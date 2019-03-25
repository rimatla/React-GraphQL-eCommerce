const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
  },

  // USER SIGNUP
  async signup(parent, args, ctx, info) {
    // lowercase user email
    args.email = args.email.toLowerCase()
    // hash password
    const password = await bcrypt.hash(args.password, 10)
    // create the user in the database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] }
        }
      },
      info
    )
    // create the JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    // We set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      // prevent from being accessed via JS
      httpOnly: true,
      // 1 year cookie (1000 milliseconds, 60 seconds , 60 minutes, 24 hours, 365 days)
      maxAge: 1000 * 60 * 60 * 24 * 365
    })
    // return the user to the browser
    return user
  },

  // USER SIGIN
  async signin(parent, { email, password }, ctx, info) {
    // 1. check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email: email } })
    if (!user) throw new Error(`No such user found for email ${email}`)

    // 2. Check if their password is correct
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new Error('Invalid Password!')

    // 3. generate the JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)

    // 4. Set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })

    // 5. Return the user
    return user
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return { message: 'Goodbye!' }
  } 
}

module.exports = mutations
