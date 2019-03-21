import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import Item from './Item'

// Write a graphQL query
const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY {
    items {
      id
      title
      price
      description
      image
      largeImage
    }
  }
`

// Styles
const Center = styled.div`
  text-align: center;
`
const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
`

class Items extends Component {
  render() {
    return (
      <Center>
        {/* render prop technique */}
        <Query query={ALL_ITEMS_QUERY}>
          {({ data, error, loading }) => {
            // conditional rendering
            if (loading) return <p>Loading...</p>
            if (error) return <p>Error: {error.message}</p>

            // console.log(payload)
            // console.log(data)
            return (
              <ItemsList>
                {data.items.map(item => (
                  <Item item={item} key={item.id} />
                ))}
              </ItemsList>
            )
          }}
        </Query>
      </Center>
    )
  }
}

export default Items
// named export 
export { ALL_ITEMS_QUERY };


