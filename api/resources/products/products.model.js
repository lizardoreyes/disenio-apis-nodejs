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
        type: Number,
        maxLength: 3,
        minLength: 3,
        required: [true, "Producto debe tener una moneda"]
    },
    owner: {
        type: String,
        required: [true, "Producto debe estas asociado a un usuario"]
    }
})

module.exports = mongoose.model("product", productSchema)