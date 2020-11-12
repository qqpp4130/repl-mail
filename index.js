// Files

console.log("Importing files...")
const config = require("./config.js").config
const util = require("./util.js")
const route = require("./route.js").route

// Startup

util.log("Starting repl mail...")

// Modules

util.log("Importing modules...")
const axios = require("axios")
const http = require("http")
const url = require("url")

// HTTP server

const server = http.createServer((req, res) => {
    // Access-Control-Allow-Origin

    if (req.headers.origin) {
        res.setHeader("Access-Control-Allow-Origin", req.headers.origin)
    } else {
        res.setHeader("Access-Control-Allow-Origin", "*")
    }

    // Handle requests

    if (req.method == "GET") {
        // Route request

        route(url.parse(req.url).pathname).then(result => {
            if (result != 404 && result[0] != 301) {
                // Content-Type

                res.setHeader("Content-Type", result[0])

                // Response

                res.writeHead(200)
                res.write(result[1])
                res.end()
            } else if (result[0] == 301) {
                // Redirect

                res.writeHead(301, {
                    Location: result[1]
                })
                res.end()
            } else if (result == 404) {
                // 404

                util.read_file("public/errors/404.html").then(file => {
                    res.writeHead(404)
                    res.write(file)
                    res.end()
                })
            } else {
                // Internal error

                util.read_file("public/errors/500.html").then(file => {
                    res.writeHead(500)
                    res.write(file)
                    res.end()
                })

                // Log error

                util.log("ERROR: INVALID RESULT", true)
            }
        }).catch(error => {
            // Internal error

            util.read_file("public/errors/500.html").then(file => {
                res.writeHead(500)
                res.write(file)
                res.end()
            })

            // Log error

            util.log(error, true)
        })
    } else if (req.method == "POST") {
        // Check origin

        if (true/*req.headers.origin && check_origin(req.headers.origin)*/) {
            // Collect data

            let data = ""
            req.on("data", chunk => {
                data += chunk.toString()
                if (data.length > config.reqByteLimit) {
                    // Request too large

                    res.writeHead(400)
                    res.write("ERROR: REQUEST TOO LARGE")
                    res.end()
                }
            })

            // Data collected

            req.on("end", function() {
                // Requests

                if (data == "auth") {
                    // repl auth request

                    if (req.headers["x-replit-user-name"]) {
                        // Request to database

                        axios({
                            method: "POST",
                            url: config.database,
                            headers: {
                                "repl-mail-key": process.env.REPL_MAIL_KEY
                            },
                            data: `auth|${req.headers["x-replit-user-name"]}`
                        }).then(result => {
                            // Response

                            res.writeHead(200)
                            res.write(result.data)
                            res.end()
                        }).catch(error => {
                            // Internal error

                            util.read_file("public/errors/500.html").then(file => {
                                res.writeHead(500)
                                res.write(file)
                                res.end()
                            })

                            // Log error

                            util.log(error, true)
                        })
                    }
                } else {
                    // Invalid request

                    res.writeHead(400)
                    res.write("ERROR: INVALID REQUEST")
                    res.end()
                }
            })
        } else {
            // Invalid origin

            res.writeHead(403)
            res.write("REJECTED: INVALID ORIGIN")
            res.end()
        }
    } else {
        // Invalid request type

        res.writeHead(400)
        res.write("ERROR: INVALID REQUEST TYPE")
        res.end()
    }
}).listen(config.port)

function check_origin(origin) {
    // Check request origin

    for (let o = 0; o < config.origins.length; o ++) {
        if (origin.startsWith(config.origins[o])) {
            return true
        }
    }

    return false
}

server.on("listening", function() {
    util.log(`HTTP server listening on port ${config.port}`)
})