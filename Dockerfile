FROM nginx:alpine

# 移除預設頁面
RUN rm -rf /usr/share/nginx/html/*

# 複製網站內容
COPY . /usr/share/nginx/html

# 設定 Nginx 在 8080 埠運行
RUN echo "server { listen 8080; server_name localhost; root /usr/share/nginx/html; index index.html; location / { try_files \$uri \$uri/ =404; } }" > /etc/nginx/conf.d/default.conf

# 開放 8080 埠
EXPOSE 8080
