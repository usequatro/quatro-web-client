import React from 'react';
import { MixpanelConsumer } from 'react-mixpanel';

const withMixpanel = (Component) => (props) => (
  <MixpanelConsumer>
    {(mixpanel) => <Component mixpanel={mixpanel} {...props} />}
  </MixpanelConsumer>
);

export default withMixpanel;
