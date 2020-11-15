import React, { forwardRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Dialog from '@material-ui/core/Dialog';
import Zoom from '@material-ui/core/Zoom';
import { makeStyles } from '@material-ui/core/styles';

import {
  selectNewTaskDialogOpen,
  selectEditTaskDialogId,
  setEditTaskDialogId,
  setNewTaskDialogOpen,
} from '../../../modules/dashboard';
import { setNewTaskInitialState, setTaskInForm } from '../../../modules/taskForm';
import TaskDialogForm from './TaskDialogForm';

const Transition = forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    [theme.breakpoints.up('sm')]: {
      width: '80%',
    },
  },
}));

const TaskDialog = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

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
      aria-labelledby="new-task-dialog-title"
      TransitionComponent={Transition}
      classes={{ paper: classes.dialogPaper }}
      maxWidth={false}
    >
      <TaskDialogForm onClose={handleClose} />
    </Dialog>
  );
};

export default TaskDialog;
