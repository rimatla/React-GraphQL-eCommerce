//  NextJS creates and wraps your page on a `App` component that can be customized to your needs.
import App, { Container } from 'next/app'
import Page from '../components/Page'

class MyApp extends App {
  render() {
    // Component will be either coming from ./pages
    const { Component } = this.props
    return (
      <Container>
        <Page>
          <Component />
        </Page>
      </Container>
    )
  }
}

export default MyApp
