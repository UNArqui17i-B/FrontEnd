FROM nginx
COPY ./build/unbundled /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf