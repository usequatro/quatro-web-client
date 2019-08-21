import React, { useState } from 'react';
import { useSelector, useDispatch, connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import styled from 'styled-components';
import { Box } from 'rebass';
import get from 'lodash/get';

import {
  getUndeletedTask,
  updateTask as updateTaskAction,
  moveToTrashTask as moveToTrashTaskAction,
  updateTaskDependency as updateTaskDependencyAction,
  removeTaskDependency as removeTaskDependencyAction,
  createTaskDependency,
  clearRelativePrioritization as clearRelativePrioritizationAction,
  getTask,
  getTaskDependencies,
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
import Paragraph from '../../../ui/Paragraph';

const FormFlexContainer = styled.form`
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
const ContentContainer = styled(Box)`
  width: 100%;
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
  completed,
  score,
  scheduledStart,
  taskPrioritizedAheadOfTitle,
  dependencyIds,
  updateTaskDependency,
  removeTaskDependency,
  clearRelativePrioritization,
}) => {
  const dispatch = useDispatch();

  const [hasDue, setHasDue] = useState(due != null);
  const [hasScheduledStart, setHasScheduledStart] = useState(scheduledStart != null);

  const onUpdate = (key, value) => {
    updateTask(id, { [key]: value });
  };

  const dependencyDescriptors = useSelector((state) => getTaskDependencies(state, dependencyIds));

  return (
    <FullScreenPaper>
      {(onRequestClose) => (
        <FormFlexContainer onSubmit={onRequestClose}>
          <AppHeaderContainer>
            <AppHeader>
              Edit Task
              <CloseButton backArrow buttonType="submit" title="Go back" />
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
                {completed && (
                  <Button
                    variant="outline"
                    onClick={() => onUpdate('completed', null)}
                    mb={4}
                  >
                    Back to not completed
                  </Button>
                )}

                <TaskForm
                  id={id}
                  title={title}
                  setTitle={(value) => onUpdate('title', value)}
                  impact={impact}
                  setImpact={(value) => onUpdate('impact', value)}
                  effort={effort}
                  setEffort={(value) => onUpdate('effort', value)}
                  description={description}
                  setDescription={(value) => onUpdate('description', value)}
                  hasDue={hasDue}
                  setHasDue={setHasDue}
                  due={due}
                  taskPrioritizedAheadOfTitle={taskPrioritizedAheadOfTitle}
                  setDue={(value) => onUpdate('due', value)}
                  hasScheduledStart={hasScheduledStart}
                  setHasScheduledStart={setHasScheduledStart}
                  scheduledStart={scheduledStart}
                  setScheduledStart={(value) => onUpdate('scheduledStart', value)}
                  dependencies={dependencyDescriptors}
                  updateTaskDependency={updateTaskDependency}
                  removeTaskDependency={removeTaskDependency}
                  createTaskDependency={(...args) => dispatch(createTaskDependency(...args))}
                  clearRelativePrioritization={clearRelativePrioritization}
                />

                <Box mb={4}>
                  <Paragraph>
                    {`Score: ${score.toFixed(2)}${score === Infinity ? ' (it was already due)' : ''}`}
                  </Paragraph>
                </Box>

                <Button
                  variant="outline"
                  onClick={() => {
                    moveToTrashTask(id);
                    onRequestClose();
                  }}
                  mb={4}
                >
                  Delete task
                </Button>
              </ContentContainer>
            )}
          </EditTaskMain>
        </FormFlexContainer>
      )}
    </FullScreenPaper>
  );
};

const mapDispatchToProps = {
  updateTask: updateTaskAction,
  moveToTrashTask: moveToTrashTaskAction,
  updateTaskDependency: updateTaskDependencyAction,
  removeTaskDependency: removeTaskDependencyAction,
  clearRelativePrioritization: clearRelativePrioritizationAction,
};

const mapStateToProps = (state, ownProps) => {
  const task = getUndeletedTask(state, ownProps.match.params.id);

  return {
    loaded: selectLoaded(state, 'default'),
    ...task,
    taskPrioritizedAheadOfTitle: task && task.prioritizedAheadOf
      ? get(getTask(state, task.prioritizedAheadOf), 'title', null)
      : null,
  };
};

export default withLoadTasks(
  connect(mapStateToProps, mapDispatchToProps)(EditTask),
  'default',
  undefined,
);
