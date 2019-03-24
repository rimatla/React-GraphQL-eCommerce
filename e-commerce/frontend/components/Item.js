import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import Title from './styles/Title'
import ItemStyles from './styles/ItemStyles'
import PriceTag from './styles/PriceTag'
import formatMoney from '../lib/formatMoney' // helper to format into dollars
import DeleteItem from './DeleteItem'

class Item extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired
  }

  render() {
    const { item } = this.props

    return (
      <ItemStyles>
        {/* evaluate to true or false like a ternary */}
        {item.image && <img src={item.image} alt={item.title} />}

        <Link href={{ pathname: '/item', query: { id: item.id } }}>
          <a className="itemTitle">{item.title}</a>
        </Link>
        <PriceTag>{formatMoney(item.price)}</PriceTag>
        <p>{item.description}</p>

        <div className="buttonList">         
          <Link
            href={{
              pathname: 'update',
              query: { id: item.id }
            }}
          >
            <a>Edit ✏️</a>
          </Link>
          <button>Add To Cart</button>
          <DeleteItem id={item.id}>Delete This Item</DeleteItem>
        </div>
      </ItemStyles>
    )
  }
}

Item.propTypes = {}

export default Item
