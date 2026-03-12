# Guía de Implementación: Backend Visual en n8n y Supabase

Esta guía establece la base técnica para programar n8n. **Todo el sistema** funcionará como una API creada de forma visual mediante Webhooks conectados directamente a las tablas de Supabase.

---

## 1. Diseño de la Base de Datos (Supabase)

Para que el colegio funcione, necesitamos crear estas tablas con estos campos sugeridos:

### 1.1. Tabla: `Usuarios`
Centraliza los logins y datos de contacto de cualquier persona en el sistema.
*   `id` (UUID - Primary Key)
*   `email` (Text - Unique)
*   `password_hash` (Text - Opcional si usas Supabase Auth)
*   `role` (Enum: `admin`, `teacher`, `parent`, `student`)
*   `full_name` (Text)
*   `is_active` (Boolean)

### 1.2. Tabla: `Cursos_Materias` (Subjects)
*   `id` (UUID - Primary Key)
*   `name` (Text - Ej: "Matemáticas 3o", "Historia de España")
*   `teacher_id` (Relación: -> `Usuarios.id`)

### 1.3. Tabla: `Relacion_Tutor_Alumno` (Guardian_Student)
Para saber los hijos de un papá.
*   `parent_id` (Relación: -> `Usuarios.id` [role: parent])
*   `student_id` (Relación: -> `Usuarios.id` [role: student])

### 1.4. Tabla: `Asistencia` (Attendance)
La lista que pasa el maestro cada mañana.
*   `id` (UUID - Primary Key)
*   `student_id` (Relación: -> `Usuarios.id`)
*   `teacher_id` (Relación: -> `Usuarios.id` - Quien tomó lista)
*   `date` (Date - Ej: '2026-03-12')
*   `status` (Enum: `presente`, `falta`, `justificada`)

### 1.5. Tabla: `Calificaciones` (Grades)
*   `id` (UUID - Primary Key)
*   `student_id` (Relación: -> `Usuarios.id`)
*   `subject_id` (Relación: -> `Cursos_Materias.id`)
*   `grade_value` (Decimal/Float)
*   `period` (Text - Ej: "Bimestre 1")
*   `date_recorded` (Timestamp)

### 1.6. Tabla: `Muro_Noticias` (Feed)
*   `id` (UUID)
*   `content` (Text)
*   `image_url` (Text - Opcional)
*   `author_name` (Text)
*   `created_at` (Timestamp)

---

## 2. Mapa de Webhooks en n8n (Micro-Servicios)

### A. Autenticación Global (POST `/webhook/auth/login`)
*   **Entrada Esperada**: JSON `{ "email": "x@x.com", "password": "***" }`
*   **n8n Nodos**:
    1.  Evento: Webhook POST.
    2.  Petición Postgres (Supabase): Buscar usuario donde `email = json.email` y checar contraseña.
    3.  Lógica IF: ¿Existe y es correcto?
*   **Salidas (Respuesta)**:
    *   *Green*: `{ "success": true, "user": { "id": "...", "role": "teacher", "full_name": "Profe Juan" } }`
    *   *Red*: Código 401 `{ "success": false, "error": "Credenciales inválidas" }`

### B. Feed del Colegio (GET `/webhook/feed/posts`)
*   **Entrada Esperada**: Ninguna particular (Quizás límites de paginación).
*   **n8n Nodos**:
    1.  Evento: Webhook GET.
    2.  Petición Postgres: `SELECT * FROM Muro_Noticias ORDER BY created_at DESC LIMIT 10`
*   **Salida**: JSON Array con objetos `[{ "id": 1, "content": "Hola", ... }]`

### C. Pase de Lista del Maestro (GET `/webhook/teacher/students`)
*   **Entrada Esperada**: Por URL/Headers el `teacherId`.
*   **n8n Nodos**:
    1.  Evento: Webhook GET.
    2.  Petición Postgres: Unir `Cursos_Materias` y `Relaciones_Estudiantes` donde `teacher_id` sea el que llega.
*   **Salida**: JSON Array de alumnos.

### D. Guardar Asistencia (POST `/webhook/teacher/attendance`)
*   **Entrada Esperada**: Array masivo.
    ```json
    [
      { "student_id": "xxx", "status": "presente", "date": "2026-03-12" },
      { "student_id": "yyy", "status": "falta", "date": "2026-03-12" }
    ]
    ```
*   **n8n Nodos**:
    1.  Evento: Webhook POST.
    2.  Loop (Item List) por cada registro.
    3.  Petición Postgres (Insert/Upsert): Insertar en tabla `Asistencia`.
*   **Salidas**: Código 200 OK u objeto `{ "success": true }`.

### E. Dashboard Financiero/Académico de Padre (GET `/webhook/parent/children?parentId=XX`)
*   **Entrada Esperada**: `parentId` por URL (ej. ?parentId=123).
*   **n8n Nodos**:
    1.  Evento: Webhook GET.
    2.  Petición Postgres A: Obtener IDs de hijos desde `Relacion_Tutor_Alumno`.
    3.  Petición Postgres B (Join): Calcular el promedio de `Calificaciones` y total de `Asistencia` = 'falta' de cada hijo.
*   **Salida**: Objeto con resumen. Ejemplo:
    ```json
    [
      { "name": "Luisito", "grade": 92.5, "absences": 3 }
    ]
    ```

---
*Nota: Este diseño será refinado y adaptado cuando proporciones el prompt detallado inicial.*
