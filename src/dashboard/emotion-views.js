const EmotionViews = {
    getBackButtonHTML(id) {
        return `
            <button id="${id}" class="btn-secondary" style="width: auto; padding: 0.75rem 1.5rem; background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.2);">
                ← Volver al Panel
            </button>
        `;
    },

    getEmotionsData() {
        return [
            { id: 1, name: 'Felicidad', icon: this.getEmojiSVG(1), color: '#10b981' },
            { id:  2, name: 'Tristeza', icon: this.getEmojiSVG(2), color: '#3b82f6' },
            { id: 3, name: 'Desagrado', icon: this.getEmojiSVG(3), color: '#8b5cf6' },
            { id: 4, name: 'Ira', icon: this.getEmojiSVG(4), color: '#ef4444' },
            { id: 5, name: 'Sorpresa', icon: this.getEmojiSVG(5), color: '#f59e0b' },
            { id: 6, name: 'Miedo', icon: this.getEmojiSVG(6), color: '#6366f1' },
            { id: 7, name: 'Neutral', icon: this.getEmojiSVG(7), color: '#94a3b8' }
        ];
    },

    getEmotionGridHTML(emotions) {
        return `
            <div class="emotion-selection-grid">
                ${emotions.map(emotion => `
                    <div class="emotion-card" data-id="${emotion.id}" style="--emotion-color: ${emotion.color}">
                        <div class="emotion-icon" style="color: ${emotion.color}">${emotion.icon}</div>
                        <div class="emotion-name">${emotion.name}</div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    async doEmotionSubmit(emotionId, token) {
        const response = await fetch('/api/emotion/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({ emotion: emotionId })
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || data.detail || 'Error al registrar la emoción.');
        }
        return response;
    },

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
                            ${this.getBackButtonHTML("back-to-dash")}
                        </div>
                    </div>
                </section>

                <div class="charts-grid">
                    <div class="chart-card">
                        <h3>Histórico: Registro Manual</h3>
                        <div id="manualTimelineChart"></div>
                    </div>
                    
                    <div class="chart-card">
                        <h3>Histórico: Reconocimiento Automático</h3>
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
        // IDs reales de la base de datos
        const dbIdMap = {
            'feliz': 1, 'felicidad': 1,
            'triste': 2, 'tristeza': 2,
            'desagrado': 3, 'disgusto': 3,
            'ira': 4, 'enojado': 4,
            'sorpresa': 5,
            'miedo': 6,
            'neutral': 7
        };

        // Mapeo Visual (Y-axis): 7 es arriba, 1 es abajo
        const visualMap = {
            1: 7, // Felicidad -> Top
            5: 6, // Sorpresa
            6: 5, // Miedo
            7: 4, // Neutral -> Center
            4: 3, // Ira
            3: 2, // Desagrado
            2: 1  // Tristeza -> Bottom
        };

        // Nombres para mostrar en el eje Y según la posición visual
        const visualNames = { 
            7: 'Felicidad', 
            6: 'Sorpresa', 
            5: 'Miedo', 
            4: 'Neutral', 
            3: 'Ira', 
            2: 'Desagrado',
            1: 'Tristeza'
        };

        const data = (rawData || []).map(item => {
            const dbId = dbIdMap[item.emotion.toLowerCase()] || 0;
            return {
                x: new Date(item.timestamp).getTime(),
                y: visualMap[dbId] || 0
            };
        }).sort((a, b) => a.x - b.x);

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
                    formatter: (val) => visualNames[Math.round(val)] || val,
                    style: { colors: '#94a3b8' }
                }
            },
            tooltip: {
                theme: 'dark',
                x: { format: 'dd MMM HH:mm' },
                y: {
                    formatter: (val) => visualNames[Math.round(val)]
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

    getEmojiSVG(id) {
        const icons = {
            1: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`, // Felicidad (1)
            2: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`, // Tristeza (2)
            3: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`, // Desagrado (3)
            4: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><path d="M7.5 8 9 9"/><path d="M16.5 8 15 9"/></svg>`, // Ira (4)
            5: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="15" r="2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`, // Sorpresa (5)
            6: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15h2s1 1 2 1 2-1 2-1 1 1 2 1"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`, // Miedo (6)
            7: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>` // Neutral (7)
        };
        return icons[id] || '';
    },

    async renderRegister(container, appInstance) {
        const restriction = await this.checkLastRegistration();
        
        if (!restriction.canRegister) {
            this.renderLocked(container, restriction.remaining, appInstance);
            return;
        }

        const emotions = this.getEmotionsData();

        container.innerHTML = `
            <div class="dashboard-container">
                <section class="welcome-section">
                    <div class="welcome-header">
                        <div class="welcome-text">
                            <h1>Registro emocional</h1>
                            <p class="subtitle" style="text-align: left;">Selecciona la emoción que mejor represente cómo te sientes en este momento.</p>
                        </div>
                        <div class="welcome-actions">
                            ${this.getBackButtonHTML("back-to-dash-reg")}
                        </div>
                    </div>
                </section>

                ${this.getEmotionGridHTML(emotions)}
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
            await this.doEmotionSubmit(emotionId, token);
            feedback.textContent = '¡Emoción registrada con éxito!';
            feedback.style.color = 'var(--primary)';
            feedback.style.display = 'block';
            
            setTimeout(() => {
                appInstance.renderDashboard();
            }, 1500);
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
                            ${this.getBackButtonHTML("back-to-dash-reg")}
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
        const emotions = this.getEmotionsData();

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

                ${this.getEmotionGridHTML(emotions)}
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
                    await this.doEmotionSubmit(emotionId, token);
                    feedback.textContent = '¡Emoción registrada! Accediendo al panel...';
                    feedback.style.color = 'var(--primary)';
                    feedback.style.display = 'block';
                    console.log('Mandatory emotion registered, redirecting to dashboard.');
                    setTimeout(() => appInstance.renderDashboard(), 1200);
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
