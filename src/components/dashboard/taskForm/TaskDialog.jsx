import React, { forwardRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';

import { setNewTaskInitialState, setTaskInForm } from '../../../modules/taskForm';
import TaskDialogForm from './TaskDialogForm';
import useNewTaskDialogRouterControl from '../../hooks/useNewTaskDialogRouterControl';
import useEditTaskDialogRouterControl from '../../hooks/useEditTaskDialogRouterControl';
import { selectDashboadIsLoaded } from '../../../modules/dashboard';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TaskDialog = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

  const dashboardLoaded = useSelector(selectDashboadIsLoaded);

  const [newTaskDialogOpen, , closeNewTaskDialog] = useNewTaskDialogRouterControl();
  const [editTaskDialogId, , closeEditTaskDialog] = useEditTaskDialogRouterControl();

  const shouldBeOpen = Boolean(dashboardLoaded && (newTaskDialogOpen || editTaskDialogId));
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open && shouldBeOpen) {
      setOpen(true);
    } else if (open && !shouldBeOpen) {
      setOpen(false);
    }
  }, [shouldBeOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // On opening new task modal, clear it
  useEffect(() => {
    if (newTaskDialogOpen && open) {
      dispatch(setNewTaskInitialState());
    }
  }, [newTaskDialogOpen, open, dispatch]);

  // On opening edit task modal, load task data
  useEffect(() => {
    if (open && editTaskDialogId) {
      const success = dispatch(setTaskInForm(editTaskDialogId));
      if (!success) {
        closeEditTaskDialog();
      }
    }
  }, [open, editTaskDialogId, closeEditTaskDialog, dispatch]);

  const handleClose = () => {
    setOpen(false);
    if (newTaskDialogOpen) {
      setTimeout(() => {
        closeNewTaskDialog();
      }, 150);
    }
    if (editTaskDialogId) {
      setTimeout(() => {
        closeEditTaskDialog();
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
      <TaskDialogForm onClose={handleClose} taskId={editTaskDialogId} />
    </Dialog>
  );
};

export default TaskDialog;
