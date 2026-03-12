const AdminReports = {
    renderLanding(appContainer, app) {
        appContainer.innerHTML = `
            <div class="admin-reports-wrapper no-print" style="max-width: 1000px; margin: 0 auto; padding-top: 1rem;">
                <div class="dashboard-header" style="text-align: center; margin-bottom: 3rem; animation: fadeIn 0.8s ease-out;">
                    <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem; background: linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        Reportes Generales
                    </h1>
                    <p class="subtitle" style="font-size: 1.1rem; opacity: 0.8;">Selecciona el tipo de análisis que deseas visualizar.</p>
                </div>

                <div class="admin-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 2rem;">
                    <!-- Charts Option -->
                    <div class="card admin-card interactive-card" id="go-to-charts-btn" style="max-width: none; margin: 0; padding: 3rem; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: linear-gradient(145deg, rgba(37, 43, 54, 0.8) 0%, rgba(30, 35, 45, 0.9) 100%);">
                        <div class="card-icon" style="width: 80px; height: 80px; background: rgba(110, 206, 210, 0.1); border-radius: 1.5rem; display: flex; align-items: center; justify-content: center; color: var(--primary); margin-bottom: 2rem;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        </div>
                        <h2 style="margin-bottom: 1rem; font-size: 1.5rem; color: #fff;">Gráficas de Bienestar</h2>
                        <p class="subtitle" style="margin-bottom: 2rem; font-size: 0.95rem;">Visualización interactiva de estadísticas emocionales globales.</p>
                        <button class="primary-btn" style="width: 100%;">Ver Gráficas</button>
                    </div>

                    <!-- Reports Option -->
                    <div class="card admin-card interactive-card" id="go-to-docs-btn" style="max-width: none; margin: 0; padding: 3rem; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: linear-gradient(145deg, rgba(37, 43, 54, 0.8) 0%, rgba(30, 35, 45, 0.9) 100%);">
                        <div class="card-icon" style="width: 80px; height: 80px; background: rgba(110, 206, 210, 0.1); border-radius: 1.5rem; display: flex; align-items: center; justify-content: center; color: var(--primary); margin-bottom: 2rem;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <h2 style="margin-bottom: 1rem; font-size: 1.5rem; color: #fff;">Reportes Detallados</h2>
                        <p class="subtitle" style="margin-bottom: 2rem; font-size: 0.95rem;">Generación y descarga de informes detallados en formato PDF.</p>
                        <button class="primary-btn" style="width: 100%;">Ver Reportes</button>
                    </div>
                </div>

                <div style="margin-top: 3rem; text-align: center;">
                    <button id="back-to-dash-btn" class="link-btn">
                        <svg style="vertical-align: middle; margin-right: 8px;" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Volver al Panel Principal
                    </button>
                </div>
            </div>
        `;

        document.getElementById('go-to-charts-btn').addEventListener('click', () => app.renderAdminCharts());
        document.getElementById('go-to-docs-btn').addEventListener('click', () => this.renderSummary(appContainer, app));
        document.getElementById('back-to-dash-btn').addEventListener('click', () => app.renderDashboard());
    },

    async renderCharts(appContainer, app) {
        appContainer.innerHTML = `
            <div id="print-header" class="print-only" style="display: none; border-bottom: 2px solid var(--primary); padding-bottom: 1rem; margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h1 style="text-align: left; color: #000; margin: 0;">AURA - Reporte de Bienestar</h1>
                        <p style="color: #666; margin: 0.5rem 0 0 0;">Generado por: <span id="print-admin-name" style="font-weight: bold;"></span></p>
                    </div>
                    <div style="text-align: right;">
                        <p style="color: #666; margin: 0;">Fecha de impresión:</p>
                        <p id="print-date" style="font-weight: bold; color: #000; margin: 0;"></p>
                    </div>
                </div>
            </div>

            <div class="admin-charts-wrapper" style="max-width: 1200px; margin: 0 auto;">
                <div class="dashboard-header no-print" style="text-align: center; margin-bottom: 3rem;">
                    <h1 style="font-size: 2.2rem; background: linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        Gráficas de Bienestar Emocional
                    </h1>
                    <p class="subtitle">Análisis global comparativo de registros manuales y reconocimiento facial.</p>
                    <button id="btn-print-report" class="primary-btn no-print" style="width: auto; margin: 1rem auto; padding: 0.75rem 2rem; display: flex; gap: 10px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        Imprimir Reporte
                    </button>
                </div>

                <div class="charts-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(480px, 1fr)); gap: 2rem;">
                    <div class="card chart-card" style="max-width: none; margin: 0;">
                        <h3 style="margin-bottom: 1.5rem; color: var(--primary);">Registros Manuales</h3>
                        <div id="adminManualBarChart" style="width: 100%;"></div>
                    </div>
                    <div class="card chart-card" style="max-width: none; margin: 0;">
                        <h3 style="margin-bottom: 1.5rem; color: var(--error);">Reconocimiento Facial (Emoción Dominante)</h3>
                        <div id="adminFacialBarChart" style="width: 100%;"></div>
                    </div>
                    <div class="card chart-card" style="max-width: none; margin: 0; grid-column: 1 / -1; width: 100%;">
                        <h3 style="margin-bottom: 1.5rem; color: #fff; text-align: center;">Índices de Agotamiento (MBI-SS)</h3>
                        <div id="adminBurnoutDonutChart" style="display: flex; justify-content: center; width: 100%;"></div>
                    </div>
                </div>

                <div style="margin-top: 3rem; text-align: center;" class="no-print">
                    <button id="back-to-reports-landing" class="link-btn">← Volver a opciones de reportes</button>
                </div>
            </div>
        `;

        document.getElementById('back-to-reports-landing').addEventListener('click', () => this.renderLanding(appContainer, app));
        document.getElementById('btn-print-report').addEventListener('click', () => this.handlePrint());

        await this.initCharts();
    },

    handlePrint() {
        const user = window.Auth.getUser();
        const adminNameSpan = document.getElementById('print-admin-name');
        const printDateSpan = document.getElementById('print-date');

        if (adminNameSpan) adminNameSpan.textContent = user ? (user.first_name ? `${user.first_name} ${user.last_name}` : user.username) : 'Administrador';
        
        if (printDateSpan) {
            const now = new Date();
            const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
            printDateSpan.textContent = now.toLocaleDateString('es-ES', options);
        }

        // Small delay to ensure DOM update before printing
        setTimeout(() => {
            window.print();
        }, 300);
    },

    async initCharts() {
        const token = window.Auth.getToken();
        try {
            const response = await fetch('/api/reports/general/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar reportes');
            const data = await response.json();

            this.renderBarChart(data.manual_registrations, '#adminManualBarChart', 'Registros Manuales', '#6ECED2');
            this.renderBarChart(data.facial_recognition_dominance, '#adminFacialBarChart', 'Dominancia Facial', '#f87171');
            
            if (data.burnout_survey_results) {
                this.renderDonutChart(data.burnout_survey_results, '#adminBurnoutDonutChart');
            }

        } catch (err) {
            console.error(err);
        }
    },

    async renderSummary(appContainer, app) {
        appContainer.innerHTML = `
            <div class="admin-summary-wrapper" style="max-width: 1200px; margin: 0 auto; padding-top: 1rem;">
                <div class="dashboard-header" style="text-align: center; margin-bottom: 3rem;">
                    <h1 style="font-size: 2.2rem; background: linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        Resumen General Académico
                    </h1>
                    <p class="subtitle">Consolidado de métricas y estadísticas de la plataforma.</p>
                    <button id="btn-download-pdf" class="primary-btn" style="width: auto; margin: 1.5rem auto; padding: 0.75rem 2rem; display: flex; gap: 10px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Descargar Reporte en PDF
                    </button>
                </div>

                <div class="summary-totals" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <h4 style="color: var(--primary); font-size: 0.9rem; text-transform: uppercase;">Usuarios Totales</h4>
                        <p id="total_users" style="font-size: 2.5rem; font-weight: bold; color: #fff; margin: 0.5rem 0;">0</p>
                    </div>
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <h4 style="color: #fbbf24; font-size: 0.9rem; text-transform: uppercase;">Registros Manuales</h4>
                        <p id="total_emotions" style="font-size: 2.5rem; font-weight: bold; color: #fff; margin: 0.5rem 0;">0</p>
                    </div>
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <h4 style="color: var(--error); font-size: 0.9rem; text-transform: uppercase;">Reconocimientos</h4>
                        <p id="total_recognitions" style="font-size: 2.5rem; font-weight: bold; color: #fff; margin: 0.5rem 0;">0</p>
                    </div>
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <h4 style="color: #a78bfa; font-size: 0.9rem; text-transform: uppercase;">Encuestas MBI-SS</h4>
                        <p id="total_surveys" style="font-size: 2.5rem; font-weight: bold; color: #fff; margin: 0.5rem 0;">0</p>
                    </div>
                </div>

                <div class="summary-tables" style="display: grid; grid-template-columns: 1fr; gap: 2.5rem;">
                    <!-- Roles Table -->
                    <div class="card" style="padding: 2rem;">
                        <h2 style="margin-bottom: 1.5rem; font-size: 1.25rem;">Desglose por Roles</h2>
                        <table id="table-roles" style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); text-align: left;">
                                    <th style="padding: 1rem; color: var(--primary);">Rol</th>
                                    <th style="padding: 1rem; color: var(--primary); text-align: right;">Cantidad de Usuarios</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>

                    <!-- Programs Table -->
                    <div class="card" style="padding: 2rem;">
                        <h2 style="margin-bottom: 1.5rem; font-size: 1.25rem;">Desglose por Programas Académicos</h2>
                        <table id="table-programs" style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); text-align: left;">
                                    <th style="padding: 1rem; color: var(--primary);">Programa</th>
                                    <th style="padding: 1rem; color: var(--primary); text-align: right;">Cantidad de Usuarios</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>

                    <!-- Faculties Table -->
                    <div class="card" style="padding: 2rem;">
                        <h2 style="margin-bottom: 1.5rem; font-size: 1.25rem;">Desglose por Facultades</h2>
                        <table id="table-faculties" style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); text-align: left;">
                                    <th style="padding: 1rem; color: var(--primary);">Facultad</th>
                                    <th style="padding: 1rem; color: var(--primary); text-align: right;">Cantidad de Usuarios</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>

                <div style="margin-top: 3rem; text-align: center;">
                    <button id="back-to-reports-landing" class="link-btn">← Volver a opciones de reportes</button>
                </div>
            </div>
        `;

        document.getElementById('back-to-reports-landing').addEventListener('click', () => this.renderLanding(appContainer, app));
        document.getElementById('btn-download-pdf').addEventListener('click', () => this.downloadPDF());

        await this.loadGeneralReport();
    },

    async loadGeneralReport() {
        const token = window.Auth.getToken();
        try {
            const response = await fetch('/api/reports/summary/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar reporte general');
            const data = await response.json();

            // Fill Totals
            document.getElementById('total_users').textContent = data.totals.users;
            document.getElementById('total_emotions').textContent = data.totals.emotions;
            document.getElementById('total_recognitions').textContent = data.totals.recognitions;
            document.getElementById('total_surveys').textContent = data.totals.surveys;

            // Fill Tables
            this.fillTable('table-roles', data.by_role);
            this.fillTable('table-programs', data.by_program);
            this.fillTable('table-faculties', data.by_faculty);

        } catch (err) {
            console.error(err);
        }
    },

    fillTable(tableId, rows) {
        const tbody = document.querySelector(`#${tableId} tbody`);
        if (!tbody) return;
        tbody.innerHTML = rows.map(row => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 1rem; color: #e2e8f0;">${row.name}</td>
                <td style="padding: 1rem; color: #fff; text-align: right; font-weight: 600;">${row.count}</td>
            </tr>
        `).join('');
    },

    downloadPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const user = window.Auth.getUser();
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.text("AURA - Reporte General Académico", 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generado por: ${user ? (user.first_name || user.username) : 'Administrador'}`, 14, 30);
        doc.text(`Fecha: ${dateStr}`, 14, 36);
        
        // Horizontal Line
        doc.setLineWidth(0.5);
        doc.line(14, 40, 196, 40);

        // Totals Data for PDF
        const totals = [
            ["Usuarios Totales", document.getElementById('total_users').textContent],
            ["Registros Manuales", document.getElementById('total_emotions').textContent],
            ["Reconocimientos Faciales", document.getElementById('total_recognitions').textContent],
            ["Encuestas MBI-SS", document.getElementById('total_surveys').textContent]
        ];

        doc.autoTable({
            startY: 45,
            head: [['Métrica de Plataforma', 'Total']],
            body: totals,
            theme: 'striped',
            headStyles: { fillColor: [110, 206, 210] }
        });

        // Roles Table
        doc.setFontSize(14);
        doc.text("Resumen por Roles", 14, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
            html: '#table-roles',
            startY: doc.lastAutoTable.finalY + 20,
            headStyles: { fillColor: [110, 206, 210] }
        });

        // Programs Table
        doc.setFontSize(14);
        doc.text("Resumen por Programas Académicos", 14, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
            html: '#table-programs',
            startY: doc.lastAutoTable.finalY + 20,
            headStyles: { fillColor: [110, 206, 210] }
        });

        // Check for new page if needed
        if (doc.lastAutoTable.finalY + 40 > 280) doc.addPage();

        // Faculties Table
        doc.setFontSize(14);
        doc.text("Resumen por Facultades", 14, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
            html: '#table-faculties',
            startY: doc.lastAutoTable.finalY + 20,
            headStyles: { fillColor: [110, 206, 210] }
        });

        doc.save('reporte_general_plataforma.pdf');
    },

    renderBarChart(dataObj, selector, name, color) {
        const categories = Object.keys(dataObj).map(e => e.charAt(0).toUpperCase() + e.slice(1));
        const values = Object.values(dataObj);

        const options = {
            series: [{ name: name, data: values }],
            chart: {
                type: 'bar',
                height: 400,
                toolbar: { show: false },
                foreColor: '#94a3b8',
                animations: { enabled: true, easing: 'easeinout', speed: 800 }
            },
            plotOptions: {
                bar: {
                    borderRadius: 8,
                    columnWidth: '50%',
                    distributed: true,
                    dataLabels: { position: 'top' }
                }
            },
            colors: [color],
            dataLabels: {
                enabled: true,
                formatter: val => val,
                offsetY: -20,
                style: { fontSize: '12px', colors: ["#fff"] }
            },
            legend: { show: false },
            xaxis: {
                categories: categories,
                position: 'bottom',
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: { style: { colors: '#94a3b8', fontWeight: 600 } }
            },
            yaxis: {
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: { show: true, style: { colors: '#94a3b8' } }
            },
            grid: { borderColor: 'rgba(255,255,255,0.05)' },
            tooltip: { theme: 'dark' }
        };

        const container = document.querySelector(selector);
        if (container) {
            new ApexCharts(container, options).render();
        }
    },

    renderDonutChart(dataObj, selector) {
        const labels = Object.keys(dataObj);
        const series = Object.values(dataObj);

        const options = {
            series: series,
            chart: {
                type: 'donut',
                height: 380,
                animations: { enabled: true, easing: 'easeinout', speed: 800 }
            },
            labels: labels,
            colors: ['#f87171', '#6ECED2'], // Error/Red for Agotamiento, Primary/Teal for Sin Agotamiento
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total',
                                color: '#94a3b8',
                                formatter: w => w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                            },
                            value: {
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '24px'
                            }
                        }
                    }
                }
            },
            dataLabels: { enabled: true, style: { fontSize: '14px', fontWeight: 'bold' } },
            legend: {
                position: 'bottom',
                labels: { colors: '#94a3b8' },
                fontSize: '14px'
            },
            stroke: { width: 0 },
            tooltip: { theme: 'dark' }
        };

        const container = document.querySelector(selector);
        if (container) {
            new ApexCharts(container, options).render();
        }
    }
};

window.AdminReports = AdminReports;
