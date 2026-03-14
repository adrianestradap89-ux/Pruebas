-- ==========================================
-- EDUHUB 2026 - ESQUEMA INICIAL SUPABASE
-- ==========================================
-- NOTA: Este script borra el contenido actual e inicializa
-- la estructura necesaria para enlazarla con n8n y Vercel.

-- 1. Limpiar esquema actual (ESTO BORRARÁ LOS DATOS)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- ==========================================
-- 2. TABLAS BASE
-- ==========================================

-- A. Perfiles de Usuario (Mapeado con Auth de Supabase si se usa Google Login)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'teacher', 'parent', 'student')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- B. Materias / Cursos
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    teacher_id UUID REFERENCES public.profiles(id)
);

-- C. Relación Tutor-Alumno (Muchos a Muchos)
CREATE TABLE public.students_parents (
    parent_id UUID REFERENCES public.profiles(id),
    student_id UUID REFERENCES public.profiles(id),
    PRIMARY KEY (parent_id, student_id)
);

-- ==========================================
-- 3. MÓDULOS DE REGISTRO
-- ==========================================

-- D. Pase de Lista (Asistencia Diaria)
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id),
    teacher_id UUID REFERENCES public.profiles(id),
    date DATE NOT NULL,
    status TEXT CHECK (status IN ('presente', 'falta', 'justificada')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- E. Calificaciones por Materia
CREATE TABLE public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id),
    subject_id UUID REFERENCES public.subjects(id),
    score DECIMAL(5,2) NOT NULL,
    period_id TEXT NOT NULL, -- ej: 'Q1_2026'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- F. Muro Social (Noticias)
CREATE TABLE public.feed_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    image_url TEXT,
    author_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ==========================================
-- 4. ÍNDICES (Para optimizar queries pesados desde n8n)
-- ==========================================
CREATE INDEX idx_feed_posts_date ON public.feed_posts(created_at);
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX idx_grades_student_period ON public.grades(student_id, period_id);
