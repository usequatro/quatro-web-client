import styled from 'styled-components';
// @ts-ignore
import { Box } from 'rebass/styled-components';
import Button from 'components/ui/Button';

const FooterContainer = styled(Box)`
  align-self: flex-end;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex-shrink: 0;
`;

const FooterButton = styled(Button).attrs({
  fontSize: 4,
  p: [4, 5],
})`
  border-radius: 0;
  text-transform: uppercase;
`;

const ButtonFooter = {
  Container: FooterContainer,
  Button: FooterButton,
};

export default ButtonFooter;
