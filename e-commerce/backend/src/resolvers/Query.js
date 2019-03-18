/* This is where your queries to the DB will go, this could be any end-point such as a REST API*/

// ctx = context
const Query = {
  dogs: function(parent, args, ctx, info) {
    global.dogs = global.dogs || []
    return global.dogs
  }
}

module.exports = Query
