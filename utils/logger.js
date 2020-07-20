const winston = require('winston');
const config = require("../config");

/*  Winston
    https://github.com/winstonjs/winston/blob/master/docs/transports.md

    Niveles de Logs:
    error: 0
    warn: 1
    info: 2
    verbose: 3
    debug: 4
    silly: 5
 */

const includeDate = winston.format(info => {
    info.message = `${new Date().toISOString()} ${info.message}`
    return info
})

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: config.suprimirLogs ? "error" : "debug",
            handleExceptions: true,
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            level: 'info',
            handleExceptions: true,
            format: winston.format.combine(
                includeDate(),
                winston.format.simple()
            ),
            maxsize: 5120000, // 5Mb
            maxFiles: 5,
            filename: `${__dirname}/../logs/log-de-application.log`
        })
    ]
})

module.exports = logger

//  USOS
// logger.log({ level: 'info', message: 'Hello distributed log files!' });
// logger.error( {message: "mensaje"})
// logger.warn("Advertencia")
// logger.info("Hola soy logger")
// logger.verbose("verbose")
// logger.debug("Debug")
// logger.silly("silly")