import Link from 'next/link'
import NavStyles from './styles/NavStyles'

const Nav = () => (
  <NavStyles>
    <Link href="/">
      <a>Home</a>
    </Link>
    <Link href="/sell">
      <a>sell</a>
    </Link>
  </NavStyles>
)

export default Nav
