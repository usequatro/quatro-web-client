import mixpanel from 'mixpanel-browser';

export default process.env.REACT_APP_MIXPANEL_KEY !== ''
  ? (() => {
      // Initialize mixpanel right away
      mixpanel.init(process.env.REACT_APP_MIXPANEL_KEY);
      return mixpanel;
    })()
  : // Mock for development
    {
      /* eslint-disable no-console */
      init: (...args) => {
        console.info('[mixpanel.init]', ...args);
      },
      identify: (...args) => {
        console.info('[mixpanel.identify]', ...args);
      },
      track: (...args) => {
        console.info('[mixpanel.track]', ...args);
      },
      register: (...args) => {
        console.info('[mixpanel.register]', ...args);
      },
      people: {
        set: (...args) => {
          console.info('[mixpanel.people.set]', ...args);
        },
      },
      /* eslint-enable no-console */
    };
