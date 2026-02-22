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
                    <div class="form-group" id="image-group">
                        <label for="image">Imagen Facial (Requerido)</label>
                        <input type="file" id="image" accept="image/*">
                        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
                            Se requiere para el análisis de emociones.
                        </p>
                    </div>
                    <button type="submit" data-original-text="Iniciar Sesión">Iniciar Sesión</button>
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
            const imageFile = document.getElementById('image').files[0];

            try {
                await window.Auth.login(email, password, imageFile);
                if (window.Navbar) window.Navbar.update();
                app.renderDashboard();
            } catch (err) {
                app.showError(err.message);
            } finally {
                app.setLoading(false);
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
                    
                    <!-- Simulating selection for IDs for now -->
                    <div class="form-group">
                        <label for="FK_Role">Rol</label>
                        <select id="FK_Role" required>
                            <option value="2">Estudiante</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="FK_Faculty">Facultad</label>
                        <select id="FK_Faculty" required>
                            <option value="1">Ingeniería</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="FK_Program">Programa</label>
                        <select id="FK_Program" required>
                            <option value="1">Ingeniería de Sistemas</option>
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
                            <input type="checkbox" id="DataAuth" style="width: auto;">
                            <span>Autorización de datos</span>
                        </label>
                    </div>

                    <button type="submit" data-original-text="Registrarse">Registrarse</button>
                </form>
                <button class="link-btn" id="go-to-login">¿Ya tienes cuenta? Inicia Sesión</button>
            </div>
        `;

        const form = document.getElementById('register-form');
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
                FK_Role: parseInt(document.getElementById('FK_Role').value),
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
