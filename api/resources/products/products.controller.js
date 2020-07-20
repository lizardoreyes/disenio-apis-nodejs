const Product = require("./products.model");

const createProduct = (product, owner) => {
    return new Product({...product, owner})
        .save()
}

const getProducts = () => {
    return Product.find({})
}

const getProduct = id => {
    return Product.findById(id)
}

const replaceProduct = (id, product, username) => {
    return Product.findOneAndUpdate({_id: id}, {
        ...product, owner: username
    }, {
        new: true // para que envie el producto modificado
    })
}

const deleteProduct = id => {
    return Product.findByIdAndDelete(id)
}

const saveUrlImage = (id, urlImage) => {
    return Product.findOneAndUpdate({ _id: id },{ image: urlImage }, { new: true })
}

module.exports = {
    createProduct,
    getProducts,
    getProduct,
    replaceProduct,
    deleteProduct,
    saveUrlImage
}