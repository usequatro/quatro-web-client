import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function GoogleSignInConfirmDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="password-confirm-title">
      <DialogTitle id="password-confirm-title">Before moving on</DialogTitle>
      <DialogContent>
        <DialogContentText>
          It&quot;s been a while your session is open. To verify your identify, please log out, log
          in and try again
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

GoogleSignInConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
