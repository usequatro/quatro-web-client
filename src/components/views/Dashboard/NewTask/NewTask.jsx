import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import uuid from 'uuid/v4';
import { Box } from 'rebass/styled-components';

import { addTask } from 'modules/tasks';

import FullScreenPaper from 'components/ui/FullScreenPaper';
import PapelHeader from 'components/ui/PaperHeader';
import BasicMain from 'components/ui/BasicMain';
import ButtonFooter from 'components/ui/ButtonFooter';
import TaskForm from 'components/views/Dashboard/EditTask/TaskForm';
import Button from 'components/ui/Button';

import withMixpanel from 'components/hoc/withMixpanel';
import { TASK_CREATED } from 'constants/mixpanelTrackingEvents';

const FormFlexContainer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
`;
const NewTaskMain = styled(BasicMain).attrs({ pt: 4 })``;
const ContentContainer = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const NewTask = ({ history, mixpanel }) => {
  const [temporaryId, setTemporaryId] = useState('');
  const [title, setTitle] = useState('');
  const [impact, setImpact] = useState(5);
  const [effort, setEffort] = useState(1);
  const [description, setDescription] = useState('');
  const [due, setDue] = useState(null);
  const [scheduledStart, setScheduledStart] = useState(null);
  const [dependencies, setDependencies] = useState([]);
  const [recurringConfig, setRecurringConfig] = useState(null);

  useEffect(() => {
    setTemporaryId(`_${uuid()}`);
  }, []);
  const dispatch = useDispatch();

  const createTask = (event) => {
    event.preventDefault();
    const newTask = {
      temporaryId,
      title,
      impact,
      effort,
      description,
      due,
      scheduledStart,
    };
    dispatch(addTask(newTask, dependencies, recurringConfig, history));
    mixpanel.track(TASK_CREATED, {
      hasBlockers: dependencies.length > 0,
      hasScheduledStart: !!scheduledStart,
      hasDueDate: !!due,
    });
  };

  const onUpdateTaskDependency = (id, updatedDependency) => {
    setDependencies(dependencies.map((dependency) => (
      dependency.id !== id
        ? dependency
        : {
          ...updatedDependency,
          taskId: temporaryId,
          id,
        }
    )));
  };
  const onRemoveTaskDependency = (idToRemove) => {
    setDependencies(dependencies.filter((dependency) => dependency.id !== idToRemove));
  };
  const onCreateTaskDependency = (dependency) => {
    setDependencies([
      ...dependencies,
      {
        ...dependency,
        taskId: temporaryId,
      },
    ]);
  };

  return (
    <FullScreenPaper>
      {(onRequestClose) => (
        <FormFlexContainer onSubmit={createTask}>
          <PapelHeader
            headline="Create Task"
            buttonRight={(
              <Button variant="textOverBackground" onClick={onRequestClose}>
                Cancel
              </Button>
            )}
          />
          <NewTaskMain>
            <ContentContainer>
              <TaskForm
                id={temporaryId}
                title={title}
                setTitle={setTitle}
                impact={impact}
                setImpact={setImpact}
                effort={effort}
                setEffort={setEffort}
                description={description}
                setDescription={setDescription}
                due={due}
                setDue={setDue}
                scheduledStart={scheduledStart}
                setScheduledStart={setScheduledStart}
                dependencies={dependencies}
                updateTaskDependency={onUpdateTaskDependency}
                removeTaskDependency={onRemoveTaskDependency}
                createTaskDependency={onCreateTaskDependency}
                recurringConfig={recurringConfig}
                setRecurringConfig={(newRecurringConfig) => setRecurringConfig(newRecurringConfig)}
                removeRecurringConfig={() => setRecurringConfig(null)}
              />
            </ContentContainer>
          </NewTaskMain>

          <ButtonFooter.Container>
            <ButtonFooter.Button type="submit" variant="primary">
              Create Task
            </ButtonFooter.Button>
          </ButtonFooter.Container>
        </FormFlexContainer>
      )}
    </FullScreenPaper>
  );
};

export default withMixpanel(withRouter(NewTask));
