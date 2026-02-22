const Navbar = {
    init(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
    },

    update() {
        if (!this.container) return;
        const navLinks = document.getElementById('nav-links');
        if (!navLinks) return;

        if (window.Auth.isAuthenticated()) {
            navLinks.innerHTML = `
                <a href="#" class="nav-link active" id="nav-dashboard">Panel</a>
                <a href="#" class="nav-link" id="nav-profile">Perfil</a>
                <a href="#" class="nav-link btn-logout" id="nav-logout">Cerrar Sesión</a>
            `;

            this.addLogoutListener();
            this.addLinkListeners();
        } else {
            navLinks.innerHTML = `
                <a href="#" class="nav-link" id="nav-login">Iniciar Sesión</a>
                <a href="#" class="nav-link" id="nav-register">Registrarse</a>
            `;
            this.addAuthLinkListeners();
        }
    },

    addLogoutListener() {
        const logoutBtn = document.getElementById('nav-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.Auth.logout();
                this.update();
                if (window.App) window.App.renderLogin();
            });
        }
    },

    addLinkListeners() {
        // Generic listeners for authenticated links
        const dashboardLink = document.getElementById('nav-dashboard');
        if (dashboardLink) {
            dashboardLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.App) window.App.renderDashboard();
            });
        }
    },

    addAuthLinkListeners() {
        const loginLink = document.getElementById('nav-login');
        const registerLink = document.getElementById('nav-register');

        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.App) window.App.renderLogin();
            });
        }
        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.App) window.App.renderRegister();
            });
        }
    },

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <a href="/" class="nav-brand" id="brand-link">
                        <img src="/assets/logo.png" alt="AURA Logo" class="nav-logo">
                        <span>AURA</span>
                    </a>
                    <div class="nav-links" id="nav-links">
                        <!-- Links will be dynamically injected via update() -->
                    </div>
                </div>
            </nav>
        `;

        const brandLink = document.getElementById('brand-link');
        brandLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.App) window.App.renderInitialView();
        });

        this.update();
    }
};

window.Navbar = Navbar;
