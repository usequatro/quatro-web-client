import React from 'react';
import PropTypes from 'prop-types';

import Zoom from '@material-ui/core/Zoom';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

export const DROP_AREA_HEIGHT = '120px';

const useStyles = makeStyles((theme) => ({
  droppablePlaceholderArea: {
    display: 'flex',
    height: DROP_AREA_HEIGHT,
    flexDirection: 'column',
    justifyContent: 'stretch',
    alignItems: 'stretch',
  },
  droppableInnerContainer: {
    margin: theme.spacing(2),
    height: '100%',
    border: `dotted 1px ${theme.palette.primary.main}`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  droppableDraggingOver: {
    backgroundColor: `${theme.palette.background.lightEmphasis}`,
  },
}));

const TaskSiblingListDropArea = ({ isDraggingOver, title }) => {
  const classes = useStyles();

  return (
    <Zoom in>
      <div className={[
        classes.droppablePlaceholderArea,
        isDraggingOver && classes.droppableDraggingOver,
      ].filter(Boolean).join(' ')}
      >
        <div className={classes.droppableInnerContainer}>
          <Typography color="primary" variant="h6" component="p">
            {title}
          </Typography>
        </div>
      </div>
    </Zoom>
  )
}

TaskSiblingListDropArea.propTypes = {
  title: PropTypes.string.isRequired,
  isDraggingOver: PropTypes.bool.isRequired,
};

export default TaskSiblingListDropArea;
