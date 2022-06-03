const lodash = require('lodash')

const dummy = () => {
    return 1
}
  
const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => {
        return sum + blog.likes
    }, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null
    }
    const favorite = blogs.reduce((prev, current) => {
        return prev.likes > current.likes ? prev : current
    })
    return {
        title: favorite.title,
        author: favorite.author,
        likes: favorite.likes
    }
}


const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return null
    }
    const authorCount = lodash.countBy(blogs, 'author')

    const bestAuthor = Object.keys(authorCount).reduce((prev, current) => {
        return authorCount[prev] > authorCount[current] ? prev : current
    }
    )
    return {
        author: bestAuthor,
        blogs: authorCount[bestAuthor]
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) {
        return null
    }
    const likeCount = lodash(blogs)
        .groupBy('author')
        .map((objs, key) => ({ author: key, likes: lodash.sumBy(objs, 'likes') }))
        .value()

    return likesCount.reduce((prev, current) => {
        return prev.likes > current.likes ? prev : current
    })
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }