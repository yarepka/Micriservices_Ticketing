const LandingPage = ({ currentUser }) => {
  return <h1>You are {currentUser ? 'signed in' : 'NOT signed in'}</h1>
};

// will be executed during server side rendering process
// here we will fetch some data specificaly for doing
// some initial rendering for our app
// any data we return from this function will show up
// inside of our component props

/*
  getInitialProps executed on the server:
  - Hard refresh of the page
  - Clicking link from different domain
  - Typing URL into address bar

  getInitialProps executed on the client:
  - Navigation from one page to another while in the app
*/
LandingPage.getInitialProps = async (context) => {
  return {};
}

export default LandingPage;