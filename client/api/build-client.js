// we use axios here instead of our useRequest hook
// because hooks can only be used inside components
// but we need to run the code on the server, not
// inside component, to fetch the current user info
// from jwt payload, which stored in the cookie
import axios from 'axios';

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // We are on the server
    return axios.create({
      baseURL: `${req['x-forwarded-proto']}://${req.headers.host}`,
      headers: req.headers
    });
  } else {
    // We must be on the browser
    return axios.create({
      baseUrl: '/'
    });
  }
};
