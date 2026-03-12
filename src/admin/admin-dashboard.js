const AdminDashboard = {
    render(appContainer, app) {
        const user = window.Auth.getUser();
        
        appContainer.innerHTML = `
            <div class="admin-dashboard-wrapper" style="max-width: 1000px; margin: 0 auto; padding-top: 1rem;">
                <div class="dashboard-header" style="text-align: center; margin-bottom: 3rem; animation: fadeIn 0.8s ease-out;">
                    <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem; background: linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        Panel de Administración
                    </h1>
                    <p class="subtitle" style="font-size: 1.1rem; opacity: 0.8;">Bienvenido al centro de control, ${user.username}</p>
                    <div class="user-badge admin" style="background: rgba(110, 206, 210, 0.1); color: var(--primary); border: 1px solid rgba(110, 206, 210, 0.3); padding: 0.4rem 1.2rem; border-radius: 2rem; display: inline-block; font-weight: 600; font-size: 0.9rem;">
                        Administrador
                    </div>
                </div>

                <div class="admin-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 2rem; padding-bottom: 2rem;">
                    <!-- User Management Card -->
                    <div class="card admin-card interactive-card" id="admin-users-card" style="max-width: none; margin: 0; padding: 3rem; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: linear-gradient(145deg, rgba(37, 43, 54, 0.8) 0%, rgba(30, 35, 45, 0.9) 100%); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                        <div class="card-icon" style="width: 80px; height: 80px; background: rgba(110, 206, 210, 0.1); border-radius: 1.5rem; display: flex; align-items: center; justify-content: center; color: var(--primary); margin-bottom: 2rem; transition: transform 0.3s ease;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <h2 style="margin-bottom: 1rem; font-size: 1.5rem; color: #fff;">Administración de Usuarios</h2>
                        <p class="subtitle" style="margin-bottom: 2rem; font-size: 0.95rem; line-height: 1.6;">Gestiona el directorio completo de usuarios, valida registros y administra permisos del sistema.</p>
                        <button class="primary-btn" style="padding: 1rem 2rem; border-radius: 1rem; width: 100%; font-size: 1rem; letter-spacing: 0.5px;">Administrar Usuarios</button>
                    </div>

                    <!-- General Reports Card -->
                    <div class="card admin-card interactive-card" id="admin-reports-card" style="max-width: none; margin: 0; padding: 3rem; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: linear-gradient(145deg, rgba(37, 43, 54, 0.8) 0%, rgba(30, 35, 45, 0.9) 100%); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                        <div class="card-icon" style="width: 80px; height: 80px; background: rgba(110, 206, 210, 0.1); border-radius: 1.5rem; display: flex; align-items: center; justify-content: center; color: var(--primary); margin-bottom: 2rem; transition: transform 0.3s ease;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        </div>
                        <h2 style="margin-bottom: 1rem; font-size: 1.5rem; color: #fff;">Reportes Generales</h2>
                        <p class="subtitle" style="margin-bottom: 2rem; font-size: 0.95rem; line-height: 1.6;">Visualiza estadísticas avanzadas, tendencias emocionales y métricas de impacto institucional.</p>
                        <button class="primary-btn" style="padding: 1rem 2rem; border-radius: 1rem; width: 100%; font-size: 1rem; letter-spacing: 0.5px;">Explorar Reportes</button>
                    </div>
                </div>

                <div style="margin-top: 3rem; text-align: center;">
                    <button id="admin-logout-btn" class="link-btn" style="color: rgba(255,255,255,0.5); font-size: 1rem;">
                        <svg style="vertical-align: middle; margin-right: 8px;" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Cerrar Sesión Segura
                    </button>
                </div>
            </div>

            <style>
                .admin-card:hover {
                    transform: translateY(-8px);
                    border-color: var(--primary);
                    box-shadow: 0 15px 40px rgba(110, 206, 210, 0.1);
                }
                .admin-card:hover .card-icon {
                    transform: scale(1.1) rotate(5deg);
                    background: rgba(110, 206, 210, 0.2);
                }
                .interactive-card .primary-btn {
                    transition: all 0.3s;
                }
                .admin-card:hover .primary-btn {
                    box-shadow: 0 0 20px rgba(110, 206, 210, 0.3);
                }
            </style>
        `;

        // Event Listeners
        document.getElementById('admin-users-card').addEventListener('click', () => {
            alert('Módulo de Administración de Usuarios en desarrollo para Aura v1.0.');
        });

        document.getElementById('admin-reports-card').addEventListener('click', () => {
            alert('Módulo de Reportes Generales en desarrollo para Aura v1.0.');
        });

        document.getElementById('admin-logout-btn').addEventListener('click', () => {
            window.Auth.logout();
            if (window.Navbar) window.Navbar.update();
            app.renderLogin();
        });
    }
};

window.AdminDashboard = AdminDashboard;
