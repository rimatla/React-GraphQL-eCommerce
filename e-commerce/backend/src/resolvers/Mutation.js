const mutations = {
  createDog(parent, args, ctx, info) {
    // mimic a DB in memory
    global.dogs = global.dogs || []
    // console.log(args)
    // create a dog!
    const newDog = { name: args.name }
    global.dogs.push(newDog)
    return newDog
  }
}

module.exports = mutations
