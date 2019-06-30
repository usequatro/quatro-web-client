import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Box } from 'rebass';

import {
  getLoaded,
  getUndeletedTask,
  updateTask as updateTaskAction,
  moveToTrashTask as moveToTrashTaskAction,
} from '../../../../modules/tasks';
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
`;
const ContentContainer = styled(Box)`  width: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const EditTask = ({
  loaded, updateTask, moveToTrashTask, id, title, impact, effort, description, due, scheduledStart,
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
                  title={title}
                  impact={impact}
                  effort={effort}
                  description={description}
                  hasDue={hasDue}
                  due={due}
                  hasScheduledStart={hasScheduledStart}
                  scheduledStart={scheduledStart}
                  setTitle={value => onUpdate('title', value)}
                  setImpact={value => onUpdate('impact', value)}
                  setEffort={value => onUpdate('effort', value)}
                  setDescription={value => onUpdate('description', value)}
                  setHasDue={setHasDue}
                  setDue={value => onUpdate('due', value)}
                  setHasScheduledStart={setHasScheduledStart}
                  setScheduledStart={value => onUpdate('scheduledStart', value)}
                />

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
};

const mapStateToProps = (state, ownProps) => ({
  loaded: getLoaded(state),
  ...getUndeletedTask(state, ownProps.match.params.id),
});

export default withLoadTasks(connect(mapStateToProps, mapDispatchToProps)(EditTask));
