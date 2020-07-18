const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const productsRouter = require('./api/resources/products/products.route');
const logger = require('./utils/logger');


app.use(bodyParser.json())

app.use("/products", productsRouter)


app.get("/", (req, res) => {
    res.send("API funcionando")
})

app.listen(3000, err => {
    if (err) throw new Error(err)
    logger.info("Servidor iniciado en el puerto 3000")
})