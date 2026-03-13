const UserViews = {
    renderLandingPage(app) {
        app.appContainer.innerHTML = `
            <div class="card landing-card" style="max-width: 600px; text-align: center; padding: 3rem 2rem;">
                <div class="landing-header" style="margin-bottom: 2rem;">
                    <img src="/assets/logo.png" alt="AURA Logo" style="width: 120px; height: auto; margin-bottom: 1.5rem; filter: drop-shadow(0 4px 12px rgba(110, 206, 210, 0.3));">
                    <h1 style="font-size: 2.8rem; margin-bottom: 0.5rem; background: linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        AURA
                    </h1>
                    <p style="font-size: 1.1rem; color: var(--primary); font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                        Inteligencia Emocional para tu Bienestar
                    </p>
                </div>

                <div class="landing-description" style="margin-bottom: 2.5rem; text-align: left; line-height: 1.6; color: #fff;">
                    <p style="margin-bottom: 1rem;">
                        Bienvenido a <strong>AURA</strong>, la plataforma de vanguardia diseñada para acompañar y fortalecer tu salud mental académica. 
                    </p>
                    <p style="margin-bottom: 1.5rem; color: #94a3b8;">
                        Mediante análisis avanzado de emociones y herramientas de seguimiento personalizado, AURA te ayuda a entender tu estado emocional, prevenir el agotamiento y potenciar tu rendimiento universitario de forma equilibrada.
                    </p>
                    
                    <div style="display: flex; gap: 1rem; flex-direction: column;">
                        <button id="landing-login-btn" class="primary-btn" style="padding: 1rem;">Iniciar Sesión</button>
                        <button id="landing-register-btn" class="secondary-btn" style="padding: 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff;">Crear una Cuenta</button>
                    </div>
                </div>

                <div class="privacy-note" style="padding: 1.25rem; background: rgba(110, 206, 210, 0.05); border-radius: 12px; border: 1px solid rgba(110, 206, 210, 0.1); text-align: left;">
                    <p style="font-size: 0.85rem; color: #94a3b8; margin: 0; display: flex; gap: 12px; align-items: flex-start;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        <span>
                            <strong>Tu privacidad es nuestra prioridad:</strong> AURA no almacena imágenes de rostros en sus servidores. Las capturas se analizan localmente para generar datos segmentados y se eliminan inmediatamente después del procesamiento.
                        </span>
                    </p>
                </div>
            </div>

            <style>
                .landing-card {
                    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .secondary-btn:hover {
                    background: rgba(255,255,255,0.1) !important;
                    border-color: var(--primary) !important;
                }
            </style>
        `;

        document.getElementById('landing-login-btn').addEventListener('click', () => app.renderLogin());
        document.getElementById('landing-register-btn').addEventListener('click', () => app.renderRegister());
    },

    renderLogin(app) {
        app.appContainer.innerHTML = `
            <div class="card">
                <h1>Bienvenido</h1>
                <p class="subtitle">Inicia sesión en Aura</p>
                <div class="error-message"></div>
                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Correo Electrónico</label>
                        <input type="email" id="email" required placeholder="ejemplo@correo.com">
                    </div>
                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <div class="password-input-container">
                            <input type="password" id="password" required placeholder="••••••••">
                            <button type="button" class="password-toggle" id="toggle-password" title="Mostrar/Ocultar contraseña">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                        </div>
                    </div>
                    <button type="submit" data-original-text="Siguiente">Siguiente</button>
                </form>
                <div style="text-align: right; margin-top: 0.5rem;">
                    <button class="link-btn" id="forgot-password-link" style="font-size: 0.85rem; padding: 0;">¿Olvidaste tu contraseña?</button>
                </div>
                <button class="link-btn" id="go-to-register">¿No tienes cuenta? Regístrate</button>
            </div>
        `;

        const form = document.getElementById('login-form');
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.getElementById('toggle-password');

        toggleBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Toggle icon
            if (type === 'text') {
                toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
            } else {
                toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            app.setLoading(true);

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Try login directly. Backend handles role-based biometric requirements.
                await window.Auth.login(email, password, null);

                if (window.Navbar) window.Navbar.update();
                app.renderDashboard();
            } catch (err) {
                // If credentials are correct but face registration is missing or image is required (Student)
                if (err.code === 'FACE_REGISTRATION_REQUIRED' ||
                    err.message.includes('Image file is required') ||
                    err.message.includes('Face registration required')) {
                    app.renderFaceVerification(email, password);
                } else if (err.code === 'EMAIL_NOT_VERIFIED') {
                    UserViews.renderOTPVerification(app, email, password);
                } else if (err.code === 'ACCOUNT_DEACTIVATED') {
                    UserViews.renderAccountDeactivated(app, err.admin_email || 'admin@aura.com');
                } else if (err.code === 'ACCOUNT_PENDING') {
                    UserViews.renderAccountPending(app);
                } else {
                    app.showError(err.message, false);
                }
            } finally {
                app.setLoading(false);
            }
        });
        
        document.getElementById('forgot-password-link').addEventListener('click', () => {
            if (app.renderForgotEmail) app.renderForgotEmail();
            else UserViews.renderForgotEmail(app);
        });

        document.getElementById('go-to-register').addEventListener('click', () => app.renderRegister());
    },

    renderAccountDeactivated(app, adminEmail) {
        app.appContainer.innerHTML = `
            <div class="card deactivation-card" style="text-align: center; padding: 3rem 2rem; max-width: 500px;">
                <div class="icon-container" style="color: #ef4444; margin-bottom: 1.5rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                </div>
                <h1 style="color: #fff; margin-bottom: 1rem;">Cuenta Desactivada</h1>
                <p style="color: #94a3b8; line-height: 1.6; margin-bottom: 2rem;">
                    Esta cuenta ha sido desactivada por un administrador. Si crees que esto es un error o deseas solicitar su reactivación, por favor contacta al administrador.
                </p>
                
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                    <p style="color: #fca5a5; font-size: 0.8rem; margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Contacto Administrador</p>
                    <a href="mailto:${adminEmail}" style="color: var(--primary); font-size: 1.1rem; text-decoration: none; font-weight: 600; word-break: break-all;">${adminEmail}</a>
                </div>

                <button class="secondary-btn" id="back-to-landing-from-deactivated">Volver al Inicio</button>
            </div>
        `;
        
        document.getElementById('back-to-landing-from-deactivated').addEventListener('click', () => app.renderLandingPage());
    },

    renderAccountPending(app) {
        app.appContainer.innerHTML = `
            <div class="card pending-card" style="text-align: center; padding: 3rem 2rem; max-width: 500px;">
                <div class="icon-container" style="color: #fbbf24; margin-bottom: 1.5rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <h1 style="color: #fff; margin-bottom: 1rem;">Cuenta en Revisión</h1>
                <p style="color: #94a3b8; line-height: 1.6; margin-bottom: 2rem;">
                    Su estado actual es <strong>pendiente</strong>. Un administrador está revisando su solicitud de acceso.
                </p>
                
                <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.2); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                    <p style="color: #fbbf24; font-size: 0.95rem; margin: 0; font-weight: 500;">
                        Se le notificará al correo electrónico cuando su cuenta sea activada. 😊
                    </p>
                </div>

                <button class="secondary-btn" id="pending-back-btn">Volver al Inicio</button>
            </div>
        `;
        
        document.getElementById('pending-back-btn').addEventListener('click', () => app.renderLandingPage());
    },

    renderForgotEmail(app) {
        app.appContainer.innerHTML = `
            <div class="card">
                <h1>Recuperar Contraseña</h1>
                <p class="subtitle">Ingresa tu correo institucional para recibir un código de recuperación.</p>
                <div class="error-message"></div>
                <form id="forgot-email-form">
                    <div class="form-group">
                        <label for="recovery-email">Correo Electrónico</label>
                        <input type="email" id="recovery-email" required placeholder="ejemplo@ucundinamarca.edu.co">
                    </div>
                    <button type="submit" data-original-text="Enviar Código">Enviar Código</button>
                </form>
                <button class="link-btn" id="back-to-login">Volver al Inicio de Sesión</button>
            </div>
        `;

        document.getElementById('forgot-email-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('recovery-email').value;
            app.setLoading(true);
            try {
                await window.Auth.requestPasswordResetOTP(email);
                UserViews.renderRecoveryOTP(app, email);
            } catch (err) {
                app.showError(err.message, false);
            } finally {
                app.setLoading(false);
            }
        });

        document.getElementById('back-to-login').addEventListener('click', () => app.renderLogin());
    },

    renderRecoveryOTP(app, email) {
        app.appContainer.innerHTML = `
            <div class="card">
                <h1>Verificación</h1>
                <p class="subtitle">Hemos enviado un código a <strong>${email}</strong>. Ingrésalo para continuar.</p>
                <div class="error-message"></div>
                <form id="recovery-otp-form">
                    <div class="form-group">
                        <label for="recovery-otp">Código de 6 dígitos</label>
                        <input type="text" id="recovery-otp" required 
                               placeholder="123456" 
                               maxlength="6" 
                               style="text-align: center; font-size: 2rem; letter-spacing: 0.5rem;">
                    </div>
                    <button type="submit" data-original-text="Verificar Código">Verificar Código</button>
                </form>
                <button class="link-btn" id="resend-recovery-otp">Reenviar Código</button>
                <button class="link-btn" id="back-to-email">Cambiar Correo</button>
            </div>
        `;

        document.getElementById('recovery-otp-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const otp_code = document.getElementById('recovery-otp').value;
            app.setLoading(true);
            try {
                await window.Auth.verifyPasswordResetOTP(email, otp_code);
                UserViews.renderResetPassword(app, email, otp_code);
            } catch (err) {
                app.showError(err.message, false);
            } finally {
                app.setLoading(false);
            }
        });

        document.getElementById('resend-recovery-otp').addEventListener('click', async () => {
            app.setLoading(true);
            try {
                await window.Auth.requestPasswordResetOTP(email);
                alert('Nuevo código enviado.');
            } catch (err) {
                app.showError(err.message);
            } finally {
                app.setLoading(false);
            }
        });

        document.getElementById('back-to-email').addEventListener('click', () => UserViews.renderForgotEmail(app));
    },

    renderResetPassword(app, email, otp_code) {
        app.appContainer.innerHTML = `
            <div class="card">
                <h1>Nueva Contraseña</h1>
                <p class="subtitle">Establece tu nueva contraseña para acceder a Aura.</p>
                <div class="error-message"></div>
                <form id="reset-password-form">
                    <div class="form-group">
                        <label for="new-password">Nueva Contraseña</label>
                        <input type="password" id="new-password" required placeholder="••••••••">
                    </div>
                    <div class="form-group">
                        <label for="confirm-new-password">Confirmar Contraseña</label>
                        <input type="password" id="confirm-new-password" required placeholder="••••••••">
                    </div>
                    <button type="submit" data-original-text="Actualizar Contraseña">Actualizar Contraseña</button>
                </form>
            </div>
        `;

        document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('new-password').value;
            const confirm_password = document.getElementById('confirm-new-password').value;

            app.setLoading(true);
            try {
                await window.Auth.resetPassword(email, otp_code, password, confirm_password);
                alert('Contraseña actualizada con éxito. Ahora puedes iniciar sesión.');
                app.renderLogin();
            } catch (err) {
                app.showError(err.message, false);
            } finally {
                app.setLoading(false);
            }
        });
    },

    renderFaceVerification(app, email, password) {
        app.appContainer.innerHTML = `
            <div class="card">
                <h1>Verificación Facial</h1>
                <p class="subtitle">Mira a la cámara para finalizar el inicio de sesión.</p>
                <div class="error-message"></div>
                <div class="camera-preview">
                    <video id="verification-video" autoplay playsinline muted></video>
                    <div class="camera-overlay"></div>
                </div>
                <button id="verify-btn" data-original-text="Verificar e Iniciar Sesión">Verificar e Iniciar Sesión</button>
                <button class="link-btn" id="back-to-login">Volver</button>
            </div>
        `;

        const videoSelector = '#verification-video';
        const verifyBtn = document.getElementById('verify-btn');

        // Init camera for preview
        window.CameraHandler.init(videoSelector);

        verifyBtn.addEventListener('click', async () => {
            app.setLoading(true);
            try {
                const imageFile = await window.CameraHandler.capturePhoto();
                if (!imageFile) throw new Error('No se pudo capturar la foto');

                await window.Auth.login(email, password, imageFile);

                window.CameraHandler.stop();
                if (window.Navbar) window.Navbar.update();
                app.renderDashboard();
            } catch (err) {
                app.showError(err.message);
            } finally {
                app.setLoading(false);
            }
        });

        document.getElementById('back-to-login').addEventListener('click', () => {
            window.CameraHandler.stop();
            app.renderLogin();
        });
    },

    renderRegister(app, prefillData = null) {
        app.appContainer.innerHTML = `
            <div class="card">
                <h1>Registro</h1>
                <p class="subtitle">Crea tu cuenta en Aura</p>
                <div class="error-message"></div>
                <form id="register-form">
                    <div class="form-group">
                        <label for="username">Usuario</label>
                        <input type="text" id="username" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Correo</label>
                        <input type="email" id="email" required>
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
                        <label for="DateOfBirth">Fecha de Nacimiento</label>
                        <input type="date" id="DateOfBirth" required>
                    </div>
                    <div class="form-group">
                        <label for="Semester">Semestre</label>
                        <input type="number" id="Semester" required min="1" max="10">
                    </div>
                    
                    <!-- Role is statically set to Student (2) in the submit handler -->
                    <div class="form-group">
                        <label for="FK_Program">Programa</label>
                        <select id="FK_Program" required disabled>
                            <option value="">Cargando programas...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="FK_Faculty">Facultad</label>
                        <select id="FK_Faculty" required disabled>
                            <option value="">Seleccione un programa primero</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <div class="password-input-container">
                            <input type="password" id="password" required>
                            <button type="button" class="password-toggle" id="toggle-password-reg" title="Mostrar/Ocultar contraseña">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="confirm_password">Confirmar Contraseña</label>
                        <div class="password-input-container">
                            <input type="password" id="confirm_password" required>
                            <button type="button" class="password-toggle" id="toggle-confirm-password" title="Mostrar/Ocultar contraseña">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" id="DataAuth" style="width: auto;" required>
                            <span>Acepto el <a href="/assets/Tratamiento de datos personales.pdf" target="_blank" style="color: var(--primary); text-decoration: none;">Tratamiento de datos personales</a></span>
                        </label>
                    </div>

                    <button type="submit" data-original-text="Registrarse">Registrarse</button>
                </form>
                <button class="link-btn" id="go-to-login">¿Ya tienes cuenta? Inicia Sesión</button>
            </div>
        `;

        const form = document.getElementById('register-form');
        const programSelect = document.getElementById('FK_Program');
        const facultySelect = document.getElementById('FK_Faculty');

        // Fetch programs and faculties
        const loadPrograms = async () => {
            try {
                const response = await fetch(`${window.API_URL || '/api'}/programs/`);
                if (!response.ok) throw new Error('Error al cargar programas');
                const programs = await response.json();

                programSelect.innerHTML = '<option value="">Seleccione un programa</option>';
                programs.forEach(p => {
                    const option = document.createElement('option');
                    option.value = p.ID_Program;
                    option.textContent = p.Program;
                    // Store faculty info within the option dataset for easy access
                    if (p.faculty) {
                        option.dataset.facultyId = p.faculty.ID_Faculty;
                        option.dataset.facultyName = p.faculty.Faculty;
                    }
                    programSelect.appendChild(option);
                });
                programSelect.disabled = false;
            } catch (err) {
                console.error(err);
                programSelect.innerHTML = '<option value="">Error al cargar</option>';
            }
        };

        // Auto-fill faculty on program change
        programSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            if (selectedOption.value && selectedOption.dataset.facultyId) {
                facultySelect.innerHTML = `<option value="${selectedOption.dataset.facultyId}" selected>${selectedOption.dataset.facultyName}</option>`;
            } else {
                facultySelect.innerHTML = '<option value="">Seleccione un programa primero</option>';
            }
        });

        loadPrograms().then(() => {
            // Pre-fill form if data is provided (e.g. coming back from OTP correction)
            if (prefillData) {
                if (prefillData.username) document.getElementById('username').value = prefillData.username;
                if (prefillData.email) document.getElementById('email').value = prefillData.email;
                if (prefillData.first_name) document.getElementById('first_name').value = prefillData.first_name;
                if (prefillData.last_name) document.getElementById('last_name').value = prefillData.last_name;
                if (prefillData.DateOfBirth) document.getElementById('DateOfBirth').value = prefillData.DateOfBirth;
                if (prefillData.Semester) document.getElementById('Semester').value = prefillData.Semester;
                if (prefillData.FK_Program) {
                    programSelect.value = prefillData.FK_Program;
                    // Trigger faculty auto-fill
                    programSelect.dispatchEvent(new Event('change'));
                }
            }
        });

        // Password toggles for registration
        const setupPasswordToggle = (inputId, toggleId) => {
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

        setupPasswordToggle('password', 'toggle-password-reg');
        setupPasswordToggle('confirm_password', 'toggle-confirm-password');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            app.setLoading(true);

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirm_password = document.getElementById('confirm_password').value;
            const semester = parseInt(document.getElementById('Semester').value);

            // Validation
            if (!email.endsWith('@ucundinamarca.edu.co')) {
                app.showError('Por favor, regístrate con tu correo institucional (@ucundinamarca.edu.co), no con uno personal.', false);
                app.setLoading(false);
                return;
            }

            if (semester < 1 || semester > 10) {
                app.showError('El semestre debe estar entre 1 y 10.', false);
                app.setLoading(false);
                return;
            }

            const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(password)) {
                app.showError('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.', false);
                app.setLoading(false);
                return;
            }

            if (password !== confirm_password) {
                app.showError('Las contraseñas no coinciden.', false);
                app.setLoading(false);
                return;
            }

            const userData = {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                first_name: document.getElementById('first_name').value,
                last_name: document.getElementById('last_name').value,
                DateOfBirth: document.getElementById('DateOfBirth').value,
                Semester: semester,
                FK_Role: 2, // Hardcoded to student
                FK_Faculty: parseInt(document.getElementById('FK_Faculty').value),
                FK_Program: parseInt(document.getElementById('FK_Program').value),
                password: password,
                confirm_password: confirm_password,
                DataAuth: document.getElementById('DataAuth').checked,
                FK_HealthcareProfessional: null
            };

            try {
                console.log('Starting registration for:', userData.email);
                // Step 1: Account creation (JSON)
                await window.Auth.register(userData);
                console.log('Registration successful, redirecting to OTP');
                
                // Step 2: Show OTP Verification (pass full userData for possible correction)
                UserViews.renderOTPVerification(app, userData);
            } catch (err) {
                console.error('Registration failed:', err);
                
                // Check if it's the specific "user already exists" error
                if (err.message && err.message.includes('USER_ALREADY_EXISTS')) {
                    app.showError('Este usuario ya tiene una cuenta activa. Por favor, inicia sesión.', false);
                } else if (err.message && (err.message.includes('email:') || err.message.includes('username:'))) {
                    // Extract the message after the field name prefix
                    const msg = err.message.includes('email:') ? 
                        err.message.split('email: ')[1] : 
                        err.message.split('username: ')[1];
                    app.showError(msg.split('.')[0] || msg, false); // take first sentence/part
                } else {
                    app.showError(err.message);
                }
            } finally {
                app.setLoading(false);
            }
        });

        document.getElementById('go-to-login').addEventListener('click', () => app.renderLogin());
    },

    renderOTPVerification(app, userData) {
        // Support both legacy call (email, password) and new call (userData object)
        const isLegacy = typeof userData === 'string';
        const email = isLegacy ? userData : userData.email;
        const password = isLegacy ? arguments[2] : userData.password;

        app.appContainer.innerHTML = `
            <div class="card">
                <h1>Verificación de Correo</h1>
                <p class="subtitle">Hemos enviado un código de 6 dígitos a <strong>${email}</strong>. Por favor, ingrésalo para activar tu cuenta.</p>
                <div class="error-message"></div>
                <form id="otp-form">
                    <div class="form-group">
                        <label for="otp_code">Código de Verificación</label>
                        <input type="text" id="otp_code" required 
                               placeholder="123456" 
                               inputmode="numeric" 
                               maxlength="6" 
                               style="text-align: center; font-size: 2rem; letter-spacing: 0.5rem; font-weight: 700;">
                    </div>
                    <button type="submit" data-original-text="Verificar Código">Verificar Código</button>
                </form>
                <p class="subtitle" style="margin-top: 1.5rem;">¿No recibiste el código? Revisa tu carpeta de spam o utiliza la opción de abajo.</p>
                <div id="resend-container" style="text-align: center; margin-top: 1rem;">
                    <button id="resend-otp-btn" class="link-btn" disabled>Reenviar Código (120s)</button>
                </div>
                <hr style="border: none; border-top: 1px solid var(--border, #eee); margin: 1.5rem 0;">
                <p class="subtitle" style="font-size: 0.9rem;">¿Pusiste el correo incorrecto u otros datos erróneos?</p>
                <button class="link-btn" id="edit-registration-btn" style="color: var(--primary);">✏️ Corregir mis datos</button>
            </div>
        `;

        const form = document.getElementById('otp-form');
        const resendBtn = document.getElementById('resend-otp-btn');
        const editBtn = document.getElementById('edit-registration-btn');
        let countdown = 120;
        let timerId = null;

        const startTimer = () => {
            countdown = 120;
            resendBtn.disabled = true;
            if (timerId) clearInterval(timerId);
            
            timerId = setInterval(() => {
                countdown--;
                if (countdown <= 0) {
                    clearInterval(timerId);
                    resendBtn.disabled = false;
                    resendBtn.textContent = 'Reenviar Código';
                } else {
                    resendBtn.textContent = `Reenviar Código (${countdown}s)`;
                }
            }, 1000);
        };

        startTimer();

        resendBtn.addEventListener('click', async () => {
            app.setLoading(true);
            try {
                await window.Auth.resendOTP(email);
                alert('Nuevo código enviado a su correo.');
                startTimer();
            } catch (err) {
                app.showError(err.message);
            } finally {
                app.setLoading(false);
            }
        });

        editBtn.addEventListener('click', async () => {
            const confirmed = confirm(
                `¿Deseas volver al formulario de registro para corregir tus datos?\n\nSe cancelará el registro actual para "${email}".`
            );
            if (!confirmed) return;

            app.setLoading(true);
            try {
                // Remove the unverified user so they can re-register cleanly
                const apiBase = window.API_URL || '/api';
                const response = await fetch(`${apiBase}/cancel-registration/`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'No se pudo cancelar el registro.');
                }

                console.log('Registration cancelled, returning to register form with prefilled data.');
                if (timerId) clearInterval(timerId);

                // Return to register form with data pre-filled (excluding password for security)
                const prefill = isLegacy ? { email } : {
                    username: userData.username,
                    email: userData.email,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    DateOfBirth: userData.DateOfBirth,
                    Semester: userData.Semester,
                    FK_Program: userData.FK_Program,
                    FK_Faculty: userData.FK_Faculty,
                };
                UserViews.renderRegister(app, prefill);
            } catch (err) {
                console.error('Failed to cancel registration:', err);
                app.showError(err.message, false);
            } finally {
                app.setLoading(false);
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            app.setLoading(true);

            const otpCode = document.getElementById('otp_code').value;

            try {
                console.log('Verifying OTP for:', email);
                await window.Auth.verifyOTP(email, otpCode);
                console.log('OTP verified, redirecting to Face Capture');
                
                if (timerId) clearInterval(timerId);
                // Success: Move to mandatory face capture (Step 3)
                UserViews.renderFaceCaptureForRegistration(app, email, password);
            } catch (err) {
                console.error('OTP verification failed:', err);
                app.showError(err.message, false);
            } finally {
                app.setLoading(false);
            }
        });
    },

    renderFaceCaptureForRegistration(app, email, password) {
        app.appContainer.innerHTML = `
            <div class="card">
                <h1>Captura de Rostro</h1>
                <p class="subtitle">Tómate una foto para finalizar tu registro.</p>
                <div class="error-message"></div>
                
                <div id="capture-step">
                    <div class="camera-preview">
                        <video id="registration-video" autoplay playsinline muted></video>
                        <div class="camera-overlay"></div>
                    </div>
                    <button id="capture-btn">Capturar Foto</button>
                    <button class="link-btn" id="cancel-capture">Volver</button>
                </div>

                <div id="confirm-step" style="display: none; text-align: center;">
                    <div class="camera-preview">
                        <img id="captured-preview" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <p class="subtitle" style="margin-top: 1rem; color: var(--primary); font-weight: 600;">¿Confirmas que este eres tú?</p>
                    <button id="confirm-register-btn">Confirmo que este soy yo</button>
                    <button class="link-btn" id="retry-capture">Retomar Foto</button>
                </div>
            </div>
        `;

        const videoSelector = '#registration-video';
        const captureStep = document.getElementById('capture-step');
        const confirmStep = document.getElementById('confirm-step');
        const capturedPreview = document.getElementById('captured-preview');
        
        const captureBtn = document.getElementById('capture-btn');
        const confirmBtn = document.getElementById('confirm-register-btn');
        const retryBtn = document.getElementById('retry-capture');
        const cancelBtn = document.getElementById('cancel-capture');

        let capturedImageBlob = null;

        // Init camera
        window.CameraHandler.init(videoSelector);

        captureBtn.addEventListener('click', async () => {
            app.setLoading(true);
            const imageFile = await window.CameraHandler.capturePhoto();
            if (imageFile) {
                capturedImageBlob = imageFile;
                
                // Show preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    capturedPreview.src = e.target.result;
                    captureStep.style.display = 'none';
                    confirmStep.style.display = 'block';
                };
                reader.readAsDataURL(imageFile);
                app.setLoading(false);
            } else {
                app.showError('No se pudo capturar la foto. Por favor intente de nuevo.');
                app.setLoading(false);
            }
        });

        retryBtn.addEventListener('click', () => {
            confirmStep.style.display = 'none';
            captureStep.style.display = 'block';
            capturedImageBlob = null;
        });

        confirmBtn.addEventListener('click', async () => {
            app.setLoading(true);
            try {
                if (!capturedImageBlob) throw new Error('No hay una imagen capturada');

                console.log('Finalizing registration with face capture for:', email);
                // Step 3: Login with face capture. 
                // Since this is the first login, backend will register the face embedding.
                const loginData = await window.Auth.login(email, password, capturedImageBlob);
                console.log('Biometric registration/login successful');
                
                window.CameraHandler.stop();
                alert(`¡Bienvenido a Aura, ${loginData.username}! Registro completado con éxito.`);
                
                if (window.Navbar) window.Navbar.update();
                app.renderDashboard();
            } catch (err) {
                console.error('Face capture login failed:', err);
                app.showError(err.message);
                // If biometric login fails, allow retrying photo
                confirmStep.style.display = 'none';
                captureStep.style.display = 'block';
            } finally {
                app.setLoading(false);
            }
        });

        cancelBtn.addEventListener('click', () => {
            window.CameraHandler.stop();
            app.renderRegister();
        });
    }
};

window.UserViews = UserViews;
