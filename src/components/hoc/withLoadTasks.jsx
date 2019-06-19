import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { loadTasks as loadTasksAction, getLoaded } from '../../modules/tasks';

export default (Component) => {
  const mapDispatchToProps = {
    loadTasks: loadTasksAction,
  };
  const mapStateToProps = state => ({
    loaded: getLoaded(state),
  });

  const ComponentWithLoader = ({ loadTasks, loaded, ...restProps }) => {
    useEffect(() => {
      if (!loaded) {
        loadTasks();
      }
    });
    return <Component {...restProps} />;
  };
  return connect(mapStateToProps, mapDispatchToProps)(ComponentWithLoader);
};
