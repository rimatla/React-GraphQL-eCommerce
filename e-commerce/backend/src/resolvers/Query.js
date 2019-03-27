/* This is where your queries to the DB will go, this could be any end-point such as a REST API*/
const { forwardTo } = require('prisma-binding')
const { hasPermission } = require('../utils')

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
  },

  async users(parent, args, ctx, info) {
    // 1. Check if they are logged in
    if (!ctx.request.userId) throw new Error('You must be logged in!')
    console.log(ctx.request.userId)

    // 2. Check if the user has the permissions to query all the users
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE'])

    // 3. if they do, query all the users!
    return ctx.db.query.users({}, info)
  }
}

module.exports = Query
