function mail_screen_listeners() {
    // Elements

    const nav_inbox = document.getElementById("nav_inbox")
    const nav_sent = document.getElementById("nav_sent")
    const nav_archive = document.getElementById("nav_archive")

    const inbox = document.getElementById("inbox")
    const sent = document.getElementById("sent")
    const archive = document.getElementById("archive")

    const new_message = document.getElementById("new_message")

    const account = document.getElementById("account")
    const account_menu = document.getElementById("account_menu")
    const logout = document.getElementById("menu_logout")

    // Event listeners

    nav_inbox.addEventListener("click", event => {
        if (event.isTrusted && Screen != "inbox") {
            // Buttons

            nav_inbox.className = "navButtonActive"
            nav_sent.className = "navButton"
            nav_archive.className = "navButton"

            // Screens

            inbox.className = "mailbox mailboxActive"
            sent.className = "mailbox mailboxHidden"
            archive.className = "mailbox mailboxHidden"

            // Update

            Screen = "inbox"
            update_mail()
        }
    })

    nav_sent.addEventListener("click", event => {
        if (event.isTrusted && Screen != "sent") {
            // Buttons

            nav_inbox.className = "navButton"
            nav_sent.className = "navButtonActive"
            nav_archive.className = "navButton"

            // Screens

            inbox.className = "mailbox mailboxHidden"
            sent.className = "mailbox mailboxActive"
            archive.className = "mailbox mailboxHidden"

            // Update

            Screen = "sent"
            update_mail()
        }
    })

    nav_archive.addEventListener("click", event => {
        if (event.isTrusted && Screen != "archive") {
            // Buttons

            nav_inbox.className = "navButton"
            nav_sent.className = "navButton"
            nav_archive.className = "navButtonActive"

            // Screens

            inbox.className = "mailbox mailboxHidden"
            sent.className = "mailbox mailboxHidden"
            archive.className = "mailbox mailboxActive"

            // Update

            Screen = "archive"
            update_mail()
        }
    })

    account.addEventListener("click", event => {
        if (event.isTrusted && !event.path.includes(account_menu)) {
            // Change style

            if (account_menu.style.display == "block") {
                account.style.removeProperty("background-color")
                account_menu.style.display =  "none"
            } else {
                account.style.backgroundColor = "#DDDDDD"
                account_menu.style.display = "block"
            }
        }
    })

    new_message.addEventListener("click", event => {
        if (event.isTrusted) {
            display_compose()
        }
    })

    logout.addEventListener("click", event => {
        if (event.isTrusted) {
            // Logout on database

            request(config.database, `logout|${SessionId}`).then(result => {
                if (result == "success") {
                    // Hide body

                    document.body.style.display = "none"

                    // Delete session id

                    delete localStorage.sessionId

                    // Redirect to main page

                    location.replace("https://repl-mail.mreconomical.repl.co")
                } else {
                    // Error when logging out (should never happen)

                    logout.innerText = "ERROR"
                    setTimeout(() => {
                        logout.innerText = "Logout"
                    }, 500)
                }
            }).catch(error => {
                throw error
            })
        }
    })
}

function mail_listeners(ids, mail, elements) {
    // Elements

    const mail_display = document.getElementById("mail_display")

    // Event listeners

    for (let e = 0; e < elements.length; e ++) {
        elements[e].addEventListener("click", event => {
            if (event.isTrusted) {
                // Display message

                mail_display.style.display = "none"
                MessageId = ids[e]
                display_message(mail[ids[e]])
            }
        })
    }
}

function message_listeners() {
    // Elements

    const mail = document.getElementById("mail_display")

    const message = document.getElementById("message")
    const back = document.getElementById("message_back")
    const archive = document.getElementById("message_archive")
    const trash = document.getElementById("message_delete")
    const report = document.getElementById("message_report")
    const reply = document.getElementById("message_reply")

    // Event listeners

    back.addEventListener("click", event => {
        if (event.isTrusted) {
            document.title = "repl mail | mail"
            document.getElementById("sender_pfp").src = "/public/images/blank.png"
            message.style.display = "none"
            mail.style.display = "block"
        }
    })

    archive.addEventListener("click", event => {
        if (event.isTrusted && MessageId && !Object.keys(Mail.archive).includes(MessageId)) {
            archive_message()
        }
    })

    trash.addEventListener("click", event => {
        if (event.isTrusted && MessageId) {
            Confirm = "delete"
            display_confirm("Delete email", "Are you sure? Once deleted, the email cannot be recovered.")
        }
    })

    report.addEventListener("click", event => {
        if (event.isTrusted && MessageId) {
            Confirm = "report"
            display_confirm("Report email", "Report this email for inapproripate content. Do not abuse reporting.")
        }
    })

    reply.addEventListener("click", event => {
        if (event.isTrusted && MessageId) {
            // Elements

            const title = document.getElementById("editor_title")
            const recipients = document.getElementById("send_recipients")
            const body = document.getElementById("editor_body")

            // Reset current compose

            Recipients.length = 0
            while (recipients.firstChild) {
                recipients.firstChild.remove()
            }

            body.value = ""

            // Reply data

            const message = Mail[Screen][MessageId]

            title.value = `Re: ${message.title}`
            if (message.from != Username) {
                add_recipient(message.from)
            }
            for (let t = 0; t < message.to.length; t ++) {
                if (message.to[t] != Username) {
                    add_recipient(message.to[t])
                }
            }

            // Display

            display_compose()
        }
    })
}

