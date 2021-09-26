const http = require('http');
const app = require('./app');

const server = app.listen(process.env.PORT || 7500, () => {
    const port = server.address().port;
    console.log("Express is working on port "+port);
    console.log(process.env.BASE_LINK);
    // console.log(process.env.ADMIN_PW);
})