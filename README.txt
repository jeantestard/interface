Web application to tag semantically text data (unsing an inline annotation format)

Installing the django user managmement framework and running the application

from the source folder

 pip install -r requirements.txt
 pip install  sentry "celery<3.0" (facultative, depends on the distro)

from the source/datateam folder

./manage.py syncdb
./manage.py migrate

run on https:

./datateamide.py -l -f start

run on http:

./datateamide.py -n -l -f  start