const axios = require('axios');

const testApi = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/medicines', {
            params: { page: 1, limit: 10 },
            headers: {
                // I need a valid token to test this if it's protected
                // But let's see if it even reaches the controller or fails at middleware
                // Actually, without a token, protect middleware might return 401, not 500.
            }
        });
        console.log('Response:', response.data);
    } catch (err) {
        if (err.response) {
            console.log('Error Status:', err.response.status);
            console.log('Error Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.log('Error Message:', err.message);
        }
    }
};

testApi();
