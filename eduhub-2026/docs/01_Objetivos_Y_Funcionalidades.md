# EDUHUB 2026 - Objetivos y Funcionalidades Maestros

Este documento es la brújula central del proyecto "Colegio España", basado en los requerimientos originales del sistema y adaptado a nuestra arquitectura actual y eficiente (Vercel, Render, Supabase, n8n, HTML/JS/CSS vainilla).

## 1. Auth & Session Management
- **Autenticación Centralizada**: Login único mediante correo y contraseña manejado vía Supabase/n8n. (Originalmente propuesto con Google Provider, puede integrarse a futuro si se requiere).
- **Control de Sesión Robusto**: Flujo de 'Sign Out' que limpia `localStorage` y seguridad básica en el navegador.
- **Protección de Rutas**: Redirecciones en las vistas locales (`dashboard.html`) dependiendo de si existe un usuario autenticado y validación de su `role` (admin, teacher, parent).

## 2. El Feed Social (Muro Principal)
- **Consumo Dinámico**: La vista principal (`index.html`) consume comunicados de la tabla `feed_posts` en Supabase a través de n8n.
- **Lógica de Autolimpieza**: El webhook encargado de extraer los posts solo debe retornar aquellos cuya fecha de creación (`created_at`) no exceda los 31 días a partir del día de la consulta.
- **Gestión de Imágenes**: Soporte para subida y visualización de imágenes (ya sea mediante URLs directas o integrando Cloudinary a través de los flujos de n8n o directamente desde el frontend).

## 3. Sistema de Calificaciones y Generación de PDF
- **Vista de Calificaciones**: Los maestros podrán cargar calificaciones y los tutores visualizar el rendimiento.
- **Generador de Boletas (PDF)**: 
  - Funcionalidad para compilar los datos de un alumno (materias, notas, faltas).
  - Dado que no usamos Next.js/React, la generación se planteará usando librerías frontend como `jsPDF` o procesando el archivo desde n8n y devolviéndolo al navegador.
  - Nombre del formato de descarga: `Boleta_[Nombre_Alumno]_[Periodo].pdf`.
  - Descarga instantánea al presionar "Generar Boleta".

## 4. Notificaciones Masivas (Correos)
- **Disparador Administrativo**: Un endpoint/webhook que el Admin pueda activar al finalizar un periodo de evaluación.
- **Procesamiento en n8n**:
  1. Mapea la relación Padre-Hijo.
  2. Extrae las calificaciones actuales de Supabase.
  3. Formula correos dinámicos.
  4. Envía los correos masivamente (usando nodos de SendGrid, SMTP, o Gmail dentro de n8n).

## 5. Estructura de Base de Datos Base (Supabase)
- `profiles` o `usuarios` (id, email, full_name, role).
- `students_parents` (relación muchos a muchos para vincular tutores con alumnos).
- `attendance` (status: 'presente', 'falta', 'justificada').
- `grades` (score, period_id, student_id, subject_id).
- `feed_posts` (content, image_url, author_name, created_at).

## 6. UI/UX (Interfaz Visual)
- **Dashboard Modular**: Panel principal con menú lateral (Sidebar) colapsable.
- **Data Grids para Maestros**: Vistas de listas en forma de tabla para cargar asistencia diaria y calificaciones de forma ágil.
- **Indicadores Visuales**: Uso de símbolos o círculos de colores para reportar el estatus de asistencia de manera rápida e intuitiva.
- **Tarjetas Resumen**: Para tutores, mostrando gráficas simples o resúmenes del desempeño de sus hijos.
