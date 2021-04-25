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
      const updatedSearch = new URLSearchParams(history.location.search);
      updatedSearch.set('tid', taskId);
      history.push({ pathname: history.location.pathname, search: updatedSearch.toString() });
    },
    [history],
  );
  const remove = useCallback(() => {
    const updatedSearch = new URLSearchParams(history.location.search);
    updatedSearch.delete('tid');
    history.replace({ pathname: history.location.pathname, search: updatedSearch.toString() });
  }, [history]);

  return [isOpen, open, remove];
}
