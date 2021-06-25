import React from 'react';
import ReactDOM from 'react-dom';

import './firebase';

import App from './components/App';
import debugConsole from './utils/debugConsole';

ReactDOM.render(<App />, document.getElementById('root'));

// app info for debugging
window.quatro = {
  buildEnv: process.env.NODE_ENV,
  appEnv: process.env.REACT_APP_DEVELOPMENT ? 'development' : 'production',
  emulator: process.env.REACT_APP_FIREBASE_EMULATOR,
};

// Receive messages from the native application wrapper
window.addEventListener('message', (event) => {
  if (event.origin !== window.origin) {
    return;
  }
  if (event.data) {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (data.source !== 'quatro-desktop-client') {
        return;
      }
      debugConsole.log('Quatro Desktop Client Message', data);
      if (data.desktopClientVersion) {
        window.quatro.desktopClientVersion = data.desktopClientVersion;
      }
    } catch (error) {
      console.error(error); // eslint-disable-line no-console
    }
  }
});
