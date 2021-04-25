import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

/**
 * Hook to control the opening and closing of the new task dialog through React Router
 * @returns {Array}
 */
export default function useNewTaskDialogRouterControl() {
  const history = useHistory();

  const isOpen = new URLSearchParams(history.location.search).get('newTask') !== null;
  const open = useCallback(() => {
    const updatedSearch = new URLSearchParams(history.location.search);
    updatedSearch.set('newTask', '1');
    history.push({ pathname: history.location.pathname, search: updatedSearch.toString() });
  }, [history]);
  const remove = useCallback(() => {
    const updatedSearch = new URLSearchParams(history.location.search);
    updatedSearch.delete('newTask');
    history.replace({ pathname: history.location.pathname, search: updatedSearch.toString() });
  }, [history]);

  return [isOpen, open, remove];
}
