const express = require('express');
const uuid = require('uuid').v4;
const _ = require("underscore")
const log = require("../../../utils/logger")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { users } = require('./../../../database');
const usersRouter = express.Router();
const {validateUser, validateLogin} = require("./users.validate");
const config = require('../../../config');

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

        users.push({id: uuid() ,username, email, password: hashedPassword})
        res.status(201).send("Usuario creado exitosamente")
    })

})

usersRouter.post("/login", validateLogin, (req, res) => {
    const { username, password } = req.body
    const pos = users.findIndex(user => user.username === username)
    if (pos === -1) {
        log.info(`Usuario ${username} no pudo ser autenticado.`)
        return res.status(400).send("Credenciales incorrectas. El usuario no existe")

    } else {
        const hashedPassword = users[pos].password
        bcrypt.compare(password, hashedPassword, (err, equals) => {
            if (equals) {
                // Generar token
                let token = jwt.sign({
                    id: users[pos].id
                }, config.jwt.secret, { expiresIn: config.jwt.expiration })
                log.info(`Usuario ${username} completo la autenticacion.`)
                res.json({ token })
            }
            else {
                log.info(`Usuario ${username} no completo la autenticacion. Contraseña incorrecta`)
                res.status(400).send("Credenciales incorrectas. Asegurate que el username y password sean correctas.")
            }
        })
    }

})

module.exports = usersRouter
