import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import propTypes from 'prop-types'

const CURRENT_USER_QUERY = gql`
  query {
    me {
      id
      email
      name
      permissions
      # include shopping cart
      cart {
        id
        quantity
        # item relationship
        item {
          id
          price
          image
          title
          description
        }
      }
    }
  }
`

const User = props => (
  <Query {...props} query={CURRENT_USER_QUERY}>
    {payload => props.children(payload)}
  </Query>
)

// only pass a child as a function
User.propTypes = {
  children: propTypes.func.isRequired
}

export default User
export { CURRENT_USER_QUERY }
