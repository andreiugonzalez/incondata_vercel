# Faena Backend

Backend robusto para gestión de proyectos, usuarios, documentos y recursos en faenas, construido con Node.js, Express, Sequelize y PostgreSQL.
Incluye soporte para autenticación JWT, WebSockets, notificaciones en tiempo real, subida de archivos a S3, y arquitectura modular y escalable.

---

## 🚀 Estructura del Proyecto

```
WebApp_Backend/
│
├── config/              # Configuración de base de datos para CLI y entorno
├── cronJobs/            # Tareas automáticas (cron jobs)
├── iisnode/             # Logs y visor de logs para despliegue en IIS
├── migrations/          # Scripts de migración de base de datos (Sequelize)
├── models/              # Modelos legacy (usados por CLI, migraciones antiguas)
├── src/
│   ├── config/          # Configuración de Sequelize, logger y conexión DB
│   ├── controllers/     # Lógica de negocio por entidad (usuarios, proyectos, etc.)
│   ├── errors/          # Manejo y definición de errores personalizados
│   ├── middlewares/     # Middlewares de validación, autenticación, etc.
│   ├── models/          # Modelos Sequelize (estructura de tablas)
│   ├── repositories/    # Acceso a datos (queries, persistencia)
│   ├── routes/          # Endpoints HTTP y WebSocket
│   └── utils/           # Helpers, respuestas estándar y datos dummy
├── uploads/             # Archivos subidos por usuarios (no subir a git)
├── app.js               # Punto de entrada principal del backend
├── package.json         # Configuración de npm y scripts
├── package-lock.json    # Lockfile de dependencias
└── .env                 # Variables de entorno (no subir a git)
```

---

## ⚙️ Instalación y configuración

1. **Clona el repo y entra a la carpeta:**
   ```bash
   git clone <repo-url>
   cd WebApp_Backend
   ```

2. **Instala dependencias:**
   ```bash
   npm install
   ```

3. **Configura tu archivo `.env`:**
   - Usa las variables de ejemplo del equipo o pide un `.env` de referencia.
   - Ejemplo de variables importantes:
     ```
     CONSTRUAPP_PSQL_USER=usuario
     CONSTRUAPP_PSQL_PASSWORD=contraseña
     CONSTRUAPP_PSQL_BD=nombre_db
     CONSTRUAPP_PSQL_HOST=host_db
     CONSTRUAPP_PSQL_PORT=5432
     JWT_SECRET=tu_clave_secreta
     ```

4. **Ejecuta migraciones:**
   ```bash
   npm run migrate
   ```

5. **(Opcional) Pobla la base de datos con datos dummy:**
   ```bash
   npm run seeder
   ```

6. **Levanta el servidor:**
   - Modo desarrollo:
     ```bash
     npm run dev
     ```
   - Modo producción:
     ```bash
     npm start
     ```

---

## 🛠️ Scripts útiles

- `npm run dev` — Levanta el servidor en modo desarrollo (con recarga automática).
- `npm run start` — Levanta el servidor en modo producción.
- `npm run migrate` — Ejecuta migraciones de base de datos usando variables de entorno.
- `npm run migrateg -- <nombre>` — Genera una nueva migración.
- `npm run migrateu` — Revierte la última migración.
- `npm run seeder` — Pobla la base de datos con datos dummy (si tienes script).

---

## 🧩 Arquitectura y capas principales

### **Config**
- Centraliza la configuración de base de datos, logger y Sequelize.
- Usa variables de entorno para máxima seguridad.

### **Models**
- Define la estructura de las tablas de la base de datos usando Sequelize.
- Cada archivo `.model.js` representa una entidad (User, Project, Document, etc).

### **Repositories**
- Encapsulan la lógica de acceso a datos (queries, inserts, updates, deletes).
- Permiten mantener los controladores limpios y desacoplados de la base de datos.

### **Controllers**
- Implementan la lógica de negocio para cada recurso.
- Orquestan la interacción entre rutas, repositorios y servicios.

### **Routes**
- Definen los endpoints HTTP y WebSocket de la API.
- Conectan rutas con controladores y middlewares.

### **Middlewares**
- Validan, autentican y procesan datos antes/después de los controladores.
- Incluyen autenticación JWT, validaciones de datos, permisos, etc.

### **Errors**
- Manejo centralizado de errores personalizados y globales.
- Respuestas consistentes y útiles para frontend y debugging.

### **Utils**
- Helpers reutilizables y datos dummy para testing/desarrollo.

### **CronJobs**
- Tareas automáticas programadas (ej: marcar usuarios inactivos).

---

## 📝 Buenas prácticas

- Usa variables de entorno para credenciales y configuración sensible.
- No subas la carpeta `uploads/` ni el archivo `.env` al repo.
- Comenta y documenta tus controladores, modelos y repositorios.
- Usa middlewares para validaciones y autenticación.
- Mantén las migraciones y modelos sincronizados.
- Si tienes dudas, revisa este README o pregunta al equipo.

---

## 👩‍💻 Créditos y contacto

Desarrollado por el equipo Incon.
¿Dudas, sugerencias o bugs? ¡Abre un issue o contacta a los responsables del repo!

---

¡Vamos, que el código no se escribe solo~!

