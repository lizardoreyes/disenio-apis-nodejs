const express = require('express');
const uuid = require('uuid').v4;
const _ = require("underscore")
const { products } = require('./../../../database');
const productsRouter = express.Router();

productsRouter.get("/", (req, res) => {
    res.json(products)
})

productsRouter.post("/", (req, res) => {
    const newProduct = {id: uuid(), ...req.body}
    if(!newProduct.title || !newProduct.price || !newProduct.currency) {
        // Bad Request
        res.status(400).send(`Tu producto debe especificar un titulo, precio y moneda`)
        return
    }
    products.push(newProduct)
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
productsRouter.put("/:id", (req, res) => {
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

productsRouter.delete("/:id", (req, res) => {
    const pos = products.findIndex(product => product.id === req.params.id)
    if (pos === -1) {
        res.status(404).send(`El producto con id [${req.params.id}] no existe`)
        return
    }
    const product = products.splice(pos, 1)
    res.json(product)
})

module.exports = productsRouter