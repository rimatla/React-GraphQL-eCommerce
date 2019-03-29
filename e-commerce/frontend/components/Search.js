import React from 'react'
import Downshift from 'downshift'
import Router from 'next/router'
import { ApolloConsumer } from 'react-apollo'
import gql from 'graphql-tag'
import debounce from 'lodash.debounce'
import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown'

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(
      where: {
        # or condition
        OR: [
          { title_contains: $searchTerm }
          { description_contains: $searchTerm }
        ]
      }
    ) {
      id
      image
      title
    }
  }
`

class AutoComplete extends React.Component {
  state = {
    items: [],
    loading: false
  }

  // debounce will take all events that are fired in sequence when typing on a input field
  // and only fire them all only after a specific given time i.e. 350 milliseconds
  onChange = debounce(async (e, client) => {
    // console.log('Searching...')
    // turn loading on
    this.setState({ loading: true })
    // Manually query apollo client
    const res = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm: e.target.value }
    })
    this.setState({
      items: res.data.items,
      loading: false
    })
  }, 350)

  render() {
    return (
      <SearchStyles>
        <div>
          <ApolloConsumer>
            {client => (
              // expose apollo client to us and pass it to a separate function
              <input
                placeholder="search item"
                type="search"
                onChange={e => {
                  e.persist()
                  this.onChange(e, client)
                }}
              />
            )}
          </ApolloConsumer>

          <DropDown>
            {this.state.items.map(item => (
              <DropDownItem key={item.id}>
                <img width="50" src={item.image} alt={item.title} />
                {item.title}
              </DropDownItem>
            ))}
          </DropDown>
        </div>
      </SearchStyles>
    )
  }
}

export default AutoComplete
