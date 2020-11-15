import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

/**
 * Hook to control the opening and closing of the edit task dialog through React Router
 * @returns {Array}
 */
export default function useEditTaskDialogRouterControl() {
  const history = useHistory();

  const isOpen = new URLSearchParams(history.location.search).get('tid');
  const open = useCallback(
    (taskId) => {
      history.push({ pathname: history.location.pathname, search: `?tid=${taskId}` });
    },
    [history],
  );
  const close = useCallback(() => {
    if (isOpen) {
      history.replace({ pathname: history.location.pathname, search: '' });
    }
  }, [history, isOpen]);

  return [isOpen, open, close];
}
