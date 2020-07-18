const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan")
const productsRouter = require('./api/resources/products/products.routes');
const usersRouter = require("./api/resources/users/users.routes")
const logger = require('./utils/logger');
const passport = require("passport")
// Autenticacion basica de username y password
const BasicStrategy = require("passport-http").BasicStrategy

app.use(morgan("short", {
    stream: {
        write: message => logger.info(message.trim())
    }
}))

app.use(bodyParser.json())

passport.use(new BasicStrategy((username, password, done) => {
    if(username.valueOf() === "lizardo" && password.valueOf() === "123") {
        return done(null, true)
    } else {
        return done(null, false)
    }
}))
app.use(passport.initialize())

app.use("/products", productsRouter)
app.use("/users", usersRouter)
app.get("/", passport.authenticate("basic", { session:false }), (req, res) => {
    res.send("API funcionando")
})

app.listen(3000, err => {
    if (err) throw new Error(err)
    logger.info("Servidor iniciado en el puerto 3000")
})