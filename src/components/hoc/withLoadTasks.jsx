import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { loadDashboardTasks as loadDashboardTasksAction, selectLoaded } from '../../modules/dashboard';
import { selectUserLoggedIn } from '../../modules/session';

export default (Component, view) => {
  const mapDispatchToProps = {
    loadDashboardTasks: loadDashboardTasksAction,
  };
  const mapStateToProps = (state) => ({
    loaded: selectLoaded(state, view),
    userLoggedIn: selectUserLoggedIn(state, view),
  });

  const ComponentWithLoader = ({
    loadDashboardTasks, loaded, userLoggedIn, ...restProps
  }) => {
    useEffect(() => {
      if (!loaded && userLoggedIn) {
        loadDashboardTasks(view);
      }
    });
    return <Component {...restProps} loaded={loaded} />;
  };
  return connect(mapStateToProps, mapDispatchToProps)(ComponentWithLoader);
};
