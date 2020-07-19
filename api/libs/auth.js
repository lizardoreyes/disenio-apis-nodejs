const _ = require("underscore")
const bcrypt = require("bcrypt")
const passportJWT = require("passport-jwt")

const log = require("../../utils/logger")
const config = require('../../config');
const userController = require("../resources/users/users.controller")

// Authorization: bearer xxxx.yyyy.zzzz
const jwtOptions = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}

const jwtStrategy = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {

    userController.getUser({id: jwtPayload.id})
        .then(user => {
            if(!user) {
                log.info(`JWT token no es válido. Usuario con id ${jwtPayload.id} no existe.`)
                return next(null, false)
            }

            log.info(`Usuario ${user.username} suministro un token valido. Autenticación completada.`)
            next(null, {
                id: user.id,
                username: user.username
            })
        })
        .catch(err => {
            log.error(`Error ocurrio al tratar de validar un token.`, err)
            return next(err)
        })
})

module.exports = jwtStrategy;