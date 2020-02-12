import React from 'react';
import { Heading } from 'rebass/styled-components';
// import styled from 'styled-components';

import Popup from 'components/ui/Popup';
import ButtonInline from 'components/ui/ButtonInline';
import Paragraph from 'components/ui/Paragraph';

const DeleteConfirmationPopup = ({
  open,
  onConfirm,
  onCancel,
}) => {
  return (
    <Popup open={open}>
      <Popup.Header>
        <Heading>Delete Task</Heading>
      </Popup.Header>

      <Popup.Content>
        <Paragraph>Are you sure you want to delete this task?</Paragraph>
      </Popup.Content>

      <Popup.Footer>
        <ButtonInline onClick={() => onCancel()}>Cancel</ButtonInline>
        <ButtonInline onClick={() => onConfirm()}>Delete</ButtonInline>
      </Popup.Footer>
    </Popup>
  );
};

export default DeleteConfirmationPopup;
