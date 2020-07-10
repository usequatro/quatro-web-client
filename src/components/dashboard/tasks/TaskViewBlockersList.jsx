import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import cond from 'lodash/cond';

import BlockRoundedIcon from '@material-ui/icons/BlockRounded';

import TaskViewSubtitle from './TaskViewSubtitle';
import * as blockerTypes from '../../../constants/blockerTypes';
import { selectTaskActiveBlockerDescriptors, selectTaskTitle } from '../../../modules/tasks';

const TaskTitle = memo(({ id }) => {
  const title = useSelector((state) => selectTaskTitle(state, id));
  return title;
});
TaskTitle.propTypes = {
  id: PropTypes.string.isRequired,
};

const getBlockerTitle = cond([
  [
    (blockerDescriptor) => blockerDescriptor.type === blockerTypes.TASK,
    (blockerDescriptor) => <TaskTitle id={blockerDescriptor.config.taskId} />,
  ],
  [
    (blockerDescriptor) => blockerDescriptor.type === blockerTypes.FREE_TEXT,
    (blockerDescriptor) => `"${blockerDescriptor.config.value}"`,
  ],
  [() => true, () => 'Error'],
]);

const TaskViewBlockersList = ({ id }) => {
  const blockerDescriptors = useSelector((state) => selectTaskActiveBlockerDescriptors(state, id));

  if (blockerDescriptors.length === 0) {
    return null;
  }

  return blockerDescriptors.map((blockerDescriptor, index) => (
    <TaskViewSubtitle
      tooltip="Blocker"
      Icon={BlockRoundedIcon}
      onClick={() => {}}
      key={index /* eslint-disable-line react/no-array-index-key */}
    >
      {getBlockerTitle(blockerDescriptor)}
    </TaskViewSubtitle>
  ));
};

TaskViewBlockersList.propTypes = {
  id: PropTypes.string.isRequired,
};

export default TaskViewBlockersList;
