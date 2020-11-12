let Error = false

function request(server, data) {
    return new Promise((resolve, reject) => {
        // Check data

        if (data) {
            // Construct request

            const req = new XMLHttpRequest()
            req.open("POST", server)
            req.send(data)

            // Error

            req.onerror = () => {
                if (!Error) {
                    // Try again

                    Error = true
                    request(server, data).then(result => {
                        resolve(result)
                    }).catch(error => {
                        reject(error)
                    })
                } else {
                    // Delete all elements

                    while (document.body.firstChild) {
                        document.body.firstChild.remove()
                    }

                    // Error message

                    document.body.appendChild(error("ERROR: SERVER CONNECTION FAILED"))
                    throw "ERROR: SERVER CONNECTION FAILED"
                }
            }

            // Response

            req.onload = () => {
                if (req.status == 200) {
                    // Request success

                    Error = false
                    resolve(req.responseText)
                } else {
                    // Delete all elements

                    while (document.body.firstChild) {
                        document.body.firstChild.remove()
                    }

                    // Error message

                    document.body.appendChild(error("ERROR: INTERNAL ERROR"))
                    throw "ERROR: INTERNAL ERROR"
                }
            }
        } else {
            // Invalid data

            reject("ERROR: INVALID REQUEST DATA")
        }
    })
}

function error(message) {
    // Create error message

    const error = document.createElement("div")
    error.style.position = "absolute"
    error.style.top = "30px"
    error.style.left = "50px"
    error.style.fontSize = "30px"
    error.innerHTML = `
        ${new Date()}
        <br>
        ${message}
    `

    return error
}