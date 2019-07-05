import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { withRouter } from 'react-router-dom';

import { addTask as addTaskAction } from '../../../../modules/tasks';

import FullScreenPaper from '../../../ui/FullScreenPaper';
import CloseButton from '../../../ui/CloseButton';
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
const NewTaskMain = styled(Main).attrs({ p: 3 })`
  flex-grow: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const getInitialDueDate = () => dayjs()
  .add(1, 'day')
  .hour(17)
  .startOf('hour')
  .valueOf();

const NewTask = ({ history, addTask }) => {
  const [title, setTitle] = useState('');
  const [impact, setImpact] = useState('');
  const [effort, setEffort] = useState('');
  const [description, setDescription] = useState('');
  const [hasDue, setHasDue] = useState(false);
  const [due, setDue] = useState(getInitialDueDate());
  const [hasScheduledStart, setHasScheduledStart] = useState(false);
  const [scheduledStart, setScheduledStart] = useState(null);

  const createTask = (event) => {
    event.preventDefault();
    addTask({
      title,
      impact,
      effort,
      description,
      due: hasDue ? due : null,
      scheduledStart: hasScheduledStart ? scheduledStart : null,
    });
    history.goBack();
  };

  return (
    <FullScreenPaper>
      {onRequestClose => (
        <FlexContainer>
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
                dependencies={[]}
                setDependencies={() => {}}
              />
              <Button variant="primary" type="submit">Create task</Button>
            </Form>
          </NewTaskMain>
        </FlexContainer>
      )}
    </FullScreenPaper>
  );
};

const mapDispatchToProps = dispatch => ({
  addTask: task => dispatch(addTaskAction(task)),
});

export default withRouter(connect(null, mapDispatchToProps)(NewTask));
