# Configuración Global y Directorio de Endpoints

Este documento sirve como el equivalente a un gran `.env` del sistema. Aquí se centralizan los dominios, rutas (webhooks), contraseñas iniciales y claves de APIs externas que se irán implementando a medida que crezca el colegio virtual.

## 1. DOMINIOS Y HOSTINGS PÚBLICOS
Las URLs principales bajo las que viven nuestras plataformas.
- **Frontend (Sitio Web Público y Dashboard)**: `https://colegio-espana.vercel.app/` *(o el dominio personalizado final)*
- **Backend Visual (n8n en Render)**: `https://pruebas-80d7.onrender.com/`

## 2. CREDENCIALES DE BASE DE DATOS (SUPABASE)
Esta conexión permite al panel de n8n interactuar con las tablas.
- **Project Reference ID**: `ookcuyvmviilceivvpsu`
- **Host (IPv4 - Pooler)**: `aws-0-us-west-2.pooler.supabase.com`
- **Puerto**: `5432` o `6543`
- **Usuario de BD**: `postgres.ookcuyvmviilceivvpsu`
- **Contraseña Master**: `ColegioEspana2026Admin`
- **Database Name**: `postgres`
- **Claves API Públicas (si el frontend llegase a conectar directo)**: *(Por agregar)*

## 3. INTEGRACIONES EXTERNAS Y CLAVES API
A utilizar dentro de los flujos de n8n para potenciar el sistema.
- **Envíos Masivos de Correo (SendGrid, Mailgun o Gmail)**:
  - `MAIL_API_KEY`: *(Por agregar en n8n Credentials)*
  - `SENDER_EMAIL`: *admin@colegio-espana.com* *(Por confirmar)*
- **Alojamiento de Imágenes (Cloudinary)**:
  - `CLOUDINARY_CLOUD_NAME`: *(Por agregar)*
  - `CLOUDINARY_UPLOAD_PRESET`: *(Por agregar para cargas directas front-end o n8n)*
  - `CLOUDINARY_API_KEY`: *(Por agregar en n8n)*

---

## 4. DIRECTORIO GLOBLAL DE WEBHOOKS (RUTAS n8n)
La lista definitiva de *EndPoints* donde enviaremos (`POST`) y pediremos (`GET`) datos desde nuestra página web en Vercel.

*(Nota: En el código JavaScript siempre se llamarán como `/webhook/...`, y Vercel los redigirá internamente a Render.)*

### A. Autenticación y Sesión
> [!NOTE] Rutas para comprobar credenciales y dar acceso.
- `[POST]` **`/webhook/auth/login`**: Envía `{ email, password }`. Retorna un objeto con un boolean `success`, y los datos del perfil (nombre completo, rol y ID del usuario).

### B. Mostrar Datos (GET - Consultas de solo lectura)
> [!NOTE] Peticiones de las interfaces (Muros, Dashboards, Tablas).
- `[GET]` **`/webhook/feed/posts`**: Obtiene lista de comunicados en el muro social. Su nodo en n8n filtrará por los últimos 31 días. 
- `[GET]` **`/webhook/teacher/students?teacherId=ID`**: Data Grid de asistencia. Devuelve alumnos de un profesor para el pase de lista de hoy.
- `[GET]` **`/webhook/teacher/grades?teacherId=ID`**: Data Grid de calificaciones. Devuelve alumnos y materias de un profesor para capturar notas del periodo en curso.
- `[GET]` **`/webhook/parent/children?parentId=ID`**: Dashboard del tutor. Devuelve perfiles de sus hijos, total de inasistencias y promedio de calificaciones.
- `[GET]` **`/webhook/student/report?studentId=ID&periodId=ID`**: Solicitud de obtención de calificaciones individuales (Base de datos para generar la Boleta en PDF).

### C. Cargar Información (POST / PUT - Escritura)
> [!NOTE] Inyecciones o modificaciones en Supabase.
- `[POST]` **`/webhook/teacher/attendance`**: Sube arreglo de asistencias del salón. Payload: `[{ student_id, status: 'presente', date }, ...]`
- `[POST]` **`/webhook/teacher/grades`**: Sube arreglo de calificaciones del salón. Payload: `[{ student_id, subject_id, score, period_id }, ...]`
- `[POST]` **`/webhook/feed/create`**: Sube nuevo aviso oficial (Administrador). Payload: `{ content, image_url, author_name }`

### D. Acciones Complejas y Tareas Pesadas (Edge Functions equivalentes)
> [!CAUTION] Rutas que generan trabajos masivos en el backend.
- `[POST]` **`/webhook/admin/generate-pdf`** *(Opcional base n8n)*: Envía el ID del alumno. n8n compila el HTML en PDF y devuelve el archivo al navegador.
- `[POST]` **`/webhook/admin/notify-grades`**: Envío masivo de SendGrid (Email). El admin activa este evento al cerrar el periodo. n8n cruza a cada tutor con las notas de sus hijos y envía un correo formateado a la lista completa.
