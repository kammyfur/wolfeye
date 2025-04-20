const cluster = require('cluster');
global.mpws = require('./server/version');

if (cluster.isMaster) {
    console.log("")
    console.log("Minteck Satellite Server");
    console.log("version " + mpws.version);
    console.log("");
    console.log("Copyright (c) " + mpws.copyright + " Minteck");
    console.log("All Rights Reserved");
    console.log("");

    for (let i = 0; i < require('os').cpus().length; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log("[" + worker.id + "] " + "Process " + worker.process.pid + " died");
        cluster.fork();
    });
} else {
    require('./server/core');
}