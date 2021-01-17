import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import PasswordTextField from '../../ui/PasswordTextField';

export default function PasswordConfirmDialog({ open, onClose, onConfirm }) {
  const [password, setPassword] = useState('');
  const handleConfirm = (event) => {
    event.preventDefault();
    onConfirm(password);
    onClose();
  };

  useEffect(() => {
    setPassword('');
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="password-confirm-title">
      <DialogTitle id="password-confirm-title">Before moving on</DialogTitle>
      <form onSubmit={handleConfirm}>
        <DialogContent>
          <DialogContentText>
            Please confirm your current password to save changes
          </DialogContentText>

          <PasswordTextField
            label="Current password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="outlined" color="primary" autoFocus disabled={!password}>
            Continue
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

PasswordConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
