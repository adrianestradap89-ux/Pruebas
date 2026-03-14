/**
 * CONFIGURACIÓN GLOBAL - EDUHUB 2026
 * 
 * Este archivo centraliza todas las variables del entorno, URLs,
 * Webhooks de n8n, claves de Supabase y Cloudinary.
 * 
 * INSTRUCCIONES:
 * 1. Incluye este archivo en tus HTML ANTES de cualquier otro script de la aplicación.
 *    Ejemplo: <script src="/config.js"></script>
 * 2. Usa las variables en tu JS como: ENV.SUPABASE_URL o ENV.getWebhookUrl(ENV.WEBHOOKS.FEED_POSTS)
 */

window.ENV = {
    // ==========================================
    // 1. SUPABASE (Base de datos y Login de Google)
    // ==========================================
    SUPABASE_URL: "https://ookcuyvmviilceivvpsu.supabase.co", 
    SUPABASE_ANON_KEY: "TU_SUPABASE_ANON_KEY", // Necesaria para inicializar el cliente y Google Auth en el front
    
    // ==========================================
    // 2. CLOUDINARY (Imágenes del Muro) 
    // ==========================================
    CLOUDINARY_CLOUD_NAME: "TU_CLOUD_NAME",
    CLOUDINARY_UPLOAD_PRESET: "TU_UPLOAD_PRESET", // Debe ser "Unsigned" para subir sin backend
    
    // ==========================================
    // 3. RUTAS N8N / WEBHOOKS
    // ==========================================
    // Usamos "/webhook" para que el proxy de Vercel lo envíe a Render automáticamente, 
    // evitando problemas de CORS y bloqueos del navegador.
    API_BASE: "/webhook", 

    WEBHOOKS: {
        // --- Muro Social ---
        FEED_POSTS: "/feed/posts",       // GET: Obtener las últimas noticias
        FEED_CREATE: "/feed/create",     // POST: Crear una nueva noticia
        
        // --- Docentes ---
        TEACHER_STUDENTS: "/teacher/students",     // GET: Obtener alumnos para pasar lista
        TEACHER_ATTENDANCE: "/teacher/attendance", // POST: Enviar el pase de lista del día
        TEACHER_GRADES_GET: "/teacher/grades",     // GET: Obtener alumnos para cargar calificaciones
        TEACHER_GRADES_SAVE: "/teacher/grades/save", // POST: Guardar calificaciones
        
        // --- Tutores y Alumnos ---
        PARENT_CHILDREN: "/parent/children", // GET: Datos, inasistencias y promedios de los hijos
        STUDENT_REPORT: "/student/report",   // GET: Calificaciones para la generación del PDF local
        
        // --- Administración ---
        ADMIN_NOTIFY_GRADES: "/admin/notify-grades" // POST: Dispara a n8n para enviar correos masivos vía SendGrid
    },

    /**
     * Función utilitaria para construir la ruta correcta combinando
     * la BASE ("/webhook") con el endpoint elegido.
     */
    getWebhookUrl: function(endpoint) {
        return this.API_BASE + endpoint;
    }
};
