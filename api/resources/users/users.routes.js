const express = require('express');
const uuid = require('uuid').v4;
const _ = require("underscore")
const log = require("../../../utils/logger")
const bcrypt = require("bcrypt")
const { users } = require('./../../../database');
const usersRouter = express.Router();
const validateUser = require("./users.validate");

usersRouter.get("/", (req, res) => {
    res.json(users)
})

usersRouter.post("/", validateUser, (req, res) => {
    const {username, password, email} = req.body
    const pos = users.findIndex(user => user.username === username || user.email === email)
    if (pos !== -1) {
        // Conflict
        log.info("Email o username ya existen en la base de datos")
        res.status(409).send("El email o username ya estan asociados a una cuenta.")
        return
    }
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if(err) {
            log.error("Error ocurrio al tratar de obtener el hash de una contraseña", err)
            return res.status(500).send("Ocurrió un error proceso creación del usuario")
        }

        users.push({username, email, password: hashedPassword})
        res.status(201).send("Usuario creado exitosamente")
    })

})

module.exports = usersRouter
