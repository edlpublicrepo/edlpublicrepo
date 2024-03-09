FROM nginx:latest

COPY ./toSyncToS3 /usr/share/nginx/html/

RUN ["/bin/sh", "-c", "mv /usr/share/nginx/html/main.html /usr/share/nginx/html/index.html && mv /usr/share/nginx/html/assets/img/k8s.edlresume.com.jpeg /usr/share/nginx/html/assets/img/edlresume.com.jpeg && ls -l /usr/share/nginx/html/assets/img/"]


EXPOSE 80