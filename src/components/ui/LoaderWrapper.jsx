import React from 'react';
import Loader from './Loader';

export default ({ loading, children }) => (
  <React.Fragment>
    {loading && (
      <Loader />
    )}
    {!loading && (
      children
    )}
  </React.Fragment>
);
