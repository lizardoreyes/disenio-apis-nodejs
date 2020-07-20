const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const request = require("supertest");
const mongoose = require("mongoose");

const User = require("../users/users.model")
const Product = require("./products.model")
const { app, server } = require("../../../index")
const config = require('../../../config');

// Cuidado con Race condition - Que los tests se cruzen con users

const productoYaEnBaseDeDatos = {
    title: "Mackbook Pro 13 Inches",
    price: 1300,
    currency: "USD",
    owner: "lizardo"
}

const newProduct = {
    title: "Televisor",
    price: 120.23,
    currency: "USD"
}

const idInexistente = "5f1439ad1b93d0424422e9c2"

const testUsuario = {
    username: "lizardo",
    email: "ciberutilidades@gmail.com",
    password: "1234567"
}

let authToken
let tokenInvalido = "eyJhbGciOaJIUzI1NiIsInR5cCI6IkpXVCJ9.ezJpZCI6IjVmMTQzOTQ5MWI5M2QwNDI0NDIyZTljMyIsImlhdCI6MTU5NTE2MDkwOSwiZXhwIjoxNTk1MjQ3MzA5fQ.CaJ6o1IBvF0Vn6-7JV6T5nuLfmiiYUC3fgHlwDALI0d"

function obtenerToken(done) {
    // Creamos un usuario y obtenemos su JWT token para las rutas que requieran login
    User.deleteMany({}, err => {
        if (err) done(err)
        request(app)
            .post("/users")
            .send(testUsuario)
            .end((err, res) => {
                expect(res.status).toBe(201)
                request(app)
                    .post("/users/login")
                    .send({
                        username: testUsuario.username,
                        password: testUsuario.password
                    })
                    .end((err, res) => {
                        if(err) done(err)
                        expect(res.status).toBe(200)
                        authToken = res.body.token
                        done()
                    })
            })
    })
}

describe("Productos", () => {
    // Antes de cada test
    beforeEach(done => {
        Product.deleteMany({}, err => {
            done()
        })
    })

    // Despues que todos los tests hayan sido ejecutados
    afterAll(async () => {
        server.close()
        await mongoose.disconnect()
    })

    describe("GET /productos/:id", () => {
        it('Tratar de obtener un producto con un id inválido debería retornar 400', done => {
            request(app)
                .get("/products/123")
                .end((err, res) => {
                    expect(res.status).toBe(400)
                    done()
                })
        });

        it('Tratar de obtener un producto que no existe debería retornar 404', done => {
            request(app)
                .get(`/products/${idInexistente}`)
                .end((err, res) => {
                    expect(res.status).toBe(404)
                    done()
                })
        });

        it('Deberia retornar un producto que si existe exitósamente', done => {
            (new Product(productoYaEnBaseDeDatos)).save()
                .then(product => {
                    request(app)
                        .get(`/products/${product._id}`)
                        .end((err, res) => {
                            expect(res.status).toBe(200)
                            expect(res.body).toBeInstanceOf(Object)
                            expect(res.body.title).toEqual(product.title)
                            expect(res.body.price).toEqual(product.price)
                            expect(res.body.currency).toEqual(product.currency)
                            expect(res.body.owner).toEqual(product.owner)
                            done()
                        })
                })
                .catch(err => {
                    done(err)
                })
        });
    })

    describe("POST /productos", () => {

        beforeAll(obtenerToken)

        it("Si el usuario provee un token válido y el producto también es válido, debería ser creado", done => {
            request(app)
                .post("/products")
                .set("Authorization", `Bearer ${authToken}`)
                .send(newProduct)
                .end((err, res) => {
                    if (err) done(err)
                    expect(res.status).toBe(201)
                    expect(res.body.title).toEqual(newProduct.title)
                    expect(res.body.price).toEqual(newProduct.price)
                    expect(res.body.currency).toEqual(newProduct.currency)
                    expect(res.body.owner).toEqual(testUsuario.username)
                    done()
                })
        })

        it("Si el usuario no provee un token válido deberia retornar 401", done => {
            request(app)
                .post("/products")
                .set("Authorization", `Bearer ${tokenInvalido}`)
                .send(newProduct)
                .end((err, res) => {
                    if (err) done(err)
                    expect(res.status).toBe(401)
                    done()
                })
        })

        it("Si al producto le falta el título, no debería ser creado", done => {
            request(app)
                .post("/products")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    currency: newProduct.currency,
                    price: newProduct.price
                })
                .end((err, res) => {
                    if (err) done(err)
                    expect(res.status).toBe(400)
                    done()
                })
        })

        it("Si al producto le falta el precio, no debería ser creado", done => {
            request(app)
                .post("/products")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    currency: newProduct.currency,
                    title: newProduct.title
                })
                .end((err, res) => {
                    if (err) done(err)
                    expect(res.status).toBe(400)
                    done()
                })
        })

        it("Si al producto le falta la moneda, no debería ser creado", done => {
            request(app)
                .post("/products")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    price: newProduct.price,
                    title: newProduct.title
                })
                .end((err, res) => {
                    if (err) done(err)
                    expect(res.status).toBe(400)
                    done()
                })
        })
    })

    describe('DELETE /productos/:id', () => {
        let idDelProductoExistente

        beforeAll(obtenerToken)

        beforeEach(done => {
            Product.deleteMany({}, err => {
                if (err) done(err)
                new Product(productoYaEnBaseDeDatos).save()
                    .then(product => {
                        idDelProductoExistente = product._id
                        done()
                    })
                    .catch(err => {
                        done(err)
                    })
            })
        })

        it("Tratar de obtener un producto con un id inválido debería retornar 400", done => {
            request(app)
                .delete("/products/123")
                .set("Authorization", `Bearer ${authToken}`)
                .end((err, res) => {
                    if (err) done(err)
                    expect(res.status).toBe(400)
                    done()
                })
        })

        it("Tratar de borrar un producto que no existe debería retornar 404", done => {
            request(app)
                .delete(`/products/${idInexistente}`)
                .set("Authorization", `Bearer ${authToken}`)
                .end((err, res) => {
                    if (err) done(err)
                    expect(res.status).toBe(404)
                    done()
                })
        })

        it("Si el usuario no provee un token de autenticacion válido, debería retornar 401", done => {
            request(app)
                .delete(`/products/${idInexistente}`)
                .set("Authorization", `Bearer ${tokenInvalido}`)
                .end((err, res) => {
                    if (err) done(err)
                    expect(res.status).toBe(401)
                    done()
                })
        })

        it('Si el usuario no es dueño del producto, debería retornar 401', done => {
            new Product({
                title: "Camisa",
                price: 12.12,
                currency: "USD",
                owner: "lizardo2"
            }).save()
                .then(product => {
                    request(app)
                        .delete(`/products/${product._id}`)
                        .set("Authorization", `Bearer ${authToken}`)
                        .end((err, res) => {
                            expect(res.status).toBe(401)
                            expect(res.text.includes("No eres dueño del producto con id")).toBe(true)
                            done()
                        })
                })
                .catch(err => {
                    done(err)
                })
        });

    });

    // describe('PUT /productos/:id', () => {
    //
    // });

})