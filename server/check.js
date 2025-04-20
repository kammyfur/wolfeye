module.exports.check = function () {
    log.verbose("Check init")
    var net = require('net');
    log.verbose("Net rq init ok")
    var server = net.createServer();
    log.verbose("net.createServer ok")

    server.once('error', function(err) {
        log.verbose("err: " + err.code)
        if (err.code === 'EADDRINUSE') {
            log.error("Port is busy, aborting.")
        } else {
            log.error("Cannot open port.")
        }
    });

    server.once('listening', function() {
        log.verbose("listening ok")
        log.info("Port is available")
        log.verbose("server close ok")
        server.close();
        server = undefined;
        log.verbose("http init start")
        log.info("Initialising HTTP module...")
        global.ws = require('./http.js')
        log.verbose("http init stop")
        ws.start()
        log.verbose("server start")
    });

    log.verbose("all ok")
    server.listen(config.port);
    log.verbose("listen ok")
}