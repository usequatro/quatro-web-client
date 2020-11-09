const print = (type, ...args) => {
  if (process.env.REACT_APP_DEVELOPMENT) {
    console[type]('🧿', ...args); // eslint-disable-line no-console
  }
};

export default {
  log: (...args) => print('log', ...args),
  info: (...args) => print('info', ...args),
  warn: (...args) => print('warn', ...args),
  error: (...args) => print('error', ...args),
};
