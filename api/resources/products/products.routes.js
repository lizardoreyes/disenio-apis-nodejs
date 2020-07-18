const express = require('express');
const uuid = require('uuid').v4;
const _ = require("underscore")
const log = require("../../../utils/logger")
const { products } = require('./../../../database');
const productsRouter = express.Router();
const validateProduct = require("./products.validate")
const passport = require("passport")
const jwtAuthenticated = passport.authenticate("jwt", { session:false })

productsRouter.get("/", (req, res) => {
    res.json(products)
})

productsRouter.post("/", [jwtAuthenticated, validateProduct], (req, res) => {
    const newProduct = {
        ...req.body,
        id: uuid(),
        owner: req.user.username
    }

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
productsRouter.put("/:id", [jwtAuthenticated, validateProduct] ,(req, res) => {
    const replaceProduct = {
        ...req.body,
        id: req.params.id,
        owner: req.user.username
    }

    const pos = products.findIndex(product => product.id === replaceProduct.id)

    if (pos === -1) {
        res.status(404).send(`El producto con id [${replaceProduct.id}] no existe`)
    } else {
        if(products[pos].owner !== replaceProduct.owner) {
            log.info(`Usuario ${req.user.username} no es dueño del producto con id ${replaceProduct.id}. Dueño real es ${products[pos].owner}. Request no será procesado.`)
            res.status(401).send(`No eres dueño del producto con id ${replaceProduct.id}. Solo puedes modificar productos creados por ti.`)
        } else {
            products[pos] = replaceProduct
            log.info(`Producto con id ${replaceProduct.id} reemplazado con nuevo producto`, products[pos])
            res.json(products[pos])
        }

    }
})

productsRouter.delete("/:id", jwtAuthenticated, (req, res) => {
    const pos = products.findIndex(product => product.id === req.params.id)
    if (pos === -1) {
        log.warn(`Producto con id ${req.params.id} no existe. Nada que borrar.`)
        res.status(404).send(`El producto con id [${req.params.id}] no existe`)
        return
    }

    if(products[pos].owner !== req.user.username) {
        log.info(`Usuario ${req.user.username} no es dueño del producto con id ${products[pos].id}. Dueño real es ${products[pos].owner}. Request no será procesado.`)
        res.status(401).send(`No eres dueño del producto con id ${products[pos].id}. Solo puedes borrar productos creados por ti.`)
    } else {
        log.info(`Produto con id ${req.params.id} fue borrado.`)
        const product = products.splice(pos, 1)
        res.json(product)
    }

})

module.exports = productsRouter