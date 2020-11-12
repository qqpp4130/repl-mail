// When document is loaded...

document.addEventListener("DOMContentLoaded", () => {
    // Auth complete message

    addEventListener("message", message => {
        if (message.data === "auth_complete") {
            // Request to server

            request("https://repl-mail.mreconomical.repl.co", "auth").then(result => {
                localStorage.sessionId = result
                location.replace("https://repl-mail.mreconomical.repl.co/mail")
            }).catch(error => {
                throw error
            })
        }
    })
})