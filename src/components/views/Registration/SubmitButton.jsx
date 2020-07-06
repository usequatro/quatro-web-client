import React from 'react';
import styled from 'styled-components';

import Button from '../../ui/Button';
import Loader from '../../ui/Loader';

const SubmitButton = styled(Button).attrs({
  fontSize: 4,
  py: [3, 4],
  px: [4, 5],
  mt: [0, 3, 5],
})`
  text-transform: uppercase;
`;

export default ({ submitting, children, ...props }) => (
  <SubmitButton {...props}>
    {submitting ? <Loader color="textPrimaryOverBackground" /> : children}
  </SubmitButton>
);
