// When document is loaded...

document.addEventListener("DOMContentLoaded", () => {
    // Get started event listener

    document.getElementById("get_started").addEventListener("click", event => {
        if (event.isTrusted) {
            // Session id

            const session_id = localStorage.sessionId
            if (session_id) {
                // Loading screen

                document.getElementById("title_screen").style.display = "none"
                document.getElementById("loading").style.display = "block"
                
                // Check session id

                request(config.database, `check_session|${session_id}`).then(result => {
                    if (result == "failed") {
                        // Reset

                        delete localStorage.sessionId
                        location.replace("https://repl-mail.mreconomical.repl.co/login")
                    } else {
                        // Session id valid

                        location.replace("https://repl-mail.mreconomical.repl.co/mail")
                    }
                }).catch(error => {
                    throw error
                })
            } else {
                // Redirect to login

                location.replace("https://repl-mail.mreconomical.repl.co/login")
            }
        }
    })
})

// Fade in on load

window.onload = () => {
    setTimeout(() => {
        // Elements

        const title_screen = document.getElementById("title_screen")

        // Display

        title_screen.style.opacity = 0
        title_screen.style.display = "block"

        // Interval

        let opacity = 0
        const fade_interval = setInterval(() => {
            // Increase opacity

            opacity = Math.round((opacity + 0.05) * 100) / 100
            title_screen.style.opacity = opacity

            // Check finished

            if (opacity == 1) {
                clearInterval(fade_interval)
            }
        }, 10)
    }, 100)
}