import React from 'react';
import PropTypes from 'prop-types';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';

import DoubleArrowRoundedIcon from '@material-ui/icons/DoubleArrowRounded';

import useDelayedState from '../../hooks/useDelayedState';

const useStyles = makeStyles((theme) => ({
  toggleListItem: {
    transform: ({ open }) => (open ? 'rotateY(180deg)' : 'rotateY(0deg)'),
    transition: ({ open }) =>
      theme.transitions.create('transform', {
        delay: open ? 0 : theme.transitions.duration.standard,
        duration: 0,
      }),
  },
}));

const PassThrough = ({ children }) => children;

const NavigationSidebarFooter = ({ open, setNavigationOpen }) => {
  const classes = useStyles({ open });

  const delayedOpen = useDelayedState(open, 1000); // trick to prevent tooltip showing when closing
  const TooltipWhenClosed = open || delayedOpen ? PassThrough : Tooltip;

  return (
    <List>
      <TooltipWhenClosed title="Expand" placement="right" arrow>
        <ListItem
          button
          onClick={() => setNavigationOpen(!open)}
          className={classes.toggleListItem}
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          <ListItemIcon>
            <DoubleArrowRoundedIcon fontSize="small" />
          </ListItemIcon>
        </ListItem>
      </TooltipWhenClosed>
    </List>
  );
};

NavigationSidebarFooter.propTypes = {
  open: PropTypes.bool.isRequired,
  setNavigationOpen: PropTypes.func.isRequired,
};

export default NavigationSidebarFooter;
