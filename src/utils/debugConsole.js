const colorByPrefix = {
  firebase: 'background: #FFC427; color: #000',
  firestore: 'background: #FF2764; color: #000',
  'google api': 'background: #fff; color: #000',
  dnd: 'background: #18a669; color: #fff',
  fallback: 'background: #2196f3; color: #000',
};

export default {
  log: (prefix, ...args) => {
    if (process.env.REACT_APP_DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.log(
        `%c ${prefix.toUpperCase()} `,
        colorByPrefix[prefix.toLowerCase()] || colorByPrefix.fallback,
        ...args,
      );
    }
  },
  info: (...args) => {
    if (process.env.REACT_APP_DEVELOPMENT) {
      console.info('%c INFO ', 'background: #2196f3; color: #fff', ...args); // eslint-disable-line no-console
    }
  },
  warn: (...args) => {
    if (process.env.REACT_APP_DEVELOPMENT) {
      console.warn('%c INFO ', 'background: #ff9800; color: #000', ...args); // eslint-disable-line no-console
    }
  },
  error: (...args) => {
    if (process.env.REACT_APP_DEVELOPMENT) {
      console.error('%c INFO ', 'background: #f44336; color: #000', ...args); // eslint-disable-line no-console
    }
  },
};
