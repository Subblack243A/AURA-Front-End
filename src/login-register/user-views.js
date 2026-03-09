const UserViews = {
    renderCameraPermission(app) {
        app.appContainer.innerHTML = `
            <div class="card">
                <h1>Acceso a Cámara</h1>
                <p class="subtitle">Para iniciar sesión, necesitamos usar tu cámara para el análisis de emociones y seguridad.</p>
                <div class="camera-icon-preview" style="text-align: center; margin: 2rem 0;">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                </div>
                <button id="enable-camera-btn">Habilitar Cámara</button>
                <button class="link-btn" id="go-to-login-anyway">Continuar al Login</button>
            </div>
        `;

        document.getElementById('enable-camera-btn').addEventListener('click', async () => {
            const allowed = await window.CameraHandler.requestPermission();
            if (allowed) {
                app.renderLogin();
            } else {
                alert('No se pudo acceder a la cámara. Por favor, asegúrate de dar los permisos necesarios.');
            }
        });

        document.getElementById('go-to-login-anyway').addEventListener('click', () => app.renderLogin());
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
                // Try login without image first to check credentials
                await window.Auth.login(email, password, null);

                // If by some chance it succeeds (e.g. backend doesn't require image for this user), go to dashboard
                if (window.Navbar) window.Navbar.update();
                app.renderDashboard();
            } catch (err) {
                // If credentials are correct but face registration is missing or image is required
                if (err.code === 'FACE_REGISTRATION_REQUIRED' ||
                    err.message.includes('Image file is required') ||
                    err.message.includes('Face registration required')) {
                    app.renderFaceVerification(email, password);
                } else {
                    app.showError(err.message, false); // Pass false as it's likely a validation/cred error
                }
            } finally {
                app.setLoading(false);
            }
        });

        document.getElementById('go-to-register').addEventListener('click', () => app.renderRegister());
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

    renderRegister(app) {
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

        loadPrograms();

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
                // Step 1: Account creation (JSON)
                await window.Auth.register(userData);
                
                // Step 2: Go to face capture for biometric setup
                this.renderFaceCaptureForRegistration(app, userData.email, userData.password);
            } catch (err) {
                app.showError(err.message);
            } finally {
                app.setLoading(false);
            }
        });

        document.getElementById('go-to-login').addEventListener('click', () => app.renderLogin());
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
            } else {
                app.showError('No se pudo capturar la foto. Por favor intente de nuevo.');
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

                // Step 2: Login with face capture. 
                // Since this is the first login, backend will register the face embedding.
                const loginData = await window.Auth.login(email, password, capturedImageBlob);
                
                window.CameraHandler.stop();
                alert(`¡Bienvenido a Aura, ${loginData.username}! Registro completado con éxito.`);
                
                if (window.Navbar) window.Navbar.update();
                app.renderDashboard();
            } catch (err) {
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
