const API_URL = '/api';

const Auth = {
    async login(email, password, image) {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        if (image) {
            formData.append('image', image);
        }

        const response = await fetch(`${API_URL}/login/`, {
            method: 'POST',
            body: formData, // Send as multi-part for image
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Store session
        localStorage.setItem('aura_token', data.token);
        localStorage.setItem('aura_user', JSON.stringify({
            id: data.user_id,
            username: data.username,
            role: data.role
        }));

        return data;
    },

    async register(userData) {
        const response = await fetch(`${API_URL}/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (!response.ok) {
            const errors = Object.values(data).flat().join('. ');
            throw new Error(errors || 'Registration failed');
        }

        return data;
    },

    logout() {
        localStorage.removeItem('aura_token');
        localStorage.removeItem('aura_user');
    },

    isAuthenticated() {
        return !!localStorage.getItem('aura_token');
    },

    getToken() {
        return localStorage.getItem('aura_token');
    },

    getUser() {
        const user = localStorage.getItem('aura_user');
        return user ? JSON.parse(user) : null;
    },

    getRole() {
        const user = this.getUser();
        return user ? user.role : null;
    }
};

window.Auth = Auth; // Make it globally accessible for simplicity in this vanilla setup
