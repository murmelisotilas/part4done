const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const dB = require('./inDB')
const config = require('../utils/config')
const User = require('../models/user')
const Blog = require('../models/blog')

beforeEach (async () => {
    console.log('before each', dB.initialBlogs.length);
    await Blog.deleteMany({})
    await Blog.insertMany(dB.initialBlogs)
})

describe('when there is initially some blogs saved', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('amount of blogs is correct', async () => {
        const response = await api.get('/api/blogs')

        expect(response.body.length).toBe(dB.initialBlogs.length)
    })

    test('id is defined', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body[0].id).toBeDefined()
    })

    test('id property name is id', async () => {
        const response = await api.get('/api/blogs')
        
        const idPropertyName = response.body.map(blog => blog.id)

        for (const id of idPropertyName) {
            expect(id).toBeDefined()
        }
    })
})

describe('addition of a new blog', () => {
    let token = null
    beforeEach(async () => {
        const passwordHash = await bcrypt.hash('secret', 10)
        const user = new User({ username: 'name', passwordHash })
        await user.save()
        return(token = jwt.sign({ username: 'name', id: user._id }, config.SECRET))
    })

    test('succeeds with valid data', async () => {
        const newBlog = {
            title: 'Testi',
            author: 'Testaaja',
            url: 'www.testi.fi',
            likes: 5
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
            
        const blogsAtEnd = await dB.blogsInDb()
        expect(blogsAtEnd).toHaveLength(dB.initialBlogs.length + 1)
        expect(blogsAtEnd.map(blog => blog.title)).toContain('Testi')
    })

    test('if likes is not defined, it is expected to be 0', async () => {
        const newBlog = {
            title: 'Canonical string reduction',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        const blogsAtEnd = await dB.blogsInDb()
        expect(blogsAtEnd).toHaveLength(dB.initialBlogs.length + 1)
        expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toBe(0)
    })

    test('if title or url is missing, the response is 400', async () => {
        const newBlog = {   
            likes: 5,
        }
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(400)

        const blogsAtEnd = await dB.blogsInDb()
        expect(blogsAtEnd).toHaveLength(dB.initialBlogs.length)
    })
})

describe('deletion of a blog', () => {
    let token = null
    beforeEach(async () => {
        await Blog.deleteMany({})
        await User.deleteMany({})

        
        const passwordHash = await bcrypt.hash('12345678', 10)
        const user = new User({ username: 'name', passwordHash })
        await user.save()
        token = jwt.sign({ username: 'name', id: user._id }, config.SECRET)

        const newBlog = {
            title: 'Testi',
            author: 'Testaaja',
            url: 'www.testi.fi',
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

            return token
    })

    test('a blog can be deleted with status 204', async () => {
        const blogsAtStart = await Blog.find({}).populate('user')
        const blogToDelete = blogsAtStart[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

        const blogsAtEnd = await Blog.find({}).populate('user')
        expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

        const titles = blogsAtEnd.map(blog => blog.title)
        expect(titles).not.toContain(blogToDelete.title)
    })

    test('user not authorized to delete blog', async () => {
        const blogsAtStart = await Blog.find({}).populate('user')
        const blogToDelete = blogsAtStart[0]

        token = null 

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(401)

        const blogsAtEnd = await Blog.find({}).populate('user')

        expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
        expect(blogsAtStart).toEqual(blogsAtEnd)
    })
})

describe('modification of a certain blog', () => {
    test('a blog can be modified with status 200', async () => {
        const blogsAtStart = await dB.blogsInDb()
        const blogToModify = blogsAtStart[0]

        await api
            .put(`/api/blogs/${blogToModify.id}`)
            .send({ likes: 8 })
            .expect(200)

        const blogsAtEnd = await dB.blogsInDb()
        const modifiedBlog = blogsAtEnd[0]
        expect(blogsAtEnd).toHaveLength(dB.initialBlogs.length)
        expect(modifiedBlog.likes).toBe(8)
    })
})


afterAll (() => {
    mongoose.connection.close()
})

