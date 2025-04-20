module.exports = (config, callback) => {
    log.verbose("start command")
    global.commandDone = false;
    const exec = require('child_process').exec;
    exec(config.command, (err, stdout, stderr) => {
        if (err) {
            log.warn("Command plugin error: " + err.toString());
            global.commandReturnOutput = {
                error: true,
                errorMessage: err.toString(),
                verbose: {
                    stdout: stdout,
                    stderr: stderr
                }
            }
            global.commandDone = true;
            callback();
        } else {
            log.info("Command plugin successfully terminated");
            global.commandReturnOutput = {
                error: false,
                errorMessage: null,
                verbose: {
                    stdout: stdout,
                    stderr: stderr
                }
            }
            global.commandDone = true;
            callback(commandReturnOutput);
        }
    });
}