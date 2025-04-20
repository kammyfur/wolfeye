global.fs = require('fs')
global.os = require('os')
global.mime = require('node-mime');
global.dirconf = null;

module.exports.start = function () {
    String.prototype.replacei = function (search, replace) {
        var regex = new RegExp(search, "ig");
        return this.replace(regex, replace);
    }

    global.http = require('http');

    http.createServer(async function (req, res) {
        global.res = res;

        req.url_early = req.url;

        if (req.url.length > 1 && req.url.endsWith("/")) {
            req.url = req.url.substr(0, req.url.length - 1);
        }

        req.url_orig = req.url;
        req.url_arg = req.url.split("?")[1];
        req.url = req.url.split("?")[0];

        if (req.headers["x-forwarded-for"]) {
            global.address = req.headers["x-forwarded-for"];
        } else {
            global.address = req.connection.remoteAddress
        }

        log.verbose("request: " + address + "; " + req.url)

        let dlang = "en";
        let ulang = req.headers["accept-language"].substr(0, 2);

        if (/^[a-z]{2}$/gm.test(ulang)) {
            if (fs.existsSync(wwwdata + "/../../data/lang/" + ulang + ".json")) {
                dlang = ulang;
            }
        }

        frhtml = false;
        ejs = false;
        if (req.url.includes(".")) {
        } else {
            if (fs.existsSync(wwwdata + req.url + "/index.html")) {
                req.url = req.url + "/index.html"
            } else {
                req.url = req.url + "/index.ejs"
                ejs = true;
            }
        }
        if ((fs.existsSync(wwwdata + req.url) || fs.existsSync(wwwdata + req.url_orig + "/$command.json")) && !req.url.startsWith("/assets/")) {
            if (req.url_orig.replace(/\/+/g, '/').trim() !== "/") {
                res.writeHead(301, {"Location": "/" + dlang + req.url_orig.replace(/\/+/g, '/') + "/"});
            } else {
                res.writeHead(301, {"Location": "/" + dlang + "/"});
            }
            res.end();
        } else if (!req.url.startsWith("/assets/")) {
            slang = req.url.split("/")[1];
            if (!slang.includes(".") && !slang.includes("/") && fs.existsSync(serverRoot + "/data/lang/" + slang + ".json")) {
                global.lang = JSON.parse(fs.readFileSync(serverRoot + "/data/lang/" + slang + ".json").toString());
                parts = req.url.split("/");
                parts.shift();
                parts.shift();
                req.url = "/" + parts.join("/");
            } else {
                parts = req.url_orig.split("/");
                parts.shift();
                parts.shift();

                newUrl = "/" + parts.join("/");
                if (newUrl.replace(/\/+/g, '/').trim() !== "/") {
                    res.writeHead(301, {"Location": "/en" + newUrl.replace(/\/+/g, '/') + "/"});
                } else {
                    res.writeHead(301, {"Location": "/en/"});
                }
                res.end();
            }
        }
        if (req.url_early.split("/").length === 2 && req.url_early !== "/") {
            res.writeHead(301, {"Location": req.url_early + "/"});
            res.end();
        }
        if (req.url.includes("..")) {
            if (config.errors_show_trace) {
                trace = "<div><code>Satellite Server - System Backtrace<br><br>Server Backtrace:<br>401F0000     PERMISSION_DENIED<br>00000001     SERVER_RUNTIME<br>0000001A     HTTP_WEBSERVER<br><br>Kernel Backtrace:<br></code></div>"
            } else {
                trace = "";
            }
            log.verbose("return 401")
            res.writeHead(401, {'Content-Type': 'text/html'});
            res.write("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\"><title>Satellite Fatal Error</title></head><body><h1>Internal Server Error</h1>Minteck Satellite Server returned an error while trying to request your file.<br><br>0x401: Forbidden<br>" + req.url + "<br><br><b>Minteck Satellite Server " + mpws.version + ", kernel " + process.version + "</b>" + trace + "</body></html>");
            res.end();
            return;
        }
        global.dirconf = null;
        if (fs.existsSync(wwwdata + req.url.substring(0, req.url.indexOf('/')) + "/" + config.access)) {
            log.verbose('reading ' + config.access + ' file...')
            try {
                if (require.cache[require.resolve(wwwdata + req.url.substring(0, req.url.indexOf('/')) + "/" + config.access)]) {
                    delete require.cache[require.resolve(wwwdata + req.url.substring(0, req.url.indexOf('/')) + "/" + config.access)]
                }
                global.dirconf = require(wwwdata + req.url.substring(0, req.url.indexOf('/')) + "/" + config.access)
            } catch (err) {
                global.dirconf = null;
                if (config.errors_show_trace) {
                    trace = "<div><code>Satellite Server - System Backtrace<br><br>Server Backtrace:<br>50A00000     INVALID_DIR_CONF<br>00000001     SERVER_RUNTIME<br>0000001A     HTTP_WEBSERVER<br><br>Kernel Backtrace:<br>" + err.toString().replace('\n', '<br>') + "</code></div>"
                } else {
                    trace = "";
                }
                log.verbose("return 500")
                res.writeHead(500, {'Content-Type': 'text/html'});
                res.write("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\"><title>Satellite Fatal Error</title></head><body><h1>Internal Server Error</h1>Minteck Satellite Server returned an error while trying to request your file.<br><br>0x50A: Invalid Directory Configuration<br>" + req.url + "<br><br><b>Minteck Satellite Server " + mpws.version + ", kernel " + process.version + "</b>" + trace + "</body></html>");
                res.end();
                return;
            }
            if (dirconf == null) {
            } else {
                if (typeof (dirconf.access) != "undefined") {
                    if (typeof (dirconf.access) == "boolean") {
                        if (dirconf.access == false) {
                            if (config.errors_show_trace) {
                                trace = "<div><code>Satellite Server - System Backtrace<br><br>Server Backtrace:<br>401F0000     PERMISSION_DENIED<br>00000001     SERVER_RUNTIME<br>0000001A     HTTP_WEBSERVER<br><br>Kernel Backtrace:<br></code></div>"
                            } else {
                                trace = "";
                            }
                            log.verbose("return 401")
                            res.writeHead(500, {'Content-Type': 'text/html'});
                            res.write("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\"><title>Satellite Fatal Error</title></head><body><h1>Internal Server Error</h1>Minteck Satellite Server returned an error while trying to request your file.<br><br>0x401: Forbidden<br>" + req.url + "<br><br><b>Minteck Satellite Server " + mpws.version + ", kernel " + process.version + "</b>" + trace + "</body></html>");
                            res.end();
                            return;
                        }
                    }
                }
            }
        }
        if (fs.existsSync(wwwdata + req.url)) {
            if (ejs) {
                log.verbose("return " + mime.lookUpType((wwwdata + req.url).split(".").pop()))
                log.verbose("parser: ejs");
                var date = new Date();
                var hour = date.getHours();
                hour = (hour < 10 ? "0" : "") + hour;
                var min = date.getMinutes();
                min = (min < 10 ? "0" : "") + min;
                var sec = date.getSeconds();
                sec = (sec < 10 ? "0" : "") + sec;
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                month = (month < 10 ? "0" : "") + month;
                var day = date.getDate();
                day = (day < 10 ? "0" : "") + day;
                res.writeHead(200, {
                    'Content-Type': "text/html",
                    'Set-Cookie': '__mpws_request=' + year + month + day + hour + min + sec
                });
                try {
                    if (typeof req.url_arg === "string") {
                        get = require('querystring').parse(require('url').parse(req.url_orig).query);
                    } else {
                        get = {};
                    }
                    str = await require('ejs').renderFile(wwwdata + req.url, {axios: require('axios'), address, crypto: require('crypto'), wwwdata, private, req, res, slang, lang, get, fs: require('fs'), child_process: require('child_process')}, {async: true});
                    res.write(str);
                    res.end();
                } catch (e) {
                    res.writeHead(200, {
                        'Content-Type': "text/plain",
                        'Set-Cookie': '__mpws_request=' + year + month + day + hour + min + sec
                    });
                    res.write(e.stack);
                    res.end();
                }
                return;
            } else {
                var type = mime.lookUpType((wwwdata + req.url).split(".").pop());
                log.verbose("return " + type)
                var date = new Date();
                var hour = date.getHours();
                hour = (hour < 10 ? "0" : "") + hour;
                var min = date.getMinutes();
                min = (min < 10 ? "0" : "") + min;
                var sec = date.getSeconds();
                sec = (sec < 10 ? "0" : "") + sec;
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                month = (month < 10 ? "0" : "") + month;
                var day = date.getDate();
                day = (day < 10 ? "0" : "") + day;
                res.writeHead(200, {
                    'Content-Type': type,
                    'Set-Cookie': '__mpws_request=' + year + month + day + hour + min + sec
                });
                if (req.url.endsWith("/$command.json")) {
                    prejson = JSON.parse(fs.readFileSync(wwwdata + req.url));
                    prejson.token = "<-- TOKEN TRUNCATED - Access file on real server to get the authentication token -->"
                    res.write(JSON.stringify(prejson));
                } else {
                    res.write(fs.readFileSync(wwwdata + req.url));
                }
                res.end();
                return;
            }
        } else {
            if (config.errors_show_trace) {
                trace = "<div><code>Satellite Server - System Backtrace<br><br>Server Backtrace:<br>404F0000     FILE_NOT_FOUND<br>00000001     SERVER_RUNTIME<br>0000001A     HTTP_WEBSERVER<br><br>Kernel Backtrace:<br></code></div>"
            } else {
                trace = "";
            }
            log.verbose("return 404")
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.write("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\"><title>Satellite Server Fatal Error</title></head><body><h1>Internal Server Error</h1>Minteck Satellite Server returned an error while trying to request your file.<br><br>0x404: Not Found<br>" + req.url + "<br><br><b>Minteck Satellite Server " + mpws.version + ", kernel " + process.version + "</b>" + trace + "</body></html>");
            res.end();
        }
    }).listen(config.port);
    log.info('Started Satellite at port ' + config.port)
}
