server {
    listen 80;
    server_name sas.uaenorth.cloudapp.azure.com;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name sas.uaenorth.cloudapp.azure.com;

    ssl_certificate /etc/letsencrypt/live/sas.uaenorth.cloudapp.azure.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sas.uaenorth.cloudapp.azure.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://applottobueno.com:8000; # Redirigir a la aplicación que está en el contenedor Docker
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
