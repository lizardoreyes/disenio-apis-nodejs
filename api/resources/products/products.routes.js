const express = require('express');
const uuid = require('uuid').v4;
const _ = require("underscore")
const passport = require("passport")

const productsRouter = express.Router();
const log = require("../../../utils/logger");
const productController = require("./products.controller")
const { products } = require('./../../../database');
const validateProduct = require("./products.validate")
const jwtAuthenticated = passport.authenticate("jwt", { session:false })

const validateId = (req, res, next) => {
    const { id } = req.params
    // Regex para asegurarnos que se pase un id correcto
    if(id.match(/^[a-fA-F0-9]{24}$/) === null) {
        res.status(401).send(`El id [${id}] suministrado en el URL no es válido.`)
        return
    }
    next()
}

productsRouter.get("/", (req, res) => {
    productController.getProducts()
        .then(products => {
            res.json(products)
        })
        .catch(err => {
            res.status(500).send(`Error al leer los productos de la base de datos.`)
        })
})

productsRouter.post("/", [jwtAuthenticated, validateProduct], (req, res) => {
    productController.createProduct(req.body, req.user.username)
        .then(product => {
            log.info("Producto agregado a la colección productos", product.toObject())
            res.status(201).json(product)
        })
        .catch(err =>{
            log.error("Producto no pudo ser creado", err)
            res.status(500).send("Error ocurrió al tratar de crear el producto.")
        })
})

productsRouter.get("/:id", validateId, (req, res) => {
    const { id } = req.params
    productController.getProduct(id)
        .then(product => {
            if(!product) {
                res.status(404).send(`Producto con id [${id}] no existe`)
            } else {
                res.json(product)
            }
        })
        .catch(err => {
            log.error(`Excepción ocurrio al tratar de obtener producto con ${id}`, err)
            res.status(500).send(`Error ocurrio obteniendo un producto con id [${id}]`)
        })
})

// Reemplazamos totalmente un producto
productsRouter.put("/:id", [jwtAuthenticated, validateId, validateProduct] , async (req, res) => {
    const { id } = req.params
    const { username } = req.user
    let productReplace

    try {
        productReplace = await productController.getProduct(id)
    } catch (err) {
        log.error(`Excepcion ocurrió al procesar la modificación de producto con id [${id}]`, err)
        res.status(500).send(`Error ocurrió modificando producto con id [${id}]`)
        return
    }

    if(!productReplace) {
        res.status(404).send(`El producto con id [${id}] no existe.`)
        return
    }

    if(productReplace.owner !== username) {
        log.warn(`Usuario [${username}] no es dueño del producto con id [${id}]. Dueño real es ${productReplace.owner}. Request no será procesado.`)
        res.status(401).send(`No eres dueño del producto con id [${id}]. Solo puedes modificar productos creados por ti.`)
        return
    }

    try {
        console.log(id, productReplace, username)
        productReplace = await productController.replaceProduct(id, req.body, username)
        log.info(`Producto con id [${id}] fue reemplazado con nuevo producto.`, productReplace.toObject())
        res.json(productReplace)
    } catch (err) {
        log.error(`Excepcion ocurrió al tratar de reemplazar producto con id [${id}]`, err)
        res.status(500).send(`Error ocurrió modificando producto con id [${id}]`)
        return
    }
})

productsRouter.delete("/:id", [jwtAuthenticated, validateId], async (req, res) => {
    const { id } = req.params
    let productDelete
    
    try {
        productDelete = await productController.getProduct(id)
    } catch (err) {
        log.error(`Excepcion ocurrió al procesar el borrado de producto con id [${id}]`, err)
        res.status(500).send(`Error ocurrió borrando producto con id [${id}]`)
        return
    }

    if (!productDelete) {
        log.info(`Producto con id ${id} no existe. Nada que borrar.`)
        res.status(404).send(`El producto con id [${id}] no existe`)
        return
    }
    
    const username = req.user.username
    if(productDelete.owner !== username) {
        log.info(`Usuario [${username}] no es dueño del producto con id [${id}]. Dueño real es ${productDelete.owner}. Request no será procesado.`)
        res.status(401).send(`No eres dueño del producto con id ${id}. Solo puedes borrar productos creados por ti.`)
        return
    }

    try {
        productDelete = await productController.deleteProduct(id)
        log.info(`Producto con id [${id}] fue borrado.`)
        res.json(productDelete)
    } catch (err) {
        log.error(`Excepcion ocurrió al procesar el borrado de producto con id [${id}]`, err)
        res.status(500).send(`Error ocurrió borrando producto con id [${id}]`)
        return
    }
})

module.exports = productsRouter