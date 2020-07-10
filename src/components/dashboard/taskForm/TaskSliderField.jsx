import React from 'react';
import PropTypes from 'prop-types';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { withStyles } from '@material-ui/core/styles';

const QuatroSlider = withStyles((theme) => ({
  thumb: {
    width: '2rem',
    height: '2rem',
    marginTop: '-1rem',
    marginLeft: '-1rem',
    fontSize: '1.3rem',
    // emoji alignment
    paddingTop: '3px',
    paddingLeft: '1px',
    color: theme.palette.common.white,
    border: `solid 1px ${theme.palette.secondary.main}`,
  },
}))(Slider);

// eslint-disable-next-line react/prop-types
const QuatroSliderThumbnal = ({ style, className, ...props }) => (
  <>
    {/* HACK! We render 2 thumbnails. The first is a fake at the beginning of the slider */}
    <span
      {...props}
      tabIndex={-1}
      style={{ ...(style || {}), left: 0 }}
      className={(className || '')
        .split(' ') // eslint-disable-line react/prop-types
        .filter((c) => !/focusVisible|active/.test(c))
        .join(' ')}
    >
      <span role="img" aria-label="Indicator" style={{ transform: 'scale(-1, 1)' }}>
        🤚
      </span>
    </span>

    <span {...props} className={className} style={style}>
      <span role="img" aria-label="Indicator">
        🤚
      </span>
    </span>
  </>
);

const TaskSliderField = ({ id, label, onChange, value, getValueText, marks }) => (
  <>
    <Typography id={id} color="textSecondary" gutterBottom style={{ fontSize: '0.75rem' }}>
      {label}
    </Typography>
    <Typography gutterBottom color="primary" variant="body1" component="p">
      {getValueText(value)}
    </Typography>
    <Box px={3}>
      <QuatroSlider
        marks={marks || true}
        min={0}
        max={4}
        step={1}
        aria-labelledby={id}
        getAriaValueText={(v) => getValueText(v)}
        /* first thumb is fixed to position 0, the other one is the varying one */
        value={value}
        onChange={(event, newValue) => {
          // const newValue = Math.min(...values.filter((n) => n > 0));
          // console.log(values, newValue);
          onChange(newValue);
        }}
        ThumbComponent={QuatroSliderThumbnal}
      />
    </Box>
  </>
);

TaskSliderField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  getValueText: PropTypes.func.isRequired,
  marks: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]).isRequired,
};

export default TaskSliderField;
