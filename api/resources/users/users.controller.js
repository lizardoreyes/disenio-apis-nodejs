const User = require("./users.model");

const getUsers = () => {
    return User.find({})
}

const createUser = (user, hashedPassword) => {
    return new User({
        ...user,
        password: hashedPassword
    }).save()
}

const userExists = (username, email) => {
    return new Promise((resolve, reject) => {
        User.find().or([{ username }, { email }])
            .then(users => resolve(users.length > 0))
            .catch(err => reject(err))
    })
}

const getUser = ({ username, id, email }) => {
    if(username) return User.findOne({username})
    if(id) return User.findById(id)
    if(email) return User.findOne({email})
    throw new Error("Funcion obtener usuario del controller fue llamada sin especificar username o id.")
}

module.exports = {
    getUsers,
    createUser,
    userExists,
    getUser
}