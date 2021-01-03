import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  tickLabel: ({ fontSize }) => ({
    fontSize: fontSize || 'inherit',
    color: theme.palette.text.hint,
    display: 'inline-block',
    backgroundColor: theme.palette.background.paper,
    textAlign: 'right',
    paddingRight: theme.spacing(1),
    whiteSpace: 'nowrap',
  }),
}));

const TickLabel = ({ fontSize, children, className }) => {
  const classes = useStyles({ fontSize });

  return (
    <span className={[classes.tickLabel, className].filter(Boolean).join(' ')}>{children}</span>
  );
};

TickLabel.propTypes = {
  fontSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

TickLabel.defaultProps = {
  fontSize: 'inherit',
  className: '',
};

export default TickLabel;
