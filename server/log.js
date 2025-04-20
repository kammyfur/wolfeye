time = 0
const cluster = require('cluster');

function fix(number) {
    return "0000000000".substr(0, 10 - Math.round(number * 100000).toString().length) + Math.round(number * 100000).toString()
}

function fix2(number) {
    return "000".substr(0, 3 - number.toString().length) + number.toString();
}

if (cluster.worker) {
    cid = fix2(cluster.worker.id);
} else if (process.argv[2]) {
    cid = fix2(process.argv[2] - 1 + 1);
} else {
    cid = "---";
}

module.exports.info = function (logel) {
    time = fix(process.uptime());
    console.log("[" + cid + "] " + "[" + time + "] [info] " + logel);
}

module.exports.verbose = function (logel) {
    time = fix(process.uptime());
    if (config.verbose) {
        console.log("[" + cid + "] " + "[" + time + "] [verbose] " + logel);
    }
}

module.exports.warn = function (logel) {
    time = fix(process.uptime());
    console.log("[" + cid + "] " + "[" + time + "] [warn] " + logel);
}

module.exports.error = function (logel) {
    time = fix(process.uptime());
    console.log("[" + cid + "] " + "[" + time + "] [error] " + logel);
    process.exit()
}