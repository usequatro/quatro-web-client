import { useHotkeys } from 'react-hotkeys-hook';

import useNewTaskDialogRouterControl from '../../hooks/useNewTaskDialogRouterControl';
import useEditTaskDialogRouterControl from '../../hooks/useEditTaskDialogRouterControl';

const KEY = 'space';

export default function useCreateTaskShortcut() {
  const [newTaskDialogOpen, openNewTaskDialog] = useNewTaskDialogRouterControl();
  const [editTaskDialogId] = useEditTaskDialogRouterControl();

  useHotkeys(
    KEY,
    (event) => {
      if (newTaskDialogOpen || editTaskDialogId) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      openNewTaskDialog();
    },
    [newTaskDialogOpen, editTaskDialogId],
  );
}
