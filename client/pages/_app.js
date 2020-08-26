import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/Header';

// used for applying global css and
// to show some elements on the screen
// which will be visible on every single page
const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
};

// will be executed during server side rendering process
// here we will fetch some data specificaly for doing
// some initial rendering for our app
// any data we return from this function will show up
// inside of our component props
AppComponent.getInitialProps = async appContext => {
  console.log(appContext);
  // will share data with Header component
  const { data } = await buildClient(appContext.ctx).get('/api/users/currentuser');

  let pageProps = {};
  // if current Component has getInitialProps() function
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }

  return {
    pageProps,
    currentUser: data.currentUser
  };
}

export default AppComponent;