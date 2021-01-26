import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Fade from '@material-ui/core/Fade';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  emptyStateContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    flexGrow: 1,
  },
  emptyStateContent: {
    width: '25rem',
    maxWidth: '95vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  // emptyStateImage: {
  //   width: '100%',
  //   objectFit: 'scale-down',
  // },
  emptyStateImageContainer: {
    fontSize: 120,
    color: theme.palette.primary.main,
  },
}));

const EmptyState = ({ text, Image, children }) => {
  const classes = useStyles();

  return (
    <Box className={classes.emptyStateContainer}>
      <Fade in>
        <div className={classes.emptyStateContent}>
          <Box
            width="60%"
            mb={4}
            display="flex"
            justifyContent="center"
            alignItems="center"
            className={classes.emptyStateImageContainer}
          >
            {/* {imageUrl && typeof imageUrl === 'string' && (
              <img alt="Empty task list" className={classes.emptyStateImage} src={imageUrl} />
            )} */}
            {Image && <Image fontSize="inherit" />}
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
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
  Image: PropTypes.elementType,
  children: PropTypes.node,
};

EmptyState.defaultProps = {
  Image: undefined,
  children: undefined,
};

export default EmptyState;
