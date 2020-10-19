import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import parse from 'date-fns/parse';
import formatFunction from 'date-fns/format';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import QueryBuilderRoundedIcon from '@material-ui/icons/QueryBuilderRounded';
import SendRoundedIcon from '@material-ui/icons/SendRounded';

import LabeledIconButton from './LabeledIconButton';

const useStyles = makeStyles((theme) => ({
  popoverPaper: {
    display: 'flex',
    flexDirection: 'column',
  },
  currentValueContainer: {
    padding: theme.spacing(2),
    paddingBottom: 0,
  },
  footer: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'flex-end',
  },
  menuArea: {
    display: 'flex',
    padding: theme.spacing(2),
    paddingRight: 0,
  },
  menu: {
    maxHeight: '50vh',
    overflow: 'auto',
  },
  buttonLabel: {
    justifyContent: 'space-between',
  },
  dateTime: {
    marginLeft: '10rem',
  },
}));

const hours = ['12', '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
const minutes = Array(60).fill('').map((e, i) => `${i < 10 ? '0' : ''}${i}`);
const amPm = ['AM', 'PM'];

const parseSafe = (value, format, fallback) => {
  if (!value) {
    return fallback;
  }
  try {
    return parse(value, format, new Date());
  } catch (error) {
    return fallback;
  }
};

const TimePicker = ({ dateTime, onChangeCommitted, format }) => {
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const anchor = useRef();

  const [currentHour, setCurrentHour] = useState('');
  const [currentMinute, setCurrentMinute] = useState('');
  const [currentAmPm, setCurrentAmPm] = useState('');

  useEffect(() => {
    setCurrentHour(formatFunction(dateTime, 'hh'));
    setCurrentMinute(formatFunction(dateTime, 'mm'));
    setCurrentAmPm(formatFunction(dateTime, 'a'));
  }, [dateTime]);

  const displayFallback = format.replace(/h/ig, '-').replace(/m/ig, '-').replace(/a/ig, '--');

  const handleChangesDone = () => {
    onChangeCommitted(currentHour && currentMinute && currentAmPm
      ? parseSafe(`${currentHour}:${currentMinute} ${currentAmPm}`, 'hh:mm a', null)
      : null);
    setOpen(false);
  };

  return (
    <>
      <Button
        fullWidth
        startIcon={<QueryBuilderRoundedIcon />}
        endIcon={<ArrowForwardIosIcon />}
        onClick={() => setOpen(true)}
        ref={anchor}
        classes={{
          label: classes.buttonLabel,
        }}
      >
        <Typography component="p">
          Time
        </Typography>
        <Box className={classes.dateTime}>
          {dateTime ? formatFunction(dateTime, format) : displayFallback}
        </Box>
      </Button>
      <Popover
        open={open}
        onClose={handleChangesDone}
        anchorEl={anchor.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{ className: classes.popoverPaper }}
      >
        <Box className={classes.currentValueContainer}>
          <Typography align="center" component="p" variant="h6">
            {currentHour || '--'}
            :
            {currentMinute || '--'}
            {' '}
            {currentAmPm || '--'}
          </Typography>
        </Box>

        <Box className={classes.menuArea}>
          <MenuList className={classes.menu}>
            {hours.map((hour) => (
              <MenuItem
                key={hour}
                selected={hour === currentHour}
                onClick={() => setCurrentHour(hour)}
              >
                {hour}
              </MenuItem>
            ))}
          </MenuList>

          <MenuList className={classes.menu}>
            {minutes.map((minute) => (
              <MenuItem
                key={minute}
                selected={minute === currentMinute}
                onClick={() => setCurrentMinute(minute)}
              >
                {minute}
              </MenuItem>
            ))}
          </MenuList>

          <MenuList className={classes.menu}>
            {amPm.map((option) => (
              <MenuItem
                key={option}
                selected={option === currentAmPm}
                onClick={() => setCurrentAmPm(option)}
              >
                {option}
              </MenuItem>
            ))}
          </MenuList>
        </Box>

        <Box className={classes.footer}>
          <LabeledIconButton
            color="background.secondary"
            label="Done"
            icon={<SendRoundedIcon />}
            onClick={handleChangesDone}
          />
        </Box>
      </Popover>
    </>
  );
};

TimePicker.propTypes = {
  dateTime: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired,
  onChangeCommitted: PropTypes.func.isRequired,
  format: PropTypes.string.isRequired,
};

export default TimePicker;
