const ProfileView = {
    async render(container, appInstance) {
        this.container = container;
        this.app = appInstance;
        this.userData = null;
        
        await this.showViewState();
    },

    async fetchUserData() {
        const token = window.Auth.getToken();
        try {
            const response = await fetch('/api/profile/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar el perfil');
            this.userData = await response.json();
            return this.userData;
        } catch (err) {
            console.error(err);
            this.app.showError(err.message);
        }
    },

    async showViewState() {
        this.app.setLoading(true);
        const user = await this.fetchUserData();
        this.app.setLoading(false);

        if (!user) return;

        this.container.innerHTML = `
            <div class="dashboard-container">
                <section class="welcome-section">
                    <div class="welcome-header">
                        <div class="welcome-text">
                            <h1>Tu Perfil</h1>
                            <p class="subtitle" style="text-align: left;">Gestiona tu información personal y académica.</p>
                        </div>
                    </div>
                </section>

                <div class="profile-card" id="profile-view-state">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            ${user.first_name[0]}${user.last_name[0]}
                        </div>
                        <div class="profile-title-info">
                            <h2>${user.first_name} ${user.last_name}</h2>
                            <p class="role-badge">${window.Auth.formatRole(user.role)}</p>
                        </div>
                    </div>

                    <div class="profile-info-grid">
                        <div class="info-item">
                            <label>Correo Electrónico</label>
                            <p>${user.email}</p>
                        </div>
                        <div class="info-item">
                            <label>Facultad</label>
                            <p>${user.faculty_name}</p>
                        </div>
                        <div class="info-item">
                            <label>Programa</label>
                            <p>${user.program_name}</p>
                        </div>
                        <div class="info-item">
                            <label>Semestre</label>
                            <p>${user.semester}° Semestre</p>
                        </div>
                        <div class="info-item">
                            <label>Fecha de Nacimiento</label>
                            <p>${new Date(user.birth_date).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div class="profile-actions">
                        <button id="btn-edit-profile" class="btn-primary">Actualizar Perfil</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-edit-profile').addEventListener('click', () => this.requestOTP());
        
        // Render Survey History
        const historyContainer = document.createElement('div');
        historyContainer.id = 'survey-history-section';
        historyContainer.className = 'profile-card';
        historyContainer.style.marginTop = '2rem';
        this.container.querySelector('.dashboard-container').appendChild(historyContainer);
        
        await this.renderSurveyHistory(user.id);
    },

    async renderSurveyHistory(userId) {
        const historyContainer = document.getElementById('survey-history-section');
        historyContainer.innerHTML = `
            <div class="profile-header">
                <div class="welcome-text">
                    <h3 style="color: #fff; margin-bottom: 0.5rem; text-align: left;">Historial de Encuestas</h3>
                    <p class="subtitle" style="text-align: left;">Resumen de tus evaluaciones de agotamiento académico.</p>
                </div>
            </div>
            <div id="survey-list-container" style="margin-top: 1.5rem;">
                <div class="spinner"></div>
            </div>
        `;

        try {
            const surveys = await this.fetchUserSurveys(userId);
            const listContainer = document.getElementById('survey-list-container');
            
            if (!surveys || surveys.length === 0) {
                listContainer.innerHTML = `<p style="color: #94a3b8; text-align: center; padding: 2rem;">No se encontraron encuestas registradas.</p>`;
                return;
            }

            listContainer.innerHTML = `
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
                                    <button class="btn-detail-link" onclick="ProfileView.openSurveyDetail(${s.id})" style="justify-content: flex-start;">
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
            document.getElementById('survey-list-container').innerHTML = `<p style="color: #f87171;">Error al cargar el historial.</p>`;
        }
    },

    async fetchUserSurveys(userId) {
        const token = window.Auth.getToken();
        const response = await fetch(`/api/reports/user/${userId}/surveys/`, {
            headers: { 'Authorization': `Token ${token}` }
        });
        if (!response.ok) throw new Error('Error al cargar encuestas');
        return await response.json();
    },

    async openSurveyDetail(surveyId) {
        this.app.setLoading(true);
        try {
            const token = window.Auth.getToken();
            const response = await fetch(`/api/surveys/${surveyId}/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar detalle de la encuesta');
            const data = await response.json();
            
            this.showDetailModal(data);
        } catch (err) {
            this.app.showError(err.message);
        } finally {
            this.app.setLoading(false);
        }
    },

    showDetailModal(data) {
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
            0: "Nunca",
            1: "Casi nunca",
            2: "A veces",
            3: "Regularmente",
            4: "Frecuentemente",
            5: "Casi siempre",
            6: "Siempre"
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
                            <div class="status-badge ${data.results.levels.ae_level === 'Bajo' ? 'burnout-yes' : 'burnout-no'}">${data.results.levels.ae_level}</div>
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
                    <button class="btn-secondary" onclick="ProfileView.closeDetailModal()">Cerrar</button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Close on outside click
        modal.onclick = (e) => {
            if (e.target === modal) this.closeDetailModal();
        };
    },

    closeDetailModal() {
        const modal = document.getElementById('survey-detail-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    },

    async requestOTP() {
        this.app.setLoading(true);
        const token = window.Auth.getToken();
        try {
            const response = await fetch('/api/profile/request-update/', {
                method: 'POST',
                headers: { 'Authorization': `Token ${token}` }
            });
            
            if (response.ok) {
                this.showOTPState();
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Error al solicitar el código');
            }
        } catch (err) {
            this.app.showError(err.message);
        } finally {
            this.app.setLoading(false);
        }
    },

    showOTPState() {
        this.container.querySelector('.profile-card').innerHTML = `
            <div class="otp-verification-container">
                <h3>Validación de Seguridad</h3>
                <p class="subtitle">Hemos enviado un código de 6 dígitos a tu correo institucional para autorizar los cambios.</p>
                <div class="error-message" id="otp-error" style="display:none;"></div>
                <div class="form-group">
                    <label for="profile_otp">Código OTP</label>
                    <input type="text" id="profile_otp" class="otp-input" placeholder="000000" maxlength="6" inputmode="numeric">
                </div>
                <div class="profile-actions">
                    <button id="btn-verify-otp" class="btn-primary">Verificar</button>
                    <button id="btn-cancel-otp" class="btn-secondary">Cancelar</button>
                </div>
            </div>
        `;

        document.getElementById('btn-cancel-otp').addEventListener('click', () => this.showViewState());
        document.getElementById('btn-verify-otp').addEventListener('click', () => {
            const otpCode = document.getElementById('profile_otp').value;
            if (otpCode.length === 6) {
                this.showEditState(otpCode);
            } else {
                const error = document.getElementById('otp-error');
                error.textContent = 'Ingrese un código de 6 dígitos';
                error.style.display = 'block';
            }
        });
    },

    async showEditState(otpCode) {
        this.app.setLoading(true);
        // We'll need programs to populate the select
        let programs = [];
        try {
            const resp = await fetch('/api/programs/');
            programs = await resp.json();
        } catch (e) { console.error(e); }
        this.app.setLoading(false);

        const user = this.userData;

        this.container.querySelector('.profile-card').innerHTML = `
            <div class="profile-edit-container">
                <h3>Editar Perfil</h3>
                <form id="profile-edit-form">
                    <div class="profile-info-grid">
                        <div class="form-group">
                            <label>Correo Electrónico (No editable)</label>
                            <input type="text" value="${user.email}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Rol (No editable)</label>
                            <input type="text" value="${window.Auth.formatRole(user.role)}" disabled>
                        </div>
                        <div class="form-group">
                            <label for="edit_first_name">Nombre</label>
                            <input type="text" id="edit_first_name" value="${user.first_name}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit_last_name">Apellido</label>
                            <input type="text" id="edit_last_name" value="${user.last_name}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit_birth_date">Fecha de Nacimiento</label>
                            <input type="date" id="edit_birth_date" value="${user.birth_date}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit_semester">Semestre</label>
                            <input type="number" id="edit_semester" value="${user.semester}" required min="1" max="10">
                        </div>
                        <div class="form-group">
                            <label for="edit_program">Programa</label>
                            <select id="edit_program" required>
                                ${programs.map(p => `
                                    <option value="${p.ID_Program}" ${p.ID_Program === user.program ? 'selected' : ''} 
                                            data-faculty-id="${p.faculty.ID_Faculty}" 
                                            data-faculty-name="${p.faculty.Faculty}">
                                        ${p.Program}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Facultad</label>
                            <p id="edit_faculty_name" class="static-value">${user.faculty_name}</p>
                            <input type="hidden" id="edit_faculty" value="${user.faculty}">
                        </div>
                    </div>
                    <div class="profile-actions">
                        <button type="submit" class="btn-primary">Guardar Cambios</button>
                        <button type="button" id="btn-cancel-edit" class="btn-secondary">Cancelar</button>
                    </div>
                </form>
            </div>
        `;

        const programSelect = document.getElementById('edit_program');
        const facultyNameElem = document.getElementById('edit_faculty_name');
        const facultyHidden = document.getElementById('edit_faculty');

        programSelect.addEventListener('change', () => {
            const opt = programSelect.options[programSelect.selectedIndex];
            facultyNameElem.textContent = opt.dataset.facultyName;
            facultyHidden.value = opt.dataset.facultyId;
        });

        document.getElementById('btn-cancel-edit').addEventListener('click', () => this.showViewState());
        
        document.getElementById('profile-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            this.saveChanges(otpCode);
        });
    },

    async saveChanges(otpCode) {
        this.app.setLoading(true);
        const token = window.Auth.getToken();
        
        const updateData = {
            otp_code: otpCode,
            first_name: document.getElementById('edit_first_name').value,
            last_name: document.getElementById('edit_last_name').value,
            birth_date: document.getElementById('edit_birth_date').value,
            semester: parseInt(document.getElementById('edit_semester').value),
            program: parseInt(document.getElementById('edit_program').value),
            faculty: parseInt(document.getElementById('edit_faculty').value)
        };

        try {
            const response = await fetch('/api/profile/update/', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                this.showToast('Datos actualizados correctamente');
                await this.showViewState();
            } else {
                const err = await response.json();
                throw new Error(err.error || 'Error al actualizar el perfil');
            }
        } catch (err) {
            this.app.showError(err.message);
        } finally {
            this.app.setLoading(false);
        }
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'profile-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 100);
    }
};

window.ProfileView = ProfileView;
