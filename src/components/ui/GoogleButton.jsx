import React from 'react';
import Button from '@material-ui/core/Button';

const GoogleButton = ({ ...props }) => (
  <Button
    type="button"
    variant="outlined"
    size="large"
    startIcon={
      <img
        src="/images/google_logo.png"
        alt="google logo"
        style={{ width: '1.5rem', height: '1.5rem' }}
      />
    }
    {...props}
  />
);

export default GoogleButton;
