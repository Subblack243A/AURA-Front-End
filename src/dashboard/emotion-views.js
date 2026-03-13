const EmotionViews = {
    async render(container, appInstance) {
        const user = window.Auth.getUser();
        if (!user) return;

        container.innerHTML = `
            <div class="dashboard-container">
                <section class="welcome-section">
                    <div class="welcome-header">
                        <div class="welcome-text">
                            <h1>Análisis Emocional Detallado</h1>
                            <p class="subtitle" style="text-align: left;">Compara tus registros manuales con las detecciones automáticas del sistema.</p>
                        </div>
                        <div class="welcome-actions">
                            <button id="back-to-dash" class="btn-secondary" style="width: auto; padding: 0.75rem 1.5rem; background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.2);">
                                ← Volver al Panel
                            </button>
                        </div>
                    </div>
                </section>

                <div class="charts-grid">
                    <div class="chart-card">
                        <h3>Histórico: Registro Manual (Última Semana)</h3>
                        <div id="manualTimelineChart"></div>
                    </div>
                    
                    <div class="chart-card">
                        <h3>Histórico: Reconocimiento Automático (Última Semana)</h3>
                        <div id="facialTimelineChart"></div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('back-to-dash').addEventListener('click', () => {
            appInstance.renderDashboard();
        });

        await this.initCharts(user.id);
    },

    async initCharts(userId) {
        const token = window.Auth.getToken();
        const headers = { 'Authorization': `Token ${token}` };

        try {
            // Fetch Timeline Data
            const timelineRes = await fetch(`/api/reports/user/${userId}/timeline/`, { headers });
            let timelineData = { facial_timeline: [], manual_timeline: [] };
            if (timelineRes.ok) {
                timelineData = await timelineRes.json();
            }

            // Render Timeline Charts
            this.renderTimeline(timelineData.manual_timeline, "#manualTimelineChart", "Registro Manual", "#6ECED2");
            this.renderTimeline(timelineData.facial_timeline, "#facialTimelineChart", "Reconocimiento Facial", "#f87171");

        } catch (err) {
            console.error('Error fetching chart data:', err);
        }
    },

    renderTimeline(rawData, selector, name, color) {
        const emotionMap = {
            'enojado': 1, 'ira': 1,
            'disgusto': 2, 'desagrado': 2,
            'miedo': 3,
            'triste': 4, 'tristeza': 4,
            'neutral': 5,
            'sorpresa': 6,
            'feliz': 7, 'felicidad': 7
        };
        const emotionNames = { 1: 'Enojado', 2: 'Disgusto', 3: 'Miedo', 4: 'Triste', 5: 'Neutral', 6: 'Sorpresa', 7: 'Feliz' };

        const data = (rawData || []).map(item => ({
            x: new Date(item.timestamp).getTime(),
            y: emotionMap[item.emotion.toLowerCase()] || 0
        })).sort((a, b) => a.x - b.x);

        const container = document.querySelector(selector);
        if (!container) return;

        if (data.length === 0) {
            container.innerHTML = `<div style="height: 300px; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">No hay datos disponibles para esta fuente.</div>`;
            return;
        }

        const options = {
            series: [{ name: name, data: data }],
            chart: { type: 'area', height: 300, toolbar: { show: false }, foreColor: '#94a3b8' },
            colors: [color],
            dataLabels: { enabled: false },
            markers: {
                size: 5,
                strokeColors: '#fff',
                strokeWidth: 2,
                hover: { size: 7 }
            },
            stroke: { curve: 'smooth', width: 3 },
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 90, 100] } },
            xaxis: { type: 'datetime', labels: { style: { colors: '#94a3b8' } } },
            yaxis: {
                min: 1, max: 7, tickAmount: 6,
                labels: {
                    formatter: (val) => emotionNames[Math.round(val)] || val,
                    style: { colors: '#94a3b8' }
                }
            },
            tooltip: {
                theme: 'dark',
                x: { format: 'dd MMM HH:mm' },
                y: {
                    formatter: (val) => emotionNames[Math.round(val)]
                }
            }
        };

        new ApexCharts(container, options).render();
    },

    async checkLastRegistration() {
        const token = window.Auth.getToken();
        try {
            const response = await fetch('/api/emotion/register/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (!data.last_registrations || data.last_registrations.length < 3) return { canRegister: true };

                const regs = data.last_registrations.map(d => new Date(d));
                const serverTime = new Date(data.server_time);
                
                // Ráfaga: 3 registros en menos de 60 segundos
                const burstDuration = regs[0] - regs[2];
                const diffFromLast = serverTime - regs[0];
                const threeMinutes = 3 * 60 * 1000;

                if (burstDuration < 60 * 1000 && diffFromLast < threeMinutes) {
                    return {
                        canRegister: false,
                        remaining: threeMinutes - diffFromLast
                    };
                }
            }
        } catch (err) {
            console.error('Error checking last registration:', err);
        }
        return { canRegister: true };
    },

    async renderRegister(container, appInstance) {
        const restriction = await this.checkLastRegistration();
        
        if (!restriction.canRegister) {
            this.renderLocked(container, restriction.remaining, appInstance);
            return;
        }

        const getEmojiSVG = (id) => {
            const icons = {
                1: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`, // Felicidad
                2: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`, // Tristeza
                3: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`, // Desagrado
                4: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><path d="M7.5 8 9 9"/><path d="M16.5 8 15 9"/></svg>`, // Ira
                5: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="15" r="2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`, // Sorpresa
                6: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15h2s1 1 2 1 2-1 2-1 1 1 2 1"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>` // Miedo
            };
            return icons[id] || '';
        };

        const emotions = [
            { id: 1, name: 'Felicidad', icon: getEmojiSVG(1) },
            { id: 2, name: 'Tristeza', icon: getEmojiSVG(2) },
            { id: 3, name: 'Desagrado', icon: getEmojiSVG(3) },
            { id: 4, name: 'Ira', icon: getEmojiSVG(4) },
            { id: 5, name: 'Sorpresa', icon: getEmojiSVG(5) },
            { id: 6, name: 'Miedo', icon: getEmojiSVG(6) }
        ];

        container.innerHTML = `
            <div class="dashboard-container">
                <section class="welcome-section">
                    <div class="welcome-header">
                        <div class="welcome-text">
                            <h1>Registro emocional</h1>
                            <p class="subtitle" style="text-align: left;">Selecciona la emoción que mejor represente cómo te sientes en este momento.</p>
                        </div>
                        <div class="welcome-actions">
                            <button id="back-to-dash-reg" class="btn-secondary" style="width: auto; padding: 0.75rem 1.5rem; background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.2);">
                                ← Volver al Panel
                            </button>
                        </div>
                    </div>
                </section>

                <div class="emotion-selection-grid">
                    ${emotions.map(emotion => `
                        <div class="emotion-card" data-id="${emotion.id}">
                            <div class="emotion-icon">${emotion.icon}</div>
                            <div class="emotion-name">${emotion.name}</div>
                        </div>
                    `).join('')}
                </div>
                <div id="registration-feedback" style="text-align: center; margin-top: 2rem; display: none;"></div>
            </div>
        `;

        document.getElementById('back-to-dash-reg').addEventListener('click', () => {
            appInstance.renderDashboard();
        });

        const cards = container.querySelectorAll('.emotion-card');
        cards.forEach(card => {
            card.addEventListener('click', async () => {
                const emotionId = parseInt(card.dataset.id);
                await this.submitEmotion(emotionId, appInstance);
            });
        });
    },

    async submitEmotion(emotionId, appInstance) {
        const feedback = document.getElementById('registration-feedback');
        const token = window.Auth.getToken();

        try {
            const response = await fetch('/api/emotion/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({ emotion: emotionId })
            });

            if (response.ok) {
                feedback.textContent = '¡Emoción registrada con éxito!';
                feedback.style.color = 'var(--primary)';
                feedback.style.display = 'block';
                
                setTimeout(() => {
                    appInstance.renderDashboard();
                }, 1500);
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Error al registrar la emoción');
            }
        } catch (err) {
            feedback.textContent = err.message;
            feedback.style.color = 'var(--error)';
            feedback.style.display = 'block';
        }
    },

    renderLocked(container, remainingMs, appInstance) {
        container.innerHTML = `
            <div class="dashboard-container">
                <section class="welcome-section">
                    <div class="welcome-header">
                        <div class="welcome-text">
                            <h1>Registro emocional</h1>
                            <p class="subtitle" style="text-align: left;">Has realizado demasiados registros seguidos. Por favor, espera un momento.</p>
                        </div>
                        <div class="welcome-actions">
                            <button id="back-to-dash-reg" class="btn-secondary" style="width: auto; padding: 0.75rem 1.5rem; background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.2);">
                                ← Volver al Panel
                            </button>
                        </div>
                    </div>
                </section>

                <div class="card" style="text-align: center; padding: 3rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">⏳</div>
                    <h2 style="color: white; margin-bottom: 1rem;">Próximo registro disponible en:</h2>
                    <div id="countdown-timer" style="font-size: 3rem; font-weight: bold; color: var(--primary); letter-spacing: 2px;">
                        --:--
                    </div>
                    <p class="subtitle" style="margin-top: 1rem;">Podrás registrar cómo te sientes en 3 minutos.</p>
                </div>
            </div>
        `;

        document.getElementById('back-to-dash-reg').addEventListener('click', () => {
            appInstance.renderDashboard();
        });

        const timerDisplay = document.getElementById('countdown-timer');
        let remaining = remainingMs;

        const updateTimer = () => {
            if (remaining <= 0) {
                clearInterval(interval);
                this.renderRegister(container, appInstance);
                return;
            }

            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

            let timeStr = "";
            if (hours > 0) timeStr += `${hours}h `;
            timeStr += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            timerDisplay.textContent = timeStr;
            remaining -= 1000;
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        
        // Cleanup interval when container is cleared or user navigates
        const observer = new MutationObserver((mutations) => {
            if (!document.body.contains(timerDisplay)) {
                clearInterval(interval);
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    },
    /**
     * Checks whether the user needs to register an emotion before accessing the dashboard.
     * Returns true if: no previous registration exists OR last one was > 24 hours ago.
     */
    async checkNeedsEmotionRegistration() {
        const token = window.Auth.getToken();
        if (!token) return false; // Not logged in, skip
        try {
            const response = await fetch('/api/emotion/register/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) return false;

            const data = await response.json();

            // No previous registration at all
            if (!data.last_manual_registration) return true;

            const lastDate = new Date(data.last_manual_registration);
            const serverTime = new Date(data.server_time);
            const hours24 = 24 * 60 * 60 * 1000;

            return (serverTime - lastDate) > hours24;
        } catch (err) {
            console.error('Error checking 24h emotion requirement:', err);
            return false; // On error, don't block the user
        }
    },

    /**
     * Renders the mandatory emotion registration screen.
     * No "back" button — the user MUST register before proceeding.
     */
    async renderMandatoryRegister(container, appInstance) {
        const getEmojiSVG = (id) => {
            const icons = {
                1: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
                2: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
                3: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
                4: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><path d="M7.5 8 9 9"/><path d="M16.5 8 15 9"/></svg>`,
                5: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="15" r="2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
                6: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15h2s1 1 2 1 2-1 2-1 1 1 2 1"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>` // Miedo
            };
            return icons[id] || '';
        };

        const emotions = [
            { id: 1, name: 'Felicidad', icon: getEmojiSVG(1) },
            { id: 2, name: 'Tristeza', icon: getEmojiSVG(2) },
            { id: 3, name: 'Desagrado', icon: getEmojiSVG(3) },
            { id: 4, name: 'Ira', icon: getEmojiSVG(4) },
            { id: 5, name: 'Sorpresa', icon: getEmojiSVG(5) },
            { id: 6, name: 'Miedo', icon: getEmojiSVG(6) }
        ];

        container.innerHTML = `
            <div class="dashboard-container">
                <section class="welcome-section">
                    <div class="welcome-header">
                        <div class="welcome-text">
                            <h1>¿Cómo te sientes hoy?</h1>
                            <p class="subtitle" style="text-align: left;">
                                Han pasado más de 24 horas desde tu último registro emocional.
                                Selecciona la emoción que mejor represente cómo te sientes ahora para continuar.
                            </p>
                        </div>
                    </div>
                </section>

                <div class="emotion-selection-grid">
                    ${emotions.map(emotion => `
                        <div class="emotion-card" data-id="${emotion.id}">
                            <div class="emotion-icon">${emotion.icon}</div>
                            <div class="emotion-name">${emotion.name}</div>
                        </div>
                    `).join('')}
                </div>
                <div id="mandatory-registration-feedback" style="text-align: center; margin-top: 2rem; display: none;"></div>
            </div>
        `;

        const cards = container.querySelectorAll('.emotion-card');
        cards.forEach(card => {
            card.addEventListener('click', async () => {
                const emotionId = parseInt(card.dataset.id);
                const token = window.Auth.getToken();
                const feedback = document.getElementById('mandatory-registration-feedback');

                // Disable all cards while submitting
                cards.forEach(c => c.style.pointerEvents = 'none');

                try {
                    const response = await fetch('/api/emotion/register/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Token ${token}`
                        },
                        body: JSON.stringify({ emotion: emotionId })
                    });

                    if (response.ok) {
                        feedback.textContent = '¡Emoción registrada! Accediendo al panel...';
                        feedback.style.color = 'var(--primary)';
                        feedback.style.display = 'block';
                        console.log('Mandatory emotion registered, redirecting to dashboard.');
                        setTimeout(() => appInstance.renderDashboard(), 1200);
                    } else {
                        const errData = await response.json();
                        throw new Error(errData.error || errData.detail || 'Error al registrar la emoción.');
                    }
                } catch (err) {
                    feedback.textContent = err.message;
                    feedback.style.color = 'var(--error, #f87171)';
                    feedback.style.display = 'block';
                    // Re-enable cards so the user can retry
                    cards.forEach(c => c.style.pointerEvents = '');
                }
            });
        });
    }
};

window.EmotionViews = EmotionViews;
