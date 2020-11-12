// Modules

const fs = require("fs")

// Utility functions

function log(message, error) {
    // Get current time

    const time = get_time()
    const date = time[0]
    const utc_time = time[1]
    const pt_time = time[2]

    // Construct message
    
    const data = `${date} ${utc_time} UTC ${pt_time} PT | ${message}`

    // Log message

    if (error) {
        console.error(data)
    } else {
        console.log(data)
    }
}

function get_time() {
    // Constructor

    const d = new Date()

    // Date

    const year = d.getUTCFullYear()
    let month = (d.getUTCMonth() + 1).toString()
    let day = d.getUTCDate().toString()

    if (month.length == 1) {
        month = "0" + month
    }
    if (day.length == 1) {
        day = "0" + day
    }

    const date = `${year}-${month}-${day}`

    // Calculate time

    let utc_hours = d.getUTCHours()
    let pt_hours
    let prev_day = false
    if (utc_hours < 7) {
        prev_day = true
        pt_hours = 17 + utc_hours
    } else {
        pt_hours = utc_hours - 7
    }

    pt_hours = pt_hours.toString()
    if (pt_hours.length == 1) {
        pt_hours = "0" + pt_hours
    }

    utc_hours = utc_hours.toString()
    if (utc_hours.length == 1) {
        utc_hours = "0" + utc_hours
    }

    let minutes = d.getUTCMinutes().toString()
    if (minutes.length == 1) {
        minutes = "0" + minutes
    }

    let seconds = d.getUTCSeconds().toString()
    if (seconds.length == 1) {
        seconds = "0" + seconds
    }

    const utc_time = `${utc_hours}:${minutes}:${seconds}`
    let pt_time
    if (prev_day == false) {
        pt_time = `${pt_hours}:${minutes}:${seconds}`
    } else {
        pt_time = `[[${pt_hours}:${minutes}:${seconds}]]`
    }

    return [date, utc_time, pt_time]
}

function read_file(path) {
    return new Promise((resolve, reject) => {
        // Read file

        fs.readFile(path, (error, data) => {
            // Error

            if (error) {
                reject(error)
            }

            // File data

            if (path.endsWith(".json")) {
                resolve(JSON.parse(data))
            } else {
                resolve(data)
            }
        })
    })
}

// Exports

module.exports = {
    log: log,
    read_file: read_file
}