import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { loadDashboardTasks as loadDashboardTasksAction, selectLoaded } from '../../modules/dashboard';

export default (Component, view, fetchParams) => {
  const mapDispatchToProps = {
    loadDashboardTasks: loadDashboardTasksAction,
  };
  const mapStateToProps = state => ({
    loaded: selectLoaded(state, view),
  });

  const ComponentWithLoader = ({ loadDashboardTasks, loaded, ...restProps }) => {
    useEffect(() => {
      if (!loaded) {
        loadDashboardTasks(view, fetchParams);
      }
    });
    return <Component {...restProps} loaded={loaded} />;
  };
  return connect(mapStateToProps, mapDispatchToProps)(ComponentWithLoader);
};
