FROM erickdalima/edlresume:latest

# Overwrite the splash page
# RUN ["/bin/sh", "-c", "mv /usr/share/nginx/html/main.html /usr/share/nginx/html/index.html"]
RUN ["/bin/sh", "-c", "mv /usr/share/nginx/html/main.html /usr/share/nginx/html/index.html"]

EXPOSE 80