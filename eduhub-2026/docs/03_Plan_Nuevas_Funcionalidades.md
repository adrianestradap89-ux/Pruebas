# EduHub 2026 - Plan de Nuevas Funcionalidades (HTML + n8n)

Al haber transicionado de una arquitectura pesada en Next.js (con un servidor React completo) a una arquitectura ágil Serverless (Vercel Estático + n8n + Supabase), debemos adaptar algunas funcionalidades que el prompt original proponía mediante librerías de Node (React-PDF, Edge Functions, Sendgrid API SDK).

**IMPORTANTE:** No cambiaremos la infraestructura tecnológica actual (n8n/Vercel). Las siguientes propuestas de implementación se han diseñado específicamente para aprovechar al máximo las herramientas gratuitas y perpetuas que ya configuramos.

---

## 1. Generador de Boletas PDF
> [!NOTE] Botón de "Generar Boleta" con nombre `Boleta_[Alumno]_[Periodo].pdf`

**El Problema:** El prompt pedía usar `react-pdf`, lo cual es inviable en HTML Vainilla puro sin complicar las dependencias del frontend.

**La Solución Propuesta:**
*Opción A (Recomendada - Frontend):* Utilizaremos la librería **`jsPDF`** y **`html2canvas`** cargadas directamente por CDN en Vercel.
  1. El tutor hace clic en "Descargar".
  2. Solicitamos a n8n el cruce de calificaciones (`GET /webhook/student/report`).
  3. Renderizamos una tabla invisible u oculta temporal en HTML.
  4. `jsPDF` toma esa tabla y genera y descarga el archivo con el nombre preciso al instante (Sin costo de servidor `react-pdf` ni demoras).

*Opción B (Nativa n8n):* Construir un webhook especial en Render (`/webhook/admin/generate-pdf`) donde n8n toma los datos, compone un HTML básico, usa su nodo interno o una API libre de PDF y te devuelve el archivo en binario. *(Menos recomendada por posible saturación de RAM en la capa gratuita).*

**Decisión:** Implementaremos la **Opción A** al crear la vista final del tutor.

## 2. El Feed Social e Imágenes (Cloudinary)
> [!NOTE] Subida y autolimpieza a 31 días

**Problema:** Al no tener un servidor intermedio propio, subir la imagen primero a Vercel es imposible.

**Solución Propuesta (Frontend-First Upload):**
  1. Configuraremos **Cloudinary con Upload Presets No Firmados** (Unsigned Presets).
  2. Cuando el Admin intente subir una foto para un comunicado, el navegador enviará directamente el archivo a Cloudinary (mediante FETCH a la API de Cloudinary).
  3. Cloudinary nos responderá con la URL segura y liviana (`image_url`).
  4. Envía a n8n solo esa URL junto con el `content` para guardar en Supabase (`POST /webhook/feed/create`).
  5. **La Autolimpieza:** El motor de PostgreSQL + n8n maneja este filtro. El nodo de base de datos en n8n usará este `WHERE` exacto cada vez que se consulte el Muro principal: `created_at >= CURRENT_DATE - INTERVAL '31 days'`.

## 3. Notificaciones Masivas (SendGrid o similares)
> [!NOTE] Función de enviar emails con listado de calificaciones por cada padre de familia.

**Problema:** El prompt pedía una "Edge Function".

**Solución Propuesta (El Superpoder de n8n):**
Esto es para lo que n8n nació, y será infinitamente más fácil que programar una Edge Function.
1. Cuando se cierre un periodo, el Dashboard hará una sola petición a **`/webhook/admin/notify-grades`**.
2. Ese webhook activará el flujo "Notificaciones de Fin de Curso".
3. **El Flujo:**
   *  Traerá todos los `students_parents` con roles 'padre' verificados.
   *  Iterará (Loop) consultando cada una de las altas notas de sus respectivos hijos conectadas a ese periodo.
   *  Compilará una tabla HTML dentro del flujo.
   *  Se conectará a un **Nodo de Correo** nativo de n8n.
4. **Proveedor:** Puedes usar cualquier credencial SMTP. Si la cuenta colegial tiene **Gmail**, usamos directamente el nodo de *Google/Gmail*. Si necesitas correos masivos fiables de grado empresarial, crearás una API Key en **SendGrid**, pondremos las credenciales en n8n y enviará 3,000 correos al día sin problemas.

---
**¿Apruebas estas metodologías para ir integrándolas al frontend (`.html`) y backend visual (`.json`) a medida que avancemos?**
