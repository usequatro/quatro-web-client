import React from 'react';
import { MixpanelConsumer } from '../tracking/MixpanelContext';

const withMixpanel = (Component) => (props) => (
  <MixpanelConsumer>{(mixpanel) => <Component mixpanel={mixpanel} {...props} />}</MixpanelConsumer>
);

export default withMixpanel;
