import React from 'react';
import PropTypes from 'prop-types';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { withStyles } from '@material-ui/core/styles';

const QuatroSlider = withStyles((theme) => ({
  thumb: {
    width: '1.3rem',
    height: '1.3rem',
    marginTop: '-0.6rem',
    marginLeft: '-0.7rem',
    // emoji alignment
    paddingTop: '3px',
    paddingLeft: '1px',
    color: theme.palette.common.white,
    border: `solid 1px ${theme.palette.primary.light}`,
  },
  markLabel: {
    top: '40px',
  },
}))(Slider);

const getValueLabelColor = (value, length) => {
  const percentage = value / length;
  if (percentage < 0.25) {
    return 'textSecondary';
  }
  if (percentage > 0.75) {
    return 'secondary';
  }
  return 'primary';
};

const SliderField = ({
  id,
  label,
  tooltipTitle,
  'aria-label': ariaLabel,
  onChange,
  value,
  getValueText,
  marks,
}) => (
  <>
    <Box display="flex" justifyContent="space-between">
      {label && (
        <Typography id={id} color="textSecondary" gutterBottom>
          {label}

          {tooltipTitle && (
            <Tooltip aria-hidden arrow title={tooltipTitle} placement="top">
              <InfoOutlinedIcon
                fontSize="small"
                style={{ marginLeft: '0.3em', marginBottom: '-0.2em', fontSize: '1em' }}
              />
            </Tooltip>
          )}
        </Typography>
      )}

      <Typography
        gutterBottom
        color={getValueLabelColor(value, marks.length - 1)}
        variant="body1"
        style={{ marginBottom: '1rem' }}
        component="p"
      >
        {getValueText(value)}
      </Typography>
    </Box>

    <Box>
      <QuatroSlider
        aria-label={ariaLabel}
        marks={marks || true}
        min={marks[0].value}
        max={marks[marks.length - 1].value}
        step={1}
        {...(label ? { 'aria-labelledby': id } : {})}
        getAriaValueText={(v) => getValueText(v)}
        /* first thumb is fixed to position 0, the other one is the varying one */
        value={value}
        onChange={(event, newValue) => {
          // const newValue = Math.min(...values.filter((n) => n > 0));
          // console.log(values, newValue);
          onChange(newValue);
        }}
      />
    </Box>
  </>
);

SliderField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  tooltipTitle: PropTypes.string,
  'aria-label': PropTypes.string,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  getValueText: PropTypes.func.isRequired,
  marks: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]).isRequired,
};

SliderField.defaultProps = {
  label: undefined,
  tooltipTitle: undefined,
  'aria-label': undefined,
};

export default SliderField;
