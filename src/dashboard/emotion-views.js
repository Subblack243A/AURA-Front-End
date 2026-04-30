const EmotionViews = {
    _timelineMaps: {
        dbId: {
            'feliz': 1, 'felicidad': 1, 'triste': 2, 'tristeza': 2,
            'desagrado': 3, 'disgusto': 3, 'ira': 4, 'enojado': 4,
            'sorpresa': 5, 'miedo': 6, 'neutral': 7
        },
        visual: { 1: 7, 5: 6, 6: 5, 7: 4, 4: 3, 3: 2, 2: 1 },
        names: { 7: 'Felicidad', 6: 'Sorpresa', 5: 'Miedo', 4: 'Neutral', 3: 'Ira', 2: 'Desagrado', 1: 'Tristeza' }
    },

    _logError(msg, err) {
        console.error(`[EmotionViews] ${msg}`, err);
    },

    _getHeaders(Auth) {
        return { 'Authorization': `Token ${Auth.getToken()}` };
    },

    _getSortedCauses(causes) {
        return [...causes].sort((a, b) => {
            const nameA = a.Cause.toLowerCase();
            const nameB = b.Cause.toLowerCase();
            if (nameA.includes('otra')) return 1;
            if (nameB.includes('otra')) return -1;
            return nameA.localeCompare(nameB);
        });
    },

    _getRegisterLayoutHTML(title, subtitle, extraHTML, backBtnId = null) {
        const emotions = this.getEmotionsData();
        return `
            <div class="dashboard-container">
                <section class="welcome-section">
                    <div class="welcome-header">
                        <div class="welcome-text">
                            <h1>${title}</h1>
                            <p class="subtitle" style="text-align: left;">${subtitle}</p>
                        </div>
                        ${backBtnId ? `<div class="welcome-actions">${this.getBackButtonHTML(backBtnId)}</div>` : ''}
                    </div>
                </section>
                ${this.getEmotionGridHTML(emotions)}
                ${extraHTML}
            </div>
        `;
    },

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
    async fetchCauses(token) {
        try {
            const response = await fetch('/api/causes/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (response.ok) return await response.json();
            return [];
        } catch (err) {
            this._logError('Error fetching causes', err);
            return [];
        }
    },

    getEnergySelectionHTML() {
        const labels = {
            1: "Muy baja",
            2: "Baja",
            3: "Media",
            4: "Alta",
            5: "Muy alta"
        };
        return `
            <div class="step-container fade-in" id="step-energy" style="display: none; margin-top: 2rem;">
                <h2 style="color: white; margin-bottom: 0.5rem; text-align: left;">¿Cuál es tu nivel de energía?</h2>
                <p class="subtitle" style="margin-bottom: 2rem; text-align: left;">Elige del 1 al 5 el nivel de energía con el que te sientes ahora mismo.</p>
                
                <div class="energy-options" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 1rem; width: 100%;">
                    ${[1,2,3,4,5].map(level => `
                        <button class="energy-btn" data-level="${level}" style="
                            background: var(--card-bg); 
                            border: 1px solid var(--card-border); 
                            border-radius: 16px; 
                            padding: 1.5rem 0.5rem; 
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            gap: 0.75rem;
                            width: 100%;
                        ">
                            <div class="battery-icon" style="color: var(--primary); display: flex; align-items: center; justify-content: center; height: 32px;">
                                ${this.getBatterySVG(level)}
                            </div>
                            <span style="color: white; font-weight: bold; font-size: 1.2rem; line-height: 1;">${level}</span>
                            <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem; text-align: center; line-height: 1.2;">${labels[level]}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    getBatterySVG(level) {
        let items = '';
        for(let i=1; i<=5; i++) {
            const fill = i <= level ? 'currentColor' : 'rgba(255,255,255,0.1)';
            items += `<rect x="${3 + (i-1)*4}" y="6" width="3" height="12" fill="${fill}" rx="1"/>`;
        }
        return `
            <svg viewBox="0 0 28 24" width="36" height="32">
                <rect x="1" y="4" width="24" height="16" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" rx="2"/>
                <path d="M26 9v6" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round"/>
                ${items}
            </svg>
        `;
    },

    getCauseIcon(causeName) {
        const name = causeName.toLowerCase();
        
        // Académico - Libro (Book)
        if (name.includes('académico')) {
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;
        }
        // Comunidad/Social - Usuarios (Users)
        if (name.includes('comunidad') || name.includes('social')) {
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><circle cx="19" cy="11" r="4"/></svg>`;
        }
        // Espiritual/Religioso - Chispas/Loto (Sparkles/Sun)
        if (name.includes('espiritual') || name.includes('religioso')) {
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
        }
        // Familia/Relaciones - Corazón (Heart)
        if (name.includes('familia') || name.includes('relaciones')) {
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
        }
        // Finanzas/Economía Personal - Monedas (Coins)
        if (name.includes('finanzas') || name.includes('economía')) {
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>`;
        }
        // Juegos/Ocio - Mando (Gamepad)
        if (name.includes('juegos') || name.includes('ocio')) {
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/></svg>`;
        }
        // Laboral - Maletín (Briefcase)
        if (name.includes('laboral') || name.includes('trabajo')) {
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
        }
        // Salud Física/Mental - Actividad/Pulso (Activity)
        if (name.includes('salud')) {
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`;
        }
        
        // Predeterminado o "Otra" - Ayuda (HelpCircle)
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    },

    getCausesSelectionHTML(causes) {
        const sortedCauses = this._getSortedCauses(causes);

        return `
            <div class="step-container fade-in" id="step-causes" style="display: none; margin-top: 3rem;">
                <h2 style="color: white; margin-bottom: 0.5rem; text-align: left;">Causa de la Emoción</h2>
                <p class="subtitle" style="margin-bottom: 2rem; text-align: left;">¿Cuál definirías como la principal causa de la emoción a registrar?</p>
                
                <div class="causes-grid" style="
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.25rem;
                    width: 100%;
                ">
                    ${sortedCauses.map(cause => `
                        <div class="cause-card" data-id="${cause.ID_Cause}" style="
                            background: var(--card-bg);
                            border: 1px solid var(--card-border);
                            border-radius: 16px;
                            padding: 1.25rem;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 1rem;
                        ">
                            <div style="color: var(--secondary); font-size: 1.5rem; display: flex;">
                                ${this.getCauseIcon(cause.Cause)}
                            </div>
                            <div style="color: white; font-weight: 500; font-size: 0.95rem; text-align: left;">
                                ${cause.Cause}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 3rem; text-align: center;">
                    <button id="final-submit-emotion" class="btn-primary" disabled style="
                        padding: 1rem 3rem;
                        font-size: 1.2rem;
                        border-radius: 30px;
                        opacity: 0.5;
                        cursor: not-allowed;
                        transition: all 0.3s ease;
                    ">Enviar Registro</button>
                    <div id="step-feedback" style="margin-top: 1rem; font-weight: 500; display: none;"></div>
                </div>
            </div>
        `;
    },

    bindSequentialFlow(container, appInstance, causes) {
        let selectedEmotion = null;
        let selectedEnergy = null;
        let selectedCause = null;
        
        const { Auth } = window;
        const token = Auth.getToken();
        const cards = container.querySelectorAll('.emotion-card');
        const energyBtns = container.querySelectorAll('.energy-btn');
        const causeCards = container.querySelectorAll('.cause-card');
        const submitBtn = container.querySelector('#final-submit-emotion');
        const feedback = container.querySelector('#step-feedback');
        
        const checkSubmitReady = () => {
            if (selectedEmotion && selectedEnergy && selectedCause) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                }
            }
        };

        cards.forEach(card => {
            card.addEventListener('click', () => {
                cards.forEach(c => {
                    c.style.opacity = '0.5';
                    c.style.transform = 'scale(0.95)';
                    c.style.border = '2px solid transparent';
                });
                card.style.opacity = '1';
                card.style.transform = 'scale(1.05)';
                card.style.border = `2px solid ${card.style.getPropertyValue('--emotion-color') || 'var(--primary)'}`;
                
                selectedEmotion = parseInt(card.dataset.id);
                
                const sEnergy = document.getElementById('step-energy');
                const sCauses = document.getElementById('step-causes');
                sEnergy.style.display = 'block';
                sCauses.style.display = 'block';
                setTimeout(() => sEnergy.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                
                checkSubmitReady();
            });
        });
        
        energyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                energyBtns.forEach(b => {
                    b.style.opacity = '0.5';
                    b.style.transform = 'scale(0.95)';
                    b.style.border = '2px solid transparent';
                });
                btn.style.opacity = '1';
                btn.style.transform = 'scale(1.05)';
                btn.style.border = '2px solid var(--primary)';
                selectedEnergy = parseInt(btn.dataset.level);
                checkSubmitReady();
            });
        });

        causeCards.forEach(card => {
            card.addEventListener('click', () => {
                causeCards.forEach(c => {
                    c.style.opacity = '0.5';
                    c.style.transform = 'scale(0.95)';
                    c.style.border = '2px solid transparent';
                });
                card.style.opacity = '1';
                card.style.transform = 'scale(1.05)';
                card.style.border = '2px solid var(--primary)';
                selectedCause = parseInt(card.dataset.id);
                checkSubmitReady();
            });
        });

        if (submitBtn) {
            submitBtn.addEventListener('click', async () => {
                if (!selectedEmotion || !selectedEnergy || !selectedCause) return;
                
                submitBtn.disabled = true;
                const origText = submitBtn.textContent;
                submitBtn.innerHTML = 'Enviando...';
                submitBtn.style.opacity = '0.7';

                try {
                    await this.doEmotionSubmit({
                        emotion: selectedEmotion,
                        cause: selectedCause,
                        energy_level: selectedEnergy
                    }, token);
                    
                    feedback.textContent = '¡Emoción registrada con éxito!';
                    feedback.style.color = 'var(--primary)';
                    feedback.style.display = 'block';
                    
                    setTimeout(() => {
                        appInstance.renderDashboard();
                    }, 1500);
                } catch (err) {
                    feedback.textContent = err.message || 'Error al enviar.';
                    feedback.style.color = 'var(--error, #f87171)';
                    feedback.style.display = 'block';
                    
                    submitBtn.textContent = origText;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                }
            });
        }
    },


    async doEmotionSubmit(payload, token) {
        const response = await fetch('/api/emotion/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || data.detail || 'Error al registrar la emoción.');
        }
        return response;
    },

    async render(container, appInstance) {
        const { Auth } = window;
        const user = Auth.getUser();
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
                    
                    <div class="chart-card">
                        <h3>Causas de Emociones Registradas</h3>
                        <div id="causesBarChart"></div>
                    </div>

                    <div class="chart-card">
                        <h3>Energía vs Emociones</h3>
                        <div id="energyEmotionScatterChart"></div>
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
        const { Auth } = window;
        const headers = this._getHeaders(Auth);

        try {
            // Fetch Timeline Data
            const timelineRes = await fetch(`/api/reports/user/${userId}/timeline/`, { headers });
            let timelineData = { facial_timeline: [], manual_timeline: [], causes_distribution: {}, energy_vs_emotion: [] };
            if (timelineRes.ok) {
                timelineData = await timelineRes.json();
            }

            // Render Timeline Charts
            this.renderTimeline(timelineData.manual_timeline, "#manualTimelineChart", "Registro Manual", "#6ECED2");
            this.renderTimeline(timelineData.facial_timeline, "#facialTimelineChart", "Reconocimiento Facial", "#f87171");
            this.renderCausesChart(timelineData.causes_distribution, "#causesBarChart");
            this.renderEnergyEmotionChart(timelineData.energy_vs_emotion, "#energyEmotionScatterChart");

        } catch (err) {
            this._logError('Error fetching chart data', err);
        }
    },

    renderTimeline(rawData, selector, name, color) {
        const { dbId: dbIdMap, visual: visualMap, names: visualNames } = this._timelineMaps;

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
            xaxis: { type: 'datetime', labels: { datetimeUTC: false, style: { colors: '#94a3b8' } } },
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

        const { ApexCharts } = window;
        new ApexCharts(container, options).render();
    },

    renderCausesChart(data, selector) {
        const container = document.querySelector(selector);
        if (!container) return;

        if (!data || Object.keys(data).length === 0) {
            container.innerHTML = `<div style="height: 300px; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">No hay datos disponibles para esta fuente.</div>`;
            return;
        }

        const categories = Object.keys(data);
        const values = Object.values(data);

        const options = {
            series: [{ name: 'Registros', data: values }],
            chart: { type: 'bar', height: 300, toolbar: { show: false }, foreColor: '#94a3b8' },
            colors: ['#a855f7'],
            plotOptions: { bar: { borderRadius: 4, horizontal: true } },
            dataLabels: { enabled: true, style: { fontSize: '12px' } },
            xaxis: { categories: categories, labels: { style: { colors: '#94a3b8' } } },
            yaxis: { labels: { style: { colors: '#94a3b8' } } },
            tooltip: { theme: 'dark' }
        };

        const { ApexCharts } = window;
        new ApexCharts(container, options).render();
    },

    renderEnergyEmotionChart(data, selector) {
        const container = document.querySelector(selector);
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = `<div style="height: 300px; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">No hay datos disponibles para esta fuente.</div>`;
            return;
        }

        const { dbId: dbIdMap, visual: visualMap, names: visualNames } = this._timelineMaps;
        
        const reverseMap = [1, 2, 3, 4, 5, 6, 7];
        const heatData = {};
        reverseMap.forEach(visId => {
            heatData[visualNames[visId]] = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
        });

        data.forEach(item => {
            const eng = String(Math.round(item.energy));
            const dbId = dbIdMap[item.emotion.toLowerCase()] || 0;
            const visId = visualMap[dbId] || 0;
            const emName = visualNames[visId];
            if (emName && heatData[emName] && heatData[emName][eng] !== undefined) {
                heatData[emName][eng]++;
            }
        });

        const seriesData = reverseMap.map(visId => {
            const emName = visualNames[visId];
            return {
                name: emName,
                data: ['1', '2', '3', '4', '5'].map(eng => ({
                    x: eng,
                    y: heatData[emName][eng]
                }))
            };
        });

        const options = {
            series: seriesData,
            chart: { type: 'heatmap', height: 300, background: 'transparent', toolbar: { show: false } },
            colors: ['#fbbf24'],
            theme: { mode: 'dark' },
            dataLabels: { enabled: true, style: { colors: ['#fff'] } },
            plotOptions: {
                heatmap: {
                    shadeIntensity: 0.5,
                    radius: 4,
                    useFillColorAsStroke: false,
                    colorScale: {
                        ranges: [
                            { from: 0, to: 0, color: 'rgba(255,255,255,0.05)', name: '0' }
                        ]
                    }
                }
            },
            xaxis: { 
                title: { text: 'Nivel de Energía', style: { color: '#94a3b8', fontSize: '12px', fontWeight: 600 }, offsetY: 10 },
                labels: { style: { colors: '#94a3b8' } }
            },
            yaxis: {
                labels: { style: { colors: '#94a3b8', fontWeight: 600 } }
            },
            grid: { padding: { right: 20 }, borderColor: 'rgba(255,255,255,0.05)' },
            tooltip: { theme: 'dark' }
        };

        const { ApexCharts } = window;
        new ApexCharts(container, options).render();
    },

    async checkLastRegistration() {
        const { Auth } = window;
        try {
            const response = await fetch('/api/emotion/register/', {
                headers: this._getHeaders(Auth)
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
            this._logError('Error checking last registration', err);
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
        if (!restriction.canRegister) return this.renderLocked(container, restriction.remaining, appInstance);

        const { Auth } = window;
        const causes = await this.fetchCauses(Auth.getToken());
        const sortedCauses = this._getSortedCauses(causes);

        container.innerHTML = this._getRegisterLayoutHTML(
            'Registro emocional',
            'Selecciona la emoción que mejor represente cómo te sientes en este momento.',
            `<div id="extra-steps-container">
                ${this.getEnergySelectionHTML()}
                ${this.getCausesSelectionHTML(sortedCauses)}
            </div>`,
            'back-to-dash-reg'
        );

        document.getElementById('back-to-dash-reg').addEventListener('click', () => {
            appInstance.renderDashboard();
        });

        this.bindSequentialFlow(container, appInstance, sortedCauses);
    },

    async submitEmotion(emotionId, appInstance) {
        const feedback = document.getElementById('registration-feedback');
        const { Auth } = window;
        const token = Auth.getToken();

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
        const { Auth } = window;
        try {
            const response = await fetch('/api/emotion/register/', {
                headers: this._getHeaders(Auth)
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
            this._logError('Error checking 24h emotion requirement', err);
            return false; // On error, don't block the user
        }
    },

    /**
     * Renders the mandatory emotion registration screen.
     * No "back" button — the user MUST register before proceeding.
     */
    async renderMandatoryRegister(container, appInstance) {
        const { Auth } = window;
        const causes = await this.fetchCauses(Auth.getToken());
        const sortedCauses = this._getSortedCauses(causes);

        container.innerHTML = this._getRegisterLayoutHTML(
            '¿Cómo te sientes hoy?',
            'Han pasado más de 24 horas desde tu último registro emocional. Selecciona la emoción que mejor represente cómo te sientes ahora para continuar.',
            `<div id="extra-steps-container">
                ${this.getEnergySelectionHTML()}
                ${this.getCausesSelectionHTML(sortedCauses)}
            </div>`
        );

        this.bindSequentialFlow(container, appInstance, sortedCauses);
    }
};

window.EmotionViews = EmotionViews;
