const totalLikes = require('../utils/list_helper').totalLikes
describe('total likes', () => {
    test('total likes of multiple values', () => {
        const blogs = [
            { _id: '5a422aa71b54a676234d17f8', title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html', likes: 5, __v: 0 },
            { _id: '5a422aa71b54a676234d17f9', title: 'Canonical string reduction', author: 'Edsger W. Dijkstra', url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html', likes: 12, __v: 0 },
            { _id: '5a422aa71b54a676234d17fa', title: 'First class tests', author: 'Robert C. Martin', url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll', likes: 10, __v: 0 },
            { _id: '5a422aa71b54a676234d17fb', title: 'TDD harms architecture', author: 'Robert C. Martin', url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html', likes: 0, __v: 0 },
        ]
        const result = totalLikes(blogs);
    
        expect(result).toBe(27);
    })

    test('total likes of one value', () => {
        const blogs = [
            { _id: '5a422aa71b54a676234d17f8', title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html', likes: 5, __v: 0 },
        ]
        const result = totalLikes(blogs);
    
        expect(result).toBe(5);
    })

    test('total likes of no value', () => {
        const blogs = []
        const result = totalLikes(blogs);
    
        expect(result).toBe(0);
    })
})
