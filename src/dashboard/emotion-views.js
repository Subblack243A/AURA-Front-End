const EmotionViews = {
    async render(container, appInstance) {
        const user = window.Auth.getUser();
        if (!user) return;

        container.innerHTML = `
            <div class="dashboard-container">
                <section class="welcome-section">
                    <div class="welcome-header">
                        <div class="welcome-text">
                            <h1>Historial de Emociones</h1>
                            <p class="subtitle" style="text-align: left;">Visualiza cómo ha sido tu evolución emocional en los últimos días.</p>
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
                        <h3>Emociones Detectadas Última Semana</h3>
                        <div id="timelineChart"></div>
                    </div>
                    <div class="chart-card">
                        <h3>Emociones Registradas Última Semana</h3>
                        <div id="distributionChart"></div>
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
        const headers = {
            'Authorization': `Token ${token}`
        };

        try {
            // Fetch Timeline Data
            const timelineRes = await fetch(`/api/reports/user/${userId}/timeline/`, { headers });
            const timelineData = await timelineRes.json();

            // Fetch Distribution Data
            const distRes = await fetch(`/api/reports/user/${userId}/`, { headers });
            const distData = await distRes.json();

            if (timelineRes.ok) {
                this.renderTimelineChart(timelineData);
            }
            if (distRes.ok) {
                this.renderDistributionChart(distData);
            }
        } catch (err) {
            console.error('Error fetching chart data:', err);
        }
    },

    renderTimelineChart(data) {
        const emotionMap = {
            'enojado': 1,
            'disgusto': 2,
            'miedo': 3,
            'triste': 4,
            'neutral': 5,
            'sorpresa': 6,
            'feliz': 7
        };

        const emotionNames = {
            1: 'Enojado',
            2: 'Disgusto',
            3: 'Miedo',
            4: 'Triste',
            5: 'Neutral',
            6: 'Sorpresa',
            7: 'Feliz'
        };

        // Merge and sort data
        const combined = [
            ...(data.facial_timeline || []).map(item => ({ 
                x: new Date(item.timestamp).getTime(), 
                y: emotionMap[item.emotion.toLowerCase()] || 0,
                type: 'Facial'
            })),
            ...(data.manual_timeline || []).map(item => ({ 
                x: new Date(item.timestamp).getTime(), 
                y: emotionMap[item.emotion.toLowerCase()] || 0,
                type: 'Manual'
            }))
        ].sort((a, b) => a.x - b.x);

        const options = {
            series: [{
                name: 'Bienestar',
                data: combined
            }],
            chart: {
                type: 'area',
                height: 350,
                toolbar: { show: false },
                animations: { enabled: true },
                foreColor: '#94a3b8'
            },
            colors: ['#6ECED2'],
            dataLabels: { enabled: false },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.45,
                    opacityTo: 0.05,
                    stops: [20, 100]
                }
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    style: { colors: '#94a3b8' }
                },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                min: 1,
                max: 7,
                tickAmount: 6,
                labels: {
                    formatter: (value) => emotionNames[Math.round(value)] || value,
                    style: { colors: '#94a3b8' }
                }
            },
            tooltip: {
                x: { format: 'dd MMM yyyy HH:mm' },
                y: {
                    formatter: (value) => emotionNames[Math.round(value)]
                },
                theme: 'dark'
            },
            grid: {
                borderColor: 'rgba(255, 255, 255, 0.05)',
                xaxis: { lines: { show: true } }
            },
            markers: {
                size: 5,
                colors: combined.map(item => item.type === 'Facial' ? '#6ECED2' : '#f87171'),
                strokeColors: '#fff',
                strokeWidth: 2,
                hover: { size: 7 }
            }
        };

        const chart = new ApexCharts(document.querySelector("#timelineChart"), options);
        chart.render();
    },

    renderDistributionChart(data) {
        const averages = data.facial_emotion_averages || {};
        const categories = Object.keys(averages).map(l => l.charAt(0).toUpperCase() + l.slice(1));
        const values = Object.values(averages);

        const options = {
            series: [{
                name: 'Intensidad Promedio',
                data: values
            }],
            chart: {
                type: 'bar',
                height: 350,
                toolbar: { show: false },
                foreColor: '#94a3b8'
            },
            plotOptions: {
                bar: {
                    borderRadius: 8,
                    distributed: true,
                    columnWidth: '50%'
                }
            },
            colors: [
                '#6ECED2', '#f87171', '#94a3b8', '#6366f1', '#f59e0b', '#10b981', '#ec4899'
            ],
            dataLabels: { enabled: false },
            legend: { show: false },
            xaxis: {
                categories: categories,
                labels: {
                    style: { colors: '#94a3b8' }
                },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                max: 100,
                labels: {
                    style: { colors: '#94a3b8' }
                },
                title: {
                    text: 'Porcentaje (%)',
                    style: { color: '#94a3b8' }
                }
            },
            grid: {
                borderColor: 'rgba(255, 255, 255, 0.05)'
            },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: (val) => val.toFixed(1) + '%'
                }
            }
        };

        const chart = new ApexCharts(document.querySelector("#distributionChart"), options);
        chart.render();
    }
};

window.EmotionViews = EmotionViews;
