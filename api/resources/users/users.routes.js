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
const { processErrors } = require("../../libs/errorHandler")
const { DatosDeUsuarioYaEnUso, CredencialesIncorrectas } = require("./users.errors")


const transformBodyALowerCase = (req, res, next) => {
    req.body.username && (req.body.username = req.body.username.toLowerCase())
    req.body.email && (req.body.email = req.body.email.toLowerCase())
    next()
}

usersRouter.get("/", processErrors((req, res) => {
    return userController.getUsers()
        .then(users => {
            res.json(users)
        })
}))

usersRouter.post("/", [validateUser, transformBodyALowerCase], processErrors((req, res) => {
    const newUser = req.body;
    return userController.userExists(newUser.username, newUser.email)
        .then(exists => {
            if(exists) {
                log.info(`Email [${newUser.email}] o username [${newUser.username}] ya existen en la base de datos`)
                throw new DatosDeUsuarioYaEnUso()
            }
            return bcrypt.hash(newUser.password, 10)
        })
        .then(hashedPassword => {
            return userController.createUser(newUser, hashedPassword)
                .then(user => {
                    res.status(201).send("Usuario creado exitósamente.")
                })
        })
}))

usersRouter.post("/login", [validateLogin, transformBodyALowerCase], processErrors(async (req, res) => {
    const userNotAuthenticated = req.body
    let userRegistered = await userController.getUser({
        username: userNotAuthenticated.username
    })

    if(!userRegistered) {
        log.info(`Usuario [${userNotAuthenticated.username}] no existe. No pudo ser autenticado`)
        throw new CredencialesIncorrectas()
    }

    let isPasswordCorrect = await bcrypt.compare(userNotAuthenticated.password, userRegistered.password)
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
        throw new CredencialesIncorrectas()
    }

}))

module.exports = usersRouter
