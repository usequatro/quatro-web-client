import React from 'react';
import { Box, Heading } from 'rebass';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { getLoaded, getTask, updateTask as updateTaskAction } from '../../modules/tasks';

import Paper from '../ui/Paper';
import InputGroup from '../ui/InputGroup';
import InputField from '../ui/InputField';
import CloseButton from '../ui/CloseButton';
import Loader from '../ui/Loader';
import Main from '../ui/Main';
import withLoadTasks from '../hoc/withLoadTasks';

const EditTask = ({
  loaded, updateTask, history, id, title, impact, effort, description,
}) => {
  const onUpdate = (key, value) => {
    updateTask(id, { [key]: value });
  };

  return (
    <Paper>
      <Box as="header" p={3} mb={4}>
        <Heading color="textHighlight" textAlign="center">
          Edit Task
          <CloseButton onClick={() => history.goBack()} />
        </Heading>
      </Box>
      <Main>
        {!loaded && (
          <Loader />
        )}
        {loaded && (
          <InputGroup mb={4}>
            <InputField
              required
              label="What do you have to do?*"
              value={title}
              onChange={e => onUpdate('title', e.target.value)}
            />
            <InputField
              required
              type="number"
              min={0}
              max={7}
              label="How important is this task?*"
              value={impact}
              onChange={e => onUpdate('impact', e.target.value)}
            />
            <InputField
              required
              type="number"
              min={0}
              max={7}
              label="How much effort will it require?*"
              value={effort}
              onChange={e => onUpdate('effort', e.target.value)}
            />
            <InputField
              textarea
              label="Notes"
              value={description}
              onChange={e => onUpdate('description', e.target.value)}
            />
          </InputGroup>
        )}
      </Main>
    </Paper>
  );
};

const mapDispatchToProps = {
  updateTask: updateTaskAction,
};

const mapStateToProps = (state, ownProps) => ({
  loaded: getLoaded(state),
  ...getTask(state, ownProps.match.params.id),
});

export default withLoadTasks(withRouter(connect(mapStateToProps, mapDispatchToProps)(EditTask)));
