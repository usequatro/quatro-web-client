import { memo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { selectTaskTitle } from '../../../modules/tasks';

const TaskTitle = memo(({ id }) => {
  const title = useSelector((state) => selectTaskTitle(state, id));
  return title;
});

TaskTitle.propTypes = {
  id: PropTypes.string.isRequired,
};

export default TaskTitle;
