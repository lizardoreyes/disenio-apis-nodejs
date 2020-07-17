const express = require('express');
const app = express();

app.get("/", (req, res) => {
    res.send("API funcionando")
})

app.listen(3000, err => {
    if (err) throw new Error(err)
    console.log("Servidor iniciado en el puerto 3000")
})