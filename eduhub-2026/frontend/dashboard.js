// dashboard.js - Lógica específica del Panel de Control

document.addEventListener('DOMContentLoaded', () => {
    if(!currentUser) {
        // Redirigir a login si llegan directo sin sesión
        window.location.href = '/';
        return;
    }

    // Llenar header
    document.getElementById('userName').innerText = currentUser.full_name || 'Usuario';
    document.getElementById('userRoleBadge').innerText = currentUser.role || 'Usuario';
    const initial = currentUser.full_name ? currentUser.full_name.charAt(0) : 'U';
    document.getElementById('userAvatar').innerText = initial;

    buildNavigation();
    
    // Toggle sidebar móvil
    document.getElementById('toggleSidebar').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('w-64');
        sidebar.classList.toggle('w-20');
        
        // Ocultar textos
        const texts = sidebar.querySelectorAll('.nav-label, #brandName');
        texts.forEach(el => el.classList.toggle('hidden'));
        
        // Ajustar brand 
        const brand = document.getElementById('brandName');
        if(brand.classList.contains('hidden')) {
            brand.parentElement.insertAdjacentHTML('afterbegin', '<span id="brandMini" class="font-bold text-xl text-primary mx-auto">CE</span>');
        } else {
            document.getElementById('brandMini')?.remove();
        }
    });
});

const getNavItems = () => [
    { id: 'home', label: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['admin', 'teacher', 'parent'] },
    { id: 'attendance', label: 'Asistencia', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', roles: ['admin', 'teacher'] },
    { id: 'children', label: 'Mis Hijos', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['admin', 'parent'] }
];

function buildNavigation() {
    const navMenu = document.getElementById('navMenu');
    navMenu.innerHTML = '';
    
    const items = getNavItems().filter(item => item.roles.includes(currentUser.role));

    items.forEach(item => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 font-medium nav-item';
        a.innerHTML = `
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}"></path></svg>
            <span class="nav-label">${item.label}</span>
        `;
        a.onclick = (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('bg-primary/10', 'text-primary'));
            a.classList.add('bg-primary/10', 'text-primary');
            loadModule(item.id, item.label);
        };
        navMenu.appendChild(a);
    });

    // Cargar el primer módulo por defecto
    if(navMenu.firstChild) {
        navMenu.firstChild.click();
    }
}

function loadModule(moduleId, title) {
    document.getElementById('pageTitle').innerText = title;
    const content = document.getElementById('dashboardContent');

    if (moduleId === 'home') {
        content.innerHTML = `
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">Bienvenido al Portal</h2>
                <p class="text-gray-600 text-lg">Hola ${currentUser.full_name}, seleccione una opción del menú lateral para comenzar a trabajar.</p>
            </div>
        `;
    } 
    else if (moduleId === 'attendance') {
        renderTeacherAttendance(content);
    }
    else if (moduleId === 'children') {
        renderParentChildren(content);
    }
}

