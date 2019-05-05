# -*- coding: utf-8 -*-
import getopt
import os
import shutil
import sys

import pathlib
from datetime import datetime

import imagehash as imagehash
import patoolib
from PIL import Image, ExifTags
from apscheduler.schedulers.blocking import BlockingScheduler
from patoolib.util import PatoolError


def is_image(file_name):
    # List mime types fully supported by Pillow
    full_supported_formats = ['gif', 'jp2', 'jpeg', 'jpg', 'pcx', 'png', 'tiff', 'x-ms-bmp',
                              'x-portable-pixmap', 'x-xbitmap']
    try:
        ext = os.path.splitext(file_name)[-1][1:]
        return ext.lower() in full_supported_formats
    except IndexError:
        return False


def get_all_files(path):
    for dir_path, dir_names, filenames in os.walk(path):
        for d_name in dir_names:
            d = os.path.join(dir_path, d_name)
            if len(os.listdir(d)) == 0 and d != path:
                os.rmdir(d + os.sep)
        for name in filenames:
            yield os.path.join(dir_path, name)


def get_file_size(file_name):
    try:
        return os.path.getsize(file_name)
    except FileNotFoundError:
        return 0


def get_image_size(img):
    return "{} x {}".format(*img.size)


def get_capture_time(img):
    try:
        exif = {
            ExifTags.TAGS[k]: v
            for k, v in img._getexif().items()
            if k in ExifTags.TAGS
        }
        return exif["DateTimeOriginal"]
    except:
        return "Time unknown"


def hash_file(file):
    try:
        hashes = []
        img = Image.open(file)

        file_size = get_file_size(file)
        image_size = get_image_size(img)
        capture_time = get_capture_time(img)

        # hash the image 4 times and rotate it by 90 degrees each time
        for angle in [0, 90, 180, 270]:
            if angle > 0:
                turned_img = img.rotate(angle, expand=True)
            else:
                turned_img = img
            hashes.append(str(imagehash.phash(turned_img)))

        hashes = ''.join(sorted(hashes))

        # cprint("\tHashed {}".format(file), "blue")
        return file, hashes, file_size, image_size, capture_time
    except OSError:
        # cprint("\tUnable to open {}".format(file), "red")
        return None


def job(source_path_):
    for of_ in get_all_files(source_path_):
        try:
            if not is_image(of_):
                try:
                    format, compression = patoolib.get_archive_format(of_)
                    target = patoolib.extract_archive(of_, outdir=source_path_)
                    os.remove(of_)
                    continue
                except PatoolError as ex:
                    os.remove(of_)
                    continue
        except Exception as ex:
            continue

        h = hash_file(of_)

        if h is None:
            continue

        h_dict[h[1]] = h[0]
        key_list = list(h_dict.keys())

        i = 0
        while i < len(key_list):
            ha = key_list[i]
            i += 1
            s = [1 for a, b in zip(ha, h[1]) if a != b]
            if len(s) < 5:  # 照片相同
                try:
                    os.remove(of_)
                    break
                except Exception as ex:
                    print(str(ex))
            else:
                try:
                    if not os.path.exists(output):
                        os.mkdir(output)
                    dt = datetime.now()
                    fn = os.path.basename(h[0])
                    shutil.move(h[0], f'{output}\\{fn}_{dt.strptime("%Y%m%d%H%M%S")}')
                    key_list.append(h[1])
                    break
                except Exception as ex:
                    print(str(ex))


if __name__ == '__main__':

    h_dict = {}
    if len(sys.argv) < 3:
        print('参数数量不正确')
        sys.exit()

    try:
        opts, args = getopt.getopt(sys.argv[1:], 'i:o:', '')
    except getopt.GetoptError:
        print("argv error, please input")

    for cmd, arg in opts:
        if cmd in ('-i',):
            source_path = arg
        elif cmd in ('-o',):
            output = arg

    sched = BlockingScheduler()
    sched.add_job(lambda: job(source_path), 'interval', seconds=5)

    for of in get_all_files(output):
        h = hash_file(of)
        if h is not None:
            h_dict[h[1]] = h[0]

    # job(source_path)
    sched.start()
