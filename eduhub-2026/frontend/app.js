// app.js - Lógica Global y Pública

const API_BASE = '/webhook'; // Proxy de Caddy hacia n8n
const N8N_URL = window.location.origin;

// ESTADO GLOBAL SIMPLE
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Si estamos en la página del index (feed)
    if (document.getElementById('feedContainer')) {
        loadFeed();
        
        document.getElementById('refreshFeedBtn')?.addEventListener('click', loadFeed);
        
        document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            await attemptLogin(email, password);
        });
    }
});

// Verificación de Autenticación basada en LocalStorage para esta versión MVP
function checkAuth() {
    const stored = localStorage.getItem('eduhub_user');
    const authSection = document.getElementById('auth-section');

    if (stored) {
        currentUser = JSON.parse(stored);
        if (authSection) {
            authSection.innerHTML = `
                <a href="/dashboard.html" class="text-sm font-medium bg-primary text-white border border-primary px-5 py-2 rounded-full hover:bg-blue-700 transition-all shadow-md">
                    Ir al Panel
                </a>
            `;
        }
        return true;
    } else {
        if(window.location.pathname.includes('dashboard')) {
            window.location.href = '/'; // Redirigir a login si no hay auth
        }
        return false;
    }
}

async function attemptLogin(email, password) {
    const btnText = document.getElementById('loginText');
    const spinner = document.getElementById('loginSpinner');
    const errorBox = document.getElementById('loginError');
    
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
    errorBox.classList.add('hidden');

    try {
        // En n8n necesitas un Webhook escuchando POST en /webhook/auth/login
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) throw new Error('Credenciales inválidas');
        
        const data = await res.json();
        
        // Asumiendo que n8n devuelve { success: true, user: { id, email, role, full_name } }
        if (data.success && data.user) {
            localStorage.setItem('eduhub_user', JSON.stringify(data.user));
            window.location.href = '/dashboard.html';
        } else {
            throw new Error('Error en respuesta');
        }

    } catch (e) {
        console.error(e);
        errorBox.classList.remove('hidden');
    } finally {
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

function logout() {
    localStorage.removeItem('eduhub_user');
    window.location.href = '/';
}

// Cargar Feed interactuando con n8n
async function loadFeed() {
    const container = document.getElementById('feedContainer');
    if(!container) return;

    try {
        // En n8n necesitas un Webhook GET en /webhook/feed/posts
        // Que devuelva un arreglo de posts: [{ id, content, image_url, created_at, author_name }]
        const res = await fetch(`${API_BASE}/feed/posts`);
        if (!res.ok) throw new Error('Network error');
        
        const posts = await res.json();
        
        container.innerHTML = ''; // Clear skeleton
        
        if(posts.length === 0) {
            container.innerHTML = `<div class="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-500 font-medium shadow-sm">No hay avisos recientes en los últimos 31 días.</div>`;
            return;
        }

        posts.forEach(post => {
            const date = new Date(post.created_at).toLocaleDateString();
            const initial = post.author_name ? post.author_name.charAt(0) : 'A';
            
            let imgHtml = '';
            if (post.image_url) {
                // imgHtml = `<img src="${post.image_url}" alt="Attachment" class="mt-4 rounded-xl w-full h-auto object-cover max-h-96 shadow-sm border border-gray-100">`;
                imgHtml = `
                    <div class="mt-4 relative rounded-xl w-full bg-gray-100 overflow-hidden border border-gray-100 shadow-sm" style="padding-top: 56.25%;">
                        <img src="${post.image_url}" class="absolute inset-0 w-full h-full object-cover" loading="lazy">
                    </div>`;
            }

            container.innerHTML += `
                <article class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div class="p-5 flex items-center gap-3 border-b border-gray-50">
                        <div class="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                            ${initial}
                        </div>
                        <div>
                            <div class="font-bold text-gray-800 text-lg">${post.author_name || 'Colegio España'}</div>
                            <div class="text-sm text-gray-500 flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                ${date}
                            </div>
                        </div>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">${post.content}</p>
                        ${imgHtml}
                    </div>
                </article>
            `;
        });

    } catch (e) {
        console.error(e);
        container.innerHTML = `<div class="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 font-medium">Error cargando el feed. Asegúrese de que n8n esté ejecutándose.</div>`;
    }
}