// ==========================================
// Módulo Maestro: Asistencia
// ==========================================
async function renderTeacherAttendance(container) {
    container.innerHTML = `<div class="text-center text-gray-500 py-10">Cargando lista de alumnos...</div>`;
    
    try {
        // Obtenemos lista de estudiantes (ej. GET /webhook/teacher/students)
        const res = await fetch(`${API_BASE}/teacher/students`);
        const students = res.ok ? await res.json() : [];

        let rowsHTML = '';
        students.forEach(student => {
            const currentStatus = student.attendance_status || 'presente';
            rowsHTML += `
                <tr class="bg-white border-b hover:bg-gray-50 transition-colors" data-id="${student.id}">
                    <td class="px-6 py-4 font-medium text-gray-900">${student.full_name}</td>
                    <td class="px-6 py-4">
                        <select class="attendance-select bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 outline-none transition-shadow">
                            <option value="presente" ${currentStatus==='presente'?'selected':''}>Presente</option>
                            <option value="falta" ${currentStatus==='falta'?'selected':''}>Falta</option>
                            <option value="justificada" ${currentStatus==='justificada'?'selected':''}>Justificada</option>
                        </select>
                    </td>
                    <td class="px-6 py-4 flex justify-center items-center">
                        <div class="status-indicator w-4 h-4 rounded-full shadow-inner ${getIndicatorColor(currentStatus)}"></div>
                    </td>
                </tr>
            `;
        });

        container.innerHTML = `
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-gray-800">Carga Diaria</h2>
                    <div class="text-gray-500 font-medium">${new Date().toLocaleDateString()}</div>
                </div>
                <div class="overflow-x-auto rounded-xl border border-gray-200">
                    <table class="w-full text-sm text-left text-gray-500">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 font-semibold border-b border-gray-200">
                            <tr>
                                <th class="px-6 py-4">Alumno</th>
                                <th class="px-6 py-4">Estado</th>
                                <th class="px-6 py-4 text-center">Indicador</th>
                            </tr>
                        </thead>
                        <tbody id="attendanceTableBody">
                            ${rowsHTML || '<tr><td colspan="3" class="text-center py-4 text-gray-500 text-sm">No hay alumnos asignados para carga. (Crea flujo n8n en GET /webhook/teacher/students que devuelva JSON array)</td></tr>'}
                        </tbody>
                    </table>
                </div>
                <div class="mt-6 flex justify-end">
                    <button id="saveAttendanceBtn" class="bg-primary text-white hover:bg-blue-700 px-6 py-2.5 rounded-xl shadow-md font-medium transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2">
                         <span>Guardar Asistencia</span>
                    </button>
                </div>
            </div>
        `;

        // Añadir Lógica Visual (Cambio de color del círculo)
        document.querySelectorAll('.attendance-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const indicator = e.target.parentElement.nextElementSibling.querySelector('.status-indicator');
                indicator.className = `status-indicator w-4 h-4 rounded-full shadow-inner ${getIndicatorColor(e.target.value)}`;
            });
        });

        // Guardar 
        document.getElementById('saveAttendanceBtn')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            btn.disabled = true;
            btn.innerHTML = 'Guardando...';

            const payload = [];
            document.querySelectorAll('#attendanceTableBody tr').forEach(row => {
               if(!row.dataset.id) return;
               payload.push({
                   student_id: row.dataset.id,
                   status: row.querySelector('.attendance-select').value,
                   date: new Date().toISOString().split('T')[0],
                   recorded_by: currentUser.id
               });
            });

            try {
                 // En n8n necesitas Webhook POST /webhook/teacher/attendance
                 const res = await fetch(`${API_BASE}/teacher/attendance`, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify(payload)
                 });
                 if(res.ok) alert('Asistencia Guardada Correctamente');
                 else alert('Error guardando en el servidor');
            } catch (err) {
                 alert('Error de conexión con el Servidor n8n');
            } finally {
                 btn.disabled = false;
                 btn.innerHTML = 'Guardar Asistencia';
            }
        });

    } catch (e) {
        container.innerHTML = `<div class="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 font-medium">Error conectando con el servidor n8n: GET /webhook/teacher/students</div>`;
    }
}

function getIndicatorColor(status) {
    if(status === 'presente') return 'bg-green-500';
    if(status === 'falta') return 'bg-red-500';
    if(status === 'justificada') return 'bg-yellow-400';
    return 'bg-gray-300';
}

// ==========================================
// Módulo Padre: Visualización Simbólica
// (Generar reporte estático vía webhook si es necesario)
// ==========================================
async function renderParentChildren(container) {
    container.innerHTML = `
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Rendimiento Académico</h2>
            <p class="text-gray-600 mb-6">Esta vista consulta los datos de su hijo hacia el Webhook de n8n.</p>
            <div id="childrenCards" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div class="text-center text-gray-400">Pidiendo información...</div>
            </div>
        </div>
    `;

    try {
        // En n8n necesitas Webhook GET /webhook/parent/children?parentId=xxx
        const res = await fetch(`${API_BASE}/parent/children?parentId=${currentUser.id}`);
        const children = res.ok ? await res.json() : [];
        
        const wrapper = document.getElementById('childrenCards');
        wrapper.innerHTML = '';

        if(children.length === 0) {
            wrapper.innerHTML = `<div class="col-span-full text-center py-6 text-gray-500 border border-dashed border-gray-300 rounded-xl">No hay información académica vinculada a su cuenta en n8n.</div>`;
            return;
        }

        // Renderizado Simbólico
        children.forEach(child => {
            wrapper.innerHTML += `
               <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    <div class="h-24 bg-gradient-to-r from-primary to-blue-400"></div>
                    <div class="px-6 pb-6 relative flex flex-col flex-1">
                        <div class="w-16 h-16 rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center text-primary font-bold text-2xl absolute -top-8">
                            ${child.name ? child.name.charAt(0) : 'E'}
                        </div>
                        <div class="mt-10">
                            <h3 class="text-lg font-bold text-gray-800">${child.name || 'Estudiante'}</h3>
                        </div>

                        <div class="mt-4 flex-1">
                            <div class="flex justify-between items-center text-sm border-b border-gray-100 py-2 text-gray-700">
                                <span>Promedio (Mock)</span>
                                <span class="font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded">${child.grade || 90}</span>
                            </div>
                            <div class="flex justify-between items-center text-sm py-2 text-gray-700">
                                <span>Faltas</span>
                                <span class="font-semibold text-red-600">${child.absences || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

    } catch(e) {
        document.getElementById('childrenCards').innerHTML = `<div class="col-span-full text-red-500 py-6">Error conectando al webhook: /webhook/parent/children</div>`;
    }
}
