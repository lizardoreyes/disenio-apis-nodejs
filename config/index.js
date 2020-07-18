const environment = process.env.NODE_ENV || "development";

const baseConfig = {
    jwt: {},
    port: 3000
}

let environmentConfig = {}

switch (environment) {
    case "development":
    case "dev":
    case "desarrollo":
        environmentConfig = require("./dev")
        break
    case "production":
    case "prod":
    case "produccion":
        environmentConfig = require("./prod")
        break
    default:
        environmentConfig = require("./dev")
}

module.exports = {
    ...baseConfig, ...environmentConfig
}