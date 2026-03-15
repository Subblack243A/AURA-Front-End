const AdminUsers = {
    allUsers: [],
    roles: [],
    healthPros: [],

    async render(appContainer, app) {
        appContainer.innerHTML = `
            <div class="admin-users-wrapper" style="width: 100%; max-width: none; margin: 0; padding: 1rem 1rem 3rem 1rem;">
                <div class="dashboard-header" style="text-align: center; margin-bottom: 3rem;">
                    <h1 style="font-size: 2.2rem; background: linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        Administración de Usuarios
                    </h1>
                    <p class="subtitle">Gestiona las solicitudes de cuenta y el directorio de usuarios.</p>
                </div>

                <div class="search-container" style="margin-bottom: 2rem; position: relative;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--primary); opacity: 0.8;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="search-users" placeholder="Buscar por nombre, correo o rol..." 
                        style="width: 100%; padding: 1rem 1rem 1rem 3.5rem; border-radius: 12px; background: rgba(30,35,45,0.9); border: 2px solid rgba(110, 206, 210, 0.2); color: #fff; font-size: 1rem; outline: none; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                </div>


                <div class="users-list card" style="padding: 1.5rem; overflow-x: auto; max-width: none; width: 100%;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); text-align: left;">
                                <th style="padding: 1rem; color: var(--primary);">Nombre Completo</th>
                                <th style="padding: 1rem; color: var(--primary);">Correo</th>
                                <th style="padding: 1rem; color: var(--primary);">Rol</th>
                                <th style="padding: 1rem; color: var(--primary);">Programa / Facultad</th>
                                <th style="padding: 1rem; color: var(--primary); text-align: right;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="users-table-body">
                            <!-- Users will be injected here -->
                        </tbody>
                    </table>
                </div>

                <div id="admin-user-profile" style="display: none;">
                    <!-- User detail content will be injected here -->
                </div>

                <div style="margin-top: 3rem; text-align: center;" id="admin-users-back-container">
                    <button id="back-to-admin-dashboard" class="secondary-btn" style="width: auto; padding: 0.75rem 2rem;">← Volver al Panel</button>
                </div>
            </div>

            <!-- Reactivation Modal -->
            <div id="reactivation-modal" class="modal-overlay" style="display: none;">
                <div class="modal-content card" style="max-width: 400px; padding: 2.5rem; text-align: center; border: 1px solid rgba(110, 206, 210, 0.2);">
                    <h3 style="margin-bottom: 1.5rem; color: #fff;">Reactivar Cuenta</h3>
                    <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 2rem;">Seleccione el rol que tendrá el usuario al reactivar su acceso:</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem;">
                        <button class="role-select-btn" data-role="2">Estudiante</button>
                        <button class="role-select-btn" data-role="3">Profesional de la Salud</button>
                        <button class="role-select-btn" data-role="4">Administrador</button>
                    </div>

                    <button class="secondary-btn" id="close-reactivation-modal" style="width: auto; padding: 0.5rem 1.5rem; font-size: 0.85rem;">Cancelar</button>
                </div>
            </div>

            <style>
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.85);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    backdrop-filter: blur(8px);
                }
                .role-select-btn {
                    padding: 1rem;
                    border-radius: 12px;
                    border: 1px solid rgba(110, 206, 210, 0.1);
                    background: rgba(110, 206, 210, 0.05);
                    color: #fff;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .role-select-btn:hover {
                    background: rgba(110, 206, 210, 0.15);
                    border-color: var(--primary);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(110, 206, 210, 0.2);
                }
                .row-pending {
                    background: rgba(251, 191, 36, 0.05);
                    border-left: 4px solid #fbbf24 !important;
                }
                .btn-approve {
                    background: var(--primary);
                    color: #fff;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                }
                .btn-approve:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(110, 206, 210, 0.3);
                }
                .role-badge-pending {
                    background: rgba(251, 191, 36, 0.2);
                    color: #fbbf24;
                    border: 1px solid rgba(251, 191, 36, 0.3);
                }
                .btn-approve:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
                #search-users:focus {
                    border-color: var(--primary);
                    background: rgba(30,35,45,1);
                    box-shadow: 0 0 20px rgba(110, 206, 210, 0.15);
                }
                .user-row {
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .user-row:hover {
                    background: rgba(110, 206, 210, 0.05) !important;
                }
            </style>
        `;

        document.getElementById('back-to-admin-dashboard').addEventListener('click', () => app.renderAdminDashboard());
        document.getElementById('close-reactivation-modal').addEventListener('click', () => this.hideReactivationModal());
        
        const searchInput = document.getElementById('search-users');
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = this.allUsers.filter(u => 
                u.first_name.toLowerCase().includes(term) || 
                u.last_name.toLowerCase().includes(term) || 
                u.email.toLowerCase().includes(term) || 
                u.role.toLowerCase().includes(term)
            );
            this.renderUsers(filtered);
        });

        await this.fetchUsers();
    },

    async fetchUsers() {
        const token = window.Auth.getToken();
        try {
            const response = await fetch('/api/admin/users/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar la lista de usuarios.');
            this.allUsers = await response.json();
            this.renderUsers(this.allUsers);
        } catch (err) {
            console.error(err);
            // Show error notification if possible
        }
    },

    async fetchRoles() {
        if (this.roles.length > 0) return;
        const token = window.Auth.getToken();
        try {
            const response = await fetch('/api/roles/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                this.roles = data.filter(r => ['Estudiante', 'Profesional de la Salud', 'Administrador'].includes(r.RoleType));
            }
        } catch (err) {
            console.error('Error fetching roles:', err);
        }
    },

    async fetchHealthPros() {
        if (this.healthPros.length > 0) return;
        const token = window.Auth.getToken();
        try {
            const response = await fetch('/api/admin/health-pros/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (response.ok) {
                this.healthPros = await response.json();
            }
        } catch (err) {
            console.error('Error fetching health pros:', err);
        }
    },

    renderUsers(users) {
        const tbody = document.getElementById('users-table-body');
        const pendingMsg = document.getElementById('pending-empty-msg');
        if (!tbody) return;

        // Sorting: Pending first
        const sortedUsers = [...users].sort((a, b) => {
            const roleA = a.role.toLowerCase();
            const roleB = b.role.toLowerCase();
            if (roleA === 'pendiente' && roleB !== 'pendiente') return -1;
            if (roleA !== 'pendiente' && roleB === 'pendiente') return 1;
            return 0;
        });

        if (pendingMsg) {
            pendingMsg.remove(); 
        }

        tbody.innerHTML = sortedUsers.map(user => {
            const isPending = user.role.toLowerCase() === 'pendiente';
            const rowClass = isPending ? 'row-pending' : '';
            
            return `
                <tr class="user-row ${rowClass}" style="border-bottom: 1px solid rgba(255,255,255,0.05);" onclick="AdminUsers.viewUserProfile('${user.id}')">
                    <td style="padding: 1.2rem 1rem; color: #fff; font-weight: 500;">${user.first_name} ${user.last_name}</td>
                    <td style="padding: 1.2rem 1rem; color: #94a3b8;">${user.email}</td>
                    <td style="padding: 1.2rem 1rem;">
                        <span class="role-badge ${this.getRoleClass(user.role)}">${window.Auth.formatRole(user.role)}</span>
                    </td>
                    <td style="padding: 1.2rem 1rem; color: #94a3b8; font-size: 0.9rem;">
                        ${user.program} <br> <span style="font-size: 0.8rem; opacity: 0.7;">${user.faculty}</span>
                    </td>
                    <td style="padding: 1.2rem 1rem; text-align: right;">
                        ${isPending ? `
                            <button class="btn-approve" onclick="event.stopPropagation(); AdminUsers.approveUser('${user.id}', this)">
                                Aceptar petición
                            </button>
                        ` : `
                            <button class="link-btn" style="font-size: 0.85rem; color: var(--primary);">Ver Detalle →</button>
                        `}
                    </td>
                </tr>
            `;
        }).join('');
    },

    getRoleClass(role) {
        const r = role.toLowerCase();
        if (r === 'administrador') return 'role-badge-admin';
        if (r === 'estudiante') return 'role-badge-student';
        if (r === 'profesional de la salud' || r === 'prof. de salud') return 'role-badge-health';
        if (r === 'pendiente') return 'role-badge-pending';
        return 'role-badge-default';
    },

    async approveUser(userId, btn) {
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner" style="width: 14px; height: 14px; margin-right: 8px;"></span> Aprobando...`;

        const token = window.Auth.getToken();
        try {
            const response = await fetch(`/api/admin/users/${userId}/approve/`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Error al aprobar usuario');
            }

            // Notification of success
            this.showNotification('Usuario aprobado exitosamente. Notificaciones enviadas.', 'success');
            
            // Refresh
            await this.fetchUsers();
        } catch (err) {
            console.error(err);
            this.showNotification(err.message, 'error');
            btn.disabled = false;
            btn.textContent = originalText;
        }
    },

    async viewUserProfile(userId) {
        const container = document.getElementById('admin-user-profile');
        const listCard = document.querySelector('.users-list');
        const searchContainer = document.querySelector('.search-container');
        const pendingMsg = document.getElementById('pending-empty-msg');
        const header = document.querySelector('.dashboard-header');
        const backContainer = document.getElementById('admin-users-back-container');

        // Toggle UI
        listCard.style.display = 'none';
        searchContainer.style.display = 'none';
        if (pendingMsg) pendingMsg.style.display = 'none';
        header.style.display = 'none';
        backContainer.style.display = 'none';
        container.style.display = 'block';

        container.innerHTML = `<div style="text-align: center; padding: 3rem;"><span class="spinner"></span> Cargando perfil...</div>`;

        const token = window.Auth.getToken();
        try {
            const response = await fetch(`/api/admin/users/${userId}/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) throw new Error('No se pudo cargar el detalle del usuario.');
            const user = await response.json();
            
            // Prefetch roles and HP list before rendering
            await Promise.all([this.fetchRoles(), this.fetchHealthPros()]);
            
            this.renderUserDetail(user);
        } catch (err) {
            console.error(err);
            this.showNotification(err.message, 'error');
            this.closeUserDetail();
        }
    },

    renderUserDetail(user) {
        const container = document.getElementById('admin-user-profile');
        const role = user.role ? user.role.toLowerCase() : '';
        const isPending = role === 'pendiente';
        const isHealthPro = role === 'profesional de la salud' || role === 'prof. de salud';
        const isAdmin = role === 'administrador' || role === 'administradora';
        const isDeactivated = role === 'desactivado' || role === 'desactivada';

        // Base template for the header and back button
        let html = `
            <div class="user-detail-view">
                <button class="secondary-btn" style="width: auto; margin-bottom: 2rem;" onclick="AdminUsers.closeUserDetail()">← Volver a la lista</button>
        `;

        if (isPending) {
            html += `
                <div class="profile-card card" style="padding: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem;">
                        <h2 style="margin: 0;">Perfil de Usuario</h2>
                        <span class="role-badge ${this.getRoleClass(user.role)}">${window.Auth.formatRole(user.role)}</span>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                        <div class="form-group">
                            <label style="color: var(--primary); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; display: block;">Nombre(s)</label>
                            <div style="background: rgba(30,35,45,0.9); padding: 0.75rem; border-radius: 8px; border: 2px solid rgba(110, 206, 210, 0.2); color: #fff;">${user.first_name}</div>
                        </div>
                        <div class="form-group">
                            <label style="color: var(--primary); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; display: block;">Apellidos</label>
                            <div style="background: rgba(30,35,45,0.9); padding: 0.75rem; border-radius: 8px; border: 2px solid rgba(110, 206, 210, 0.2); color: #fff;">${user.last_name}</div>
                        </div>
                        <div class="form-group">
                            <label style="color: var(--primary); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; display: block;">Correo Electrónico</label>
                            <div style="background: rgba(30,35,45,0.9); padding: 0.75rem; border-radius: 8px; border: 2px solid rgba(110, 206, 210, 0.2); color: #fff;">${user.email}</div>
                        </div>
                        <div class="form-group">
                            <label style="color: var(--primary); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; display: block;">Usuario</label>
                            <div style="background: rgba(30,35,45,0.9); padding: 0.75rem; border-radius: 8px; border: 2px solid rgba(110, 206, 210, 0.2); color: #fff;">${user.username}</div>
                        </div>
                    </div>

                    <div class="action-buttons" style="margin-top: 2.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                        <button id="btn-approve-hcpro" class="primary-btn" style="width: auto; padding: 0.75rem 2rem; background: #22c55e; border: none; color: #fff; font-weight: 600;" onclick="AdminUsers.approveHCPro('${user.id}', this)">Aceptar Solicitud</button>
                        <button id="btn-reject-hcpro" class="primary-btn" style="width: auto; padding: 0.75rem 2rem; background: #ef4444; border: none; color: #fff; font-weight: 600;" onclick="AdminUsers.rejectHCPro('${user.id}', this)">Denegar Solicitud</button>
                    </div>
                </div>
            `;
        } else if (isAdmin || isDeactivated) {
            // Simplified view for Admins and Deactivated users
            html += `
                <div class="profile-card card" style="padding: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem;">
                        <h2 style="margin: 0;">Perfil de ${isAdmin ? 'Administrador' : 'Usuario'}</h2>
                        <span class="role-badge ${this.getRoleClass(user.role)}">${window.Auth.formatRole(user.role)}</span>
                    </div>

                    <form id="edit-user-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                        <div class="form-group">
                            <label>Nombre(s)</label>
                            <input type="text" id="edit-first-name" value="${user.first_name}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Apellidos</label>
                            <input type="text" id="edit-last-name" value="${user.last_name}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Correo Electrónico</label>
                            <input type="email" id="edit-email" value="${user.email}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Usuario</label>
                            <input type="text" id="edit-username" value="${user.username}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Rol</label>
                            <select id="edit-role-id" disabled style="width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(30,35,45,0.9); border: 2px solid rgba(110, 206, 210, 0.2); color: #fff;">
                                ${this.roles.map(r => `
                                    <option value="${r.ID_Role}" ${r.ID_Role === user.role_id ? 'selected' : ''}>${r.RoleType}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Profesional Asignado</label>
                            <select id="edit-hp-id" disabled style="width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(30,35,45,0.9); border: 2px solid rgba(110, 206, 210, 0.2); color: #fff;">
                                <option value="">Sin asignar</option>
                                ${this.healthPros.map(hp => `
                                    <option value="${hp.ID_User}" ${hp.ID_User === user.assigned_hp_id ? 'selected' : ''}>${hp.full_name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <input type="hidden" id="edit-semester" value="0">
                        <input type="hidden" id="edit-birth-date" value="">
                    </form>

                    <div class="action-buttons" style="margin-top: 2.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                        <button id="btn-edit-user" class="primary-btn" style="width: auto; padding: 0.75rem 2rem;" onclick="AdminUsers.enableUserEdit()">Editar Datos</button>
                        <button id="btn-save-user" class="primary-btn" style="width: auto; padding: 0.75rem 2rem; display: none;" onclick="AdminUsers.saveUserChanges('${user.id}')">Guardar</button>
                        
                        <button id="btn-toggle-status" 
                                class="${isDeactivated ? 'btn-approve' : 'secondary-btn'}" 
                                style="width: auto; padding: 0.75rem 2rem; background: ${isDeactivated ? '#22c55e' : '#ef4444'}; border: none; color: #fff;" 
                                onclick="AdminUsers.toggleAccountStatus('${user.id}', '${user.role}')">
                            ${isDeactivated ? 'Reactivar Cuenta' : 'Desactivar Cuenta'}
                        </button>

                        ${isDeactivated ? `
                            <button class="primary-btn" style="width: auto; padding: 0.75rem 2rem; background: #7f1d1d; border: 1px solid #ef4444; color: #fff;" onclick="AdminUsers.deleteUserPermanently('${user.id}')">
                                Eliminar de la Base de Datos
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        } else {
            // Default view for Students and Health Pros (with metrics)
            html += `
                <div class="metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
                    ${isHealthPro ? `
                        <div class="metric-card card" style="text-align: center; padding: 1.5rem; border-left: 4px solid #a78bfa;">
                            <span style="font-size: 0.8rem; color: #a78bfa; font-weight: 600; text-transform: uppercase;">Estudiantes a cargo</span>
                            <div style="font-size: 2.5rem; font-weight: 700; margin-top: 0.5rem; color: #fff;">${user.assigned_students_count || 0}</div>
                        </div>
                    ` : `
                        <div class="metric-card card" style="text-align: center; padding: 1.5rem;">
                            <span style="font-size: 0.8rem; color: var(--primary); font-weight: 600; text-transform: uppercase;">Reconocimientos</span>
                            <div style="font-size: 2.5rem; font-weight: 700; margin-top: 0.5rem; color: #fff;">${user.recognitions_count}</div>
                        </div>
                        <div class="metric-card card" style="text-align: center; padding: 1.5rem;">
                            <span style="font-size: 0.8rem; color: var(--primary); font-weight: 600; text-transform: uppercase;">Emociones</span>
                            <div style="font-size: 2.5rem; font-weight: 700; margin-top: 0.5rem; color: #fff;">${user.emotions_count}</div>
                        </div>
                        <div class="metric-card card" style="text-align: center; padding: 1.5rem;">
                            <span style="font-size: 0.8rem; color: var(--primary); font-weight: 600; text-transform: uppercase;">Encuestas</span>
                            <div style="font-size: 2.5rem; font-weight: 700; margin-top: 0.5rem; color: #fff;">${user.surveys_count}</div>
                        </div>
                    `}
                </div>

                <div class="profile-card card" style="padding: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem;">
                        <h2 style="margin: 0;">Perfil de Usuario</h2>
                        <span class="role-badge ${this.getRoleClass(user.role)}">${window.Auth.formatRole(user.role)}</span>
                    </div>

                    <form id="edit-user-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                        <div class="form-group">
                            <label>Nombre(s)</label>
                            <input type="text" id="edit-first-name" value="${user.first_name}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Apellidos</label>
                            <input type="text" id="edit-last-name" value="${user.last_name}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Correo Electrónico</label>
                            <input type="email" id="edit-email" value="${user.email}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Usuario</label>
                            <input type="text" id="edit-username" value="${user.username}" disabled>
                        </div>
                        ${!isHealthPro ? `
                        <div class="form-group">
                            <label>Semestre</label>
                            <input type="number" id="edit-semester" value="${user.Semester || 0}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Fecha de Nacimiento</label>
                            <input type="date" id="edit-birth-date" value="${user.DateOfBirth || ''}" disabled>
                        </div>
                        ` : `
                        <input type="hidden" id="edit-semester" value="${user.Semester || 0}">
                        <input type="hidden" id="edit-birth-date" value="${user.DateOfBirth || ''}">
                        `}
                        <div class="form-group">
                            <label>Rol</label>
                            <select id="edit-role-id" disabled style="width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(30,35,45,0.9); border: 2px solid rgba(110, 206, 210, 0.2); color: #fff;">
                                ${this.roles.map(r => `
                                    <option value="${r.ID_Role}" ${r.ID_Role === user.role_id ? 'selected' : ''}>${r.RoleType}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Profesional Asignado</label>
                            <select id="edit-hp-id" disabled style="width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(30,35,45,0.9); border: 2px solid rgba(110, 206, 210, 0.2); color: #fff;">
                                <option value="">Sin asignar</option>
                                ${this.healthPros.map(hp => `
                                    <option value="${hp.ID_User}" ${hp.ID_User === user.assigned_hp_id ? 'selected' : ''}>${hp.full_name}</option>
                                `).join('')}
                            </select>
                        </div>
                    </form>

                    <div class="action-buttons" style="margin-top: 2.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                        <button id="btn-edit-user" class="primary-btn" style="width: auto; padding: 0.75rem 2rem;" onclick="AdminUsers.enableUserEdit()">Editar Usuario</button>
                        <button id="btn-save-user" class="primary-btn" style="width: auto; padding: 0.75rem 2rem; display: none;" onclick="AdminUsers.saveUserChanges('${user.id}')">Guardar Cambios</button>
                        <button class="secondary-btn" style="width: auto; padding: 0.75rem 2rem; background: #ef4444; border: none; color: #fff;" onclick="AdminUsers.toggleAccountStatus('${user.id}', '${user.role}')">Desactivar Cuenta</button>
                    </div>
                </div>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;
    },

    closeUserDetail() {
        document.getElementById('admin-user-profile').style.display = 'none';
        document.querySelector('.users-list').style.display = 'block';
        document.querySelector('.search-container').style.display = 'block';
        document.querySelector('.dashboard-header').style.display = 'block';
        document.getElementById('admin-users-back-container').style.display = 'block';
    },

    enableUserEdit() {
        const inputs = document.querySelectorAll('#edit-user-form input');
        inputs.forEach(input => input.disabled = false);
        
        const selects = document.querySelectorAll('#edit-user-form select');
        selects.forEach(select => select.disabled = false);

        document.getElementById('btn-edit-user').style.display = 'none';
        document.getElementById('btn-save-user').style.display = 'inline-block';
    },

    async saveUserChanges(userId) {
        const hpId = document.getElementById('edit-hp-id').value;
        const data = {
            first_name: document.getElementById('edit-first-name').value,
            last_name: document.getElementById('edit-last-name').value,
            email: document.getElementById('edit-email').value,
            username: document.getElementById('edit-username').value,
            Semester: parseInt(document.getElementById('edit-semester').value),
            DateOfBirth: document.getElementById('edit-birth-date').value,
            role_id: parseInt(document.getElementById('edit-role-id').value),
            assigned_hp_id: hpId ? parseInt(hpId) : null
        };

        const btn = document.getElementById('btn-save-user');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner" style="width: 14px; height: 14px; margin-right: 8px;"></span> Guardando...`;

        const token = window.Auth.getToken();
        try {
            const response = await fetch(`/api/admin/users/${userId}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Error al actualizar el usuario.');
            
            this.showNotification('Usuario actualizado exitosamente.', 'success');
            
            // Re-disable inputs
            const inputs = document.querySelectorAll('#edit-user-form input');
            inputs.forEach(input => input.disabled = true);
            document.getElementById('btn-edit-user').style.display = 'inline-block';
            btn.style.display = 'none';
            btn.disabled = false;
            btn.textContent = originalText;

            // Refresh underlying list
            await this.fetchUsers();
        } catch (err) {
            console.error(err);
            this.showNotification(err.message, 'error');
            btn.disabled = false;
            btn.textContent = originalText;
        }
    },

    async toggleAccountStatus(userId, currentRole) {
        if (currentRole === 'Desactivado') {
            this.showReactivationModal(userId);
        } else {
            if (!confirm(`¿Estás seguro de que deseas desactivar esta cuenta?`)) return;
            await this.performStatusToggle(userId, 5, true); // 5: Desactivado
        }
    },

    showReactivationModal(userId) {
        const modal = document.getElementById('reactivation-modal');
        modal.style.display = 'flex';
        
        const buttons = modal.querySelectorAll('.role-select-btn');
        buttons.forEach(btn => {
            btn.onclick = async () => {
                const roleId = btn.getAttribute('data-role');
                this.hideReactivationModal();
                await this.performStatusToggle(userId, roleId, false);
            };
        });
    },

    hideReactivationModal() {
        document.getElementById('reactivation-modal').style.display = 'none';
    },

    async performStatusToggle(userId, roleId, isDeactivating) {
        const token = window.Auth.getToken();
        try {
            const response = await fetch(`/api/admin/users/${userId}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    is_active: isDeactivating ? false : true,
                    role_id: roleId 
                })
            });

            if (!response.ok) throw new Error(`Error al actualizar el estado del usuario.`);
            
            this.showNotification(`Usuario ${isDeactivating ? 'desactivado' : 'reactivado'} correctamente.`, 'success');
            
            // Reload detail to update button color/text
            await this.viewUserProfile(userId);
            // Refresh list
            await this.fetchUsers();
        } catch (err) {
            console.error(err);
            this.showNotification(err.message, 'error');
        }
    },

    async approveHCPro(userId, btn) {
        if (!confirm('¿Estás seguro de que deseas ACEPTAR esta solicitud de profesional de la salud?')) return;
        
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner" style="width: 14px; height: 14px; margin-right: 8px;"></span> Procesando...`;

        const token = window.Auth.getToken();
        try {
            const response = await fetch(`/api/admin/users/${userId}/approve/`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Error al aprobar solicitud');
            }

            this.showNotification('Solicitud procesada: Profesional aceptado.', 'success');
            this.closeUserDetail();
            await this.fetchUsers();
        } catch (err) {
            console.error(err);
            this.showNotification(err.message, 'error');
            btn.disabled = false;
            btn.textContent = originalText;
        }
    },

    async rejectHCPro(userId, btn) {
        if (!confirm('¿Estás seguro de que deseas DENEGAR y ELIMINAR esta solicitud?')) return;

        const originalText = btn.textContent;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner" style="width: 14px; height: 14px; margin-right: 8px;"></span> Procesando...`;

        const token = window.Auth.getToken();
        try {
            const response = await fetch(`/api/admin/users/${userId}/reject/`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Error al denegar solicitud');
            }

            this.showNotification('Solicitud procesada: Profesional denegado y eliminado.', 'success');
            // Refresh
            await this.fetchUsers();
            this.closeUserDetail();
        } catch (err) {
            console.error(err);
            this.showNotification(err.message, 'error');
            btn.disabled = false;
            btn.textContent = originalText;
        }
    },

    async deleteUserPermanently(userId) {
        if (!confirm('¿ESTÁS ABSOLUTAMENTE SEGURO? Esta acción ELIMINARÁ PERMANENTEMENTE todos los datos de este usuario de la base de datos y no se puede deshacer.')) return;
        
        const token = window.Auth.getToken();
        try {
            const response = await fetch(`/api/admin/users/${userId}/`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Token ${token}`
                }
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Error al eliminar usuario');
            }

            this.showNotification('Usuario eliminado permanentemente.', 'success');
            
            // Refresh underlying list
            await this.fetchUsers();
            this.closeUserDetail();
        } catch (err) {
            console.error(err);
            this.showNotification(err.message, 'error');
        }
    },

    showNotification(message, type) {
        // Simple alert if no notification system is available
        // In a real app, you'd use a toast or similar
        alert(`${type.toUpperCase()}: ${message}`);
    }
};

window.AdminUsers = AdminUsers;
