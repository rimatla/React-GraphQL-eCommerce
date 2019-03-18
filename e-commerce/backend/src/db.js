// connections to remote PRISMA DB and query from it using JS
const { Prisma } = require('prisma-binding')

const db = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: process.env.PRISMA_SECRET,
  debug: false
})

module.exports = db
