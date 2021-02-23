# FROM tiangolo/uwsgi-nginx-flask:python3.6

# ENV LISTEN_PORT 8080
# EXPOSE 8080

# COPY ./fow /app
# COPY ./uwsgi.ini /app/uwsgi.ini
# COPY ./config.py /app/config.py
# RUN pip install -r requirements.txt

FROM ubuntu:18.04

RUN apt update
RUN apt upgrade -y

RUN apt install -y python3 python3-pip python2.7 uwsgi uwsgi-plugin-python3 supervisor nginx libpq-dev

COPY . /app
COPY ./deploy/conf/uwsgi.ini /app/uwsgi.ini
COPY ./deploy/conf/supervisor.conf /etc/supervisor/conf.d/supervisord.conf
COPY ./deploy/conf/nginx.conf /etc/nginx/sites-enabled/default
COPY ./deploy/config.py /app/config.py
RUN pip3 install -r /app/requirements.txt
RUN pip3 uninstall --yes psycopg2
RUN pip3 install --no-binary :all: psycopg2

EXPOSE 8080
CMD ["/usr/bin/supervisord"]