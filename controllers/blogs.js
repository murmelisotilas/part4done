const config = require('../utils/config')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogsRouter.get('/', async(request, response) => {
    const blogs = await Blog.find({}).populate('user')
    response.json(blogs)
})


blogsRouter.post('/', async(request, response) => {
    const body = request.body
    const user = request.user
    const token = request.token

    const decodedToken = jwt.verify(token, config.SECRET)
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    if (!user) {
        return response.status(401).json({ error: 'user missing or invalid' })
    }

    if(!body.title || !body.url) {
        return response.status(400).json({ error: 'title and url are required' })
    }
    if(body.likes === undefined) {
        body.likes = 0
    }

    const blog = await new Blog({
        title: body.title,
        author: body.author,
        user: user._id,
        url: body.url,
        likes: body.likes
    }).populate('user', { username: 1, name: 1 })


    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog.toJSON())
})

/*get blog by id*/
blogsRouter.get('/:id', async(request, response) => {
    const blog = await Blog.findById(request.params.id)
    if(!blog) {
        return response.status(404).json({ error: 'blog not found' })
    }
    response.json(blog)
})


blogsRouter.delete('/:id', async(request, response) => {
    const token = request.token
    const user = request.user

    const decodedToken = jwt.verify(token, config.SECRET)

    
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    const id = request.params.id
    const blog = await Blog.findById(id)

    if(!blog) {
        return response.status(404).json({ error: 'blog not found' })
    }

    if(blog.user.toString() === user.id.toString()) {
        await Blog.deleteOne({_id: id})
        response.status(204).end()
    }
    else {
        response.status(401).json({ error: 'user not authorized' })
    }


})

blogsRouter.put('/:id', async(request, response) => {
    const blog = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true })
    response.json(blog)
})



module.exports = blogsRouter