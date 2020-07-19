const express = require('express');
const uuid = require('uuid').v4;
const _ = require("underscore")
const log = require("../../../utils/logger")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const usersRouter = express.Router();
const {validateUser, validateLogin} = require("./users.validate");
const config = require('../../../config');
const userController = require("./users.controller")

const transformBodyALowerCase = (req, res, next) => {
    req.body.username && (req.body.username = req.body.username.toLowerCase())
    req.body.email && (req.body.email = req.body.email.toLowerCase())
    next()
}

usersRouter.get("/", (req, res) => {
    userController.getUsers()
        .then(users => {
            res.json(users)
        })
        .catch(err => {
            log.error("Error al obtener todos los usuarios", err)
            res.sendStatus(500)
        })
})

usersRouter.post("/", [validateUser, transformBodyALowerCase], (req, res) => {
    const newUser = req.body

    userController.userExists(newUser.username, newUser.email)
        .then(exists => {
            if(exists) {
                log.info(`Email [${newUser.email}] o username [${newUser.username}] ya existen en la base de datos`)
                return res.status(409).send("El email o username ya estan asociados a una cuenta.")
            }

            bcrypt.hash(newUser.password, 10, (err, hashedPassword) => {
                if(err) {
                    log.error("Error ocurrio al tratar de obtener el hash de una contraseña", err)
                    return res.status(500).send("Ocurrió un error proceso creación del usuario")
                }

                userController.createUser(newUser, hashedPassword)
                    .then(user => {
                        res.status(201).send("Usuario creado exitosamente")
                    })
                    .catch(err => {
                        log.error("Error ocurrió al tratar de crear nuevo usuario", err)
                        res.status(500).send("Error ocurrió al tratar de crear nuevo usuario.")
                    })

            })
        })
        .catch(err => {
            log.error(`Error ocurrio al tratar de verificar si usuario [${newUser.username}] con email [${newUser.email}] ya existe.`)
            return res.status(500).send("Error ocurrio al tratar de crear nuevo usuario")
        })

})

usersRouter.post("/login", [validateLogin, transformBodyALowerCase], async (req, res) => {
    const userNotAuthenticated = req.body
    let userRegistered

    try {
        userRegistered = await userController.getUser({
            username: userNotAuthenticated.username
        })
    } catch (err) {
        log.error(`Error ocurrió al tratar de determinar si el usuario [${userNotAuthenticated.username}] ya existe`, err)
        return res.status(500).send("Error ocurrió durante el proceso de login.")
    }

    if(!userRegistered) {
        log.error(`Usuario [${userNotAuthenticated.username}] no existe. No pudo ser autenticado`)
        return res.status(400).send("Credenciales incorrectas. Asegúrate que el username y contraseña sean correctas.")
    }

    let isPasswordCorrect
    try {
        isPasswordCorrect = await bcrypt.compare(userNotAuthenticated.password, userRegistered.password)
    } catch (err) {
        log.info(`Error al tratar de verificar si la contraseña es correcta`, err)
        return res.status(500).send("Error ocurrió durante el proceso de login.")
    }

    if (isPasswordCorrect) {
        // Generar token
        let token = jwt.sign({
            id: userRegistered.id
        }, config.jwt.secret, { expiresIn: config.jwt.expiration })
        log.info(`Usuario ${userRegistered.username} completo la autenticacion.`)
        res.json({ token })
    }
    else {
        log.info(`Usuario ${userNotAuthenticated.username} no completo la autenticacion. Contraseña incorrecta`)
        res.status(400).send("Credenciales incorrectas. Asegurate que el username y password sean correctas.")
    }

})

module.exports = usersRouter
