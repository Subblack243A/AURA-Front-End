const UserViews = {
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
                    <!-- Hidden camera for background capture -->
                    <div id="camera-container" style="display: none;">
                        <video id="camera-video" autoplay playsinline muted></video>
                    </div>
                    <button type="submit" data-original-text="Iniciar Sesión">Iniciar Sesión</button>
                </form>
                <button class="link-btn" id="go-to-register">¿No tienes cuenta? Regístrate</button>
            </div>

            <!-- Face Registration Modal -->
            <div id="face-modal" class="modal" style="display: none;">
                <div class="modal-content card">
                    <h2>Registro Facial Requerido</h2>
                    <p>Necesitamos una foto tuya para completar el registro y analizar tus emociones.</p>
                    <div class="camera-preview">
                        <video id="modal-video" autoplay playsinline muted></video>
                        <div class="camera-overlay"></div>
                    </div>
                    <div class="modal-actions">
                        <button id="capture-btn" class="primary-btn">Tomar Foto y Continuar</button>
                    </div>
                </div>
            </div>
        `;

        const form = document.getElementById('login-form');
        const faceModal = document.getElementById('face-modal');
        const captureBtn = document.getElementById('capture-btn');

        // Request camera permission on load
        window.CameraHandler.init('#camera-video');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            app.setLoading(true);

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // 1. Attempt capture in background
                let imageFile = await window.CameraHandler.capturePhoto();

                // 2. Try login
                await window.Auth.login(email, password, imageFile);

                if (window.Navbar) window.Navbar.update();
                app.renderDashboard();
            } catch (err) {
                if (err.message.includes('Face registration required') || err.message.includes('Image file is required')) {
                    // Show modal for foreground capture
                    faceModal.style.display = 'flex';
                    // Re-init camera for modal
                    await window.CameraHandler.init('#modal-video');

                    // Wait for photo capture
                    const newPhoto = await new Promise(resolve => {
                        captureBtn.onclick = async () => {
                            const photo = await window.CameraHandler.capturePhoto();
                            resolve(photo);
                        };
                    });

                    faceModal.style.display = 'none';
                    app.setLoading(true); // Keep loading state

                    try {
                        await window.Auth.login(email, password, newPhoto);
                        if (window.Navbar) window.Navbar.update();
                        app.renderDashboard();
                    } catch (retryErr) {
                        app.showError(retryErr.message);
                    }
                } else {
                    app.showError(err.message);
                }
            } finally {
                app.setLoading(false);
                window.CameraHandler.stop();
            }
        });

        document.getElementById('go-to-register').addEventListener('click', () => app.renderRegister());
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
