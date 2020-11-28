import mixpanel from 'mixpanel-browser';

if (!process.env.REACT_APP_MIXPANEL_KEY) {
  throw new Error('Mixpanel key required');
}

mixpanel.init(process.env.REACT_APP_MIXPANEL_KEY, {
  // debug true shows requests in console.
  // note that if Do Not Track is enabled, Mixpanel doesn't send data
  debug: process.env.REACT_APP_DEVELOPMENT == 1, // eslint-disable-line eqeqeq
});

if (process.env.REACT_APP_DEVELOPMENT) {
  window.mixpanel = mixpanel;
}

export default mixpanel;
