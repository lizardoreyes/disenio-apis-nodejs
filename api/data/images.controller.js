const AWS = require('aws-sdk');
const config = require("../../config")

const s3Client = new AWS.S3({ ...config.s3 })

function guardarImagen(imagenData, nombreDelArchivo) {
    return s3Client.putObject({
        Body: imagenData,
        Bucket: "disenio-api-nodejs",
        Key: `imagenes/${nombreDelArchivo}`
    }).promise()
}

module.exports = {
    guardarImagen
}