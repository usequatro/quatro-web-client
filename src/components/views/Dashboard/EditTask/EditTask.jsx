import React from 'react';
import { useSelector, useDispatch, connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import styled from 'styled-components';
import { Box } from 'rebass/styled-components';
import get from 'lodash/get';

import {
  selectUndeletedTask,
  updateTask,
  moveToTrashTask,
  updateTaskDependency,
  removeTaskDependency,
  createTaskDependency,
  clearRelativePrioritization,
  navigateToTabForTask,
  removeTaskRecurringConfig,
  updateTaskRecurringConfig,
  createTaskRecurringConfig,
  selectTask,
  selectTaskDependencies,
  selectRecurringConfig,
} from 'modules/tasks';
import { selectLoaded } from 'modules/dashboard';
import * as paths from 'constants/paths';

import LeftArrowIcon from 'components/icons/LeftArrow';
import FullScreenPaper from 'components/ui/FullScreenPaper';
import PapelHeader from 'components/ui/PaperHeader';
import Loader from 'components/ui/Loader';
import BasicMain from 'components/ui/BasicMain';
import Button from 'components/ui/Button';
import withLoadTasks from 'components/hoc/withLoadTasks';
import Paragraph from 'components/ui/Paragraph';

import TaskForm from './TaskForm';

const FormFlexContainer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
`;
const EditTaskMain = styled(BasicMain)``;
const ContentContainer = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const IconContainer = styled.div`
  height: 1rem;
  width: 1rem;
  cursor: pointer;
`;

const EditTask = ({
  loaded,
  id,
  title,
  impact,
  effort,
  description,
  due,
  completed,
  score,
  scheduledStart,
  associatedRecurringConfig,
  taskPrioritizedAheadOfTitle,
  dependencyIds,
}) => {
  const dispatch = useDispatch();

  const onUpdate = (key, value) => {
    dispatch(updateTask(id, { [key]: value }));
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
            buttonLeft={(
              <Button
                variant="textOverBackground"
                onClick={onRequestClose}
              >
                <IconContainer>
                  <LeftArrowIcon size="fill" title="Back" />
                </IconContainer>
              </Button>
            )}
            buttonRight={(
              <Button
                variant="textOverBackground"
                onClick={() => {
                  dispatch(moveToTrashTask(id));
                  onRequestClose();
                }}
              >
                Delete
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
                  updateTaskDependency={(...args) => dispatch(updateTaskDependency(...args))}
                  removeTaskDependency={(...args) => dispatch(removeTaskDependency(...args))}
                  createTaskDependency={(...args) => dispatch(createTaskDependency(...args))}
                  clearRelativePrioritization={(...args) => dispatch(clearRelativePrioritization(...args))}
                  recurringConfig={associatedRecurringConfig}
                  setRecurringConfig={(recurringConfig) => {
                    if (associatedRecurringConfig) {
                      dispatch(updateTaskRecurringConfig(id, recurringConfig));
                    } else {
                      dispatch(createTaskRecurringConfig(id, recurringConfig));
                    }
                  }}
                  removeRecurringConfig={() => dispatch(removeTaskRecurringConfig(id))}
                />

                <Box mb={4}>
                  <Paragraph>
                    {`Score: ${score.toFixed(2)}${score === Infinity ? ' (it was already due)' : ''}`}
                  </Paragraph>
                </Box>
              </ContentContainer>
            )}
          </EditTaskMain>
        </FormFlexContainer>
      )}
    </FullScreenPaper>
  );
};

const mapStateToProps = (state, ownProps) => {
  const task = selectUndeletedTask(state, ownProps.match.params.id);

  return {
    loaded: selectLoaded(state, 'default'),
    ...task,
    taskPrioritizedAheadOfTitle: task && task.prioritizedAheadOf
      ? get(selectTask(state, task.prioritizedAheadOf), 'title', null)
      : null,
    associatedRecurringConfig: task && task.recurringConfigId
      ? selectRecurringConfig(state, task.recurringConfigId)
      : null,
  };
};

export default withLoadTasks(
  connect(mapStateToProps)(EditTask),
  'default',
);
