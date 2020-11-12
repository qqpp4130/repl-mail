// Stuff

const Markdown = markdownit()

let SessionId = localStorage.sessionId
let Username
const Mail = {inbox: [], sent: [], archive: []}
let Screen = "inbox"
let MessageId
const Actions = []
const Recipients = []
let Confirm

let MailInterval
let ActionInterval

// When document is loaded...

document.addEventListener("DOMContentLoaded", () => {
    // Check session

    if (SessionId) {
        // Check with database

        request(config.database, `check_session|${SessionId}`).then(result => {
            if (result != "failed") {
                // Session valid

                Username = result

                // Get mail

                request(config.database, `get_mail|${SessionId}`).then(result => {
                    if (result != "failed") {
                        // Parse mail data

                        const data = result.split(config.splitChars[0])
                        Mail.inbox = JSON.parse(data[0])
                        Mail.sent = JSON.parse(data[1])
                        Mail.archive = JSON.parse(data[2])

                        // Go to mail

                        display_mail()
                    } else {
                        // Redirect to login

                        delete localStorage.sessionId
                        location.replace("https://repl-mail.mreconomical.repl.co/login")
                    }
                }).catch(error => {
                    throw error
                })
            } else {
                // Redirect to login

                delete localStorage.sessionId
                location.replace("https://repl-mail.mreconomical.repl.co/login")
            }
        }).catch(error => {
            throw error
        })
    } else {
        // Redirect to login

        location.replace("https://repl-mail.mreconomical.repl.co/login")
    }

    // Event listeners

    mail_screen_listeners()
    message_listeners()
    compose_listeners()
    confirm_listeners()
})

// Check for unsaved changes

window.onbeforeunload = () => {
    if (Actions.length != 0) {
        return "unsaved changes"
    }
}