const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const User = require('../models/user')
const usersInDb = require('../utils/list_helper').usersInDb

const initialUsers = [
    {
        username: 'root',
        name: 'Superuser',
        password: 'sekret'
    }
]

beforeEach ( async () => {
    await User.deleteMany({})

    let userObject = new User(initialUsers[0])
    await userObject.save()
})

describe('user creation', () => {
    test('a valid user can be added', async () => {
        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await usersInDb()
        expect(usersAtEnd.length).toBe(initialUsers.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('user password and username must be atleast 3 characters long', async () => {
        const newUser = {
            username: 'm',
            name: 'Matti Luukkainen',
            password: 'salainen'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAtEnd = await usersInDb()
        expect(usersAtEnd.length).toBe(initialUsers.length)
    })

    test('user username must be unique', async () => {
        const newUser = {
            username: 'root',
            name: 'Matti Luukkainen',
            password: 'salainen'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAtEnd = await usersInDb()
        expect(usersAtEnd.length).toBe(initialUsers.length)
    })
})





afterAll(() => {
    mongoose.connection.close()
})