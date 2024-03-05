FROM nginx:latest

COPY ./toSyncToS3 /usr/share/nginx/html/

EXPOSE 80