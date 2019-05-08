# -*- coding: utf-8 -*-
from python.src.toys.pic_filter import hash_file, same_img, get_file_name_and_ext

file1_path = "data/1.JPG"
file2_path = "data/1.JPG"
file3_path = "data/3.JPG"


def test_hash_file():
    _, h1, file_size, *_ = hash_file(file1_path)
    _, h2, *_ = hash_file(file2_path)
    assert h1 == h2


def test_same_img():
    _, h1, *_ = hash_file(file1_path)
    _, h2, *_ = hash_file(file2_path)
    _, h3, *_ = hash_file(file3_path)
    assert same_img(h1, h2)
    assert not same_img(h1, h3)


def test_get_file_name_and_ext():
    file, ext = get_file_name_and_ext(file1_path)
    assert (file, ext) == ('1', 'JPG')
