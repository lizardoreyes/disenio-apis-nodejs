const Joi = require('@hapi/joi');
const fileType = require('file-type');
const log = require("../../../utils/logger");

const blueprintProduct = Joi.object({
    title: Joi.string().max(100).required(),
    price: Joi.number().positive().precision(2).required(),
    currency: Joi.string().length(3).uppercase().required()
})

const CONTENT_TYPES_PERMITIDOS = ["image/jpeg", "image/jpg", "image/png"]
exports.validarImagenDelProducto = (req, res, next) => {

    const contentType = req.get("content-type");
    if (!CONTENT_TYPES_PERMITIDOS.includes(contentType)) {
        log.warn(`Request para modificar imagen de producto con id [${req.params.id}] no tiene content-type valido [${contentType}]`)
        res.status(400).send(`Archivos de tipo ${contentType} no son soportados. Usar uno de ${CONTENT_TYPES_PERMITIDOS.join(", ")}`)
        return
    }

    const fileInfo = fileType(req.body)

    // Verificamos que este permitido la subida de ese tipo de archivo
    if (!CONTENT_TYPES_PERMITIDOS.includes(fileInfo.mime)) {
        const message = `Disparidad entre content-type [${contentType}] y tipo de archivo [${fileInfo.ext}]. Request no sera procesado`
        log.warn( `${message}. Request dirigido a producto con id {${req.params.id} de usuario [${req.user.username}]`)
        res.status(400).send(message)
        return
    }

    // Validamos que el tipo de archivo subido sea soportado para leer en el servidor
    // Esto se debe a fileType no soporte todos los tipos. Ejm no soporta PDF, TXT, HTML
    if(!fileInfo) {
        log.warn(`El tipo del archivo es desconocido. Request no sera procesado.`)
        res.status(400).send(`Archivos de tipos ${contentType} son desconocidos. Usar uno de ${CONTENT_TYPES_PERMITIDOS.join(", ")}`)
        return
    }

    // Validamos que el Content-Type del body sea igual a la cabecera del archivo
    if(contentType !== fileInfo.mime){
        console.log(`La cabecera del archivo dice ser ${fileInfo.mime}, pero el cuerpo del request dice que es de tipo [${contentType}].`)
        res.status(400).send(`La cabecera del archivo dice ser ${fileInfo.mime}, pero el cuerpo del request dice que es de tipo [${contentType}].`)
        return
    }

    req.extension = fileInfo.ext
    next()
}

exports.validateDataProduct = (req, res, next) => {
    let result = blueprintProduct.validate(req.body, { abortEarly: false, convert: false })
    if(result.error === undefined) {
        next()
    } else {
        const errors = result.error.details.reduce((acc, err) => acc + `[${err.message}]`, "")
        log.warn(`El siguiente producto no paso la validación`, req.body, errors)
        res.status(400).send(`El producto en el body debe especificar titulo, precio y moneda. Errores en tu request: ${errors}`)
    }
}