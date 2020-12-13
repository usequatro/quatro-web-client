import React, { useEffect, useState, createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

const config = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  scope: process.env.REACT_APP_GOOGLE_SCOPE,
};

const injectGoogleAPIScript = (onLoad) => {
  const gScript = document.createElement('script');
  gScript.type = 'text/javascript';
  gScript.src = 'https://apis.google.com/js/platform.js';
  document.body.appendChild(gScript);
  gScript.onload = onLoad;
};

const GoogleAPIContext = createContext();
export const useGoogleAPI = () => useContext(GoogleAPIContext);

export const GoogleAPIContextProvider = ({ children }) => {
  const [gapi, setGapi] = useState(undefined);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    injectGoogleAPIScript(() => {
      window.gapi.load('client:auth2', () => {
        window.gapi.client.load('calendar', 'v3').then(() => {
          window.gapi.client
            .init(config)
            .then(() => {
              setGapi(window.gapi);
              // Listen for sign-in state changes.
              window.gapi.auth2
                .getAuthInstance()
                .isSignedIn.listen((state) => setIsSignedIn(state));
              // Handle the initial sign-in state.
              setIsSignedIn(window.gapi.auth2.getAuthInstance().isSignedIn.get());
            })
            .catch((e) => {
              console.error('ERROR on initGoogleClient: ', e); // eslint-disable-line no-console
            });
        });
      });
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      gapi,
      isSignedIn,
      signIn: () => gapi.auth2.getAuthInstance().signIn(),
    }),
    [gapi, isSignedIn],
  );

  return <GoogleAPIContext.Provider value={contextValue}>{children}</GoogleAPIContext.Provider>;
};

GoogleAPIContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
