const Joi = require('@hapi/joi');
const log = require("../../../utils/logger");

const blueprintProduct = Joi.object({
    title: Joi.string().max(100).required(),
    price: Joi.number().positive().precision(2).required(),
    currency: Joi.string().length(3).uppercase().required()
})

module.exports = (req, res, next) => {
    let result = blueprintProduct.validate(req.body, { abortEarly: false, convert: false })
    if(result.error === undefined) {
        next()
    } else {
        const errors = result.error.details.reduce((acc, err) => acc + `[${err.message}]`, "")
        log.warn(`El siguiente producto no paso la validación`, req.body, errors)
        res.status(400).send(`El producto en el body debe especificar titulo, precio y moneda. Errores en tu request: ${errors}`)
    }
}