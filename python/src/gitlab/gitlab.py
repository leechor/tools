# -*- coding: UTF-8 -*-

import sys

if sys.version_info < (3, 0):
    import urllib
else:
    from urllib.request import urlopen

import json
import subprocess, shlex
import time
import os

gitlabAddr = 'gitlab.hl.xa:9000/'
gitlabToken = '5y_hbQkspXzpMbay2Xk4'

groups = ['springcloud', 'sanyuan', 'devops']

for index in range(10):
    url = "http://%s/api/v4/projects?private_token=%s&per_page=100&page=%d&order_by=name" % (
        gitlabAddr, gitlabToken, index)
    # print(url)

    if sys.version_info < (3, 0):
        allProjects = urllib.urlopen(url)
    else:
        allProjects = urlopen(url)

    allProjectsDict = json.loads(allProjects.read().decode(encoding='UTF-8'))
    if len(allProjectsDict) == 0:
        break
    for thisProject in allProjectsDict:
        try:
            thisProjectURL = thisProject['ssh_url_to_repo']
            thisProjectPath: str = thisProject['path_with_namespace']
            # print(thisProjectURL + ' ' + thisProjectPath)

            if thisProjectPath[:thisProjectPath.index('/')] not in groups:
                continue

            thisProjectPath = thisProjectPath + '.git'
            if os.path.exists(thisProjectPath):
                command = shlex.split('git -C "%s" fetch --all' % (thisProjectPath))

            else:
                command = shlex.split('git clone --bare %s %s' % (thisProjectURL, thisProjectPath))

            resultCode = subprocess.Popen(command)
            time.sleep(0.5)
        except Exception as e:
            print("Error on %s: %s" % (thisProjectURL, e.strerror))
