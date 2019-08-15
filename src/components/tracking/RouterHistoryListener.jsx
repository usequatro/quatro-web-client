import { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { trackRouteChange } from '../../util/tracking';

const RouterHistoryListener = ({ history }) => {
  useEffect(() => {
    history.listen((location) => {
      trackRouteChange(location.pathname);
    });

    return () => { history.unlisten(); };
  }, [history]);

  return null;
};

export default withRouter(RouterHistoryListener);
