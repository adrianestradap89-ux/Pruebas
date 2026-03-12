# EDUHUB 2026 - Objetivos y Funcionalidades Principales

Este documento es la brújula central del proyecto "Colegio España". Todas las implementaciones técnicas deben responder a estas funcionalidades para garantizar que no desviemos el rumbo.

## Visión General
Desarrollar una plataforma escolar ligera, rápida y gratuita (Serverless) utilizando **Vercel (Frontend Estático HTML/JS)** y **Render + Supabase + n8n (Backend Visual y Base de Datos)**. La plataforma unifica toda la experiencia en un solo dominio, procesando todo mediante peticiones a webhooks.

## Roles del Sistema (Identificados hasta ahora)
1. **Administrador/Colegio**: Gestión global de la plataforma, publicación de avisos.
2. **Maestros**: Gestión de aulas, pase de lista (asistencia) y carga de calificaciones.
3. **Tutores (Padres)**: Visualización del rendimiento académico y asistencia de sus hijos.
4. **Alumnos** *(Por confirmar si tienen acceso propio o solo los tutores)*.

## Módulos y Funcionalidades Clave

### 1. Sistema de Autenticación Centralizado
*   Login único para todos los roles.
*   El sistema detecta automáticamente si el correo ingresado pertenece a un padre, a un maestro o al administrador, y adapta la interfaz.

### 2. Muro Principal (Feed de Avisos)
*   **Funcionalidad**: Un tablero público/privado donde el colegio publica comunicados oficiales.
*   **Características**: Textos, fechas y soporte para imágenes/banners. Diseño moderno.

### 3. Módulo de Maestros: Control de Asistencia
*   **Funcionalidad**: El maestro accede a su lista de alumnos asignados en el día actual.
*   **Acciones**: Marcar alumnos como Presentes, con Falta o Justificados.
*   **Seguridad**: Evitar que un maestro modifique la asistencia de grupos que no le corresponden.

### 4. Módulo de Tutores: Dashboard Académico
*   **Funcionalidad**: El padre de familia ve tarjetas resumen de cada uno de sus hijos inscritos.
*   **Indicadores**: Promedio actual (calificaciones), total de inasistencias.

---
*(Nota: Este documento está en su versión 1.0. A la espera del prompt original para detallar reportes de calificaciones exactos, materias, horarios u otros requerimientos específicos).*
