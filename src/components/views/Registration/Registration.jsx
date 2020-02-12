import React from 'react';
import styled from 'styled-components';
import { Switch, Route, withRouter } from 'react-router-dom';
import { Heading } from 'rebass/styled-components';

import { SIGN_UP, LOG_IN } from 'constants/paths';

import BasicMain from 'components/ui/BasicMain';
import safariBorderRadiusFix from 'components/style-mixins/safariBorderRadiusFix';
import { mediaVerySmall } from 'components/style-mixins/mediaQueries';

import LogIn from './LogIn';
import SignUp from './SignUp';

const Header = styled.header`
  flex-shrink: 0;
`;
const FormView = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  max-width: 30rem;
  flex-shrink: 0;
`;

const SignUpHeading = styled(Heading).attrs(() => ({
  color: 'textPrimaryOverBackground',
  fontWeight: 'body',
  fontSize: [6, 7],
  pt: [3, 7],
  pb: [3, 6],
}))`
  text-align: center;
  opacity: 0.8; /* to make it lighter */
`;
const SectionTitleContainer = styled(Heading)`
  color: ${({ theme }) => theme.colors.textPrimaryOverBackground};
  text-align: center;

  padding-bottom: ${({ theme }) => theme.space[5]};
  ${mediaVerySmall} {
    padding-bottom: ${({ theme }) => theme.space[3]};
  }
`;

const OuterContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const RegistrationContainer = styled(BasicMain).attrs({
  bg: 'appForeground',
  as: 'div',
  p: [5, 6],
})`
  border-radius: 2rem 2rem 0 0;
  align-items: stretch;
  ${safariBorderRadiusFix}
`;

const locationToSectionTitle = {
  [LOG_IN]: 'Log In',
  [SIGN_UP]: 'Sign Up',
};

const Registration = ({ location }) => (
  <OuterContainer>
    <Header>
      <SignUpHeading>
        Quatro
      </SignUpHeading>
      <SectionTitleContainer>
        {locationToSectionTitle[location.pathname]}
      </SectionTitleContainer>
    </Header>
    <RegistrationContainer>
      <FormView>
        <Switch>
          <Route path={SIGN_UP} component={SignUp} />
          <Route path={LOG_IN} component={LogIn} />
          <Route>404</Route>
        </Switch>
      </FormView>
    </RegistrationContainer>
  </OuterContainer>
);

export default withRouter(Registration);
