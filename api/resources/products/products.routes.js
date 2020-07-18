const express = require('express');
const uuid = require('uuid').v4;
const _ = require("underscore")
const log = require("../../../utils/logger")
const { products } = require('./../../../database');
const productsRouter = express.Router();
const validateProduct = require("./products.validate")

productsRouter.get("/", (req, res) => {
    res.json(products)
})

productsRouter.post("/", validateProduct, (req, res) => {
    const newProduct = {id: uuid(), ...req.body}

    products.push(newProduct)
    log.info("Producto agregado a la colección productos", newProduct)
    res.status(201).json(newProduct)
})

productsRouter.get("/:id", (req, res) => {
    const pos = products.findIndex(product => product.id === req.params.id)
    if (pos === -1) {
        res.status(404).send(`El producto con id [${req.params.id}] no existe`)
        return
    }
    res.json(products[pos])
})

// Reemplazamos totalmente un producto
productsRouter.put("/:id", validateProduct ,(req, res) => {
    const pos = products.findIndex(product => product.id === req.params.id)
    if (pos === -1) {
        res.status(404).send(`El producto con id [${req.params.id}] no existe`)
        return
    }
    products[pos] = {...req.body, id: products[pos].id}
    log.info(`Producto con id ${req.params.id} reemplazado con nuevo producto`, products[pos])
    res.json(products[pos])
})

productsRouter.delete("/:id", (req, res) => {
    const pos = products.findIndex(product => product.id === req.params.id)
    if (pos === -1) {
        log.warn(`Producto con id ${req.params.id} no existe. Nada que borrar.`)
        res.status(404).send(`El producto con id [${req.params.id}] no existe`)
        return
    }
    const product = products.splice(pos, 1)
    res.json(product)
})

module.exports = productsRouter