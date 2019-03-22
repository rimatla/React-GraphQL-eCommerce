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
  }
}

module.exports = mutations
