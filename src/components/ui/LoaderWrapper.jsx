import React from 'react';
import Loader from 'components/ui/Loader';

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
