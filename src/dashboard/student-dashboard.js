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
                    
                    <div class="dashboard-card" id="card-agent-portal">
                        <div class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                        <h3 class="card-title">Portal del Agente Biométrico</h3>
                        <p class="card-desc">Descarga y configura el Agente local de AURA para tus sesiones.</p>
                        <a href="#" class="card-action">Ir al portal →</a>
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
        
        const agentCard = document.getElementById('card-agent-portal');
        if (agentCard) {
            agentCard.addEventListener('click', (e) => {
                e.preventDefault();
                this.renderAgentPortal(document.querySelector('#app'), appInstance);
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
    },

    renderAgentPortal(container, appInstance) {
        container.innerHTML = `
            <div id="agent-portal-view" class="dashboard-container">
                <div class="view-header" style="display: flex; justify-content: flex-start; margin-bottom: 2rem;">
                    <button id="btn-back-dashboard" class="btn-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem; width: auto; padding: 0.5rem 1.2rem; margin: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Volver al Panel
                    </button>
                </div>
                
                <div class="portal-content-wrapper" style="max-width: 800px; margin: 0 auto;">
                    <div class="portal-card">
                        <h3>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            1. Propósito
                        </h3>
                        <p>
                            Es necesario descargar este agente local para evadir las restricciones de la cámara web en el navegador cuando se minimiza la pestaña o funciona en segundo plano. Esto asegura que la captura de datos no sea interrumpida y garantiza la precisión de la investigación y del seguimiento de tu bienestar académico.
                        </p>
                    </div>
                    
                    <div class="portal-card">
                        <h3>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            2. Instrucciones de Instalación
                        </h3>
                        <ol class="portal-instructions">
                            <li>Haz clic en <strong>"Descargar Agente"</strong> abajo para obtener un archivo .zip configurado con tus credenciales seguras.</li>
                            <li>Localiza el archivo <code>Agente_Aura.zip</code> en donde lo descargaste, haz clic derecho y selecciona <strong>"Extraer en "Agente_Aura"..."</strong> (o usa WinRAR/7-Zip) para descomprimir el contenido en una carpeta segura.</li>
                            <li>Abre la carpeta extraída y haz doble clic en <code>emotion_agent.exe</code> <em>(no aparecerá ninguna ventana, el agente se ejecutará silenciosamente en segundo plano)</em>.</li>
                        </ol>
                    </div>
                    
                    <div class="portal-card warning-card">
                        <h3>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            3. Cómo Detenerlo
                        </h3>
                        <p>
                            <strong>Advertencia:</strong> El agente corre continuamente en segundo plano enviando la información. 
                            Para apagarlo correctamente, debes buscar el ícono azul de "AURA" en la <strong>Bandeja del Sistema</strong> de Windows (junto al reloj), 
                            hacer clic derecho sobre él y seleccionar <strong>"Detener Agente"</strong>.
                        </p>
                    </div>
                    
                    <div style="margin-top: 3rem; text-align: center;">
                        <button id="btn-download-agent" class="btn-primary" style="font-size: 1.1rem; padding: 1rem 2.5rem; border-radius: 9999px; box-shadow: 0 4px 6px rgba(110, 206, 210, 0.3); transition: transform 0.2s, box-shadow 0.2s; display: inline-flex; align-items: center; gap: 0.75rem;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Descargar Agente (.ZIP)
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-back-dashboard').addEventListener('click', () => {
             this.render(container, appInstance);
        });

        document.getElementById('btn-download-agent').addEventListener('click', this.downloadAgentZip.bind(this));
    },

    async downloadAgentZip(e) {
        const btn = e.currentTarget;
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Descargando... <span class="spinner"></span>';
        btn.disabled = true;

        try {
            const token = window.Auth.getToken();
            const response = await fetch('/api/biometric/download-agent/', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error en la descarga: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'Agente_Aura.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // To ensure the state resets smoothly
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 1000);

        } catch (error) {
            console.error('Error al descargar el agente:', error);
            alert('No se pudo descargar el agente. Por favor, intenta nuevamente más tarde.');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};

window.StudentDashboard = StudentDashboard;
