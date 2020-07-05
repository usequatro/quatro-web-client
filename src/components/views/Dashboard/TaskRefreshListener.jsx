import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

// import { resumeDashboardActivity } from '../../../modules/dashboard';

const TaskRefreshListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const onFocus = () => {
      // commenting because there might be a problem with this, experienced as tasks not loading
      // until refreshing manually.
      // dispatch(resumeDashboardActivity());
    };

    window.addEventListener('focus', onFocus);

    return () => window.removeEventListener('focus', onFocus);
  }, [dispatch]);

  return null;
};

export default TaskRefreshListener;
