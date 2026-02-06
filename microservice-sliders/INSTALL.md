# Instalación del Microservicio de Sliders

Este microservicio expone los sliders de PrestaShop mediante una API REST.

## Requisitos

- Node.js 16+ instalado en el servidor
- Acceso SSH al servidor
- MySQL corriendo localmente

---

## Paso 1: Conectar al servidor via SSH

```bash
ssh ubuntu@46.224.111.41
# Password: UmZgUy_PN3
```

---

## Paso 2: Verificar que Node.js esté instalado

```bash
node --version
npm --version
```

Si **NO** está instalado, instalar Node.js:

```bash
# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

---

## Paso 3: Crear directorio del microservicio

```bash
cd /home/ubuntu
mkdir prestashop-sliders-api
cd prestashop-sliders-api
```

---

## Paso 4: Subir archivos al servidor

Desde tu máquina local, sube los archivos usando SCP:

```bash
# En Windows (desde la carpeta microservice-sliders)
scp server.js ubuntu@46.224.111.41:/home/ubuntu/prestashop-sliders-api/
scp package.json ubuntu@46.224.111.41:/home/ubuntu/prestashop-sliders-api/
```

O copia manualmente el contenido:

**En el servidor, crear `server.js`:**
```bash
nano server.js
# Pegar el contenido del archivo server.js
# Guardar: Ctrl+O, Enter, Ctrl+X
```

**Crear `package.json`:**
```bash
nano package.json
# Pegar el contenido del archivo package.json
# Guardar: Ctrl+O, Enter, Ctrl+X
```

---

## Paso 5: Instalar dependencias

```bash
cd /home/ubuntu/prestashop-sliders-api
npm install
```

---

## Paso 6: Probar el servidor manualmente

```bash
npm start
```

Deberías ver:
```
✓ Microservicio de sliders ejecutándose
✓ Puerto: 3001
```

Prueba desde otra terminal:
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/sliders?lang=es
```

Si funciona, presiona **Ctrl+C** para detener.

---

## Paso 7: Configurar como servicio systemd (para que corra siempre)

```bash
sudo nano /etc/systemd/system/sliders-api.service
```

Pegar este contenido:

```ini
[Unit]
Description=PrestaShop Sliders API Microservice
After=network.target mysql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/prestashop-sliders-api
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=sliders-api
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

Guardar: **Ctrl+O, Enter, Ctrl+X**

---

## Paso 8: Iniciar el servicio

```bash
# Recargar systemd
sudo systemctl daemon-reload

# Habilitar el servicio (arranque automático)
sudo systemctl enable sliders-api

# Iniciar el servicio
sudo systemctl start sliders-api

# Verificar estado
sudo systemctl status sliders-api
```

Deberías ver: **Active: active (running)**

---

## Paso 9: Verificar logs

```bash
# Ver logs en tiempo real
sudo journalctl -u sliders-api -f

# Ver últimos logs
sudo journalctl -u sliders-api -n 50
```

---

## Paso 10: Configurar Nginx como proxy reverso (opcional pero recomendado)

Para acceder desde fuera:

```bash
sudo nano /etc/nginx/sites-available/sliders-api
```

Pegar:

```nginx
server {
    listen 80;
    server_name api-sliders.pevgrow.com;  # O el dominio que elijas

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar configuración:

```bash
sudo ln -s /etc/nginx/sites-available/sliders-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Paso 11: Abrir puerto en firewall (si está activo)

```bash
# Verificar firewall
sudo ufw status

# Si está activo, abrir puerto 3001
sudo ufw allow 3001/tcp
sudo ufw reload
```

---

## Endpoints disponibles

Una vez instalado, los endpoints serán:

```
GET http://46.224.111.41:3001/health
GET http://46.224.111.41:3001/api/sliders?lang=es&active=true
GET http://46.224.111.41:3001/api/sliders/ps8?lang=es&active=true
```

O si configuraste Nginx:

```
GET http://api-sliders.pevgrow.com/health
GET http://api-sliders.pevgrow.com/api/sliders?lang=es
```

---

## Comandos útiles

```bash
# Ver estado del servicio
sudo systemctl status sliders-api

# Reiniciar servicio
sudo systemctl restart sliders-api

# Detener servicio
sudo systemctl stop sliders-api

# Ver logs
sudo journalctl -u sliders-api -f

# Reiniciar después de cambios en el código
sudo systemctl restart sliders-api
```

---

## Troubleshooting

### El servicio no inicia

```bash
# Ver logs detallados
sudo journalctl -u sliders-api -n 100 --no-pager

# Verificar permisos
ls -la /home/ubuntu/prestashop-sliders-api/

# Probar manualmente
cd /home/ubuntu/prestashop-sliders-api
node server.js
```

### Error de conexión MySQL

```bash
# Verificar que MySQL esté corriendo
sudo systemctl status mysql

# Probar conexión
mysql -u pevgrow -p
# Password: _Ey2FjV9
```

### Puerto 3001 en uso

```bash
# Ver qué está usando el puerto
sudo lsof -i :3001

# Cambiar puerto en server.js línea 13:
# const PORT = process.env.PORT || 3002;
```

---

## Actualizar el código

```bash
# Conectar al servidor
ssh ubuntu@46.224.111.41

# Ir al directorio
cd /home/ubuntu/prestashop-sliders-api

# Editar server.js
nano server.js

# Reiniciar servicio
sudo systemctl restart sliders-api

# Verificar
sudo systemctl status sliders-api
```

---

¡Listo! El microservicio está corriendo y exponiendo los sliders de PrestaShop.
