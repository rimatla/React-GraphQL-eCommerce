const mutations = {
  async createItem(parent, args, ctx, info) {
    // Todo: check if user is logged in
    // access DB
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args
        }
      },
      info
    )
    return item
  },

  updateItem(parent, args, ctx, info) {
    // fist take a copy of the updates
    const updates = { ...args }
    // remove the ID from the updates
    delete updates.id
    // run the update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    )
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }
    // find the item
    const item = await ctx.db.query.item({ where }, `{id, title}`)
    // check if they own that item o have the permissions

    //delete it
    return ctx.db.mutation.deleteItem({ where }, info)
  }
}

module.exports = mutations
