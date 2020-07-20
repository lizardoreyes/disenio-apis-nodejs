const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Producto debe tener un título."]
    },
    price: {
        type: Number,
        min: 0,
        required: [true, "Producto debe tener un precio"]
    },
    currency: {
        type: String,
        maxlength: 3,
        minlength: 3,
        required: [true, "Producto debe tener una moneda"]
    },
    owner: {
        type: String,
        required: [true, "Producto debe estas asociado a un usuario"]
    },
    image: {
        type: String
    }
})

module.exports = mongoose.model("product", productSchema)