const HealthProDashboard = {
    allStudents: [],
    
    async render(container, appInstance) {
        const user = window.Auth.getUser();
        const role = window.Auth.getRole();

        // Security check
        if (role !== 'Profesional de la Salud' && role !== 'Pro. Salud') {
            container.innerHTML = `<div class="card"><h1>Acceso Denegado</h1></div>`;
            return;
        }

        container.innerHTML = `
            <div class="dashboard-container">
                <section class="welcome-section">
                    <div class="welcome-header">
                        <div class="welcome-text">
                            <div class="user-badge" style="background: rgba(110, 206, 210, 0.1); color: var(--primary); border: 1px solid rgba(110, 206, 210, 0.2);">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                                Profesional de la Salud
                            </div>
                            <h1>Gestión de Estudiantes</h1>
                            <p class="subtitle" style="text-align: left; margin-bottom: 0;">Bienvenido, ${user.username}. Aquí puedes ver y buscar a los estudiantes a tu cargo.</p>
                        </div>
                        <div class="welcome-actions">
                            <button id="hcpro-logout" class="btn-secondary" style="width: auto; padding: 0.75rem 1.5rem; background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2);">
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </section>

                <div class="admin-controls" style="margin-bottom: 2rem; display: flex; gap: 1rem; align-items: center; background: var(--secondary); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--card-border); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">
                    <div class="search-box" style="flex: 1; position: relative;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" id="search-students" placeholder="Buscar por nombre o correo..." style="width: 100%; padding: 0.85rem 1rem 0.85rem 3rem; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; color: #fff; font-size: 1rem; transition: all 0.3s;">
                    </div>
                    <div id="student-count-badge" style="background: var(--primary); color: #000; padding: 0.5rem 1.25rem; border-radius: 20px; font-weight: 700; font-size: 0.9rem; white-space: nowrap;">
                        Cargando...
                    </div>
                </div>

                <div class="users-list-container" style="background: var(--secondary); border-radius: 20px; border: 1px solid var(--card-border); overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="background: #1e293b; border-bottom: 2px solid var(--primary);">
                                <th style="padding: 1.25rem 1.5rem; color: var(--primary); font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1.2px;">Estudiante</th>
                                <th style="padding: 1.25rem 1.5rem; color: var(--primary); font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1.2px;">Correo Institucional</th>
                                <th style="padding: 1.25rem 1.5rem; color: var(--primary); font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1.2px;">Edad</th>
                                <th style="padding: 1.25rem 1.5rem; color: var(--primary); font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1.2px;">Programa / Facultad</th>
                            </tr>
                        </thead>
                        <tbody id="students-table-body">
                            <!-- Data will be loaded here -->
                        </tbody>
                    </table>
                    <div id="no-students-message" style="display: none; padding: 4rem 2rem; text-align: center; color: #94a3b8;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem; opacity: 0.5;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <p>No se encontraron estudiantes asignados.</p>
                    </div>
                </div>
            </div>

            <div id="student-detail-modal" class="modal" style="display: none;">
                <div class="modal-content" style="max-width: 600px; padding: 0; background: var(--secondary); border-radius: 24px; border: 1px solid var(--card-border); overflow: hidden;">
                    <div id="student-modal-body">
                        <!-- Detail content will be loaded here -->
                    </div>
                </div>
            </div>

            <style>
                #search-students:focus {
                    border-color: var(--primary);
                    background: rgba(30,35,45,1);
                    box-shadow: 0 0 20px rgba(110, 206, 210, 0.15);
                }
                .student-row {
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                .student-row:hover {
                    background: #1e293b;
                }
                .student-row:last-child {
                    border-bottom: none;
                }
                .info-card {
                    background: rgba(15, 23, 42, 0.6);
                    padding: 1rem;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .stat-box {
                    text-align: center;
                    padding: 1rem;
                    background: rgba(110, 206, 210, 0.1);
                    border-radius: 16px;
                    border: 1px solid rgba(110, 206, 210, 0.2);
                }
            </style>
        `;

        this.setupEventListeners(appInstance);
        await this.loadStudents();
    },

    async loadStudents(searchTerm = '') {
        try {
            const token = window.Auth.getToken();
            let url = '/api/hcpro/students/';
            if (searchTerm) {
                url += `?search=${encodeURIComponent(searchTerm)}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al cargar estudiantes');
            
            this.allStudents = await response.json();
            this.renderStudentsTable(this.allStudents);
            
            const badge = document.getElementById('student-count-badge');
            if (badge) {
                badge.textContent = `${this.allStudents.length} Estudiantes`;
            }

        } catch (err) {
            console.error('Failed to load students:', err);
        }
    },

    renderStudentsTable(students) {
        const tbody = document.getElementById('students-table-body');
        const emptyMsg = document.getElementById('no-students-message');
        
        if (!tbody) return;

        if (students.length === 0) {
            tbody.innerHTML = '';
            emptyMsg.style.display = 'block';
            return;
        }

        emptyMsg.style.display = 'none';
        tbody.innerHTML = students.map(student => `
            <tr class="student-row" onclick="HealthProDashboard.showStudentDetail(${student.id})">
                <td style="padding: 1.25rem 1.5rem;">
                    <div style="font-weight: 600; color: #fff;">${student.first_name} ${student.last_name}</div>
                </td>
                <td style="padding: 1.25rem 1.5rem;">
                    <div style="color: #94a3b8; font-size: 0.9rem;">${student.email}</div>
                </td>
                <td style="padding: 1.25rem 1.5rem;">
                    <div style="color: #fff; font-size: 0.9rem;">${student.age || 'N/A'} años</div>
                </td>
                <td style="padding: 1.25rem 1.5rem;">
                    <div style="color: #fff; font-size: 0.85rem; margin-bottom: 0.25rem;">${student.program || 'N/A'}</div>
                    <div style="color: var(--primary); font-size: 0.75rem; opacity: 0.8;">${student.faculty || ''}</div>
                </td>
            </tr>
        `).join('');
    },

    async showStudentDetail(studentId) {
        const modal = document.getElementById('student-detail-modal');
        const body = document.getElementById('student-modal-body');
        if (!modal || !body) return;

        modal.style.display = 'flex';
        body.innerHTML = `
            <div style="padding: 3rem; text-align: center;">
                <div class="spinner"></div>
                <p>Cargando perfil...</p>
            </div>
        `;

        try {
            const token = window.Auth.getToken();
            const response = await fetch(`/api/admin/users/${studentId}/`, {
                headers: { 'Authorization': `Token ${token}` }
            });

            if (!response.ok) throw new Error('Error al cargar detalle');
            const student = await response.json();

            body.innerHTML = `
                <div style="position: relative; padding: 2rem; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
                    <button id="close-modal" style="position: absolute; right: 1.5rem; top: 1.5rem; width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 0; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    
                    <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                        <div style="width: 80px; height: 80px; background: var(--primary); color: var(--secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; margin-bottom: 1.5rem; box-shadow: 0 0 20px rgba(110, 206, 210, 0.3);">
                            ${student.first_name[0]}${student.last_name[0]}
                        </div>
                        <h2 style="font-size: 1.75rem; margin-bottom: 0.5rem; color: #fff;">${student.first_name} ${student.last_name}</h2>
                        <span class="user-badge" style="margin: 0 auto 1.5rem auto;">${student.role || 'Estudiante'}</span>
                    </div>
                </div>

                <div style="padding: 2rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                        <div class="stat-box">
                            <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">${student.emotions_count || 0}</div>
                            <div style="font-size: 0.7rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-top: 5px;">Emociones</div>
                        </div>
                        <div class="stat-box">
                            <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">${student.surveys_count || 0}</div>
                            <div style="font-size: 0.7rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-top: 5px;">Encuestas</div>
                        </div>
                    </div>

                    <div style="display: grid; gap: 1rem;">
                        <div class="info-card">
                            <label style="margin-bottom: 4px; display: block; font-size: 0.75rem; color: var(--primary);">Correo Electrónico</label>
                            <div style="color: #fff; font-size: 1rem;">${student.email}</div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="info-card">
                                <label style="margin-bottom: 4px; display: block; font-size: 0.75rem; color: var(--primary);">Edad</label>
                                <div style="color: #fff; font-size: 1rem;">${student.calculated_age || 'N/A'} años</div>
                            </div>
                            <div class="info-card">
                                <label style="margin-bottom: 4px; display: block; font-size: 0.75rem; color: var(--primary);">Semestre</label>
                                <div style="color: #fff; font-size: 1rem;">${student.Semester || 'N/A'}</div>
                            </div>
                        </div>
                        <div class="info-card">
                            <label style="margin-bottom: 4px; display: block; font-size: 0.75rem; color: var(--primary);">Programa Académico</label>
                            <div style="color: #fff; font-size: 1rem;">${student.program}</div>
                            <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 2px;">${student.faculty}</div>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('close-modal').addEventListener('click', () => {
                modal.style.display = 'none';
            });

        } catch (err) {
            body.innerHTML = `
                <div style="padding: 3rem; text-align: center;">
                    <p style="color: var(--error);">Error al cargar el perfil del estudiante.</p>
                    <button onclick="document.getElementById('student-detail-modal').style.display='none'" style="margin-top: 1rem;">Cerrar</button>
                </div>
            `;
        }
    },

    setupEventListeners(appInstance) {
        const logoutBtn = document.getElementById('hcpro-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                window.Auth.logout();
                if (window.Navbar) window.Navbar.update();
                appInstance.renderLogin();
            });
        }

        const searchInput = document.getElementById('search-students');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.loadStudents(e.target.value);
                }, 300);
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('student-detail-modal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
};

window.HealthProDashboard = HealthProDashboard;
