# 🚀 Microservicio de Sliders para PrestaShop

Microservicio Node.js que expone los sliders de PrestaShop mediante API REST.

## ¿Por qué este microservicio?

PrestaShop **NO expone** los sliders en su API REST por defecto. Este microservicio:
- ✅ Consulta MySQL **localmente** (sin problemas de firewall)
- ✅ Expone sliders vía REST API
- ✅ Se actualiza automáticamente cuando cambias sliders en PrestaShop
- ✅ Stack moderno (Node.js + Express)
- ✅ Soporta múltiples idiomas
- ✅ Soporta PrestaShop 8 y 9

---

## 📦 Archivos incluidos

```
microservice-sliders/
├── server.js       # Servidor Express
├── package.json    # Dependencias
├── INSTALL.md      # Guía detallada de instalación
└── README.md       # Este archivo
```

---

## ⚡ Instalación Rápida (5 minutos)

### 1. Conectar al servidor

```bash
ssh ubuntu@46.224.111.41
# Password: UmZgUy_PN3
```

### 2. Verificar Node.js

```bash
node --version
# Si no está instalado, ver INSTALL.md
```

### 3. Crear directorio

```bash
cd /home/ubuntu
mkdir prestashop-sliders-api
cd prestashop-sliders-api
```

### 4. Crear archivos

**Crear `package.json`:**
```bash
nano package.json
```

Pegar el contenido de `microservice-sliders/package.json` y guardar (Ctrl+O, Enter, Ctrl+X).

**Crear `server.js`:**
```bash
nano server.js
```

Pegar el contenido de `microservice-sliders/server.js` y guardar.

### 5. Instalar dependencias

```bash
npm install
```

### 6. Probar manualmente

```bash
node server.js
```

Deberías ver:
```
✓ MySQL pool created
✓ Microservicio de sliders ejecutándose
✓ Puerto: 3001
```

Prueba:
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/sliders?lang=es
```

Si funciona, **Ctrl+C** para detener.

### 7. Configurar como servicio

```bash
sudo nano /etc/systemd/system/sliders-api.service
```

Pegar:

```ini
[Unit]
Description=PrestaShop Sliders API
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

Guardar y ejecutar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable sliders-api
sudo systemctl start sliders-api
sudo systemctl status sliders-api
```

Deberías ver: **Active: active (running)** ✅

### 8. Abrir puerto en firewall

```bash
sudo ufw allow 3001/tcp
sudo ufw reload
```

### 9. Probar desde fuera

Desde tu máquina local:
```bash
curl http://46.224.111.41:3001/health
curl http://46.224.111.41:3001/api/sliders?lang=es
```

---

## 🔗 Endpoints disponibles

### Health Check
```
GET http://46.224.111.41:3001/health
```

Respuesta:
```json
{
  "status": "ok",
  "service": "prestashop-sliders-api",
  "timestamp": "2026-01-09T..."
}
```

### Obtener Sliders (PrestaShop 9)
```
GET http://46.224.111.41:3001/api/sliders?lang=es&active=true
```

Parámetros:
- `lang`: `es`, `en`, `fr`, `de`, `it`, `pt`, `ca` (default: `es`)
- `active`: `true` o `false` (default: `true`)

Respuesta:
```json
{
  "success": true,
  "slides": [
    {
      "id": 1,
      "title": "Semillas Gratis",
      "description": "Con cada compra",
      "legend": "",
      "image": "https://ps9.pevgrow.com/modules/ps_imageslider/images/slide-1.jpg",
      "url": "/promociones",
      "position": 1,
      "active": true
    }
  ],
  "total": 1,
  "lang": "es",
  "source": "mysql"
}
```

### Obtener Sliders (PrestaShop 8)
```
GET http://46.224.111.41:3001/api/sliders/ps8?lang=es&active=true
```

---

## 🔧 Comandos útiles

```bash
# Ver estado
sudo systemctl status sliders-api

# Reiniciar
sudo systemctl restart sliders-api

# Ver logs en tiempo real
sudo journalctl -u sliders-api -f

# Ver últimos 50 logs
sudo journalctl -u sliders-api -n 50

# Detener
sudo systemctl stop sliders-api

# Deshabilitar arranque automático
sudo systemctl disable sliders-api
```

---

## 🔄 Actualizar el código

Después de modificar `server.js`:

```bash
ssh ubuntu@46.224.111.41
cd /home/ubuntu/prestashop-sliders-api
nano server.js  # Hacer cambios
sudo systemctl restart sliders-api
sudo systemctl status sliders-api
```

---

## 🐛 Troubleshooting

### Error: Cannot connect to MySQL

Verificar que MySQL esté corriendo:
```bash
sudo systemctl status mysql
```

Probar conexión manual:
```bash
mysql -u pevgrow -p'_Ey2FjV9' -e "SELECT 1"
```

### Puerto 3001 en uso

Cambiar puerto en `server.js`:
```javascript
const PORT = process.env.PORT || 3002;
```

Reiniciar servicio.

### El servicio no inicia

Ver logs detallados:
```bash
sudo journalctl -u sliders-api -n 100 --no-pager
```

Probar manualmente:
```bash
cd /home/ubuntu/prestashop-sliders-api
node server.js
```

---

## 🔐 Seguridad

- ✅ Solo consultas SELECT (read-only)
- ✅ Pool de conexiones limitado
- ✅ CORS habilitado
- ✅ Manejo de errores robusto
- ⚠️ Considera agregar autenticación (API Key) en producción

Para agregar API Key, edita `server.js` y agrega middleware de autenticación.

---

## 📚 Documentación completa

Ver `INSTALL.md` para guía paso a paso con más detalles.

---

## ✅ Verificación final

Después de instalar, verifica que todo funciona:

1. ✅ Servicio corriendo: `sudo systemctl status sliders-api`
2. ✅ Health check: `curl http://localhost:3001/health`
3. ✅ Sliders: `curl http://localhost:3001/api/sliders?lang=es`
4. ✅ Desde fuera: `curl http://46.224.111.41:3001/api/sliders?lang=es`
5. ✅ Next.js cargando sliders correctamente

---

## 🎯 Siguiente paso

Una vez instalado el microservicio, tu Next.js consumirá automáticamente los sliders reales desde PrestaShop.

Solo necesitas **reiniciar tu servidor Next.js** para que tome la nueva configuración:

```bash
# En tu máquina local
npm run dev
```

Y listo! Los sliders se cargarán directamente desde PrestaShop 🎉
