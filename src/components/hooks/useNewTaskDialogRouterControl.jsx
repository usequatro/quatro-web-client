import { useHistory } from 'react-router-dom';

/**
 * Hook to control the opening and closing of the new task dialog through React Router
 * @returns {Array}
 */
export default function useNewTaskDialogRouterControl() {
  const history = useHistory();

  const isOpen = new URLSearchParams(history.location.search).get('newTask') !== null;
  const open = () => {
    history.push({ pathname: history.location.pathname, search: '?newTask' });
  };
  const close = () => {
    if (isOpen) {
      history.replace({ pathname: history.location.pathname, search: '' });
    }
  };

  return [isOpen, open, close];
}
