import React from 'react';
import PropTypes from 'prop-types';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  h1: theme.typography.h1,
  h2: theme.typography.h2,
  h3: theme.typography.h3,
  h4: theme.typography.h4,
  h5: theme.typography.h5,
  h6: theme.typography.h6,
  body1: theme.typography.body1,
  body2: theme.typography.body2,
}));

export const InputWithTypography = ({ typography, ...props }) => {
  const classes = useStyles();
  return <Input {...props} classes={{ input: classes[typography] }} />;
};

InputWithTypography.propTypes = {
  typography: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body1', 'body2']).isRequired,
};

export const TextFieldWithTypography = ({ typography, InputProps = {}, ...props }) => {
  const classes = useStyles();
  return (
    <TextField
      {...props}
      InputProps={{
        classes: { input: classes[typography], ...(InputProps.classes || {}) },
        ...(InputProps || {}),
      }}
    />
  );
};

TextFieldWithTypography.propTypes = {
  typography: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body1', 'body2']).isRequired,
  InputProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

TextFieldWithTypography.defaultProps = {
  InputProps: undefined,
};
