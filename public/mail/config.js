const config = {
    database: "https://repl-mail-database.mreconomical.repl.co",
    splitChars: ["⼁", "¦"],

    actionUpdate: 5000,
    mailUpdate: 5000,

    titleTest: /^[\u0020-\u00FF]+$/,
    titleReplace: /[^\u0020-\u00FF]/g,
    usernameTest: /^[a-zA-Z0-9_]+$/,
    usernameReplace: /[^a-zA-Z0-9]/g
}