function compose_listeners() {
    // Elements

    const compose = document.getElementById("compose")
    const exit = document.getElementById("compose_exit")
    const title = document.getElementById("editor_title")
    const recipients = document.getElementById("editor_recipients")
    const send_recipients = document.getElementById("send_recipients")
    const body = document.getElementById("editor_body")
    const send = document.getElementById("send_message")

    // Event listeners

    exit.addEventListener("click", event => {
        if (event.isTrusted) {
            compose.style.display = "none"
        }
    })

    title.addEventListener("keypress", event => {
        if (!event.isTrusted || !config.titleTest.test(event.key) || event.key == "<" || event.key == ">") {
            event.preventDefault()
        }
    })

    title.addEventListener("paste", event => {
        event.preventDefault()
    })

    title.oninput = () => {
        if (!config.titleTest.test(title.value)) {
            title.value = title.value.replace(config.titleReplace)
        }
    }

    recipients.addEventListener("keypress", event => {
        if (event.isTrusted) {
            if (event.key == "Enter" && recipients.value) {
                add_recipient(recipients.value)
            } else {
                if (!config.usernameTest.test(event.key)) {
                    event.preventDefault()
                }
            }
        } else {
            event.preventDefault()
        }
    })

    recipients.oninput = () => {
        if (!config.usernameTest.test(recipients.value)) {
            recipients.value = recipients.value.replace(config.usernameReplace, "")
        }
    }

    body.oninput = () => {
        if (body.value.includes(config.splitChars[0])) {
            body.value = body.value.replace(config.splitChars[0], "")
        }
    }

    send.addEventListener("click", event => {
        if (event.isTrusted) {
            // Disable button

            send.disabled = true

            // Send message

            send_message(title.value, Recipients, body.value).then(result => {
                if (result == "success") {
                    // Display

                    compose.style.display = "none"

                    // Reset compose

                    title.value = ""
                    recipients.value = ""
                    Recipients.length = 0
                    while (send_recipients.firstChild) {
                        send_recipients.firstChild.remove()
                    }
                    body.value = ""
                    send.disabled = false
                } else {
                    // Border effect

                    if (result.includes("title")) {
                        title.style.border = "1px solid #FF0000"
                        setTimeout(() => {
                            title.style.removeProperty("border")
                        }, 200)
                    }

                    if (result.includes("recipients")) {
                        recipients.style.border = "1px solid #FF0000"
                        setTimeout(() => {
                            recipients.style.removeProperty("border")
                        }, 200)
                    }

                    if (result.includes("body")) {
                        body.style.border = "1px solid #FF0000"
                        setTimeout(() => {
                            body.style.removeProperty("border")
                        }, 200)
                    }

                    // Enable button

                    send.disabled = false
                }
            }).catch(error => {
                throw error
            })
        }
    })
}

function confirm_listeners() {
    // Elements

    const confirm = document.getElementById("confirm")
    const confirm_cancel = document.getElementById("confirm_cancel")
    const confirm_confirm = document.getElementById("confirm_confirm")

    // Event listeners

    confirm_cancel.addEventListener("click", event => {
        if (event.isTrusted) {
            // Canceled
            
            Confirm = null
            confirm.style.display = "none"
        }
    })

    confirm_confirm.addEventListener("click", event => {
        if (event.isTrusted && Confirm && MessageId) {
            // Confirmed

            confirm.style.display = "none"

            if (Confirm == "delete") {
                delete_message()
            } else if (Confirm == "report") {
                report_message()
            }

            Confirm = null
        }
    })
}