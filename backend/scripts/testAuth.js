/*
Simple script to exercise the auth endpoints. Run with `node backend/scripts/testAuth.js`
Ensure the server is running before executing.
*/
const axios = require('axios');

const api = axios.create({
    baseURL: process.env.API_URL || 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
});

(async () => {
    try {
        console.log('Registering a new pharmacist...');
        const signup = await api.post('/auth/signup', {
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'password123',
        });
        console.log('Signup response:', signup.data);

        console.log('Logging in with the new account');
        const login = await api.post('/auth/login', {
            email: 'testuser@example.com',
            password: 'password123',
        });
        console.log('Login response:', login.data);
    } catch (err) {
        console.error('Error during auth tests:', err.response?.data || err.message);
    }
})();
