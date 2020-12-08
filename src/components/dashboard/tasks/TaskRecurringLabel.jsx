import { memo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { selectTaskScheduledStart } from '../../../modules/tasks';
import { selectRecurringConfigByMostRecentTaskId } from '../../../modules/recurringConfigs';
import getUserFacingRecurringText from '../../../utils/getUserFacingRecurringText';

const TaskRecurringLabel = memo(({ id }) => {
  const recurringConfig = useSelector((state) =>
    selectRecurringConfigByMostRecentTaskId(state, id),
  );
  const scheduledStart = useSelector((state) => selectTaskScheduledStart(state, id));
  return recurringConfig ? getUserFacingRecurringText(recurringConfig, scheduledStart) : '';
});

TaskRecurringLabel.propTypes = {
  id: PropTypes.string.isRequired,
};

export default TaskRecurringLabel;
