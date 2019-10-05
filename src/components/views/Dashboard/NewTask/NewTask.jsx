import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import uuid from 'uuid/v4';
import { Box } from 'rebass/styled-components';

import { addTask } from '../../../../modules/tasks';

import FullScreenPaper from '../../../ui/FullScreenPaper';
import PapelHeader from '../../../ui/PaperHeader';
import BasicMain from '../../../ui/BasicMain';
import ButtonFooter from '../../../ui/ButtonFooter';
import TaskForm from '../EditTask/TaskForm';
import Button from '../../../ui/Button';

const FormFlexContainer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
`;
const NewTaskMain = styled(BasicMain).attrs({ p: 3, pt: 4 })``;
const ContentContainer = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const NewTask = ({ history }) => {
  const [temporaryId, setTemporaryId] = useState('');
  const [title, setTitle] = useState('');
  const [impact, setImpact] = useState('');
  const [effort, setEffort] = useState('');
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

export default withRouter(NewTask);
