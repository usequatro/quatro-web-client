import React, { forwardRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import Grow from '@material-ui/core/Grow';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';

import { setFormNewTaskInitialState, setTaskInForm } from '../../../modules/taskForm';
import TaskDialogForm from './TaskDialogForm';
import useNewTaskDialogRouterControl from '../../hooks/useNewTaskDialogRouterControl';
import useEditTaskDialogRouterControl from '../../hooks/useEditTaskDialogRouterControl';
import { selectDashboadIsLoaded } from '../../../modules/dashboard';

const FullScreenTransition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
const DialogTransition = forwardRef((props, ref) => <Grow ref={ref} {...props} />);

const TaskDialog = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'), { noSsr: true });

  const dashboardLoaded = useSelector(selectDashboadIsLoaded);

  const [newTaskByUrl, , removeNewTaskParam] = useNewTaskDialogRouterControl();
  const [editTaskByUrl, , removeEditTaskParam] = useEditTaskDialogRouterControl();

  const shouldBeOpen = Boolean(dashboardLoaded && (newTaskByUrl || editTaskByUrl));
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (shouldBeOpen) {
      setOpen(true);
    }
  }, [shouldBeOpen]);

  // On opening edit task modal, load task data
  useEffect(() => {
    if (open && editTaskByUrl) {
      const success = dispatch(setTaskInForm(editTaskByUrl));
      if (!success) {
        removeEditTaskParam();
        setOpen(false);
      }
    }
  }, [open, editTaskByUrl, removeEditTaskParam, dispatch]);

  const handleClose = () => {
    setOpen(false);
    if (newTaskByUrl) {
      removeNewTaskParam();
    }
    if (editTaskByUrl) {
      removeEditTaskParam();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      onExited={() => dispatch(setFormNewTaskInitialState())}
      fullScreen={fullScreen}
      TransitionComponent={fullScreen ? FullScreenTransition : DialogTransition}
    >
      <TaskDialogForm onClose={handleClose} />
    </Dialog>
  );
};

export default TaskDialog;
