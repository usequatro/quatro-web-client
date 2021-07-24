import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import LinearProgress from '@material-ui/core/LinearProgress';

import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@material-ui/icons/RadioButtonUncheckedRounded';

import TextWithLinks from '../../ui/TextWithLinks';

const useStyles = makeStyles((theme) => ({
  subtaskList: {
    marginBottom: theme.spacing(0.5),
  },
  subtaskListItemIcon: {
    minWidth: 0,
  },
  checkbox: {
    padding: theme.spacing(0.5),
    margin: `0 ${theme.spacing(0.5)}px 0 0`,
  },
  progressBar: {
    marginLeft: theme.spacing(1),
  },
}));

const SubtaskList = ({ subtasks, onSubtaskStatusChange, enableStatusChange, showProgressBar }) => {
  const classes = useStyles();

  if (!subtasks || subtasks.length === 0) {
    return null;
  }

  const completedAmount = subtasks.filter((subtask) => subtask.completed).length;
  const completedPercentage = Math.round(100 * (completedAmount / subtasks.length));

  return (
    <Box pb={2}>
      <List disablePadding className={classes.subtaskList}>
        {subtasks.map(({ subtaskId, title, completed }) => (
          <ListItem key={subtaskId} dense disableGutters>
            <ListItemIcon className={classes.subtaskListItemIcon}>
              <Checkbox
                size="small"
                color="primary"
                className={classes.checkbox}
                onClick={(event) => {
                  event.stopPropagation();
                  onSubtaskStatusChange(subtaskId, !completed);
                }}
                onMouseDown={(event) => {
                  // Stops the Material-UI ripple animation on parent buttons
                  event.stopPropagation();
                }}
                checked={completed}
                icon={<RadioButtonUncheckedRoundedIcon fontSize="small" />}
                checkedIcon={<CheckCircleOutlineRoundedIcon fontSize="small" />}
                // prevent UI response value when parent task already completed
                style={{ pointerEvents: !enableStatusChange ? 'none' : '' }}
                disabled={!enableStatusChange && !completed}
              />
            </ListItemIcon>

            <ListItemText
              primary={completed ? undefined : <TextWithLinks text={title} />}
              secondary={completed ? <TextWithLinks text={title} /> : undefined}
            />
          </ListItem>
        ))}
      </List>

      {showProgressBar && (
        <LinearProgress
          variant="determinate"
          value={completedPercentage}
          className={classes.progressBar}
        />
      )}
    </Box>
  );
};

SubtaskList.propTypes = {
  subtasks: PropTypes.arrayOf(
    PropTypes.shape({
      subtaskId: PropTypes.string,
      title: PropTypes.string,
      completed: PropTypes.bool,
    }),
  ).isRequired,
  onSubtaskStatusChange: PropTypes.func.isRequired,
  enableStatusChange: PropTypes.bool.isRequired,
  showProgressBar: PropTypes.bool.isRequired,
};

export default SubtaskList;
