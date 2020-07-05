import React from 'react';

// The base of this component is the Material UI Slider. It allows for
// enough customization for our needs.
//
// Docs: https://material-ui.com/components/slider/
// Override Docs: https://material-ui.com/customization/components/
import { Slider as BaseMaterialSlider } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import RightHandIcon from '../icons/RightHand';
import {
  LIGHTEST_BLUE,
  GREEN_GRAY,
  DARK_BLUE,
} from '../../constants/colors';

const Slider = withStyles({
  // The target
  thumb: {
    height: 40,
    width: 40,
    marginTop: -18,
    marginLeft: -18,
    backgroundColor: '#fff',
    borderRadius: '50%',
    boxShadow: `${DARK_BLUE} 0px 1px 4px`,
    '&:focus,&:hover,&$active': {
      boxShadow: `${DARK_BLUE} 0px 1px 4px 2px`,
    },
  },

  // The mark on the option itself
  mark: {
    backgroundColor: LIGHTEST_BLUE,
    height: 20,
    width: 8,
    marginTop: -6,
    marginLeft: -4,
    borderRadius: 4,
  },

  // The whole bar on the slider
  track: {
    height: 6,
    backgroundColor: LIGHTEST_BLUE,
  },

  rail: {
    height: 6,
    backgroundColor: LIGHTEST_BLUE,
  },

  // The labels on the sider
  markLabel: {
    marginTop: 14,
    fontSize: 10,
    color: GREEN_GRAY,
  },
})(BaseMaterialSlider);

// Export the Slider itself
export default Slider;

// This is the interactive drag target for the slider. Can be passed
// to the Slider component when rendered as the custom slider.
export const SliderThumb = (props) => (
  <div {...props}>
    <RightHandIcon size="fill" />
  </div>
);
