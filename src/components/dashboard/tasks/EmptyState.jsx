import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Fade from '@material-ui/core/Fade';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

export const IMAGE_SCHEDULED = '/empty-states/empty-state-scheduled.png';
export const IMAGE_NOW = '/empty-states/empty-state-top-4.png';
export const IMAGE_BLOCKED = '/empty-states/empty-state-blocked.png';
export const IMAGE_BACKLOG = '/empty-states/empty-state-backlog.png';
export const IMAGE_COMPLETED = '/empty-states/empty-state-completed.png';
export const IMAGE_CALENDAR = '/empty-states/empty-state-google-calendar.png';

const useStyles = makeStyles((theme) => ({
  emptyStateContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.up('sm')]: {
      flexGrow: 1,
    },
  },
  emptyStateContent: {
    width: '25rem',
    maxWidth: '95vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      margin: '8vh 0',
    },
  },
  emptyStateImage: {
    width: '100%',
    objectFit: 'scale-down',
  },
}));

const EmptyState = ({ text, image, children }) => {
  const classes = useStyles();

  return (
    <Box className={classes.emptyStateContainer}>
      <Fade in>
        <div className={classes.emptyStateContent}>
          <Box width="60%" mb={4} display="flex" justifyContent="center">
            {image && typeof image === 'string' && (
              <img alt="Empty task list" className={classes.emptyStateImage} src={image} />
            )}
            {image && React.isValidElement(image) && image}
          </Box>

          {text && (
            <Typography paragraph align="center" color="textSecondary">
              {typeof text === 'string'
                ? text
                : text.map((line) => (
                    <Fragment key={line}>
                      {line}
                      <br />
                    </Fragment>
                  ))}
            </Typography>
          )}
          {children}
        </div>
      </Fade>
    </Box>
  );
};

EmptyState.propTypes = {
  image: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
  children: PropTypes.node,
};

EmptyState.defaultProps = {
  children: undefined,
};

export default EmptyState;
