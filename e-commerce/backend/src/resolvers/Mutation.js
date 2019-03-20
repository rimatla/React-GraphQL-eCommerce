const mutations = {
  async createItem(parent, args, ctx, info) {
    // Todo: check if user is logged in
    // access DB
    const item = await ctx.db.mutation.createItem({
      data: {
        ...args
      }
    }, info)
    return item
  }

  // createDog(parent, args, ctx, info) {
  //   global.dogs = global.dogs || [];
  //   // create a dog
  //   const newDog = { name: args.name };
  //   global.dogs.push(newDog);
  //   return newDog;
  // },
}

module.exports = mutations
