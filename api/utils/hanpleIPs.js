let ips = []; //    [{_ip, count}]

exports.handleIP = (ip, maxRequestsCount) => {
    for (let i=0; i<ips.length; i++) {
        if (ips[i]._ip===ip) {
            ips[i].count++
            if (ips[i].count>maxRequestsCount) return 1;
            return "Ip request count incremented";
        }
    }
    ips.push({_ip: ip, count: 0});
    return "Ip Saved";
}

exports.clearExtraIps = () => {
    console.log("Cleared IPs");
    if (ips.length>100) ips.splice(0, 50)
}
