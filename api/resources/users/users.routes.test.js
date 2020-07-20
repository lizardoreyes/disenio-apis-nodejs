const request = require("supertest")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");

const User = require("./users.model")
const { app, server } = require("../../../index")
const config = require('../../../config');

const dummyUsers = [
    {
        username: "alejandro",
        email: "alejandro@gmail.com",
        password: "123456"
    },
    {
        username: "david",
        email: "david@gmail.com",
        password: "123456"
    },
    {
        username: "alberto",
        email: "alberto@gmail.com",
        password: "123456"
    }
]

function usuarioExisteYAtributosSonCorrectos(user, done) {
    User.find({username: user.username})
        .then(users => {
            expect(users).toBeInstanceOf(Array)
            expect(users).toHaveLength(1)
            expect(users[0].username).toEqual(user.username)
            expect(users[0].email).toEqual(user.email)

            const iguales = bcrypt.compareSync(user.password, users[0].password)
            expect(iguales).toBeTruthy()
            done()
        })
        .catch(err => {
            done(err)
        })
}

async function usuarioNoExiste(user, done) {
    try {
        const users = await User.find().or({username:user.username}, {email:user.email})
        expect(users).toHaveLength(0)
        done()
    } catch (err) {
        done(err)
    }
}

describe("Usuarios", () => {
    // Antes de cada test
    beforeEach(done => {
        User.deleteMany({}, err => {
            done()
        })
    })

    // Despues que todos los tests hayan sido ejecutados
    afterAll(async () => {
        server.close()
        await mongoose.disconnect()
    })

    describe("GET /users", () => {
        test("Si no hay usuarios, debería retornar un array vació", done => {
            request(app)
                .get("/users")
                .end((err, res) => {
                    expect(res.status).toBe(200)
                    expect(res.body).toBeInstanceOf(Array)
                    expect(res.body).toHaveLength(0)
                    done()
                })
        })

        test("Si existen usuarios, debería retornarlos en un array", done => {
            Promise.all(dummyUsers.map(user => (new User(user)).save()))
                .then(users => {
                    request(app)
                        .get("/users")
                        .end((err, res) => {
                            expect(res.status).toBe(200)
                            expect(res.body).toBeInstanceOf(Array)
                            expect(res.body).toHaveLength(users.length)
                            done()
                        })
                })
        })
    })

    describe("POST /users", () => {
        test("Un usuario que cumple las condiciones debería ser creado", done => {
            request(app)
                .post("/users")
                .send(dummyUsers[0])
                .end((err, res) =>  {
                    expect(res.status).toBe(201)
                    expect(typeof res.text).toBe("string")
                    expect(res.text).toEqual("Usuario creado exitósamente.")
                    usuarioExisteYAtributosSonCorrectos(dummyUsers[0], done)
                })
        })

        test("Crear un usuario con un username ya registrado debería fallar", done => {
            Promise.all(dummyUsers.map(user => (new User(user)).save()))
                .then(users => {
                    request(app)
                        .post("/users")
                        .send({
                            username: "david",
                            email: "david2@gmail.com",
                            password: "123456"
                        })
                        .end((err, res) => {
                            expect(res.status).toBe(409)
                            expect(typeof res.text).toBe("string")
                            done()
                        })
                })
        })

        test("Crear un usuario con un email ya registrado debería fallar", done => {
            Promise.all(dummyUsers.map(user => (new User(user)).save()))
                .then(users => {
                    request(app)
                        .post("/users")
                        .send({
                            username: "david2",
                            email: "david@gmail.com",
                            password: "123456"
                        })
                        .end((err, res) => {
                            expect(res.status).toBe(409)
                            expect(typeof res.text).toBe("string")
                            done()
                        })
                })
        })

        test("Un usuario sin username no debería ser creado", done => {
            request(app)
                .post("/users")
                .send({
                    email: "david2@gmail.com",
                    password: "1234567890"
                })
                .end((err, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe("string")
                    done()
                })
        })



        test('Un usuario sin contraseña no debería ser creado', (done) => {
            request(app)
                .post("/users")
                .send({
                    username: "lizardo2",
                    email: "lizardo2@gmail.com"
                })
                .end((err, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe("string")
                    done()
                })
        })

        test('Un usuario sin email no debería ser creado', (done) => {
            request(app)
                .post("/users")
                .send({
                    username: "lizardo2",
                    password: "3456677"
                })
                .end((err, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe("string")
                    done()
                })
        })

        test('Un usuario con un email inválido no debería ser creado', (done) => {
            const user = {
                username: "lizardo2",
                email: "lizardo2@",
                password: "3456677"
            }

            request(app)
                .post("/users")
                .send(user)
                .end((err, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe("string")
                    usuarioNoExiste(user, done)
                })
        })

        test('Un usuario con un username con menos de 3 caracteres no debería ser creado', (done) => {
            const user = {
                username: "li",
                email: "lizardo2@gmail.com",
                password: "3456677"
            }

            request(app)
                .post("/users")
                .send(user)
                .end((err, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe("string")
                    usuarioNoExiste(user, done)
                })
            }
        )

        test('Un usuario con un username con más de 30 caracteres no debería ser creado', (done) => {
            const user = {
                username: "lizardo".repeat(10),
                email: "lizardo2@gmail.com",
                password: "3456677"
            }

            request(app)
                .post("/users")
                .send(user)
                .end((err, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe("string")
                    usuarioNoExiste(user, done)
                })
        })

        test('Un usuario cuya contraseña tenga menos de 6 caracteres no debería ser creado', (done) => {
            const user = {
                username: "lizardo23",
                email: "lizardo2@gmail.com",
                password: "12345"
            }

            request(app)
                .post("/users")
                .send(user)
                .end((err, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe("string")
                    usuarioNoExiste(user, done)
                })
            }
        )

        test('Un usuario cuya contraseña tenga más de 200 caracteres no debería ser creado', (done) => {
            const user = {
                username: "lizard2",
                email: "lizardo2@gmail.com",
                password: "password".repeat(40)
            }

            request(app)
                .post("/users")
                .send(user)
                .end((err, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe("string")
                    usuarioNoExiste(user, done)
                })
            }
        )

        test('El username y email de un usuario válido deben ser guardados en lowercase', (done) => {
            const user = {
                username: "LizardO2",
                email: "LizarDO2@GMAIL.com",
                password: "password"
            }

            request(app)
                .post("/users")
                .send(user)
                .end((err, res) => {
                    expect(res.status).toBe(201)
                    expect(typeof res.text).toBe("string")
                    usuarioExisteYAtributosSonCorrectos({
                        username: user.username.toLowerCase(),
                        email: user.email.toLowerCase(),
                        password: user.password
                    }, done)
                })
        })
    })

    describe("POST /users/login", () => {
        test("Login debería fallar para un request que no tiene username", done => {
            const bodyLogin = {
                password: "contraseña"
            }
            request(app)
                .post("/users/login")
                .send(bodyLogin)
                .end((err, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe("string")
                    done()
                })
        })

        test("Login debería fallar para un request que no tiene password", done => {
            const bodyLogin = {
                username: "lizardo23"
            }
            request(app)
                .post("/users/login")
                .send(bodyLogin)
                .end((err, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe("string")
                    done()
                })
        })

        test("Login debería fallar para un usuario que no esta registrado", done => {
            const bodyLogin = {
                username: "lizardo124",
                password: "contraseña"
            }
            request(app)
                .post("/users/login")
                .send(bodyLogin)
                .end((err, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe("string")
                    done()
                })
        })

        test("Login debería fallar para un usuario registrado que suministra una contraseña incorrecta", done => {
            const user = {
                username: "lizardo",
                email: "lizardo@gmail.com",
                password: "soyunacontraseña"
            }

            new User({
                username: user.username,
                email: user.email,
                password: bcrypt.hashSync(user.password, 10)
            }).save().then(newUser => {
                request(app)
                    .post("/users/login")
                    .send({
                        username: user.username,
                        password: "password incorrecto"
                    })
                    .end((err, res) => {
                        expect(res.status).toBe(400)
                        expect(typeof res.text).toBe("string")
                        done()
                    })
            })
        })

        test("Usuario registrado debería obtener un JWT token al hacer login con credenciales incorrectas", done => {
            const user = {
                username: "lizardo",
                email: "lizardo@gmail.com",
                password: "soyunacontraseña"
            }

            new User({
                username: user.username,
                email: user.email,
                password: bcrypt.hashSync(user.password, 10)
            }).save()
                .then(newUser => {
                request(app)
                    .post("/users/login")
                    .send({
                        username: user.username,
                        password: user.password
                    })
                    .end((err, res) => {
                        expect(res.status).toBe(200)
                        expect(res.body.token).toEqual(jwt.sign({id:newUser._id}, config.jwt.secret, {expiresIn: config.jwt.expiration}))
                        done()
                    })
            })
                .catch(err => {
                    done(err)
                })
        })

        test("Al hacer login no debe importar la capitalizacion del username", done => {
            const user = {
                username: "lizardo",
                email: "lizardo@gmail.com",
                password: "soyunacontraseña"
            }

            new User({
                username: user.username,
                email: user.email,
                password: bcrypt.hashSync(user.password, 10)
            }).save()
                .then(newUser => {
                    request(app)
                        .post("/users/login")
                        .send({
                            username: user.username.toUpperCase(),
                            password: user.password
                        })
                        .end((err, res) => {
                            expect(res.status).toBe(200)
                            expect(res.body.token).toEqual(jwt.sign({id:newUser._id}, config.jwt.secret, {expiresIn: config.jwt.expiration}))
                            done()
                        })
                })
                .catch(err => {
                    done(err)
                })
        })

    })
})