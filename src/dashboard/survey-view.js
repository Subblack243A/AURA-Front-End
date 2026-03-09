const SurveyView = {
    async renderHistory(container, appInstance) {
        container.innerHTML = `
            <div class="dashboard-container">
                <section class="welcome-section">
                    <div class="welcome-header">
                        <div class="welcome-text">
                            <h1>Historial de Encuestas</h1>
                            <p class="subtitle" style="text-align: left;">Revisa tus resultados anteriores y el estado de agotamiento detectado.</p>
                        </div>
                        <div class="welcome-actions">
                            <button id="back-to-dash-survey" class="btn-secondary" style="width: auto; padding: 0.75rem 1.5rem; background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.2);">
                                ← Volver al Panel
                            </button>
                        </div>
                    </div>
                </section>

                <div id="survey-history-view-list" class="survey-history-list">
                    <p class="subtitle">Cargando historial...</p>
                </div>
            </div>
        `;

        document.getElementById('back-to-dash-survey').addEventListener('click', () => {
            appInstance.renderDashboard();
        });

        try {
            const history = await window.SurveyManager.fetchHistory();
            const listContainer = document.getElementById('survey-history-view-list');

            if (!history || history.length === 0) {
                listContainer.innerHTML = `
                    <div class="card" style="text-align: center; padding: 3rem;">
                        <p class="subtitle">No se han encontrado respuestas</p>
                    </div>
                `;
                return;
            }

            listContainer.innerHTML = history.map(item => {
                const date = new Date(item.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                const statusColor = item.has_burnout ? '#f87171' : '#6ECED2';
                const statusText = item.has_burnout ? 'Se detectaron niveles de agotamiento' : 'No se detectaron niveles de agotamiento';

                return `
                    <div class="survey-history-item card">
                        <div class="survey-info">
                            <span class="survey-name">Encuesta MBI-SS</span>
                            <span class="survey-date">${date}</span>
                        </div>
                        <div class="survey-status" style="color: ${statusColor}; font-weight: 600;">
                            ${statusText}
                        </div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            console.error('Error fetching survey history:', err);
            document.getElementById('survey-history-view-list').innerHTML = `<p class="subtitle" style="color: #f87171;">Error al cargar el historial.</p>`;
        }
    },

    async renderForm(container, appInstance) {
        try {
            const response = await fetch('/schemas/mbi_ss.json');
            const schema = await response.json();
            
            container.innerHTML = `
                <div class="dashboard-container">
                    <section class="welcome-section" style="margin-bottom: 2rem;">
                        <div class="welcome-header">
                            <div class="welcome-text">
                                <h1>${schema.title}</h1>
                                <p class="subtitle" style="text-align: left;">${schema.instructions}</p>
                            </div>
                        </div>
                    </section>

                    <form id="mbi-ss-form" class="survey-form">
                        <div class="questions-container">
                            ${schema.questions.map(q => this.renderQuestion(q, schema.scale)).join('')}
                        </div>
                        <div class="survey-footer" style="margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem;">
                            <button type="button" class="btn-secondary" id="cancel-survey" style="width: auto; padding: 0.75rem 2rem;">Cancelar</button>
                            <button type="submit" class="btn-primary" id="submit-survey-btn" style="width: auto; padding: 0.75rem 2rem;">Enviar Encuesta</button>
                        </div>
                    </form>
                </div>
            `;

            document.getElementById('cancel-survey').addEventListener('click', () => {
                appInstance.renderDashboard();
            });

            const form = document.getElementById('mbi-ss-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSubmit(form, appInstance, true); // true means standalone
            });

        } catch (err) {
            console.error('Error loading survey schema:', err);
            container.innerHTML = `<p class="subtitle" style="color: #f87171;">Error al cargar la encuesta.</p>`;
        }
    },

    async renderModal(appInstance) {
        try {
            const response = await fetch('/schemas/mbi_ss.json');
            const schema = await response.json();
            
            this.createOverlay(schema, appInstance);
        } catch (err) {
            console.error('Error loading survey schema:', err);
        }
    },

    createOverlay(schema, appInstance) {
        const overlay = document.createElement('div');
        overlay.id = 'survey-overlay';
        overlay.className = 'survey-modal-overlay';
        
        overlay.innerHTML = `
            <div class="survey-modal-content">
                <div class="survey-modal-header">
                    <h2>${schema.title}</h2>
                    <p class="survey-instructions">${schema.instructions}</p>
                </div>
                <form id="mbi-ss-form" class="survey-form">
                    <div class="questions-container">
                        ${schema.questions.map(q => this.renderQuestion(q, schema.scale)).join('')}
                    </div>
                    <div class="survey-modal-footer">
                        <button type="submit" class="btn-primary" id="submit-survey-btn">Enviar Encuesta</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden'; // Block background scroll

        const form = document.getElementById('mbi-ss-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit(form, appInstance);
        });
    },

    renderQuestion(q, scale) {
        return `
            <div class="survey-question-card">
                <p class="question-text"><strong>${q.id}.</strong> ${q.text}</p>
                <div class="radio-group">
                    ${Object.entries(scale.labels).map(([val, label]) => `
                        <label class="radio-item" title="${label}">
                            <input type="radio" name="item_${q.id}" value="${val}">
                            <span class="radio-label"></span>
                            <span class="label-text">${label}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    },

    async handleSubmit(form, appInstance, isStandalone = false) {
        const formData = new FormData(form);
        const answers = [];
        const missingQuestions = [];
        
        // Remove previous error states
        form.querySelectorAll('.survey-question-card').forEach(card => card.classList.remove('error-state'));
        const existingError = form.querySelector('.survey-error-message');
        if (existingError) existingError.remove();

        // Collect 15 answers and check for missing ones
        const questionCards = form.querySelectorAll('.survey-question-card');
        for (let i = 1; i <= 15; i++) {
            const val = formData.get(`item_${i}`);
            if (val === null) {
                missingQuestions.push(i);
                const questionCard = questionCards[i-1];
                if (questionCard) {
                    questionCard.classList.add('error-state');
                    
                    // Add listener to remove error state when answered
                    const radios = questionCard.querySelectorAll('input[type="radio"]');
                    radios.forEach(radio => {
                        radio.addEventListener('change', () => {
                            questionCard.classList.remove('error-state');
                            // Check if there are other errors to hide the main message
                            if (!form.querySelector('.error-state')) {
                                const msg = form.querySelector('.survey-error-message');
                                if (msg) msg.remove();
                            }
                        }, { once: true });
                    });
                }
            } else {
                answers.push(parseInt(val));
            }
        }

        if (missingQuestions.length > 0) {
            // Create error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'survey-error-message';
            errorMsg.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                Por favor, responde todas las preguntas antes de enviar.
            `;
            form.prepend(errorMsg);

            // Scroll to first missing question
            const firstMissing = form.querySelector('.error-state');
            if (firstMissing) {
                firstMissing.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        const submitBtn = document.getElementById('submit-survey-btn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Enviando...';

        try {
            await window.SurveyManager.submitSurvey({ answers }); // Send as { "answers": [...] }
            
            // Success message
            const target = isStandalone ? document.querySelector('.dashboard-container') : document.querySelector('.survey-modal-content');
            target.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
                    <h2 style="color: white; margin-bottom: 1rem;">¡Gracias por tu participación!</h2>
                    <p class="subtitle" style="margin-bottom: 2rem;">Tus respuestas han sido registradas correctamente.</p>
                    <button class="btn-primary" id="close-survey-success" style="width: auto; padding: 0.75rem 2rem;">Continuar al Dashboard</button>
                </div>
            `;

            document.getElementById('close-survey-success').addEventListener('click', () => {
                if (!isStandalone) this.closeModal();
                appInstance.renderDashboard();
            });

        } catch (err) {
            console.error('Error submitting survey:', err);
            alert('Error al enviar la encuesta: ' + err.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    },

    closeModal() {
        const overlay = document.getElementById('survey-overlay');
        if (overlay) {
            overlay.remove();
            document.body.style.overflow = '';
        }
    }
};

window.SurveyView = SurveyView;
