import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles(() => ({
  taskSubtitleWithIcon: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const TaskViewSubtitle = ({ Icon, IconActive, iconProps, onClick, tooltip, children }) => {
  const classes = useStyles();
  const [active, setActive] = useState(false);
  const IconComponent = active && IconActive ? IconActive : Icon;
  return (
    <Typography
      variant="body2"
      className={classes.taskSubtitleWithIcon}
      color="textSecondary"
      gutterBottom
    >
      <Tooltip title={tooltip} arrow>
        <IconButton
          aria-label={tooltip}
          size="small"
          edge="start"
          onFocus={() => setActive(true)}
          onBlur={() => setActive(false)}
          onMouseEnter={() => setActive(true)}
          onMouseLeave={() => setActive(false)}
          color="inherit"
          onClick={onClick}
        >
          <IconComponent color="inherit" {...iconProps} />
        </IconButton>
      </Tooltip>

      {children}
    </Typography>
  );
};

TaskViewSubtitle.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  IconActive: PropTypes.elementType,
  iconProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onClick: PropTypes.func,
  tooltip: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

TaskViewSubtitle.defaultProps = {
  IconActive: undefined,
  iconProps: {},
  onClick: () => {},
};

export default TaskViewSubtitle;
