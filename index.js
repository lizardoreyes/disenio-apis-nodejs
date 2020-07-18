const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan")
const productsRouter = require('./api/resources/products/products.routes');
const usersRouter = require("./api/resources/users/users.routes")
const config = require("./config")
const logger = require('./utils/logger');
const passport = require("passport")

const authJWT = require("./api/libs/auth")

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