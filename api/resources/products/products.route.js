const express = require('express');
const uuid = require('uuid').v4;
const _ = require("underscore")
const Joi = require('@hapi/joi');
const { products } = require('./../../../database');
const productsRouter = express.Router();

const blueprintProduct = Joi.object({
    title: Joi.string().max(100).required(),
    price: Joi.number().positive().precision(2).required(),
    currency: Joi.string().length(3).uppercase()
})

const validateProduct = (req, res, next) => {
    let result = blueprintProduct.validate(req.body, { abortEarly: false, convert: false })
    if(result.error === undefined) {
        next()
    } else {
        const errors = result.error.details.reduce((acc, err) => acc + `[${err.message}]`, "")
        res.status(400).send(`El producto en el body debe especificar titulo, precio y moneda. Errores en tu request: ${errors}`)
    }
}

productsRouter.get("/", (req, res) => {
    res.json(products)
})

productsRouter.post("/", validateProduct, (req, res) => {
    const newProduct = {id: uuid(), ...req.body}

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
productsRouter.put("/:id", validateProduct ,(req, res) => {
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