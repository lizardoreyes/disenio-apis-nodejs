const Joi = require('@hapi/joi');
const log = require("../../../utils/logger")

const blueprintUser = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(200).required(),
    email: Joi.string().email().required()
})

exports.validateUser = (req, res, next) => {
    let result = blueprintUser.validate(req.body, { abortEarly: false, convert: false })
    if(result.error === undefined) {
        next()
    } else {
        log.warn(`Producto fallo la validación`, result.error.details.map(err => err.message))
        res.status(400).send(`Información del usuario no cumple los requisitos. El nombre del usuario debe ser alfanúmerico y tener entre 3 y 30 carácteres. La contraseña debe tener entre 6 y 200 carácteres. Asegúrate de que el email sea válido.`)
    }
}

const blueprintLogin = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
})

exports.validateLogin = (req, res, next) => {
    const result = blueprintLogin.validate(req.body, { abortEarly: false, convert: false })
    if(result.error === undefined) {
        next()
    } else {
        res.status(400).send("Login falló. Debes especificar el username y contraseña del usuario. Ambos deben ser strings.")
    }
}