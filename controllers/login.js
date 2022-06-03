const config = require('../utils/config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const loginRouter = require('express').Router()

loginRouter.post('/', async(request, response) => {
    const { username, name, password } = request.body

    const user = await User.findOne({ username })
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash)

    if(!passwordCorrect) {
        return response.status(400).json({ error: 'invalid password' })
    }

    if(!user) {
        return response.status(400).json({ error: 'invalid username' })
    }
    
    const userForToken = {
        username: user.username,
        id: user._id
    }

    const token = jwt.sign(userForToken, config.SECRET, { expiresIn: 60*60 })
    response.status(200).send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter