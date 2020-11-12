// Files and modules

const util = require("./util.js")
const fs = require("fs")

// Routing

function route(path) {
    return new Promise((resolve, reject) => {
        // Pages

        if (path == "/") {
            // Title page

            util.read_file("public/title/title.html").then(title => {
                resolve(["text/html", title])
            }).catch(error => {
                reject(error)
            })
        } else if (path == "/login") {
            // Login page

            util.read_file("public/login/login.html").then(login => {
                resolve(["text/html", login])
            }).catch(error => {
                reject(error)
            })
        } else if (path == "/mail") {
            // Mail page

            util.read_file("public/mail/mail.html").then(mail => {
                resolve(["text/html", mail])
            }).catch(error => {
                reject(error)
            })
        }

        // Files

        else if (path.startsWith("/public")) {
            // Find file

            path = path.substr(1)
            if (fs.existsSync(path) && fs.lstatSync(path).isFile()) {
                // File
                
                util.read_file(path).then(file => {
                    if (path.includes("/images")) {
                        resolve(["image", file])
                    } else {
                        const ext = path.split(".")[path.split(".").length - 1]
                        if (ext == "html") {
                            resolve(["text/plain", file])
                        } else {
                            resolve([`text/${ext}`, file.toString()])
                        }
                    }
                }).catch(error => {
                    reject(error)
                })
            } else {
                // Not found

                resolve(404)
            }
        }

        // Not found

        else {
            resolve(404)
        }
    })
}

// Exports

module.exports = {
    route: route
}