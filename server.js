const app = require('./app');
const {clearExtraIps} = require("./api/utils/hanpleIPs");

const server = app.listen(process.env.PORT || 7500, () => {
    const port = server.address().port;
    console.log("Express is working on port "+port);
    console.log(process.env.BASE_LINK);
});

setInterval(clearExtraIps, 1000*60*60*24);