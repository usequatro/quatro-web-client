import React, { useState } from 'react';

import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';

import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

export default function PasswordTextField({ ...props }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <TextField
      type={isPasswordVisible ? 'text' : 'password'}
      {...props}
      InputProps={{
        endAdornment: (
          <IconButton
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            aria-label="Hide or reveal password"
            size="small"
          >
            {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        ),
      }}
    />
  );
}
