const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')
const { transport, makeANiceEmail } = require('../mail')
const { hasPermission } = require('../utils')
const stripe = require('../stripe') // contains all of stripe's built in API mehtods

const mutations = {
  async createItem(parent, args, ctx, info) {
    // Todo: check if user is logged in
    if (!ctx.request.userId) throw new Error('You must be logged in to do that!')
    // access DB
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // make a prisma relationship between the item and the user
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
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
    const item = await ctx.db.query.item({ where }, `{id, title, user { id }}`)
    // check if they own that item o have the permissions
    const ownsItem = item.user.id === ctx.request.userId
    const hasPermissions = ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission))
    if (!ownsItem && !hasPermissions) throw new Error("You don't have permission to do that!")
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

  // USER SIGNOUT
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return { message: 'Goodbye!' }
  },

  // REQUEST RESET PASSWORD
  async requestReset(parent, args, ctx, info) {
    // 1. Check if this is a real user
    const user = await ctx.db.query.user({ where: { email: args.email } })
    if (!user) throw new Error(`No such user found for email ${args.email}`)

    // 2. Set a reset token and expiry on that user
    const randomBytesPromiseified = promisify(randomBytes)
    const resetToken = (await randomBytesPromiseified(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    })
    // console.log(res)

    // 3. Email them that reset token
    const mailRes = await transport.sendMail({
      from: 'joe@doe.com',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: makeANiceEmail(`Your Password Reset Token is here!
      \n\n
      <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`)
    })

    // 4. return the message
    return { message: 'Thanks!' }
  },

  async resetPassword(parent, args, ctx, info) {
    // 1. check if the passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("Passwords don't match!")
    }
    // 2. check if its a legit reset token
    // 3. Check if its expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    })
    if (!user) {
      throw new Error('This token is either invalid or expired!')
    }
    // 4. Hash their new password
    const password = await bcrypt.hash(args.password, 10)

    // 5. Save the new password to the user and remove old resetToken fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    })
    // 6. Generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET)

    // 7. Set the JWT cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })

    // 8. return the new user
    return updatedUser
  },

  async updatePermissions(parent, args, ctx, info) {
    // 1. Check if they are logged in
    if (!ctx.request.userId) throw new Error('You must be logged in!')
    // 2. Query the current user
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId
        }
      },
      info
    )
    // 3. Check if they have permissions to do this
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE'])
    // 4. Update the permissions
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions
          }
        },
        where: {
          id: args.userId
        }
      },
      info
    )
  },

  // SHOPPING CART
  async addToCart(parent, args, ctx, info) {
    // 1. Make sure they are signed in
    const { userId } = ctx.request
    if (!userId) {
      throw new Error('You must be signed in')
    }
    // 2. Query the users current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id }
      }
    })
    // 3. Check if that item is already in their cart and increment by 1 if it is
    if (existingCartItem) {
      console.log('This item is already in their cart')
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 }
        },
        info
      )
    }
    // 4. If its not, create a fresh CartItem for that user!
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId }
          },
          item: {
            connect: { id: args.id }
          }
        }
      },
      info
    )
  },
  async removeFromCart(parent, args, ctx, info) {
    // 1. Find the cart item
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id
        }
      },
      `{ id, user { id }}` // id or carItem + user and its id
    )
    // 1.5 Make sure we found an item
    if (!cartItem) throw new Error('No CartItem Found!')
    // 2. Make sure they own that cart item
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error('Cheatin huh')
    }
    // 3. Delete that cart item
    return ctx.db.mutation.deleteCartItem(
      {
        where: { id: args.id }
      },
      info
    )
  },
  async createOrder(parent, args, ctx, info) {
    // 1. Query the current user and make sure they are signed in
    const { userId } = ctx.request
    if (!userId) throw new Error('You must be signed in to complete this order.')
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
      id
      name
      email
      cart {
        id
        quantity
        item { title price id description image largeImage }
      }}`
    )
    // 2. recalculate the total for the price | Don't trust price sent out that can be modified on client side
    const amount = user.cart.reduce((tally, cartItem) => tally + cartItem.item.price * cartItem.quantity, 0)
    // console.log(`Going to charge for a total of ${amount}`)
    // 3. Create the stripe charge (turn token into $$$)
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token
    })
    // 4. Convert the CartItems to OrderItems
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } }
      }
      delete orderItem.id // we don't want the item id
      return orderItem
    })
    // 5. create the Order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } }
      }
    })
    // 6. Clean up - clear the users cart, delete cartItems
    const cartItemIds = user.cart.map(cartItem => cartItem.id)
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds
      }
    })
    // 7. Return the Order to the client
    return order
  }
}

module.exports = mutations
