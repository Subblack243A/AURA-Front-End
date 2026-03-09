# AURA - Front-End

Aura es una plataforma inteligente diseñada para el monitoreo del bienestar emocional y académico de los estudiantes de la Universidad de Cundinamarca. Utiliza tecnologías de vanguardia como reconocimiento facial y análisis de emociones para ofrecer una experiencia personalizada y segura.

## 🚀 Tecnologías y Frameworks

El frontend de Aura ha sido desarrollado priorizando la velocidad, la ligereza y una experiencia de usuario (UX) premium:

- **Core**: HTML5 Semántico y JavaScript Vanilla (ES6+).
- **Estilos**: Vanilla CSS3 con variables personalizadas, Glassmorphism y animaciones fluidas (Bezier).
- **Iconografía**: Lucide Icons y SVGs personalizados.
- **Tipografía**: Inter (Google Fonts) para máxima legibilidad.
- **Comunicación**: Fetch API para integración con el Backend REST (Django).
- **Biometría**: Integración con servicios de reconocimiento facial (ArcFace 512-d).

## ✨ Funcionalidades Actuales

### 1. Sistema de Autenticación Biométrica

- **Registro Seguro**: Validación estricta de correo institucional (@ucundinamarca.edu.co).
- **Captura de Rostro**: Flujo paso a paso para el registro inicial de rasgos faciales.
- **Login Facial**: Acceso rápido mediante reconocimiento facial mediante DeepFace.
- **Análisis de Emociones**: Detección automática del estado de ánimo durante el inicio de sesión.

### 2. Bienestar Estudiantil

- **Encuesta MBI-SS**: Implementación del _Maslach Burnout Inventory_ para medir el agotamiento académico.
- **Trigger Inteligente**: La encuesta se activa automáticamente cada 7 días para un seguimiento constante.
- **Interfaz Fluida**: Diseño de encuesta moderno, sin distracciones numéricas y con validación en tiempo real.

### 3. Panel de Control (Dashboard)

- **Historial de Resultados**: Visualización de encuestas anteriores con diagnóstico automático de burnout.
- **Estado en Tiempo Real**: Resumen del bienestar del estudiante.
- **Diseño Adaptativo**: Interfaz optimizada tanto para escritorio como para dispositivos móviles.

## 🛠️ Estructura del Proyecto

- `/src/login-register/`: Lógica de autenticación, vistas de login, registro y captura facial.
- `/src/dashboard/`: Componentes del panel principal y gestión de encuestas.
- `/src/schemas/`: Definiciones JSON para formularios dinámicos (MBI-SS).
- `/src/styles.css`: Sistema de diseño global y tokens visuales.
