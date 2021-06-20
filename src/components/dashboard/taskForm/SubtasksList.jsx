import React, { useState, useEffect, useRef } from 'react';
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
  root: {
    padding: 0,
    '&& > li': {
      padding: 0,
    },
  },
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

  const [currentSubtaskIndex, setCurrentSubtaskIndex] = useState(null);
  const currentSubtask = useRef(null);
  useEffect(() => {
    if (currentSubtask.current) {
      currentSubtask.current.querySelector('input').select();
    }
  }, [currentSubtaskIndex]);

  return (
    <List className={classes.root}>
      {subtasks.map(({ subtaskId, text, completed }, index) => (
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
            ref={currentSubtaskIndex === index ? currentSubtask : null}
            style={completed ? { textDecoration: 'line-through' } : {}}
            primary={
              <InputWithTypography
                className={classes.inputWithTypography}
                typography="body2"
                fullWidth
                value={text}
                autoFocus={!text}
                onFocus={() => setCurrentSubtaskIndex(index)}
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
                    dispatch(setFormNewSubtask(index + 1));
                    setCurrentSubtaskIndex(index + 1);
                  }
                  if (event.key === 'Backspace' && text === '') {
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
