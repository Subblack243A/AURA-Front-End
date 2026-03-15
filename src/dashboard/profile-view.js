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
