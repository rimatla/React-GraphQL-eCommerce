// NextJS handles the import of React...
// Next Handles routing...

import Items from '../components/Items'

const Home = props => (
  <div>
    <Items page={parseFloat(props.query.page) || 1} />
  </div>
)

export default Home
