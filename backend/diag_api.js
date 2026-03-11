const http = require('http');

http.get('http://localhost:5000/api/medicines?page=1&limit=10', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Body:', data);
        process.exit(0);
    });
}).on('error', (err) => {
    console.log('Error:', err.message);
    process.exit(1);
});
