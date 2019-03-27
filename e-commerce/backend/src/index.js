// this is the app entry point, let's go!
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

require('dotenv').config({ path: 'variables.env' })
const createServer = require('./createServer')
const db = require('./db')

const server = createServer()

// TODO use express middleware to handle cookies (JWT)
server.express.use(cookieParser())

// decode JWT so we can get the user ID on each request
server.express.use((req, res, next) => {
  const { token } = req.cookies
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET)
    // put the userId onto the req for future requests to access
    req.userId = userId
  }
  next()
})
// TODO use express middleware to populate current user on each request
server.express.use(async (req, res, next) => {
  // if they aren't logged in, skip this
  if (!req.userId) return next()
  const user = await db.query.user({ where: { id: req.userId } }, '{ id, permissions, email, name }')
  req.user = user
  // console.log(user) 
  next()
})

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  details => {
    console.log(`Server is now running on port http://localhost:${details.port}`)
  }
)
