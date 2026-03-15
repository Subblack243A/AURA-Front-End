const Navbar = {
    init(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
    },

    update() {
        if (!this.container) return;
        const navLinks = document.getElementById('nav-links');
        const roleIndicator = document.getElementById('role-indicator');
        if (!navLinks) return;

        if (window.Auth.isAuthenticated()) {
            const role = window.Auth.getRole();
            
            // Update Role Indicator
            if (roleIndicator) {
                let badgeClass = 'role-badge-default';
                if (role === 'Administrador') badgeClass = 'role-badge-admin';
                else if (role === 'Estudiante') badgeClass = 'role-badge-student';
                else if (role.toLowerCase() === 'profesional de la salud' || role.toLowerCase() === 'prof. de salud') badgeClass = 'role-badge-health';

                let agentStatusHtml = '';
                if (role === 'Estudiante') {
                    agentStatusHtml = `
                    <div class="agent-status-badge" style="display: inline-flex; height: fit-content; align-items: center; justify-content: center; margin-left: 10px; background: rgba(255, 255, 255, 0.05); padding: 0.5rem 1rem; border-radius: 2rem; font-size: 0.875rem; font-weight: 600; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <div id="agent-status-dot" class="dot-red"></div>
                        <span id="agent-status-text" style="color: white; margin-left: 5px;">Agente Desconectado</span>
                    </div>`;
                }

                roleIndicator.style.display = 'flex';
                roleIndicator.style.alignItems = 'center';
                roleIndicator.innerHTML = `<span class="role-badge ${badgeClass}">${window.Auth.formatRole(role)}</span>${agentStatusHtml}`;

                if (role === 'Estudiante') {
                    this.startAgentStatusPolling();
                } else {
                    this.stopAgentStatusPolling();
                }
            }

            navLinks.innerHTML = `
                <a href="#" class="nav-link active" id="nav-dashboard">Panel</a>
                <a href="#" class="nav-link" id="nav-profile">Perfil</a>
                <a href="#" class="nav-link btn-logout" id="nav-logout">Cerrar Sesión</a>
            `;

            this.addLogoutListener();
            this.addLinkListeners();
        } else {
            if (roleIndicator) {
                roleIndicator.innerHTML = '';
                roleIndicator.style.display = 'none';
                this.stopAgentStatusPolling();
            }
            navLinks.innerHTML = `
                <a href="#" class="nav-link" id="nav-login">Iniciar Sesión</a>
                <a href="#" class="nav-link" id="nav-register">Registrarse</a>
            `;
            this.addAuthLinkListeners();
        }
    },

    checkAgentStatus(lastPingDateString) {
        const dot = document.getElementById('agent-status-dot');
        const text = document.getElementById('agent-status-text');
        
        if (!dot || !text) return;

        if (!lastPingDateString) {
            dot.className = 'dot-red';
            text.textContent = 'Agente Desconectado';
            return;
        }

        const lastPing = new Date(lastPingDateString);
        const now = new Date();
        const diffInMinutes = (now - lastPing) / (1000 * 60);

        if (diffInMinutes < 2) {
            dot.className = 'dot-green';
            text.textContent = 'Agente Activo';
        } else {
            dot.className = 'dot-red';
            text.textContent = 'Agente Desconectado';
        }
    },

    startAgentStatusPolling() {
        if (this.agentPollingInterval) {
            clearInterval(this.agentPollingInterval);
        }

        const fetchProfile = async () => {
            try {
                if (!window.Auth.isAuthenticated()) {
                    this.stopAgentStatusPolling();
                    return;
                }
                const response = await fetch('/api/profile/', {
                    headers: {
                        'Authorization': `Token ${window.Auth.getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    this.checkAgentStatus(data.last_agent_ping);
                }
            } catch (error) {
                console.error("Error fetching agent status:", error);
            }
        };

        // Fetch immediately and set interval for every 30 seconds
        fetchProfile();
        this.agentPollingInterval = setInterval(fetchProfile, 30000);
    },

    stopAgentStatusPolling() {
        if (this.agentPollingInterval) {
            clearInterval(this.agentPollingInterval);
            this.agentPollingInterval = null;
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
        
        const profileLink = document.getElementById('nav-profile');
        if (profileLink) {
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.App) window.App.renderProfile();
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
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <a href="/" class="nav-brand" id="brand-link">
                            <img src="/assets/logo.png" alt="AURA Logo" class="nav-logo">
                            <span>AURA</span>
                        </a>
                        <div id="role-indicator" style="display: none; height: fit-content;"></div>
                    </div>
                    <div class="nav-links" id="nav-links">
                        <!-- Links will be dynamically injected via update() -->
                    </div>
                </div>
            </nav>
            <style>
                .role-badge {
                    font-size: 0.75rem;
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    border: 1px solid transparent;
                }
                .role-badge-admin { 
                    background: rgba(110, 206, 210, 0.15); 
                    color: #6ECED2; 
                    border-color: rgba(110, 206, 210, 0.3);
                }
                .role-badge-student { 
                    background: rgba(52, 211, 153, 0.15); 
                    color: #34d399; 
                    border-color: rgba(52, 211, 153, 0.3);
                }
                .role-badge-health { 
                    background: rgba(167, 139, 250, 0.15); 
                    color: #a78bfa; 
                    border-color: rgba(167, 139, 250, 0.3);
                }
                .role-badge-default { 
                    background: rgba(148, 163, 184, 0.15); 
                    color: #94a3b8; 
                    border-color: rgba(148, 163, 184, 0.3);
                }
            </style>
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
