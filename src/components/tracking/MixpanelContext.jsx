import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import mixpanelInstance from '../../utils/mixpanelInstance';

const MixpanelContext = React.createContext();

export const MixpanelProvider = ({ children }) => (
  <MixpanelContext.Provider value={mixpanelInstance}>{children}</MixpanelContext.Provider>
);

MixpanelProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useMixpanel = () => useContext(MixpanelContext);
