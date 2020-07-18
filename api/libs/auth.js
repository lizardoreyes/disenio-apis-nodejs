const _ = require("underscore")
const bcrypt = require("bcrypt")
const passportJWT = require("passport-jwt")

const { users } = require("../../database")
const log = require("../../utils/logger")
const config = require('../../config');

// Authorization: bearer xxxx.yyyy.zzzz
const jwtOptions = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}

const jwtStrategy = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
    const { id } = jwtPayload
    const pos = users.findIndex(user => user.id === id)
    if (pos === -1) {
        log.info(`JWT token no es válido. Usuario con id ${id} no existe.`)
        next(null, false)
    } else {
        log.info(`Usuario ${users[pos].username} suministro un token valido. Autenticación completada.`)
        next(null, {
            id: users[pos].id,
            username: users[pos].username
        })
    }
})

module.exports = jwtStrategy;