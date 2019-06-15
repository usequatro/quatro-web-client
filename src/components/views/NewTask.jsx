import React, { useState } from 'react';
import { Box, Heading } from 'rebass';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { addTask as addTaskAction } from '../../modules/tasks';

import Paper from '../ui/Paper';
import InputGroup from '../ui/InputGroup';
import InputField from '../ui/InputField';
import CloseButton from '../ui/CloseButton';
import Main from '../ui/Main';
import Button from '../ui/Button';

const NewTask = ({ addTask, close }) => {
  const [title, setTitle] = useState('');
  const [impact, setImpact] = useState('');
  const [effort, setEffort] = useState('');
  const [description, setDescription] = useState('');

  const createTask = () => {
    addTask({
      title, impact, effort, description, start: null,
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
        <InputGroup mb={4}>
          <InputField fullWidth label="What do you have to do?*" onChange={onTitleChange} />
          <InputField fullWidth label="How important is this task?*" onChange={onImpactChange} />
          <InputField fullWidth label="How much effort will it require?*" onChange={onEffortChange} />
          <InputField fullWidth label="Notes" textarea onChange={onDecriptionChange} />
        </InputGroup>

        <Button variant="primary" onClick={createTask}>Create task</Button>
      </Main>
    </Paper>
  );
};

NewTask.propTypes = {
  addTask: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, props) => ({
  close: () => props.history.goBack(),
  addTask: task => dispatch(addTaskAction(task)),
});

export default withRouter(connect(null, mapDispatchToProps)(NewTask));
