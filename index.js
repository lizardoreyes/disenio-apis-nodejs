const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan")
const productsRouter = require('./api/resources/products/products.routes');
const usersRouter = require("./api/resources/users/users.routes")
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
app.get("/", passport.authenticate("jwt", { session:false }), (req, res) => {
    logger.info(req.user)
    res.send("API funcionando")
})

app.listen(3000, err => {
    if (err) throw new Error(err)
    logger.info("Servidor iniciado en el puerto 3000")
})