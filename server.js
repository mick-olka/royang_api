const http = require('http');
const app = require('./app');

const server = app.listen(process.env.PORT || 5000, () => {
    const port = server.address().port;
    console.log("Express is working on port "+port);
})