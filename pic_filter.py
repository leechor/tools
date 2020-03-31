# -*- coding: utf-8 -*-
import getopt
import os
import shutil
import sys

from termcolor import cprint
import imagehash as imagehash
from PIL import Image, ExifTags
from apscheduler.schedulers.blocking import BlockingScheduler


def get_all_files(path):
    def is_image(file_name):
        # List mime types fully supported by Pillow
        full_supported_formats = ['gif', 'jp2', 'jpeg', 'jpg', 'pcx', 'png', 'tiff', 'x-ms-bmp',
                                  'x-portable-pixmap', 'x-xbitmap']
        try:
            ext = os.path.splitext(file_name)[-1][1:]
            return ext in full_supported_formats
        except IndexError:
            return False

    for dir_path, dir_names, filenames in os.walk(path):
        for name in filenames:
            if not is_image(name):
                continue
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
    for of in get_all_files(source_path_):
        h = hash_file(of)

        if h is None:
            continue

        if h[1] in h_dict.keys():
            try:
                os.remove(of)
            except:
                continue
        else:
            try:
                shutil.move(h[0], output)
                h_dict[h[1]] = h[0]
            except:
                continue


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

    sched.start()
