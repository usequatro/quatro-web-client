import React, { forwardRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';

import {
  selectNewTaskDialogOpen,
  selectEditTaskDialogId,
  setEditTaskDialogId,
  setNewTaskDialogOpen,
} from '../../../modules/dashboard';
import { setNewTaskInitialState, setTaskInForm } from '../../../modules/taskForm';
import TaskDialogForm from './TaskDialogForm';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TaskDialog = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

  const newTaskDialogOpen = useSelector(selectNewTaskDialogOpen);
  const editTaskDialogId = useSelector(selectEditTaskDialogId);

  // On opening new task modal, clear it
  useEffect(() => {
    if (newTaskDialogOpen) {
      dispatch(setNewTaskInitialState());
    }
  }, [newTaskDialogOpen, dispatch]);

  // On opening edit task modal, load task data
  useEffect(() => {
    if (editTaskDialogId) {
      dispatch(setTaskInForm(editTaskDialogId));
    }
  }, [editTaskDialogId, dispatch]);

  const shouldBeOpen = Boolean(newTaskDialogOpen || editTaskDialogId);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open && shouldBeOpen) {
      setOpen(true);
    }
  }, [shouldBeOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setOpen(false);
    if (newTaskDialogOpen) {
      setTimeout(() => {
        dispatch(setNewTaskDialogOpen(false));
      }, 150);
    }
    if (editTaskDialogId) {
      setTimeout(() => {
        dispatch(setEditTaskDialogId(null));
      }, 150);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      aria-labelledby="new-task-dialog-title"
      TransitionComponent={Transition}
    >
      <TaskDialogForm onClose={handleClose} />
    </Dialog>
  );
};

export default TaskDialog;
