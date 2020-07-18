const _ = require("underscore")
const log = require("../../utils/logger")
const { users } = require("../../database")
const bcrypt = require("bcrypt")

module.exports = (username, password, done) => {
    const pos = users.findIndex(user => user.username === username)
    if (pos === -1) {
        log.info(`Usuario ${username} no pudo ser autenticado.`)
        done(null, false)
        return
    } else {
        const hashedPassword = users[pos].password
        bcrypt.compare(password, hashedPassword, (err, res) => {
            if (res) {
                log.info(`Usuario ${username} completo la autenticacion.`)
                done(null, true)
            }
            else {
                log.info(`Usuario ${username} no completo la autenticacion. Contraseña incorrecta`)
                done(null, false)
            }
        })
    }
}