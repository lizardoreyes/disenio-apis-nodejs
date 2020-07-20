const environment = process.env.NODE_ENV || "development";

const baseConfig = {
    jwt: {},
    port: 3000,
    suprimirLogs: false,
    s3: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_KEY
    }
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
    case "test":
        environmentConfig = require("./test")
        break
    default:
        environmentConfig = require("./dev")
}

module.exports = {
    ...baseConfig, ...environmentConfig
}