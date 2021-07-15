import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  InputAdornment,
  IconButton,
} from '@material-ui/core';

import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@material-ui/icons/RadioButtonUncheckedRounded';
import ClearIcon from '@material-ui/icons/Clear';

import {
  selectFormSubtasks,
  setFormNewSubtask,
  setFormSubtaskText,
  setFormSubtaskStatus,
  deleteFormSubtask,
} from '../../../modules/taskForm';
import { InputWithTypography } from '../../ui/InputWithTypography';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 0,
    '&& > li': {
      padding: 0,
    },
  },
  listItemIcon: {
    minWidth: theme.spacing(5),
  },
  listItem: {
    // Show the delete button when hovering the entire subtask input title
    '&&:hover .MuiInputAdornment-root > button': {
      opacity: 1,
    },
  },
  inputWithTypography: {
    '&&&:before': {
      borderBottom: 'none',
    },
    // Hide the delete button by default
    '&& > .MuiInputAdornment-root > button': {
      opacity: 0,
    },

    // When focusing the delete button, we show it
    '&& > .MuiInputAdornment-root > button:focus': {
      opacity: 1,
    },
    // When the subtask title input is focused, we show the delete
    '&.Mui-focused > .MuiInputAdornment-root > button': {
      opacity: 1,
    },
  },
}));

const SubtasksList = () => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const subtasks = useSelector(selectFormSubtasks);

  const [currentSubtaskIndex, setCurrentSubtaskIndex] = useState(null);
  const currentSubtask = useRef(null);
  useEffect(() => {
    if (currentSubtask.current) {
      currentSubtask.current.querySelector('input').select();
    }
  }, [currentSubtaskIndex]);

  return (
    <List className={classes.root}>
      {subtasks.map(({ subtaskId, title, completed }, index) => (
        <ListItem key={subtaskId} disableGutters className={classes.listItem}>
          <ListItemIcon className={classes.listItemIcon}>
            <Checkbox
              onClick={() => dispatch(setFormSubtaskStatus({ subtaskId, completed: !completed }))}
              checked={completed}
              icon={<RadioButtonUncheckedRoundedIcon fontSize="small" />}
              checkedIcon={<CheckCircleOutlineRoundedIcon fontSize="small" />}
            />
          </ListItemIcon>

          <ListItemText
            id={subtaskId}
            ref={currentSubtaskIndex === index ? currentSubtask : null}
            style={completed ? { textDecoration: 'line-through' } : {}}
            primary={
              <InputWithTypography
                className={classes.inputWithTypography}
                typography="body2"
                fullWidth
                endAdornment={
                  <InputAdornment position="end" disableTypography>
                    <IconButton
                      aria-label="delete subtask"
                      size="small"
                      onClick={() => dispatch(deleteFormSubtask(subtaskId))}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                }
                value={title}
                autoFocus={!title}
                onFocus={() => setCurrentSubtaskIndex(index)}
                onChange={(event) => {
                  dispatch(setFormSubtaskText({ subtaskId, title: event.target.value }));
                }}
                onBlur={() => {
                  // Prevent leaving whitespaces saved at beginning or end
                  if (typeof title === 'string' && title !== title.trim()) {
                    dispatch(setFormSubtaskText({ subtaskId, title: title.trim() }));
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !(event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    event.stopPropagation();
                    dispatch(setFormNewSubtask(index + 1));
                    setCurrentSubtaskIndex(index + 1);
                  }
                  if (event.key === 'Backspace' && title === '') {
                    dispatch(deleteFormSubtask(subtaskId));
                    setCurrentSubtaskIndex(index - 1);
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
