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
                        <input type="password" id="password" required placeholder="••••••••">
                    </div>
                    <button type="submit" data-original-text="Siguiente">Siguiente</button>
                </form>
                <button class="link-btn" id="go-to-register">¿No tienes cuenta? Regístrate</button>
            </div>
        `;

        const form = document.getElementById('login-form');

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
                // If credentials are correct, backend returns 400 "Image file is required"
                if (err.message.includes('Image file is required') || err.message.includes('Face registration required')) {
                    app.renderFaceVerification(email, password);
                } else {
                    app.showError(err.message);
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
                        <input type="number" id="Semester" required min="1" max="12">
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
                        <input type="password" id="password" required>
                    </div>
                    <div class="form-group">
                        <label for="confirm_password">Confirmar Contraseña</label>
                        <input type="password" id="confirm_password" required>
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

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            app.setLoading(true);

            const userData = {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                first_name: document.getElementById('first_name').value,
                last_name: document.getElementById('last_name').value,
                DateOfBirth: document.getElementById('DateOfBirth').value,
                Semester: parseInt(document.getElementById('Semester').value),
                FK_Role: 2, // Hardcoded to student
                FK_Faculty: parseInt(document.getElementById('FK_Faculty').value),
                FK_Program: parseInt(document.getElementById('FK_Program').value),
                password: document.getElementById('password').value,
                confirm_password: document.getElementById('confirm_password').value,
                DataAuth: document.getElementById('DataAuth').checked,
                FK_HealthcareProfessional: null
            };

            try {
                await window.Auth.register(userData);
                alert('Registro exitoso. Ahora puedes iniciar sesión.');
                app.renderLogin();
            } catch (err) {
                app.showError(err.message);
            } finally {
                app.setLoading(false);
            }
        });

        document.getElementById('go-to-login').addEventListener('click', () => app.renderLogin());
    }
};

window.UserViews = UserViews;
