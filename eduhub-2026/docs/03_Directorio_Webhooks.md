# Directorio Global de Webhooks (n8n API)

Este documento centraliza todas las rutas (URLs) de los webhooks que se deben construir en n8n. Sirve como referencia directa para el desarrollo del Frontend (HTML/JS) para saber hacia dónde enviar o solicitar información.

**Nota sobre la URL Base:**
El frontend enviará las peticiones a su propia ruta relativa `/webhook/...` y Vercel se encargará de reenviarlas a Render.
URL Base en desarrollo directo: `https://pruebas-80d7.onrender.com/webhook/`

---

## 1. Módulo: Autenticación & Sesiones
Rutas destinadas a validar la identidad de los usuarios.

*   `[POST]` `/webhook/auth/login`
    *   **Propósito**: Recibir credenciales (email y password) y retornar los datos del usuario + su rol si es válido.

## 2. Mostrar Datos (GET - Consultas de solo lectura)
Rutas dedicadas a obtener información de la base de datos para mostrarla en pantalla.

*   `[GET]` `/webhook/feed/posts`
    *   **Propósito**: Obtener la lista de los últimos comunicados oficiales para el Muro Principal.
*   `[GET]` `/webhook/teacher/students`
    *   **Propósito**: (Maestros) Obtener la lista de alumnos asignados para tomar asistencia en el día actual.
    *   **Parámetros**: `?teacherId=123`
*   `[GET]` `/webhook/parent/children`
    *   **Propósito**: (Padres) Obtener un resumen de las calificaciones y asistencias de sus hijos.
    *   **Parámetros**: `?parentId=123`
*   `[GET]` `/webhook/admin/users`
    *   **Propósito**: (Administrador) Obtener la lista completa de usuarios registrados.

## 3. Cargar Información (POST/PUT - Modificación de datos)
Rutas dedicadas a insertar o actualizar registros en Supabase.

*   `[POST]` `/webhook/teacher/attendance`
    *   **Propósito**: (Maestros) Subir el array completo del pase de lista diario de su salón.
*   `[POST]` `/webhook/teacher/grades`
    *   **Propósito**: (Maestros) Cargar el listado de calificaciones de sus alumnos por periodo.
*   `[POST]` `/webhook/admin/users`
    *   **Propósito**: (Administrador) Dar de alta nuevos maestros, padres o alumnos.
*   `[POST]` `/webhook/admin/feed`
    *   **Propósito**: (Administrador) Publicar un nuevo aviso o comunicado en el Muro Principal.

---

*Este directorio se irá actualizando de forma dinámica a medida que se defina la estructura completa de calificaciones y pagos o roles específicos (Al recibir el prompt original del proyecto).*
