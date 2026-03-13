const http = require('http');

console.log('Testing dashboard API at http://localhost:5000/api/dashboard/stats...');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/dashboard/stats',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
        // Authentication token might be needed, but let's see if we get a 401/500/etc.
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        console.log('BODY:', body);
        process.exit(0);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    process.exit(1);
});

// Set a timeout
req.setTimeout(5000, () => {
    console.error('Request timed out after 5 seconds');
    req.destroy();
    process.exit(1);
});

req.end();
