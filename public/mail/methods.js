function display_mail() {
    // Elements

    const loading = document.getElementById("loading")

    const mail_screen = document.getElementById("mail_screen")

    const pfp = document.getElementById("pfp")
    const name = document.getElementById("username")
    const profile = document.getElementById("menu_profile")

    // Account info

    name.innerText = Username
    request(config.database, `get_pfp|${Username}`).then(img => {
        pfp.src = img
    }).catch(error => {
        throw error
    })
    profile.href = `https://repl.it/@${Username}`

    // Mail

    update_mail()

    // Update intervals

    action_interval("start")
    mail_interval("start")

    // Display

    loading.style.display = "none"
    mail_screen.style.display = "block"
}

function update_mail() {
    // Data

    const mail = Mail[Screen]
    const container = document.getElementById(`${Screen}_mail`)

    // Delete all current mail

    while (container.firstChild) {
        container.firstChild.remove()
    }

    // New mail

    const ids = Object.keys(mail).sort((id1, id2) => {
        if (mail[id1].time > mail[id2].time) {
            return -1
        } else {
            return 1
        }
    })

    for (let i = 0; i < ids.length; i ++) {
        container.appendChild(get_card(mail[ids[i]]))
    }

    // Event listeners

    if (ids.length == 0) {
        // No mail message

        const no_mail = document.createElement("div")
        no_mail.className = "noMail"
        no_mail.innerText = "No mail"

        container.appendChild(no_mail)
    } else {
        // Add event listeners

        mail_listeners(ids, mail, container.getElementsByClassName("mail"))
    }
}

function get_card(data) {
    // Create element

    const mail = document.createElement("div")
    mail.className = "mail"

    // Opened

    if (data.opened == false) {
        const opened = document.createElement("div")
        opened.className = "mailOpened"
        const opened_icon = document.createElement("i")
        opened_icon.className = "mailOpenedIcon fas fa-circle fa-sm"
        opened.appendChild(opened_icon)
        mail.appendChild(opened)
    }

    // Sender

    const sender = document.createElement("div")
    sender.className = "mailSender"
    sender.innerText = data.from
    mail.appendChild(sender)

    // Title

    const title = document.createElement("div")
    title.className = "mailTitle"
    title.innerText = data.title
    mail.appendChild(title)

    // Time

    const time = document.createElement("div")
    time.className = "mailTime"
    time.innerText = convert_time(data.time)
    mail.appendChild(time)

    // Element

    return mail
}

function convert_time(epoch) {
    // Raw time data

    const date = new Date(0)
    date.setUTCMilliseconds(epoch)

    // Get date

    const data = date.toString().split(" ")
    const date_str = `${data[1]} ${data[2]} ${data[3]}`

    // Get time string

    let time
    let hour = "AM"

    let hours = date.getHours()
    if (hours > 12) {
        hours = hours - 12
        hour = "PM"
    } else if (hours == 0) {
        hours = 12
    }

    let minutes = date.getMinutes().toString()
    if (minutes.length == 1) {
        minutes = `0${minutes}`
    }

    let seconds = date.getSeconds().toString()
    if (seconds.length == 1) {
        seconds = `0${seconds}`
    }

    time = `${hours}:${minutes}:${seconds} ${hour}`

    return `${date_str} ${time}`
}

function display_message(mail) {
    // Elements

    const message = document.getElementById("message")
    const title = document.getElementById("mail_title")
    const pfp = document.getElementById("sender_pfp")
    const sender = document.getElementById("sender")
    const recipients = document.getElementById("recipients")
    const timestamp = document.getElementById("timestamp")
    const content = document.getElementById("mail_content")

    // Check opened

    if (MessageId && mail.opened == false && !Actions.includes(`open${config.splitChars[1]}${MessageId}`)) {
        Actions.push(`open${config.splitChars[1]}${MessageId}`)
        Mail[Screen][MessageId].opened = true
        update_mail()
    }

    // Page title

    document.title = `repl mail | ${mail.title}`

    // Render mail

    title.innerText = mail.title

    request(config.database, `get_pfp|${mail.from}`).then(result => {
        pfp.src = result
    }).catch(error => {
        action_interval()
        mail_interval()
        throw error
    })

    sender.innerText = mail.from
    recipients.innerText = `to ${mail.to.join(", ")}`
    timestamp.innerText = convert_time(mail.time)

    content.innerHTML = Markdown.render(mail.content)

    // Display

    message.style.display = "block"
}

