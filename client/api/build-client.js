// we use axios here instead of our useRequest hook
// because hooks can only be used inside components
// but we need to run the code on the server, not
// inside component, to fetch the current user info
// from jwt payload, which stored in the cookie
import axios from 'axios';

/*
  getInitialProps executed on the server:
  - Hard refresh of the page
  - Clicking link from different domain
  - Typing URL into address bar

  getInitialProps executed on the client:
  - Navigation from one page to another while in the app
*/
export default ({ req }) => {
  // We need this code to basically put the baseUrl whenever
  // we do the request from the browser and from inside of
  // the server. Don't forget about cookies whenever run from
  // inside of the server.
  if (typeof window === 'undefined') {
    // We are on the server
    return axios.create({
      //baseUrl: 'http://ingress-nginx.ingress-nginx.svc.cluster.local',
      baseURL: `${req['x-forwarded-proto']}://${req.headers.host}`,
      //baseURL: `${req['x-forwarded-proto']}://${req.headers.host}`,
      //baseURL: 'http://www.yarepka.xyz/',
      headers: req.headers,
    });
  } else {
    // We are on the browser
    return axios.create({
      baseUrl: '/',
    });
  }
};
