import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import {
  getLoaded,
  getUndeletedTask,
  updateTask as updateTaskAction,
  moveToTrashTask as moveToTrashTaskAction,
} from '../../../modules/tasks';

import TaskForm from './TaskForm';
import FullScreenPaper from '../../ui/FullScreenPaper';
import CloseButton from '../../ui/CloseButton';
import { AppHeaderContainer, AppHeader } from '../../ui/AppHeader';
import Loader from '../../ui/Loader';
import Main from '../../ui/Main';
import Button from '../../ui/Button';
import withLoadTasks from '../../hoc/withLoadTasks';

const EditTask = ({
  loaded, updateTask, moveToTrashTask, history, id, title, impact, effort, description, due,
}) => {
  const [hasDue, setHasDue] = useState(due != null);

  const onUpdate = (key, value) => {
    updateTask(id, { [key]: value });
  };
  const onDelete = () => {
    moveToTrashTask(id);
    history.goBack();
  };
  const close = () => history.goBack();

  return (
    <FullScreenPaper>
      <AppHeaderContainer>
        <AppHeader>
          Edit Task
          <CloseButton backArrow onClick={close} />
        </AppHeader>
      </AppHeaderContainer>
      <Main>
        {!loaded && (
          <Loader />
        )}
        {loaded && !id && (
          1
        )}
        {loaded && id && (
          <React.Fragment>
            <TaskForm
              title={title}
              impact={impact}
              effort={effort}
              description={description}
              hasDue={hasDue}
              due={due}
              setTitle={value => onUpdate('title', value)}
              setImpact={value => onUpdate('impact', value)}
              setEffort={value => onUpdate('effort', value)}
              setDescription={value => onUpdate('description', value)}
              setHasDue={setHasDue}
              setDue={value => onUpdate('due', value)}
            />

            <Button variant="outline" onClick={onDelete}>Delete task</Button>
          </React.Fragment>
        )}
      </Main>
    </FullScreenPaper>
  );
};

const mapDispatchToProps = {
  updateTask: updateTaskAction,
  moveToTrashTask: moveToTrashTaskAction,
};

const mapStateToProps = (state, ownProps) => ({
  loaded: getLoaded(state),
  ...getUndeletedTask(state, ownProps.match.params.id),
});

export default withLoadTasks(withRouter(connect(mapStateToProps, mapDispatchToProps)(EditTask)));
