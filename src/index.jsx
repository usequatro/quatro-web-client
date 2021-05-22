import React from 'react';
import ReactDOM from 'react-dom';
import whisperguard from '@whisperguard/rum-sdk';

import './firebase';

import App from './components/App';

whisperguard.init({
  projectId: `${process.env.REACT_APP_PROJECT_ID}`,
  token: `${process.env.REACT_APP_WHISPERGUARD_TOKEN}`,
  sampleRate: 100, // 1-100 where 100 mean collect all sessions.
  env: process.env.REACT_APP_DEVELOPMENT ? 'development' : 'production',
  // version: '' OPTIONAL Your application version
});

ReactDOM.render(<App />, document.getElementById('root'));

// app info for debugging
window.quatro = {
  buildEnv: process.env.NODE_ENV,
  appEnv: process.env.REACT_APP_DEVELOPMENT ? 'development' : 'production',
  emulator: process.env.REACT_APP_FIREBASE_EMULATOR,
};
