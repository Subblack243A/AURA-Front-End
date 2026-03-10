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
            const error = new Error(data.error || 'Login failed');
            error.code = data.code; // Pass through the error code from backend
            throw error;
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
            // Handle DRF validation errors which can be objects
            let errorMsg = 'Registration failed';
            if (typeof data === 'object') {
                errorMsg = Object.entries(data)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join('. ');
            } else if (data.error) {
                errorMsg = data.error;
            }
            throw new Error(errorMsg);
        }

        return data;
    },

    async verifyOTP(email, otpCode) {
        const response = await fetch(`${API_URL}/verify-otp/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp_code: otpCode }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Verification failed');
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

    async resendOTP(email) {
        const response = await fetch(`${API_URL}/resend-otp/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Resend failed');
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
