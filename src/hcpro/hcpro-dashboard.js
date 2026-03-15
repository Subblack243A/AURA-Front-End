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
                <div class="modal-content" style="width: 95%; max-width: 1300px; padding: 0; background: var(--secondary); border-radius: 24px; border: 1px solid var(--card-border); overflow: hidden;">
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
                    padding: 1.5rem;
                    background: rgba(110, 206, 210, 0.05);
                    border-radius: 16px;
                    border: 1px solid rgba(110, 206, 210, 0.1);
                    transition: all 0.3s ease;
                }
                .stat-box:hover {
                    background: rgba(110, 206, 210, 0.1);
                    border-color: var(--primary);
                }
                
                /* Charts Grid Styles */
                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.5rem;
                    padding: 1rem;
                }
                .chart-card {
                    background: rgba(15, 23, 42, 0.4);
                    border-radius: 16px;
                    padding: 1.5rem;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .chart-card h4 {
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                    color: var(--primary);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                @media (max-width: 768px) {
                    .charts-grid {
                        grid-template-columns: 1fr;
                    }
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
            <div style="padding: 4rem; text-align: center;">
                <div class="spinner"></div>
                <p style="margin-top: 1rem; color: #94a3b8;">Cargando perfil y analíticas...</p>
            </div>
        `;

        const userRole = window.Auth.getRole();
        const isHP = userRole === 'Profesional de la Salud' || userRole === 'Pro. Salud';

        try {
            const token = window.Auth.getToken();
            
            // 1. Fetch user detail
            const userResponse = await fetch(`/api/admin/users/${studentId}/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!userResponse.ok) throw new Error('Error al cargar detalle');
            const student = await userResponse.json();

            // Render Header & Stats
            body.innerHTML = `
                <div style="max-height: 90vh; overflow-y: auto;">
                    <div style="position: relative; padding: 3rem 2rem; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
                        <button id="close-modal" style="position: absolute; right: 1.5rem; top: 1.5rem; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        
                        <div style="display: flex; gap: 2rem; align-items: center;">
                            <div style="width: 100px; height: 100px; background: var(--primary); color: var(--secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; box-shadow: 0 0 30px rgba(110, 206, 210, 0.3);">
                                ${student.first_name[0]}${student.last_name[0]}
                            </div>
                            <div style="text-align: left;">
                                <h2 style="font-size: 2rem; margin-bottom: 0.5rem; color: #fff;">${student.first_name} ${student.last_name}</h2>
                                <div style="display: flex; gap: 0.75rem;">
                                    <span class="user-badge">${student.role || 'Estudiante'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="padding: 2.5rem;">
                        <!-- Basic Info Cards -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2.5rem;">
                            <div class="info-card">
                                <label style="margin-bottom: 4px; display: block; font-size: 0.75rem; color: var(--primary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Edad</label>
                                <div style="color: #fff; font-size: 1.1rem; font-weight: 600;">${student.calculated_age || 'N/A'} años</div>
                            </div>
                            <div class="info-card">
                                <label style="margin-bottom: 4px; display: block; font-size: 0.75rem; color: var(--primary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Semestre</label>
                                <div style="color: #fff; font-size: 1.1rem; font-weight: 600;">${student.Semester || 'N/A'}° Semestre</div>
                            </div>
                            <div class="info-card">
                                <label style="margin-bottom: 4px; display: block; font-size: 0.75rem; color: var(--primary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Programa</label>
                                <div style="color: #fff; font-size: 1rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${student.program}">${student.program}</div>
                            </div>
                        </div>

                        <!-- Analytical Charts Section (visible only to HP) -->
                        <div id="health-pro-charts-container" style="display: ${isHP ? 'block' : 'none'}; margin-top: 1rem;">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                                <div style="height: 2px; flex: 1; background: linear-gradient(90deg, var(--primary) 0%, transparent 100%);"></div>
                                <h3 style="font-size: 1.1rem; color: #fff; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">Análisis Emocional</h3>
                                <div style="height: 2px; flex: 1; background: linear-gradient(270deg, var(--primary) 0%, transparent 100%);"></div>
                            </div>
                            
                            <div class="charts-grid">
                                <div class="chart-card">
                                    <h4>Reconocimiento de emociones (promedio)</h4>
                                    <div id="chart-facial-avg" style="min-height: 250px;"></div>
                                </div>
                                <div class="chart-card">
                                    <h4>Historial de Reconocimiento</h4>
                                    <div id="chart-facial-timeline" style="min-height: 250px;"></div>
                                </div>
                                <div class="chart-card">
                                    <h4>Emociones Registradas (Promedio)</h4>
                                    <div id="chart-manual-avg" style="min-height: 250px;"></div>
                                </div>
                                <div class="chart-card">
                                    <h4>Registro de Emociones</h4>
                                    <div id="chart-manual-timeline" style="min-height: 250px;"></div>
                                </div>
                            </div>

                            <!-- Survey History Section for HP -->
                            <div style="margin-top: 3rem;">
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                                    <div style="height: 2px; flex: 1; background: linear-gradient(90deg, var(--primary) 0%, transparent 100%);"></div>
                                    <h3 style="font-size: 1.1rem; color: #fff; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">Historial de Encuestas</h3>
                                    <div style="height: 2px; flex: 1; background: linear-gradient(270deg, var(--primary) 0%, transparent 100%);"></div>
                                </div>
                                <div id="hp-survey-history-container" style="background: rgba(15, 23, 42, 0.4); border-radius: 16px; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.05);">
                                    <div class="spinner"></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            `;

            document.getElementById('close-modal').addEventListener('click', () => {
                modal.style.display = 'none';
            });

            // 2. Fetch & Render Charts if HP
            if (isHP) {
                this.loadAndRenderCharts(studentId, token);
                this.loadStudentSurveys(studentId, token);
            }

        } catch (err) {
            console.error(err);
            body.innerHTML = `
                <div style="padding: 4rem; text-align: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1.5rem;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p style="color: #fff; font-size: 1.1rem;">Error al cargar el perfil del estudiante.</p>
                    <button onclick="document.getElementById('student-detail-modal').style.display='none'" class="btn-primary" style="margin-top: 1.5rem; width: auto; padding: 0.8rem 2rem;">Cerrar Ventana</button>
                </div>
            `;
        }
    },

    async loadAndRenderCharts(studentId, token) {
        try {
            // Fetch Averages
            const avgResp = await fetch(`/api/reports/user/${studentId}/averages/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            const avgData = await avgResp.json();

            // Fetch Timeline
            const tlResp = await fetch(`/api/reports/user/${studentId}/timeline/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            const tlData = await tlResp.json();

            // Render 4 Charts
            this.renderFacialAvg(avgData.facial_averages);
            this.renderManualAvg(avgData.manual_averages);
            this.renderFacialTimeline(tlData.facial_timeline);
            this.renderManualTimeline(tlData.manual_timeline);

        } catch (err) {
            console.error('Error rendering HP charts:', err);
        }
    },

    async loadStudentSurveys(studentId, token) {
        const container = document.getElementById('hp-survey-history-container');
        try {
            const response = await fetch(`/api/reports/user/${studentId}/surveys/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar encuestas');
            const surveys = await response.json();

            if (!surveys || surveys.length === 0) {
                container.innerHTML = `<p style="color: #94a3b8; text-align: center; padding: 1rem;">El estudiante no ha realizado encuestas aún.</p>`;
                return;
            }

            container.innerHTML = `
                <table class="survey-history-table">
                    <thead>
                        <tr>
                            <th style="text-align: left;">Fecha</th>
                            <th style="text-align: left;">Encuesta</th>
                            <th style="text-align: left;">Resultado</th>
                            <th style="text-align: left;">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${surveys.map(s => `
                            <tr>
                                <td style="text-align: left;">${s.created_at}</td>
                                <td style="text-align: left;">${s.survey_name}</td>
                                <td style="text-align: left;">
                                    <span class="status-badge ${s.has_burnout ? 'burnout-yes' : 'burnout-no'}">
                                        ${s.has_burnout ? 'Con Agotamiento' : 'Sin Agotamiento'}
                                    </span>
                                </td>
                                <td style="text-align: left;">
                                    <button class="btn-detail-link" onclick="HealthProDashboard.openSurveyDetail(${s.id})" style="justify-content: flex-start;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        Ver Detalle
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

        } catch (err) {
            console.error(err);
            container.innerHTML = `<p style="color: #f87171;">Error al cargar historial de encuestas.</p>`;
        }
    },

    async openSurveyDetail(surveyId) {
        // Fetch detail and show modal (reusing logic or implementing directly to avoid dependency issues)
        try {
            const token = window.Auth.getToken();
            const response = await fetch(`/api/surveys/${surveyId}/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar detalle de la encuesta');
            const data = await response.json();
            
            // We can use ProfileView if it's available for the UI part, 
            // but let's make sure we have a reference or a way to show it.
            if (window.ProfileView && window.ProfileView.showDetailModal) {
                window.ProfileView.showDetailModal(data);
            } else {
                // Fallback implementation if ProfileView is not loaded
                this.showGenericDetailModal(data);
            }
        } catch (err) {
            console.error(err);
            alert("Error al cargar el detalle de la encuesta");
        }
    },

    showGenericDetailModal(data) {
        // Simplified version if ProfileView is missing
        const questions = [
            "Las actividades académicas me tienen emocionalmente agotado.",
            "He perdido el interés en mis estudios desde que empecé la universidad/colegio.",
            "Puedo resolver de manera eficaz los problemas relacionados con mis estudios.",
            "Me encuentro agotado físicamente al final de un día en la universidad/colegio.",
            "He perdido entusiasmo por los estudios.",
            "Creo que contribuyo efectivamente con las clases a las que asisto.",
            "Estoy exhausto de tanto estudiar.",
            "En mi opinión, soy un buen estudiante.",
            "He aprendido muchas cosas interesantes durante el curso de mis estudios.",
            "Me siento cansado en la mañana cuando me levanto y tengo que afrontar otro día en la universidad/colegio.",
            "Me he distanciado de mis estudios porque pienso que no serán realmente útiles.",
            "Me estimula conseguir objetivos en mis estudios.",
            "Estudiar o ir a clases todo el día es realmente estresante para mí.",
            "Dudo de la importancia y el valor de mis estudios.",
            "Durante las clases tengo la seguridad de que soy eficaz haciendo las cosas."
        ];

        const answerLabels = {
            0: "Nunca", 1: "Casi nunca", 2: "A veces", 3: "Regularmente", 4: "Frecuentemente", 5: "Casi siempre", 6: "Siempre"
        };

        let modal = document.getElementById('survey-detail-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'survey-detail-modal';
            modal.className = 'survey-modal-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="survey-modal-content detail-card">
                <div class="survey-modal-header">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="color: var(--primary); margin-bottom: 0.25rem;">Detalle de Resultados</h2>
                            <p class="subtitle" style="text-align: left;">Evaluado el: ${data.created_at}</p>
                        </div>
                    </div>
                </div>
                <div class="survey-detail-body">
                    <!-- Dimensions Summary Section -->
                    <div class="dimensions-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        <div class="dimension-card" style="background: rgba(110, 206, 210, 0.1); padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(110, 206, 210, 0.2);">
                            <div style="font-size: 0.8rem; color: var(--primary); font-weight: 700; text-transform: uppercase;">Agotamiento Emocional</div>
                            <div style="font-size: 1.5rem; color: #fff; font-weight: 800; margin: 0.5rem 0;">${data.results.scores.emotional_exhaustion_score}</div>
                            <div class="status-badge ${data.results.levels.ee_level === 'Alto' ? 'burnout-yes' : 'burnout-no'}">${data.results.levels.ee_level}</div>
                        </div>
                        <div class="dimension-card" style="background: rgba(110, 206, 210, 0.1); padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(110, 206, 210, 0.2);">
                            <div style="font-size: 0.8rem; color: var(--primary); font-weight: 700; text-transform: uppercase;">Cinismo</div>
                            <div style="font-size: 1.5rem; color: #fff; font-weight: 800; margin: 0.5rem 0;">${data.results.scores.cynicism_score}</div>
                            <div class="status-badge ${data.results.levels.c_level === 'Alto' ? 'burnout-yes' : 'burnout-no'}">${data.results.levels.c_level}</div>
                        </div>
                        <div class="dimension-card" style="background: rgba(110, 206, 210, 0.1); padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(110, 206, 210, 0.2);">
                            <div style="font-size: 0.8rem; color: var(--primary); font-weight: 700; text-transform: uppercase;">Efectividad Académica</div>
                            <div style="font-size: 1.5rem; color: #fff; font-weight: 800; margin: 0.5rem 0;">${data.results.scores.academic_efficacy_score}</div>
                            <div class="status-badge ${data.results.levels.ae_level === 'Bajo' ? 'burnout-no' : 'burnout-yes'}">${data.results.levels.ae_level}</div>
                        </div>
                    </div>

                    <!-- Scale Explanation -->
                    <div class="scale-explanation" style="background: rgba(255,255,255,0.03); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border-left: 4px solid var(--primary);">
                        <h4 style="color: #fff; margin-bottom: 0.5rem; font-size: 0.95rem;">Sobre la escala MBI-SS</h4>
                        <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5;">
                            El Inventario de Burnout de Maslach (MBI-SS) evalúa tres dimensiones: 
                            <strong>Agotamiento</strong> (cansancio por demandas académicas), 
                            <strong>Cinismo</strong> (actitud distante hacia los estudios) y 
                            <strong>Eficacia</strong> (percepción de logro). Se diagnostica agotamiento académico cuando los niveles de Agotamiento y Cinismo son <strong>Altos</strong> y la Eficacia es <strong>Baja</strong>.
                        </p>
                    </div>

                    <h4 style="color: #fff; margin-bottom: 1.5rem; font-size: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">Respuestas Detalladas</h4>
                    <ul class="question-detail-list">
                        ${data.answers.map((ans, idx) => `
                            <li>
                                <div class="q-text">${idx + 1}. ${questions[idx]}</div>
                                <div class="q-answer">${answerLabels[ans] || ans}</div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div class="survey-modal-footer">
                    <button class="btn-secondary" onclick="document.getElementById('survey-detail-modal').style.display = 'none'; document.body.style.overflow = 'auto'">Cerrar</button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },

    renderFacialAvg(data) {
        const categories = Object.keys(data).map(k => k.charAt(0).toUpperCase() + k.slice(1));
        const values = Object.values(data).map(v => parseFloat(v.toFixed(1)));

        const options = {
            series: [{ name: 'Promedio (%)', data: values }],
            chart: { type: 'bar', height: 250, background: 'transparent', toolbar: { show: false } },
            plotOptions: { bar: { borderRadius: 4, columnWidth: '50%', distributed: true } },
            theme: { mode: 'dark' },
            colors: ['#6ecece', '#6366f1', '#f43f5e', '#fbbf24', '#10b981', '#a855f7', '#94a3b8'],
            xaxis: { categories: categories, labels: { style: { fontSize: '10px', fontWeight: 600 } } },
            yaxis: { title: { text: 'Nivel Promedio (%)', style: { color: '#94a3b8' } } },
            legend: { show: false },
            grid: { borderColor: 'rgba(255,255,255,0.05)' },
            tooltip: { theme: 'dark', y: { formatter: (val) => `${val}%` } }
        };

        new window.ApexCharts(document.querySelector("#chart-facial-avg"), options).render();
    },

    renderManualAvg(data) {
        const categories = Object.keys(data).map(k => k.charAt(0).toUpperCase() + k.slice(1));
        const values = Object.values(data);

        const options = {
            series: [{ name: 'Frecuencia', data: values }],
            chart: { type: 'bar', height: 250, background: 'transparent', toolbar: { show: false } },
            plotOptions: { bar: { borderRadius: 4, horizontal: true } },
            dataLabels: { enabled: false },
            theme: { mode: 'dark' },
            colors: ['#6ecece'],
            xaxis: { categories: categories, labels: { style: { fontSize: '10px' } } },
            grid: { borderColor: 'rgba(255,255,255,0.05)' }
        };

        new window.ApexCharts(document.querySelector("#chart-manual-avg"), options).render();
    },

    renderFacialTimeline(data) {
        // Map emotion to value for timeline
        const emotionMap = { 
            'feliz': 5, 'felicidad': 5, 'happiness': 5,
            'neutral': 4, 
            'sorpresa': 3, 'surprise': 3,
            'triste': 2, 'tristeza': 2, 'sadness': 2,
            'miedo': 1, 'fear': 1,
            'enojado': 0, 'enojo': 0, 'ira': 0, 'anger': 0,
            'disgusto': 0, 'disgust': 0
        };
        const reverseMap = ['Enojado', 'Miedo', 'Triste', 'Sorpresa', 'Neutral', 'Feliz'];
        
        const seriesData = data.map(item => ({
            x: new Date(item.timestamp).getTime(),
            y: emotionMap[item.emotion.toLowerCase()] ?? 0,
            emotion: item.emotion
        }));

        const options = {
            series: [{ name: 'Humor Facial', data: seriesData }],
            chart: { type: 'area', height: 250, background: 'transparent', toolbar: { show: false } },
            theme: { mode: 'dark' },
            colors: ['#6ecece'],
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 3 },
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.1, stops: [20, 100] } },
            xaxis: { type: 'datetime', labels: { style: { fontSize: '10px' } } },
            yaxis: { 
                min: 0, 
                max: 5, 
                tickAmount: 5,
                labels: { 
                    offsetY: 2,
                    formatter: (val) => reverseMap[Math.round(val)] || '',
                    style: { fontSize: '10px', colors: ['#94a3b8'], fontWeight: 600 }
                } 
            },
            tooltip: { x: { format: 'dd MMM HH:mm' }, y: { formatter: (val, { seriesIndex, dataPointIndex, w }) => w.config.series[seriesIndex].data[dataPointIndex].emotion } },
            grid: { borderColor: 'rgba(255,255,255,0.05)' }
        };

        new window.ApexCharts(document.querySelector("#chart-facial-timeline"), options).render();
    },

    renderManualTimeline(data) {
        const emotionMap = { 
            'feliz': 5, 'felicidad': 5, 'happiness': 5,
            'neutral': 4, 
            'sorpresa': 3, 'surprise': 3,
            'triste': 2, 'tristeza': 2, 'sadness': 2,
            'miedo': 1, 'fear': 1,
            'enojado': 0, 'enojo': 0, 'ira': 0, 'anger': 0,
            'disgusto': 0, 'disgust': 0
        };
        const reverseMap = ['Enojado', 'Miedo', 'Triste', 'Sorpresa', 'Neutral', 'Feliz'];

        const seriesData = data.map(item => ({
            x: new Date(item.timestamp).getTime(),
            y: emotionMap[item.emotion.toLowerCase()] ?? 0,
            emotion: item.emotion
        }));

        const options = {
            series: [{ name: 'Humor Manual', data: seriesData }],
            chart: { type: 'line', height: 250, background: 'transparent', toolbar: { show: false } },
            theme: { mode: 'dark' },
            colors: ['#6366f1'],
            markers: { size: 5, strokeWidth: 0, hover: { size: 7 } },
            stroke: { width: 3 },
            xaxis: { type: 'datetime', labels: { style: { fontSize: '10px' } } },
            yaxis: { 
                min: 0, 
                max: 5, 
                tickAmount: 5,
                labels: { 
                    offsetY: 2,
                    formatter: (val) => reverseMap[Math.round(val)] || '',
                    style: { fontSize: '10px', colors: ['#94a3b8'], fontWeight: 600 }
                } 
            },
            tooltip: { x: { format: 'dd MMM HH:mm' }, y: { formatter: (val, { seriesIndex, dataPointIndex, w }) => w.config.series[seriesIndex].data[dataPointIndex].emotion } },
            grid: { borderColor: 'rgba(255,255,255,0.05)' }
        };

        new window.ApexCharts(document.querySelector("#chart-manual-timeline"), options).render();
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
