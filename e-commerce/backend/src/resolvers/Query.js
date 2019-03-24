/* This is where your queries to the DB will go, this could be any end-point such as a REST API*/
const { forwardTo } = require('prisma-binding')

// ctx = context
const Query = {
  // IF the query is exactly the same on your Yoga as it is in your Prisma
  // forward the query from YOGA TO PRISMA
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    // check if there is a current user ID
    if (!ctx.request.userId) {
      return null
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    )
  }
}

module.exports = Query
