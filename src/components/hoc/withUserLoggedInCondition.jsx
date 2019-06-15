import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import * as firebase from 'firebase/app';

const withUserLoggedInCondition = (userLoggedInCondition, fallbackRoute) => (Component) => {
  const WithUserLoggedInCondition = ({ ...props }) => {
    const [userLoggedIn, setUserLoggedIn] = useState(null);

    useEffect(() => {
      const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
        console.log('[withUserLoggedInCondition] onAuthStateChanged', !!user);
        setUserLoggedIn(!!user);
      });
      return unsubscribe;
    }, []);

    if (userLoggedIn === null) {
      return null;
    }
    if (userLoggedIn !== userLoggedInCondition) {
      console.log(`[withUserLoggedInCondition] User logged in: ${userLoggedInCondition ? 'yes' : 'no'}. Redirecting to ${fallbackRoute}`);
      return <Redirect to={fallbackRoute} />;
    }
    return <Component {...props} />;
  };
  return WithUserLoggedInCondition;
};

export default withUserLoggedInCondition;
