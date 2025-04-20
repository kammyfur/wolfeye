global.mpws = require('./version');
global.log = require('./log')
global.serverRoot = __dirname + "/..";
global.fs = require('fs')
log.info("Reading configuration...")
global.config = require('../global/config.json')
log.info("Checking configuration integrity...")
log.verbose("Checking 'port'")
if (isNaN(config.port)) {
    log.error("'port' is invalid")
}
log.verbose("Checking 'document_root'")
if (typeof config.document_root == 'string') {
    log.info("Loading storage module...")
    if (config.document_root.startsWith(".")) {
        global.wwwdata = __dirname + "/../" + config.document_root
        global.private = __dirname + "/../" + config.document_root + "/../private";
    } else {
        global.wwwdata = config.document_root
        global.private = config.document_root + "/../private";
    }
    if (fs.existsSync(wwwdata)) {
        log.info("Will start Satellite at " + wwwdata)
        log.info("Checking for port availability...")
        log.verbose("Running server/check.js/check")
        require('./check.js').check()
    } else {
        log.error("'document_root' cannot be found")
    }
} else {
    log.error("'document_root' is invalid")
}