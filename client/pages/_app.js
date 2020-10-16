import './style.css';
import buildClient from '../api/build-client';
import Header from '../components/Header';

// This component responsible for rendering each of a different
// pages

// used for applying global css and
// to show some elements on the screen
// which will be visible on every single page
const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div className="container">
      <Header currentUser={currentUser} />
      <Component currentUser={currentUser} {...pageProps} />
    </div>
  );
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
AppComponent.getInitialProps = async appContext => {
  console.log(appContext);
  // will share data with Header component
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');

  let pageProps = {};
  // if current Component has getInitialProps() function
  // manually call it
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
  }

  return {
    pageProps,
    currentUser: data.currentUser
  };
}

export default AppComponent;