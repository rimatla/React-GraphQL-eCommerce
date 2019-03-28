import withApollo from 'next-with-apollo' //higher order component
import ApolloClient from 'apollo-boost'
import { endpoint } from '../config'
import { LOCAL_STATE_QUERY } from '../components/Cart'

function createClient({ headers }) {
  return new ApolloClient({
    uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include'
        },
        headers
      })
    },
    // LOCAL STATE DATA
    clientState: {
      resolvers: {
        Mutation: {
          toggleCart(_, variables, { cache }) {
            // read the cart open value from the cache
            const { cartOpen } = cache.readQuery({
              query: LOCAL_STATE_QUERY
            })
            // Write the cart State to the opposite
            const data = {
              data: { cartOpen: !cartOpen } // oposite
            }
            // imediately write it back to cahe
            cache.writeData(data)
            return data
          }
        }
      },
      defaults: {
        cartOpen: true
      }
    }
  })
}

export default withApollo(createClient)
