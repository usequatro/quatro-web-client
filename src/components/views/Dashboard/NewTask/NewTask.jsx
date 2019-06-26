import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import dayjs from 'dayjs';

import { addTask as addTaskAction } from '../../../../modules/tasks';

import FullScreenPaper from '../../../ui/FullScreenPaper';
import CloseButton from '../../../ui/CloseButton';
import { AppHeaderContainer, AppHeader } from '../../../ui/AppHeader';
import Main from '../../../ui/Main';
import Button from '../../../ui/Button';
import TaskForm from '../EditTask/TaskForm';

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const NewTaskMain = styled(Main).attrs({ p: 3 })`
  flex-grow: 1;
  overflow-y: auto;
`;

const getInitialDueDate = () => dayjs()
  .add(1, 'day')
  .hour(17)
  .startOf('hour')
  .valueOf();

const NewTask = ({ addTask }) => {
  const [title, setTitle] = useState('');
  const [impact, setImpact] = useState('');
  const [effort, setEffort] = useState('');
  const [description, setDescription] = useState('');
  const [hasDue, setHasDue] = useState(false);
  const [due, setDue] = useState(getInitialDueDate());

  const createTask = (event) => {
    event.preventDefault();
    addTask({
      title,
      impact,
      effort,
      description,
      due: hasDue ? due : undefined,
    });
  };

  return (
    <FullScreenPaper>
      {onRequestClose => (
        <React.Fragment>
          <AppHeaderContainer>
            <AppHeader>
              Create Task
            </AppHeader>
            <CloseButton onClick={onRequestClose} />
          </AppHeaderContainer>
          <NewTaskMain>
            <Form onSubmit={createTask}>
              <TaskForm
                title={title}
                impact={impact}
                effort={effort}
                description={description}
                hasDue={hasDue}
                due={due}
                setTitle={setTitle}
                setImpact={setImpact}
                setEffort={setEffort}
                setDescription={setDescription}
                setHasDue={setHasDue}
                setDue={setDue}
              />
              <Button variant="primary" type="submit">Create task</Button>
            </Form>
          </NewTaskMain>
        </React.Fragment>
      )}
    </FullScreenPaper>
  );
};

const mapDispatchToProps = dispatch => ({
  addTask: task => dispatch(addTaskAction(task)),
});

export default connect(null, mapDispatchToProps)(NewTask);
