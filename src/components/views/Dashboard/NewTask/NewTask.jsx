import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { withRouter } from 'react-router-dom';
import uuid from 'uuid/v4';

import { addTask } from '../../../../modules/tasks';

import FullScreenPaper from '../../../ui/FullScreenPaper';
import CloseButton from '../../../ui/CloseButton';
import DoneButton from '../../../ui/DoneButton';
import { AppHeaderContainer, AppHeader } from '../../../ui/AppHeader';
import Main from '../../../ui/Main';
import Button from '../../../ui/Button';
import TaskForm from '../EditTask/TaskForm';

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
`;
const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;
const NewTaskMain = styled(Main).attrs({ p: 3, pb: 6 })`
  flex-grow: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const getInitialDueDate = () => dayjs()
  .add(1, 'day')
  .hour(17)
  .startOf('hour')
  .valueOf();

const NewTask = ({ history }) => {
  const [temporaryId, setTemporaryId] = useState('');
  const [title, setTitle] = useState('');
  const [impact, setImpact] = useState('');
  const [effort, setEffort] = useState('');
  const [description, setDescription] = useState('');
  const [hasDue, setHasDue] = useState(false);
  const [due, setDue] = useState(getInitialDueDate());
  const [hasScheduledStart, setHasScheduledStart] = useState(false);
  const [scheduledStart, setScheduledStart] = useState(null);
  const [dependencies, setDependencies] = useState([]);

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
      due: hasDue ? due : null,
      scheduledStart: hasScheduledStart ? scheduledStart : null,
    };
    dispatch(addTask(newTask, dependencies));
    history.goBack();
  };

  const onUpdateTaskDependency = (id, updatedDependency) => {
    setDependencies(dependencies.map(dependency => (
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
    setDependencies(dependencies.filter(dependency => dependency.id !== idToRemove));
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
      {onRequestClose => (
        <FlexContainer>
          <Form onSubmit={createTask}>
            <AppHeaderContainer>
              <AppHeader>
                Create Task
              </AppHeader>
              <CloseButton onClick={onRequestClose} title="Cancel" />
              <DoneButton buttonType="submit" title="Create task" />
            </AppHeaderContainer>
            <NewTaskMain>
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
                setHasDue={setHasDue}
                hasDue={hasDue}
                setDue={setDue}
                scheduledStart={scheduledStart}
                hasScheduledStart={hasScheduledStart}
                setHasScheduledStart={setHasScheduledStart}
                setScheduledStart={setScheduledStart}
                dependencies={dependencies}
                updateTaskDependency={onUpdateTaskDependency}
                removeTaskDependency={onRemoveTaskDependency}
                createTaskDependency={onCreateTaskDependency}
              />
            </NewTaskMain>
          </Form>
        </FlexContainer>
      )}
    </FullScreenPaper>
  );
};

export default withRouter(NewTask);
