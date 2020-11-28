import { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { trackRouteChange } from '../../utils/googleAnalyticsTracking';

const RouterChangeTracker = ({ history }) => {
  useEffect(() => {
    const unlisten = history.listen((location) => {
      trackRouteChange(location.pathname);
    });

    return () => {
      unlisten();
    };
  }, [history]);

  return null;
};

export default withRouter(RouterChangeTracker);