function display_confirm(title, desc) {
    // Elements

    const confirm = document.getElementById("confirm")
    const confirm_title = document.getElementById("confirm_title")
    const confirm_desc = document.getElementById("confirm_desc")

    // Display

    confirm_title.innerText = title
    confirm_desc.innerText = desc
    confirm.style.display = "block"
}

function archive_message() {
    // Add to actions

    if (!Actions.includes(`archive${config.splitChars[1]}${MessageId}`)) {
        Actions.push(`archive${config.splitChars[1]}${MessageId}`)
    }

    // Move to archive

    const ids = Object.keys(Mail[Screen])
    if (ids.includes(MessageId)) {
        Mail.archive[MessageId] = Mail[Screen][MessageId]
        delete Mail[Screen][MessageId]
    }

    // Update

    update_mail()

    // Display

    document.getElementById("message").style.display = "none"
    document.getElementById("mail_display").style.display = "block"
}

function delete_message() {
    // Add to actions

    if (!Actions.includes(`delete${config.splitChars[1]}${MessageId}`)) {
        Actions.push(`delete${config.splitChars[1]}${MessageId}`)
    }

    // Delete from Mail

    const ids = Object.keys(Mail[Screen])
    if (ids.includes(MessageId)) {
        delete Mail[Screen][MessageId]
    }

    // Update

    update_mail()

    // Display

    document.getElementById("message").style.display = "none"
    document.getElementById("mail_display").style.display = "block"
}

function report_message() {
    if (Mail[Screen] && Mail[Screen][MessageId]) {
        // Parse action

        const sc = config.splitChars[1]
        const message = Mail[Screen][MessageId]
        const action = `report${sc}${Username}${sc}${MessageId}${sc}${message.title}${sc}${message.from}${sc}${convert_time(message.time)}${sc}${message.content}`

        // Add to actions

        Actions.push(action)

        // Display

        document.getElementById("message").style.display = "none"
        document.getElementById("mail_display").style.display = "block"
    }
}

function display_compose() {
    // Elements

    const compose = document.getElementById("compose")
    const input = document.getElementById("editor_recipients")
    const recipients = document.getElementById("send_recipients")

    // Check recipients

    if (Recipients.length == 0) {
        recipients.innerText = "No recipients (press enter to set a recipient)"
    }

    // Display

    compose.style.display = "block"
}

function add_recipient(user) {
    // Elements

    const input = document.getElementById("editor_recipients")
    const recipients = document.getElementById("send_recipients")

    // Add recipient

    if (!Recipients.includes(user) && user.length >= 2 && user.length <= 20) {
        // Check innerText

        if (recipients.innerText == "No recipients (press enter to set a recipient)") {
            recipients.innerText = ""
        }

        // Add to array

        Recipients.push(user)

        // Reset input

        input.value = ""

        // Create element

        const recipient = document.createElement("div")
        recipient.className = "recipient"
        recipient.innerText = user
        recipient.style.fontSize = calculate_fontsize(user, 16, 4, 124, 10)
        recipients.appendChild(recipient)
        
        // Remove recipient event listener

        recipient.addEventListener("click", function(event) {
            if (event.isTrusted && Recipients.includes(user)) {
                // Delete user

                Recipients.splice(Recipients.indexOf(user), 1)
                recipient.remove()

                // Check recipients length

                if (Recipients.length == 0) {
                    recipients.innerText = "No recipients (press enter to set a recipient)"
                }
            }
        })
    } else {
        // Border effect

        input.style.border = "1px solid #FF0000"
        setTimeout(function() {
            input.style.removeProperty("border")
        }, 200)
    }
}

