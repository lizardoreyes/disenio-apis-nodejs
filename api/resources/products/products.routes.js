const express = require('express');
const uuid = require('uuid').v4;
const passport = require("passport")

const productsRouter = express.Router();
const log = require("../../../utils/logger");
const productController = require("./products.controller")
const validateProduct = require("./products.validate")
const jwtAuthenticated = passport.authenticate("jwt", { session:false })
const { processErrors } = require("../../libs/errorHandler")
const { ProductoNoExiste, UsuarioNoEsDueño } = require("./products.errors")

const validateId = (req, res, next) => {
    const { id } = req.params
    // Regex para asegurarnos que se pase un id correcto
    if(id.match(/^[a-fA-F0-9]{24}$/) === null) {
        res.status(400).send(`El id [${id}] suministrado en el URL no es válido.`)
        return
    }
    next()
}

productsRouter.get("/", processErrors((req, res) => {
    return productController.getProducts()
        .then(products => {
            res.json(products)
        })
}))

productsRouter.post("/", [jwtAuthenticated, validateProduct], processErrors((req, res) => {
    return productController.createProduct(req.body, req.user.username)
        .then(product => {
            log.info("Producto agregado a la colección productos", product.toObject())
            res.status(201).json(product)
        })
}))

productsRouter.get("/:id", validateId, processErrors((req, res) => {
    const { id } = req.params
    return productController.getProduct(id)
        .then(product => {
            if(!product) throw new ProductoNoExiste(`Producto con id [${id}] no existe`)
            res.json(product)
        })
}))

// Reemplazamos totalmente un producto
productsRouter.put("/:id", [jwtAuthenticated, validateId, validateProduct] , processErrors(async (req, res) => {
    const { id } = req.params
    const { username } = req.user

    let productReplace = await productController.getProduct(id)
    if(!productReplace) {
        throw new ProductoNoExiste(`El producto con id [${id}] no existe.`)
    }

    if(productReplace.owner !== username) {
        log.warn(`Usuario [${username}] no es dueño del producto con id [${id}]. Dueño real es ${productReplace.owner}. Request no será procesado.`)
        throw new UsuarioNoEsDueño(`No eres dueño del producto con id [${id}]. Solo puedes modificar productos creados por ti.`)
    }

    productReplace = await productController.replaceProduct(id, req.body, username)
    log.info(`Producto con id [${id}] fue reemplazado con nuevo producto.`, productReplace.toObject())
    res.json(productReplace)
}))

productsRouter.delete("/:id", [jwtAuthenticated, validateId], processErrors(async (req, res) => {
    const { id } = req.params

    let productDelete = await productController.getProduct(id)
    if (!productDelete) {
        log.info(`Producto con id ${id} no existe. Nada que borrar.`)
        throw new ProductoNoExiste(`El producto con id [${id}] no existe. Nada que borrar`)
    }
    
    const username = req.user.username
    if(productDelete.owner !== username) {
        log.info(`Usuario [${username}] no es dueño del producto con id [${id}]. Dueño real es ${productDelete.owner}. Request no será procesado.`)
        throw new UsuarioNoEsDueño(`No eres dueño del producto con id ${id}. Solo puedes borrar productos creados por ti.`)
    }

    productDelete = await productController.deleteProduct(id)
    log.info(`Producto con id [${id}] fue borrado.`)
    res.json(productDelete)

}))

module.exports = productsRouter