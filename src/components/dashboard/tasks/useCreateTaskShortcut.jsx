import { useSelector, useDispatch } from 'react-redux';
import { useHotkeys } from 'react-hotkeys-hook';

import {
  setNewTaskDialogOpen,
  selectNewTaskDialogOpen,
  selectEditTaskDialogId,
} from '../../../modules/dashboard';

const KEY = 'space';

export default function useCreateTaskShortcut() {
  const dispatch = useDispatch();

  const newTaskDialogOpen = useSelector(selectNewTaskDialogOpen);
  const editTaskDialogId = useSelector(selectEditTaskDialogId);

  useHotkeys(
    KEY,
    (event) => {
      if (newTaskDialogOpen || editTaskDialogId) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      dispatch(setNewTaskDialogOpen(true));
    },
    [newTaskDialogOpen, editTaskDialogId],
  );
}
