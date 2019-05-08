# -*- coding: utf-8 -*-
import getopt
import os
import random
import shutil
import sys

from datetime import datetime

import imagehash
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
    for file_path in get_all_files(source_path_):
        try:
            if not is_image(file_path):
                try:
                    format, compression = patoolib.get_archive_format(file_path)
                    target = patoolib.extract_archive(file_path, outdir=source_path_)
                    remove_file(file_path)
                    continue
                except PatoolError as ex:
                    remove_file(file_path)
                    continue
        except Exception as ex:
            continue

        file, hashes, file_size, *_ = hash_file(file_path)

        if hashes is None:
            continue

        if file_size < 30 * 1024:
            remove_file(file)
            continue

        process_file_by_hash(h_dict, hashes, file)


def process_file_by_hash(h_dict_, hash_file_, file_path):

    for key in h_dict_.keys():
        if same_img(key, hash_file_):
            remove_file(file_path)
            break
    else:  # hash 列表中没有符合项
        try:
            if not os.path.exists(output):
                os.mkdir(output)
            dt = datetime.now()
            first, ext = get_file_name_and_ext(file_path)
            r_int = random.randint(0, 10000)
            shutil.move(file_path, f'{output}\\{first}_{dt.strftime("%H%M%S")}{r_int}.{ext}')

            h_dict_[hash_file_] = file_path
        except Exception as ex:
            print(str(ex))


def get_file_name_and_ext(hf):
    fn = os.path.basename(hf)
    first = fn[:fn.rfind('.')]
    ext = os.path.splitext(fn)[-1][1:]
    return first, ext


def remove_file(of_):
    try:
        os.remove(of_)
    except Exception as ex:
        print(str(ex))


def same_img(first_hash, second_hash):
    s = [1 for a, b in zip(first_hash, second_hash) if a != b]
    is_same_img = True if len(s) < 5 else False
    return is_same_img


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
