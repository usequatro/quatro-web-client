import React from 'react';
import ReactDOM from 'react-dom';

import './firebase';

import App from './components/App';

ReactDOM.render(<App />, document.getElementById('root'));

// app info for debugging
window.quatro = {
  buildEnv: process.env.NODE_ENV,
  appEnv: process.env.REACT_APP_DEVELOPMENT ? 'development' : 'production',
};
