import React from 'react';
import Paper from './Paper';
import TopSpacer from './TopSpacer';

export default props => (
  <React.Fragment>
    <TopSpacer />
    <Paper {...props} pt={0} />
  </React.Fragment>
);
