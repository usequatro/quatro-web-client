import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Box } from 'rebass';

import {
  getUndeletedTask,
  updateTask as updateTaskAction,
  moveToTrashTask as moveToTrashTaskAction,
  updateTaskDependency as updateTaskDependencyAction,
  removeTaskDependency as removeTaskDependencyAction,
  createTaskDependency as createTaskDependencyAction,
  getDependenciesForTask,
} from '../../../../modules/tasks';
import { selectLoaded } from '../../../../modules/dashboard';
import * as paths from '../../../../constants/paths';

import TaskForm from './TaskForm';
import FullScreenPaper from '../../../ui/FullScreenPaper';
import CloseButton from '../../../ui/CloseButton';
import { AppHeaderContainer, AppHeader } from '../../../ui/AppHeader';
import Loader from '../../../ui/Loader';
import Main from '../../../ui/Main';
import Button from '../../../ui/Button';
import withLoadTasks from '../../../hoc/withLoadTasks';

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
`;
const EditTaskMain = styled(Main).attrs({ p: 3 })`
  flex-grow: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;
const ContentContainer = styled(Box)`  width: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const EditTask = ({
  loaded,
  updateTask,
  moveToTrashTask,
  id,
  title,
  impact,
  effort,
  description,
  due,
  score,
  scheduledStart,
  dependencies,
  updateTaskDependency,
  removeTaskDependency,
  createTaskDependency,
}) => {
  const [hasDue, setHasDue] = useState(due != null);
  const [hasScheduledStart, setHasScheduledStart] = useState(scheduledStart != null);

  const onUpdate = (key, value) => {
    updateTask(id, { [key]: value });
  };

  return (
    <FullScreenPaper>
      {onRequestClose => (
        <FlexContainer>
          <AppHeaderContainer>
            <AppHeader>
            Edit Task
              <CloseButton backArrow onClick={onRequestClose} />
            </AppHeader>
          </AppHeaderContainer>
          <EditTaskMain>
            {!loaded && (
              <Loader />
            )}
            {loaded && !id && (
              <Redirect to={paths.DASHBOARD} />
            )}
            {loaded && id && (
              <ContentContainer>
                <TaskForm
                  id={id}
                  title={title}
                  setTitle={value => onUpdate('title', value)}
                  impact={impact}
                  setImpact={value => onUpdate('impact', value)}
                  effort={effort}
                  setEffort={value => onUpdate('effort', value)}
                  description={description}
                  setDescription={value => onUpdate('description', value)}
                  hasDue={hasDue}
                  setHasDue={setHasDue}
                  due={due}
                  setDue={value => onUpdate('due', value)}
                  hasScheduledStart={hasScheduledStart}
                  setHasScheduledStart={setHasScheduledStart}
                  scheduledStart={scheduledStart}
                  setScheduledStart={value => onUpdate('scheduledStart', value)}
                  dependencies={dependencies}
                  updateTaskDependency={updateTaskDependency}
                  removeTaskDependency={removeTaskDependency}
                  createTaskDependency={createTaskDependency}
                />

                <Box mb={4}>
                  <p>
                    {`Tasket score: ${score.toFixed(2)}`}
                  </p>
                </Box>

                <Button
                  variant="outline"
                  onClick={() => {
                    moveToTrashTask(id);
                    onRequestClose();
                  }}
                >
                  Delete task
                </Button>
              </ContentContainer>
            )}
          </EditTaskMain>
        </FlexContainer>
      )}
    </FullScreenPaper>
  );
};

const mapDispatchToProps = {
  updateTask: updateTaskAction,
  moveToTrashTask: moveToTrashTaskAction,
  updateTaskDependency: updateTaskDependencyAction,
  removeTaskDependency: removeTaskDependencyAction,
  createTaskDependency: createTaskDependencyAction,
};

const mapStateToProps = (state, ownProps) => ({
  loaded: selectLoaded(state, 'default'),
  ...getUndeletedTask(state, ownProps.match.params.id),
  dependencies: getDependenciesForTask(state, ownProps.match.params.id),
});

export default withLoadTasks(
  connect(mapStateToProps, mapDispatchToProps)(EditTask),
  'default',
  undefined,
);
