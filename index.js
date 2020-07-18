const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan")
const productsRouter = require('./api/resources/products/products.route');
const logger = require('./utils/logger');

app.use(morgan("short", {
    stream: {
        write: message => logger.info(message.trim())
    }
}))
app.use(bodyParser.json())

app.use("/products", productsRouter)
app.get("/", (req, res) => {
    res.send("API funcionando")
})

app.listen(3000, err => {
    if (err) throw new Error(err)
    logger.info("Servidor iniciado en el puerto 3000")
})