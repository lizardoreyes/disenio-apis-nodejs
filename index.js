const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan")
const passport = require("passport");
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/disenio-api-nodejs", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.connection.on("error", e => {
    logger.error("Fallo la conexion a mongodb")
    process.exit(1)
})

const productsRouter = require('./api/resources/products/products.routes');
const usersRouter = require("./api/resources/users/users.routes")
const config = require("./config")
const logger = require('./utils/logger');
const authJWT = require("./api/libs/auth");

app.use(morgan("short", {
    stream: {
        write: message => logger.info(message.trim())
    }
}))

app.use(bodyParser.json())

passport.use(authJWT)
app.use(passport.initialize())

app.use("/products", productsRouter)
app.use("/users", usersRouter)

app.listen(config.port, err => {
    if (err) throw new Error(err)
    logger.info(`Servidor iniciado en el puerto ${config.port}`)
})