import React from 'react';
import PropTypes from 'prop-types';
import cond from 'lodash/cond';
import isArray from 'lodash/isArray';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

const ConfirmationDialog = ({ open, onClose, onConfirm, id, title, body, buttonText }) => (
  <Dialog open={open} onClose={onClose} aria-labelledby={id}>
    <DialogTitle id={id}>{title}</DialogTitle>
    <DialogContent>
      {cond([
        [() => typeof body === 'string', () => <DialogContentText>{body}</DialogContentText>],
        [
          () => isArray(body),
          () =>
            // eslint-disable-next-line react/no-array-index-key
            body.map((line, index) => <DialogContentText key={index}>{line}</DialogContentText>),
        ],
        [() => true, () => body],
      ])()}
    </DialogContent>

    <DialogActions>
      <Button onClick={onClose} variant="text">
        Cancel
      </Button>
      <Button onClick={onConfirm} variant="text" color="primary" autoFocus>
        {buttonText}
      </Button>
    </DialogActions>
  </Dialog>
);

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string), PropTypes.node])
    .isRequired,
  buttonText: PropTypes.string.isRequired,
};

export default ConfirmationDialog;
