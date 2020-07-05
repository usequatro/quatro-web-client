import React from 'react';
import Loader from './Loader';

export default ({ loading, children }) => (
  <>
    {loading && (
      <Loader />
    )}
    {!loading && (
      children
    )}
  </>
);
