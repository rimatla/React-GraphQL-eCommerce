import React from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import CartStyles from './styles/CartStyles'
import Supreme from './styles/Supreme'
import CloseButton from './styles/CloseButton'
import SickButton from './styles/SickButton'

// local state is data that won't live in your DB, rather it needs to live in the browser for a UI session
const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`

const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`
const Cart = () => (
  <Mutation mutation={TOGGLE_CART_MUTATION}>
    {toggleCart => (
      <Query query={LOCAL_STATE_QUERY}>
        {({ data }) => (
          <CartStyles open={data.cartOpen}>
            <header>
              <CloseButton onClick={toggleCart} title="close">
                &times;
              </CloseButton>
              <Supreme>Your Cart</Supreme>
              <p>You Have __ Items in your cart.</p>
            </header>
            <footer>
              <p>$10.00</p>
              <SickButton>Checkout</SickButton>
            </footer>
          </CartStyles>
        )}
      </Query>
    )}
  </Mutation>
)

export default Cart
export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION }
