import React from 'react';
import ReactDOM from 'react-dom';

const getRoot = (() => {
  let root;
  return () => {
    if (!root) {
      root = document.getElementById('root');
    }
    return root;
  };
})();

// https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/patterns/using-a-portal.md
// Using a portal to avoid issues with the applied transforms. It's less perfomant though.
const PortalAware = ({ children, usePortal }) => (
  !usePortal
    ? React.Children.only(children)
    : ReactDOM.createPortal(React.Children.only(children), getRoot())
);

export default PortalAware;
