import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { selectUserLoggedIn } from '../../modules/session';

const withUserLoggedInCondition = (userLoggedInCondition, fallbackRoute) => (Component) => {
  const WithUserLoggedInCondition = ({ ...props }) => {
    const userLoggedIn = useSelector(selectUserLoggedIn);

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
