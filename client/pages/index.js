import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
  return <h1>You are {currentUser ? 'signed in' : 'NOT signed in'}</h1>
};

// will be executed during server side rendering process
// here we will fetch some data specificaly for doing
// some initial rendering for our app
// any data we return from this function will show up
// inside of our component props
LandingPage.getInitialProps = async ({ req }) => {
  const { data } = await buildClient({ req }).get('/api/users/currentuser');

  console.log(data);

  return data;
}

export default LandingPage;