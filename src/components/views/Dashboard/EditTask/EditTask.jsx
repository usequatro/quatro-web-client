import React from 'react';
import { useSelector, useDispatch, connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import styled from 'styled-components';
import { Box } from 'rebass';
import get from 'lodash/get';

import {
  selectUndeletedTask,
  updateTask as updateTaskAction,
  moveToTrashTask as moveToTrashTaskAction,
  updateTaskDependency as updateTaskDependencyAction,
  removeTaskDependency as removeTaskDependencyAction,
  createTaskDependency,
  clearRelativePrioritization as clearRelativePrioritizationAction,
  selectTask,
  selectTaskDependencies,
  navigateToTabForTask,
} from '../../../../modules/tasks';
import { selectLoaded } from '../../../../modules/dashboard';
import * as paths from '../../../../constants/paths';

import TaskForm from './TaskForm';
import FullScreenPaper from '../../../ui/FullScreenPaper';
import PapelHeader from '../../../ui/PaperHeader';
import Loader from '../../../ui/Loader';
import BasicMain from '../../../ui/BasicMain';
import Button from '../../../ui/Button';
import withLoadTasks from '../../../hoc/withLoadTasks';
import Paragraph from '../../../ui/Paragraph';

const FormFlexContainer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
`;
const EditTaskMain = styled(BasicMain).attrs({ p: 3, pt: 4 })``;
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

  const onUpdate = (key, value) => {
    updateTask(id, { [key]: value });
  };

  const dependencyDescriptors = useSelector((state) => (
    selectTaskDependencies(state, dependencyIds)
  ));

  return (
    <FullScreenPaper onCloseCustom={(history) => dispatch(navigateToTabForTask(id, history))}>
      {(onRequestClose) => (
        <FormFlexContainer onSubmit={onRequestClose}>
          <PapelHeader
            headline="Edit Task"
            buttonRight={(
              <Button variant="textOverBackground" onClick={onRequestClose}>
                Done
              </Button>
            )}
          />
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
                    Set as not completed
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
                  due={due}
                  taskPrioritizedAheadOfTitle={taskPrioritizedAheadOfTitle}
                  setDue={(value) => onUpdate('due', value)}
                  scheduledStart={scheduledStart}
                  setScheduledStart={(value) => onUpdate('scheduledStart', value)}
                  dependencies={dependencyDescriptors}
                  updateTaskDependency={updateTaskDependency}
                  removeTaskDependency={removeTaskDependency}
                  createTaskDependency={(...args) => dispatch(createTaskDependency(...args))}
                  clearRelativePrioritization={clearRelativePrioritization}
                  setRecurringConfig={(...args) => console.log(...args)}
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
  const task = selectUndeletedTask(state, ownProps.match.params.id);

  return {
    loaded: selectLoaded(state, 'default'),
    ...task,
    taskPrioritizedAheadOfTitle: task && task.prioritizedAheadOf
      ? get(selectTask(state, task.prioritizedAheadOf), 'title', null)
      : null,
  };
};

export default withLoadTasks(
  connect(mapStateToProps, mapDispatchToProps)(EditTask),
  'default',
  undefined,
);
