import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Confirm = ({ renderDialog, onConfirm, renderContent }) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setOpen(false);
    onConfirm();
  };

  const handleCancel = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setOpen(false);
  }

  const handleClick = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setOpen(true);
  };

  return (
    <>
      {renderDialog(open, handleConfirm, handleCancel)}
      {renderContent(handleClick)}
    </>
  )
}

Confirm.propTypes = {
  renderDialog: PropTypes.func.isRequired,
  renderContent: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default Confirm;
