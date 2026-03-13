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


    async renderInitialView() {
        if (window.Auth.isAuthenticated()) {
            await this.checkEmotionAndRender();
        } else {
            // Start with Landing Page
            this.renderLandingPage();
        }
    },

    async checkEmotionAndRender() {
        // Only apply the 24h check for students
        if (window.Auth.getRole() === 'Estudiante' && window.EmotionViews) {
            try {
                const needsRegistration = await window.EmotionViews.checkNeedsEmotionRegistration();
                if (needsRegistration) {
                    console.log('24h emotion check: registration required before dashboard.');
                    await window.EmotionViews.renderMandatoryRegister(this.appContainer, this);
                    return;
                }
            } catch (err) {
                console.error('Emotion check failed, proceeding to dashboard:', err);
            }
        }
        this.renderDashboard(true);
    },

    setLoading(isLoading) {
        // Find all interactive buttons in the current view that should be disabled
        const buttons = this.appContainer.querySelectorAll('button[type="submit"], #verify-btn, #landing-login-btn, #landing-register-btn, #capture-btn, #confirm-register-btn, #retry-capture, #cancel-capture, #back-to-login');
        
        buttons.forEach(btn => {
            btn.disabled = isLoading;
            
            // Only change text/spinner for the "primary" action buttons
            if (btn.type === 'submit' || btn.id === 'verify-btn' || btn.id === 'capture-btn' || btn.id === 'confirm-register-btn') {
                if (isLoading) {
                    if (!btn.dataset.originalText) {
                        btn.dataset.originalText = btn.textContent;
                    }
                    btn.innerHTML = `<span class="spinner"></span> Procesando...`;
                } else {
                    btn.textContent = btn.dataset.originalText || btn.textContent;
                }
            }
        });
    },

    showError(message, isSystemError = true) {
        const errorDiv = this.appContainer.querySelector('.error-message');
        if (errorDiv) {
            console.error(isSystemError ? 'System Error:' : 'Validation Error:', message);

            // If it's a system error, we can show a cleaner message but keep the tech detail visible
            if (isSystemError) {
                // For "Face registration required", we want it to be descriptive if it leaks to the UI
                if (message && message.includes('Face registration required')) {
                    errorDiv.textContent = 'Se requiere registro facial para este usuario.';
                } else {
                    errorDiv.textContent = 'Algo salió mal. Por favor, inténtelo de nuevo.';
                }

                // Add a small technical detail link/text if specifically requested or for debugging
                console.debug('Error detail:', message);
            } else {
                errorDiv.textContent = message;
            }

            errorDiv.style.display = 'block';
        }
    },

    renderLandingPage() {
        if (window.UserViews) {
            window.UserViews.renderLandingPage(this);
        }
    },

    renderLogin() {
        if (window.UserViews) {
            window.UserViews.renderLogin(this);
        }
    },

    renderForgotEmail() {
        if (window.UserViews) {
            window.UserViews.renderForgotEmail(this);
        }
    },

    renderFaceVerification(email, password) {
        if (window.UserViews) {
            window.UserViews.renderFaceVerification(this, email, password);
        }
    },

    renderEmotionHistory() {
        if (window.EmotionViews) {
            window.EmotionViews.render(this.appContainer, this);
        }
    },

    renderEmotionRegister() {
        if (window.EmotionViews) {
            window.EmotionViews.renderRegister(this.appContainer, this);
        }
    },

    renderRegister() {
        if (window.UserViews) {
            window.UserViews.renderRegister(this);
        }
    },

    renderSurveyHistory() {
        if (window.SurveyView) {
            window.SurveyView.renderHistory(this.appContainer, this);
        }
    },

    renderSurveyForm() {
        if (window.SurveyView) {
            window.SurveyView.renderForm(this.appContainer, this);
        }
    },

    renderProfile() {
        if (window.ProfileView) {
            window.ProfileView.render(this.appContainer, this);
        }
    },

    renderAdminReports() {
        if (window.AdminReports) {
            window.AdminReports.renderLanding(this.appContainer, this);
        }
    },

    renderAdminCharts() {
        if (window.AdminReports) {
            window.AdminReports.renderCharts(this.appContainer, this);
        }
    },

    renderAdminUsers() {
        if (window.AdminUsers) {
            window.AdminUsers.render(this.appContainer, this);
        }
    },

    renderAdminDashboard() {
        if (window.AdminDashboard) {
            window.AdminDashboard.render(this.appContainer, this);
        }
    },

    async renderDashboard(skipCheck = false) {
        const user = window.Auth.getUser();
        const role = window.Auth.getRole();

        // Intercept for student 24h emotion check (don't check when already coming from checkEmotionAndRender)
        if (!skipCheck && role === 'Estudiante' && window.EmotionViews) {
            try {
                const needsRegistration = await window.EmotionViews.checkNeedsEmotionRegistration();
                if (needsRegistration) {
                    console.log('24h emotion check: registration required before dashboard.');
                    await window.EmotionViews.renderMandatoryRegister(this.appContainer, this);
                    return;
                }
            } catch (err) {
                console.error('Emotion check failed, proceeding to dashboard:', err);
            }
        }


        if (role === 'Estudiante') {
            if (window.StudentDashboard) {
                window.StudentDashboard.render(this.appContainer, this);
            } else {
                this.appContainer.innerHTML = `<p>Error: Student Dashboard not loaded.</p>`;
            }
        } else if (role === 'Administrador' && window.AdminDashboard) {
            window.AdminDashboard.render(this.appContainer, this);
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
