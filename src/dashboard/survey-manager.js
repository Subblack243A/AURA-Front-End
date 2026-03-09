const SurveyManager = {
    async checkSurveyRequirement(appInstance) {
        const user = window.Auth.getUser();
        console.log('MBI-SS: Iniciando verificación simplificada para usuario:', user);
        if (!user || !user.role || user.role.toLowerCase() !== 'estudiante') {
            console.log('MBI-SS: Usuario no es estudiante o no tiene rol definido.', user?.role);
            return;
        }

        try {
            const token = window.Auth.getToken();
            if (!token) {
                console.warn('MBI-SS: No se encontró un token de autenticación. Abortando verificación.');
                return;
            }
            console.log('MBI-SS: Token encontrado (primeros 5 caracteres):', token.substring(0, 5) + '...');
            
            const response = await fetch('/api/surveys/mbi-ss/last-response/', {
                headers: { 
                    'Authorization': `Token ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('MBI-SS: Última respuesta:', data);
                
                if (!data.last_response_date) {
                    console.log('MBI-SS: Primera vez detectada. Disparando.');
                    this.showSurvey(appInstance);
                    return;
                }

                const lastResponse = new Date(data.last_response_date);
                const now = new Date();
                
                // Diferencia en milisegundos convertida a días
                const diffTime = Math.abs(now - lastResponse);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                console.log(`MBI-SS: Han pasado ${diffDays} días desde la última respuesta.`);

                if (diffDays > 7) {
                    console.log('MBI-SS: Han pasado más de 7 días. Disparando.');
                    this.showSurvey(appInstance);
                } else {
                    console.log('MBI-SS: Encuesta al día (menos de 7 días).');
                }
            }
        } catch (err) {
            console.error('MBI-SS: Error en checkSurveyRequirement:', err);
        }
    },

    showSurvey(appInstance) {
        console.log('MBI-SS: Redirigiendo a la encuesta...');
        if (appInstance && appInstance.renderSurveyForm) {
            appInstance.renderSurveyForm();
        } else {
            console.error('MBI-SS: No se pudo realizar el redireccionamiento. appInstance.renderSurveyForm no disponible.');
        }
    },

    async submitSurvey(answers) {
        const token = window.Auth.getToken();
        const response = await fetch('/api/surveys/mbi-ss/submit/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(answers)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al enviar la encuesta');
        }

        return await response.json();
    },

    async fetchHistory() {
        const token = window.Auth.getToken();
        const response = await fetch('/api/surveys/mbi-ss/history/', {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (!response.ok) {
            throw new Error('Error al obtener el historial de encuestas');
        }

        return await response.json();
    }
};

window.SurveyManager = SurveyManager;
