const StudentDashboard = {
    render(container, appInstance) {
        const user = window.Auth.getUser();

        // Security check: Only students can see this
        if (user.role !== 'Estudiante') {
            this.renderAccessDenied(container);
            return;
        }

        container.innerHTML = `
            <div class="dashboard-container">
                <section class="welcome-section">
                    <div class="welcome-header">
                        <div class="welcome-text">
                            <div class="user-badge">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                Estudiante
                            </div>
                            <h1>¡Hola de nuevo, ${user.username}!</h1>
                            <p class="subtitle" style="text-align: left; margin-bottom: 0;">Bienvenido a tu panel personal de AURA. Aquí puedes gestionar tu bienestar académico.</p>
                        </div>
                        <div class="welcome-actions">
                            <button id="dashboard-logout" class="btn-secondary" style="width: auto; padding: 0.75rem 1.5rem; background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2);">
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </section>

                <div class="dashboard-grid">
                    <div class="dashboard-card" id="card-emotion-history">
                        <div class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"></path><path d="M7 16.5c1-1 2.5-1.5 5-1.5s4 .5 5 1.5"></path><path d="M5.5 12c1.5-1.5 3.5-2.5 6.5-2.5s5 1 6.5 2.5"></path><path d="M4 8c2.5-3 5.5-4.5 8-4.5s5.5 1.5 8 4.5"></path></svg>
                        </div>
                        <h3 class="card-title">Mis Emociones</h3>
                        <p class="card-desc">Visualiza tu historial de estados de ánimo y cómo han evolucionado durante el semestre.</p>
                        <a href="#" class="card-action">Ver historial →</a>
                    </div>

                    <div class="dashboard-card">
                        <div class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                        </div>
                        <h3 class="card-title">Encuestas</h3>
                        <p class="card-desc">Responde encuestas académicas para ayudarnos a entender mejor tu experiencia universitaria.</p>
                        <a href="#" class="card-action">Ir a encuestas →</a>
                    </div>

                    <div class="dashboard-card" id="card-emotion-register">
                        <div class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 7a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3z"></path></svg>
                        </div>
                        <h3 class="card-title">Registro emocional</h3>
                        <p class="card-desc">Tómate un momento para registrar cómo te sientes hoy.</p>
                        <a href="#" class="card-action">Registrar emoción →</a>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners(appInstance);
        this.updateRegistrationCard();
        
        // Check for 24h emotion registration requirement (Student only)
        if (window.EmotionViews) {
            window.EmotionViews.checkNeedsEmotionRegistration().then(needsRegistration => {
                if (needsRegistration) {
                    console.log('24h emotion check: registration required.');
                    window.EmotionViews.renderMandatoryRegister(container, appInstance);
                    return;
                }
                
                // If emotion is OK, then check for surveys
                if (window.SurveyManager) {
                    window.SurveyManager.checkSurveyRequirement(appInstance);
                }
            }).catch(err => {
                console.error('Emotion check failed, still checking surveys:', err);
                if (window.SurveyManager) {
                    window.SurveyManager.checkSurveyRequirement(appInstance);
                }
            });
        }
    },

    async updateRegistrationCard() {
        const registerCard = document.getElementById('card-emotion-register');
        if (!registerCard) return;

        const restriction = await window.EmotionViews.checkLastRegistration();
        const actionLink = registerCard.querySelector('.card-action');
        const descText = registerCard.querySelector('.card-desc');

        if (!restriction.canRegister) {
            registerCard.classList.add('locked');
            actionLink.innerHTML = `<span id="dashboard-timer">--:--</span>`;
            descText.textContent = 'Próximo registro disponible en:';
            
            const timerSpan = document.getElementById('dashboard-timer');
            let remaining = restriction.remaining;

            const updateDashboardTimer = () => {
                if (remaining <= 0) {
                    clearInterval(interval);
                    registerCard.classList.remove('locked');
                    actionLink.textContent = 'Registrar emoción →';
                    descText.textContent = 'Tómate un momento para registrar cómo te sientes hoy.';
                    return;
                }

                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

                let timeStr = "";
                if (hours > 0) timeStr += `${hours}h `;
                timeStr += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                timerSpan.textContent = timeStr;
                remaining -= 1000;
            };

            const interval = setInterval(updateDashboardTimer, 1000);
            updateDashboardTimer();
        }
    },

    setupEventListeners(appInstance) {
        document.getElementById('dashboard-logout').addEventListener('click', () => {
            window.Auth.logout();
            if (window.Navbar) window.Navbar.update();
            appInstance.renderLogin();
        });

        const historyCard = document.getElementById('card-emotion-history');
        if (historyCard) {
            historyCard.addEventListener('click', (e) => {
                e.preventDefault();
                appInstance.renderEmotionHistory();
            });
        }

        const registerCard = document.getElementById('card-emotion-register');
        if (registerCard) {
            registerCard.addEventListener('click', (e) => {
                e.preventDefault();
                appInstance.renderEmotionRegister();
            });
        }

        const surveyCard = document.querySelector('.dashboard-card:nth-child(2)');
        if (surveyCard) {
            surveyCard.addEventListener('click', (e) => {
                e.preventDefault();
                appInstance.renderSurveyHistory();
            });
        }
    },

    renderAccessDenied(container) {
        container.innerHTML = `
            <div class="access-denied card">
                <h1>Acceso Denegado</h1>
                <p class="subtitle">Lo sentimos, esta sección es exclusiva para estudiantes.</p>
                <button onclick="window.Auth.logout(); location.reload();">Cerrar Sesión</button>
            </div>
        `;
    }
};

window.StudentDashboard = StudentDashboard;
