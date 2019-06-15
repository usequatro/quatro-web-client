import React, { useState } from 'react';
import { Box, Heading } from 'rebass';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { addTask as addTaskAction } from '../../modules/tasks';

import Paper from '../ui/Paper';
import InputGroup from '../ui/InputGroup';
import InputField from '../ui/InputField';
import CloseButton from '../ui/CloseButton';
import Main from '../ui/Main';
import Button from '../ui/Button';

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const NewTask = ({ addTask, close }) => {
  const [title, setTitle] = useState('');
  const [impact, setImpact] = useState('');
  const [effort, setEffort] = useState('');
  const [description, setDescription] = useState('');

  const createTask = () => {
    addTask({
      title, impact, effort, description,
    });
    close();
  };
  const onTitleChange = event => setTitle(event.target.value);
  const onImpactChange = event => setImpact(event.target.value);
  const onEffortChange = event => setEffort(event.target.value);
  const onDecriptionChange = event => setDescription(event.target.value);

  return (
    <Paper>
      <Box as="header" p={3} mb={4}>
        <Heading color="textHighlight" textAlign="center">
          Create Task
          <CloseButton onClick={close} />
        </Heading>
      </Box>
      <Main>
        <Form onSubmit={createTask}>
          <InputGroup mb={4}>
            <InputField
              required
              fullWidth
              label="What do you have to do?*"
              onChange={onTitleChange}
            />
            <InputField
              required
              type="number"
              min={0}
              max={7}
              fullWidth
              label="How important is this task?*"
              onChange={onImpactChange}
            />
            <InputField
              required
              type="number"
              min={0}
              max={7}
              fullWidth
              label="How much effort will it require?*"
              onChange={onEffortChange}
            />
            <InputField
              textarea
              fullWidth
              label="Notes"
              onChange={onDecriptionChange}
            />
          </InputGroup>

          <Button variant="primary" type="submit">Create task</Button>
        </Form>
      </Main>
    </Paper>
  );
};

const mapDispatchToProps = (dispatch, props) => ({
  close: () => props.history.goBack(),
  addTask: task => dispatch(addTaskAction(task)),
});

export default withRouter(connect(null, mapDispatchToProps)(NewTask));
