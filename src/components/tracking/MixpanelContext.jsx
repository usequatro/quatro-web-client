import React from 'react';
import PropTypes from 'prop-types';

const MixpanelContext = React.createContext();
export default MixpanelContext;

MixpanelContext.Provider.propTypes = {
  value: PropTypes.shape({
    init: PropTypes.func.isRequired,
    track: PropTypes.func.isRequired,
  }),
};

export const MixpanelProvider = ({ mixpanel, children }) => (
  <MixpanelContext.Provider value={mixpanel}>{children}</MixpanelContext.Provider>
);

export const mixpanelShape = PropTypes.shape({
  init: PropTypes.func.isRequired,
  track: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  people: PropTypes.shape({
    set: PropTypes.func.isRequired,
  }).isRequired,
});

MixpanelProvider.propTypes = {
  children: PropTypes.node.isRequired,
  mixpanel: mixpanelShape.isRequired,
};

export const MixpanelConsumer = MixpanelContext.Consumer;
