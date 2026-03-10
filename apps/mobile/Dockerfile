ARG BASE_IMAGE=nginx:alpine
FROM $BASE_IMAGE

WORKDIR /usr/share/nginx/html

# 复制 nginx 配置
COPY deploy/nginx.conf /etc/nginx/nginx.conf

# uni-app H5 产物路径：dist/build/h5/
COPY dist/build/h5/ .

# 复制版本信息文件
COPY version.html .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
