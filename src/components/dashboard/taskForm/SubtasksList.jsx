import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';

import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@material-ui/icons/RadioButtonUncheckedRounded';

import {
  selectFormSubtasks,
  setFormNewSubtask,
  setFormSubtaskText,
  setFormSubtaskStatus,
  deleteFormSubtask,
} from '../../../modules/taskForm';
import { InputWithTypography } from '../../ui/InputWithTypography';

const useStyles = makeStyles((theme) => ({
  listItemIcon: {
    minWidth: theme.spacing(5),
  },
  inputWithTypography: {
    '&&&:before': {
      borderBottom: 'none',
    },
  },
}));

const SubtasksList = () => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const subtasks = useSelector(selectFormSubtasks);

  return (
    <List dense>
      {subtasks.map(({ subtaskId, text, completed }) => (
        <ListItem key={subtaskId} disableGutters>
          <ListItemIcon className={classes.listItemIcon}>
            <Checkbox
              onClick={() => dispatch(setFormSubtaskStatus({ subtaskId, completed: !completed }))}
              checked={completed}
              tabIndex={-1}
              disableRipple
              icon={<RadioButtonUncheckedRoundedIcon fontSize="small" />}
              checkedIcon={<CheckCircleOutlineRoundedIcon fontSize="small" />}
            />
          </ListItemIcon>

          <ListItemText
            id={subtaskId}
            style={completed ? { textDecoration: 'line-through' } : {}}
            primary={
              <InputWithTypography
                className={classes.inputWithTypography}
                typography="body2"
                fullWidth
                value={text}
                autoFocus={!text}
                onChange={(event) => {
                  dispatch(setFormSubtaskText({ subtaskId, text: event.target.value }));
                }}
                onBlur={() => {
                  // Prevent leaving whitespaces saved at beginning or end
                  if (text !== text.trim()) {
                    dispatch(setFormSubtaskText({ subtaskId, text: text.trim() }));
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.stopPropagation();
                    dispatch(setFormNewSubtask());
                  }
                  if (event.key === 'Backspace' && text === '') {
                    dispatch(deleteFormSubtask(subtaskId));
                  }
                }}
              />
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default SubtasksList;
