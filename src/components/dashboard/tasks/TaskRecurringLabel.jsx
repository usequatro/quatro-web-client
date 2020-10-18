import { memo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { selectRecurringConfigByMostRecentTaskId } from '../../../modules/recurringConfigs';
import getUserFacingRecurringText from '../../../utils/getUserFacingRecurringText';

const TaskRecurringLabel = memo(({ id }) => {
  const recurringConfig = useSelector((state) =>
    selectRecurringConfigByMostRecentTaskId(state, id),
  );
  return recurringConfig ? getUserFacingRecurringText(recurringConfig) : '';
});

TaskRecurringLabel.propTypes = {
  id: PropTypes.string.isRequired,
};

export default TaskRecurringLabel;
