const express = require('express');
const bodyParser = require("body-parser");
const uuid = require('uuid').v4;
const _ = require("underscore")
const app = express();

app.use(bodyParser.json())

// Base de datos en memoria
let products = [
    {id: "12", title: "Mackbook Pro", price: 1300, currency: "USD"},
    {id: "21", title: "Television 14'", price: 500, currency: "USD"},
    {id: "14", title: "Teclado m90", price: 90, currency: "USD"}
]

app.route("/productos")
    .get((req, res) => {
        res.json(products)
    })
    .post((req, res) => {
        const newProduct = {id: uuid(), ...req.body}
        if(!newProduct.title || !newProduct.price || !newProduct.currency) {
            // Bad Request
            res.status(400).send(`Tu producto debe especificar un titulo, precio y moneda`)
            return
        }
        products.push(newProduct)
        res.status(201).json(newProduct)
    })

app.route("/productos/:id")
    .get((req, res) => {
        const pos = products.findIndex(product => product.id === req.params.id)
        if (pos === -1) {
            res.status(404).send(`El producto con id [${req.params.id}] no existe`)
            return
        }
        res.json(products[pos])
    })
    // Reemplazamos totalmente un producto
    .put((req, res) => {
        if(!req.body.title || !req.body.price || !req.body.currency) {
            // Bad Request
            res.status(400).send(`Tu producto debe especificar un titulo, precio y moneda`)
            return
        }

        const pos = products.findIndex(product => product.id === req.params.id)
        if (pos === -1) {
            res.status(404).send(`El producto con id [${req.params.id}] no existe`)
            return
        }
        products[pos] = {...req.body, id: products[pos].id}
        res.json(products[pos])
    })
    .delete((req, res) => {
        const pos = products.findIndex(product => product.id === req.params.id)
        if (pos === -1) {
            res.status(404).send(`El producto con id [${req.params.id}] no existe`)
            return
        }
        const product = products.splice(pos, 1)
        res.json(product)
    })


app.get("/", (req, res) => {
    res.send("API funcionando")
})

app.listen(3000, err => {
    if (err) throw new Error(err)
    console.log("Servidor iniciado en el puerto 3000")
})