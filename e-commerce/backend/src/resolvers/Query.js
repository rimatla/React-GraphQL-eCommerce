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
    //console.log(ctx.request.userId)

    // 2. Check if the user has the permissions to query all the users
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE'])

    // 3. if they do, query all the users!
    return ctx.db.query.users({}, info)
  },

  // ORDER QUERY
  async order(parent, args, ctx, info) {
    // 1. Make sure they are logged in
    if (!ctx.request.userId) throw new Error('You arent logged in!')
    // 2. Query the current order
    const order = await ctx.db.query.order(
      {
        where: { id: args.id }
      },
      info
    )
    // 3. Check if the have the permissions to see this order
    const ownsOrder = order.user.id === ctx.request.userId // boolean
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes('ADMIN')
    if (!ownsOrder && !hasPermissionToSeeOrder) {
      throw new Error('You cant see this buddy')
    }
    // 4. Return the order
    return order
  }
}

module.exports = Query