function calculate_fontsize(text, max, min, width, padding) {
    // Measuring div

    const measure = document.getElementById("measure")
    
    // Data

    const size = max
    const limit = width - 2 * padding

    // Test

    for (let size = max; size >= min; size --) {
        measure.innerText = text
        measure.style.fontSize = `${size}px`
         if (measure.getBoundingClientRect().width <= limit) {
             return `${size}px`
         }
    }

    // min font size

    return `${min}px`
}

function send_message(title, recipients, body) {
    return new Promise((resolve, reject) => {
        // Basic checks

        if (config.titleTest.test(title)) {
            if (recipients.length != 0) {
                if (!body.includes(config.splitChars[0])) {
                    // Send mail

                    request(config.database, `send_mail|${SessionId}|${title}${config.splitChars[0]}${recipients.join(config.splitChars[1])}${config.splitChars[0]}${body}`).then(result => {
                        if (result == "fail") {
                            location.replace("https://repl-mail.mreconomical.repl.co/login")
                        } else {
                            resolve(result)
                        }
                    }).catch(error => {
                        reject(error)
                    })
                } else {
                    resolve("body")
                }
            } else {
                resolve("recipients")
            }
        } else {
            resolve("title")
        }
    })
}

function mail_interval(control) {
    if (control == "start") {
        // Start mail interval

        MailInterval = setInterval(() => {
            request(config.database, `get_mail|${SessionId}`).then(result => {
                if (result != "fail") {
                    // Get data

                    const data = result.split(config.splitChars[0])
                    const inbox = JSON.parse(data[0])
                    const sent = JSON.parse(data[1])
                    const archive = JSON.parse(data[2])

                    // Check for valid update

                    if (Actions.length == 0) {
                        if ((Screen == "inbox" && check_different(Mail.inbox, inbox)) || (Screen == "sent" && check_different(Mail.sent, sent)) || (Screen == "archive" && check_different(Mail.archive, archive))) {
                            // Data
                            
                            Mail.inbox = inbox
                            Mail.sent = sent
                            Mail.archive = archive

                            // Display
                            
                            update_mail()
                        } else {
                            // Data

                            Mail.inbox = inbox
                            Mail.sent = sent
                            Mail.archive = archive
                        }
                    }
                } else {
                    // Delete session id

                    delete localStorage.sessionId

                    // Redirect to login

                    location.replace("https://repl-mail.mreconomical.repl.co")
                }
            }).catch(error => {
                // Request error

                action_interval()
                mail_interval()
                throw error
            })
        }, config.mailUpdate)
    } else {
        // Stop mail interval

        clearInterval(MailInterval)
    }
}

function check_different(mail1, mail2) {
    // Ids

    const ids1 = Object.keys(mail1)
    const ids2 = Object.keys(mail2)

    // Different

    if (ids1.length != ids2.length) {
        return true
    } else {
        for (let i = 0; i < ids1.length; i ++) {
            if (ids1[i] != ids2[i]) {
                return true
            } else {
                const id = ids1[i]
                if (mail1[id].title != mail2[id].title || mail1[id].content != mail2[id].content) {
                    return true
                }
            }
        }

        return false
    }
}

function action_interval(control) {
    if (control == "start") {
        // Start action interval

        ActionInterval = setInterval(() => {
            // Send to server

            if (Actions.length != 0) {
                request(config.database, `process_actions|${SessionId}|${Actions.join(config.splitChars[0])}`).then(result => {
                    if (result == "success") {
                        Actions.length = 0
                    } else {
                        action_interval()
                        mail_interval()
                        throw result
                    }
                }).catch(error => {
                    action_interval()
                    mail_interval()
                    throw error
                })
            }
        }, config.actionUpdate)
    } else {
        // Stop action interval

        clearInterval(ActionInterval)
    }
}