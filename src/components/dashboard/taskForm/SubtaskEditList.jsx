import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';

import DragHandleIcon from '@material-ui/icons/DragHandle';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';

import {
  selectFormSubtasks,
  setFormNewSubtask,
  setFormSubtaskText,
  deleteFormSubtask,
  reorderFormSubtasks,
} from '../../../modules/taskForm';
import { InputWithTypography } from '../../ui/InputWithTypography';

const useStyles = makeStyles((theme) => ({
  list: {
    padding: 0,
    '&& > li': {
      padding: 0,
    },
  },
  listItemIcon: {
    minWidth: 0,
    opacity: 0.75,
  },
  subtaskIconButton: {
    opacity: 0.75,
  },
  listItem: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
  },
  inputWithTypography: {
    '&::before': {
      opacity: 0.1,
    },
  },
}));

const SubtaskEditList = () => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const subtasks = useSelector(selectFormSubtasks);

  const [currentSubtaskIndex, setCurrentSubtaskIndex] = useState(null);
  const currentSubtask = useRef(null);
  useEffect(() => {
    if (currentSubtask.current) {
      const input = currentSubtask.current.querySelector('input');
      if (document.activeElement !== input) {
        input.select();
      }
    }
  }, [currentSubtaskIndex]);

  const handleDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    dispatch(
      reorderFormSubtasks({
        sourceIndex: result.source.index,
        destinationIndex: result.destination.index,
      }),
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="droppable">
        {(droppableProvided) => (
          <List
            className={classes.list}
            {...droppableProvided.droppableProps}
            ref={droppableProvided.innerRef}
            subheader="Subtasks:"
          >
            {subtasks.map(({ subtaskId, title }, index) => (
              <Draggable
                key={subtaskId}
                draggableId={subtaskId}
                index={index}
                disableInteractiveElementBlocking
              >
                {(draggableProvided) => (
                  <ListItem
                    key={subtaskId}
                    disableGutters
                    className={classes.listItem}
                    ref={draggableProvided.innerRef}
                    {...draggableProvided.draggableProps}
                    style={draggableProvided.draggableProps.style}
                  >
                    <ListItemText
                      id={subtaskId}
                      ref={currentSubtaskIndex === index ? currentSubtask : null}
                      primary={
                        <InputWithTypography
                          className={classes.inputWithTypography}
                          typography="body2"
                          fullWidth
                          startAdornment={
                            <InputAdornment position="start" disableTypography>
                              <IconButton
                                aria-label="reorder subtask"
                                className={classes.subtaskIconButton}
                                size="small"
                                {...draggableProvided.dragHandleProps}
                              >
                                <DragHandleIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          }
                          endAdornment={
                            <InputAdornment position="end" disableTypography>
                              <IconButton
                                aria-label="delete subtask"
                                className={classes.subtaskIconButton}
                                size="small"
                                onClick={() => dispatch(deleteFormSubtask(subtaskId))}
                              >
                                <DeleteOutlineIcon fontSize="small" />
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
                )}
              </Draggable>
            ))}
            {droppableProvided.placeholder}
          </List>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default SubtaskEditList;
