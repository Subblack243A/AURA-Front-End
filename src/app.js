const App = {
    init() {
        this.appContainer = document.getElementById('app');
        if (window.Navbar) {
            window.Navbar.init('navbar-placeholder');
        }
        if (window.Footer) {
            window.Footer.init('footer-placeholder');
        }

        this.renderInitialView();
    },


    renderInitialView() {
        if (window.Auth.isAuthenticated()) {
            this.renderDashboard();
        } else {
            // Start with camera permission request
            this.renderCameraPermission();
        }
    },

    setLoading(isLoading) {
        const btn = this.appContainer.querySelector('button[type="submit"]');
        if (btn) {
            btn.disabled = isLoading;
            btn.textContent = isLoading ? 'Procesando...' : btn.dataset.originalText;
        }
    },

    showError(message) {
        const errorDiv = this.appContainer.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    },

    renderCameraPermission() {
        if (window.UserViews) {
            window.UserViews.renderCameraPermission(this);
        }
    },

    renderLogin() {
        if (window.UserViews) {
            window.UserViews.renderLogin(this);
        }
    },

    renderFaceVerification(email, password) {
        if (window.UserViews) {
            window.UserViews.renderFaceVerification(this, email, password);
        }
    },

    renderRegister() {
        if (window.UserViews) {
            window.UserViews.renderRegister(this);
        }
    },

    renderDashboard() {
        const user = window.Auth.getUser();
        const role = window.Auth.getRole();

        if (role === 'Estudiante') {
            if (window.StudentDashboard) {
                window.StudentDashboard.render(this.appContainer, this);
            } else {
                this.appContainer.innerHTML = `<p>Error: Student Dashboard not loaded.</p>`;
            }
        } else {
            // Default or other role dashboards
            this.appContainer.innerHTML = `
                <div class="card">
                    <h1>Panel de Control</h1>
                    <p class="subtitle">Hola, ${user.username}!</p>
                    <div class="user-badge" style="margin: 0 auto 1.5rem auto; display: flex; justify-content: center; width: fit-content;">
                        ${role || 'Usuario'}
                    </div>
                    <p style="text-align: center; margin-bottom: 1.5rem;">Próximamente: Panel específico para tu rol.</p>
                    <button id="logout-btn" data-original-text="Cerrar Sesión">Cerrar Sesión</button>
                </div>
            `;

            document.getElementById('logout-btn').addEventListener('click', () => {
                window.Auth.logout();
                if (window.Navbar) window.Navbar.update();
                this.renderLogin();
            });
        }
    }
};

window.App = App;
document.addEventListener('DOMContentLoaded', () => App.init());
