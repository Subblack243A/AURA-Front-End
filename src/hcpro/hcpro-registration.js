const HealthProRegistration = {
    render(app) {
        app.appContainer.innerHTML = `
            <div class="card">
                <h1>Registro Profesional</h1>
                <p class="subtitle">Regístrate como Profesional de la Salud en Aura</p>
                <div class="error-message"></div>
                <form id="health-pro-register-form">
                    <div class="form-group">
                        <label for="username">Usuario</label>
                        <input type="text" id="username" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Correo Electrónico</label>
                        <input type="email" id="email" required placeholder="ejemplo@correo.com">
                    </div>
                    <div class="form-group">
                        <label for="first_name">Nombre</label>
                        <input type="text" id="first_name" required>
                    </div>
                    <div class="form-group">
                        <label for="last_name">Apellido</label>
                        <input type="text" id="last_name" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <div class="password-input-container">
                            <input type="password" id="password" required>
                            <button type="button" class="password-toggle" id="toggle-password-hp" title="Mostrar/Ocultar contraseña">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                        </div>
                        <small style="color: #94a3b8; font-size: 0.8rem; margin-top: 4px; display: block;">Mínimo 8 caracteres, una mayúscula y un número.</small>
                    </div>
                    <div class="form-group">
                        <label for="confirm_password">Confirmar Contraseña</label>
                        <div class="password-input-container">
                            <input type="password" id="confirm_password" required>
                            <button type="button" class="password-toggle" id="toggle-confirm-password-hp" title="Mostrar/Ocultar contraseña">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-group checkbox-group" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem;">
                        <input type="checkbox" id="terms_acceptance_hp" required style="width: auto; margin-bottom: 0;">
                        <label for="terms_acceptance_hp" style="margin-bottom: 0; font-size: 0.9rem;">
                            He leído y acepto los <a href="/assets/Terminos%20de%20uso.pdf" target="_blank" style="color: var(--primary);">términos de uso</a>
                        </label>
                    </div>
                    
                    <button type="submit" data-original-text="Enviar Solicitud">Enviar Solicitud</button>
                </form>
                <button class="link-btn" id="back-to-landing">Volver al Inicio</button>
            </div>

            <style>
                .input-error {
                    border-color: #ef4444 !important;
                    background: rgba(239, 68, 68, 0.05) !important;
                }
                .label-error {
                    color: #ef4444 !important;
                }
            </style>
        `;

        const form = document.getElementById('health-pro-register-form');
        const backBtn = document.getElementById('back-to-landing');

        // Password toggles
        const setupHPPasswordToggle = (inputId, toggleId) => {
            const input = document.getElementById(inputId);
            const toggle = document.getElementById(toggleId);
            toggle.addEventListener('click', () => {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                if (type === 'text') {
                    toggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
                } else {
                    toggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
                }
            });
        };

        setupHPPasswordToggle('password', 'toggle-password-hp');
        setupHPPasswordToggle('confirm_password', 'toggle-confirm-password-hp');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const termsAccepted = document.getElementById('terms_acceptance_hp').checked;
            if (!termsAccepted) {
                app.showError('No se enviarán datos a menos que se confirme la lectura de los términos de uso.', false);
                return;
            }

            app.setLoading(true);

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirm_password = document.getElementById('confirm_password').value;

            // Password security validation
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
            const passwordInput = document.getElementById('password');
            const passwordLabel = document.querySelector('label[for="password"]');

            if (!passwordRegex.test(password)) {
                passwordInput.classList.add('input-error');
                if (passwordLabel) passwordLabel.classList.add('label-error');
                app.showError('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.', false);
                app.setLoading(false);
                return;
            } else {
                passwordInput.classList.remove('input-error');
                if (passwordLabel) passwordLabel.classList.remove('label-error');
            }

            const confirmInput = document.getElementById('confirm_password');
            if (password !== confirm_password) {
                confirmInput.classList.add('input-error');
                app.showError('Las contraseñas no coinciden.', false);
                app.setLoading(false);
                return;
            } else {
                confirmInput.classList.remove('input-error');
            }

            const userData = {
                username: document.getElementById('username').value,
                email: email,
                first_name: document.getElementById('first_name').value,
                last_name: document.getElementById('last_name').value,
                password: password,
                confirm_password: confirm_password,
                // Default required fields for UserRegisterSerializer compatibility if any,
                // but HealthProRegisterSerializer might skip some.
                // Let's provide dummy values for fields that might be required by the base serializer
                // but not relevant for Health Pro.
                DateOfBirth: '2000-01-01', 
                Semester: 0,
                FK_Role: 1, // 'pendiente'
                FK_Faculty: 1, // Dummy or handled in backend
                FK_Program: 1, // Dummy or handled in backend
                DataAuth: true
            };

            try {
                await window.Auth.registerHealthPro(userData);
                this.renderOTP(app, email);
            } catch (err) {
                app.showError(err.message, false);
            } finally {
                app.setLoading(false);
            }
        });

        backBtn.addEventListener('click', () => app.renderLandingPage());
    },

    renderOTP(app, email) {
        app.appContainer.innerHTML = `
            <div class="card">
                <h1>Validación OTP</h1>
                <p class="subtitle">Ingresa el código enviado a <strong>${email}</strong> para completar tu solicitud.</p>
                <div class="error-message"></div>
                <form id="health-pro-otp-form">
                    <div class="form-group">
                        <label for="otp_code">Código OTP</label>
                        <input type="text" id="otp_code" required 
                               placeholder="123456" 
                               maxlength="6" 
                               style="text-align: center; font-size: 2rem; letter-spacing: 0.5rem;">
                    </div>
                    <button type="submit" data-original-text="Validar OTP">Validar OTP</button>
                </form>
            </div>
        `;

        const form = document.getElementById('health-pro-otp-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            app.setLoading(true);
            const otpCode = document.getElementById('otp_code').value;

            try {
                await window.Auth.verifyHealthPro(email, otpCode);
                alert('Solicitud enviada. Recibirás un correo cuando un administrador apruebe tu acceso');
                app.renderLandingPage();
            } catch (err) {
                app.showError(err.message, false);
            } finally {
                app.setLoading(false);
            }
        });
    }
};

window.HealthProRegistration = HealthProRegistration;
