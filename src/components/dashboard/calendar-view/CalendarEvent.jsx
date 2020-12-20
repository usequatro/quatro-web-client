import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import isValid from 'date-fns/isValid';
import isPast from 'date-fns/isPast';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import Typography from '@material-ui/core/Typography';
import startOfDay from 'date-fns/startOfDay';
import Box from '@material-ui/core/Box';
import Popover from '@material-ui/core/Popover';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';

import TICK_HEIGHT from './tickHeight';

import {
  selectCalendarEventSummary,
  selectCalendarEventLocation,
  selectCalendarEventStartDateTime,
  selectCalendarEventEndDateTime,
  selectCalendarEventCalendarId,
  selectCalendarEventProviderCalendarId,
} from '../../../modules/calendarEvents';
import { selectCalendarColor } from '../../../modules/calendars';
import lighenDarkenColor from '../../../utils/lighenDarkenColor';
import TextWithLinks from '../../ui/TextWithLinks';
import DialogTitleWithClose from '../../ui/DialogTitleWithClose';

const useStyles = makeStyles((theme) => ({
  eventCard: {
    position: 'absolute',
    width: '80%',
    padding: `${theme.spacing(1) / 2}px ${theme.spacing(1)}px`,
    borderRadius: 5,
    color: '#FFFFFF',
    border: '1px solid #FFFFFF',
  },
  eventName: {
    fontSize: theme.typography.body2.fontSize,
  },
  eventDate: {
    fontSize: `${parseFloat(theme.typography.body2.fontSize) * 0.8}rem`,
  },
  eventPopoverPaper: {
    overflowWrap: 'break-word',
    [theme.breakpoints.up('md')]: {
      maxWidth: '60vw !important',
    },
  },
}));

const getPaddingForDuration = (duration) => {
  if (duration <= 15) {
    return 2;
  }
  if (duration < 30) {
    return 2;
  }
  return 8;
};

const getLineHeightForDuration = (duration) => {
  if (duration <= 15) {
    return 1;
  }
  if (duration < 30) {
    return 1.25;
  }
  return 1.5;
};

const CalendarEvent = ({ id, zIndex }) => {
  const classes = useStyles();

  const summary = useSelector((state) => selectCalendarEventSummary(state, id));
  const location = useSelector((state) => selectCalendarEventLocation(state, id));
  const providerCalendarId = useSelector((state) =>
    selectCalendarEventProviderCalendarId(state, id),
  );
  const startDateTime = useSelector((state) => selectCalendarEventStartDateTime(state, id));
  const endDateTime = useSelector((state) => selectCalendarEventEndDateTime(state, id));
  const calendarId = useSelector((state) => selectCalendarEventCalendarId(state, id));
  const color = useSelector((state) => selectCalendarColor(state, calendarId)) || '#000000';

  const [focused, setFocused] = useState(false);
  const [calendarDetailsOpen, setCalendarDetailsOpen] = useState(false);
  const cardRef = useRef();

  const startDate = parseISO(startDateTime);
  if (!isValid(startDate)) {
    return null;
  }
  const endDate = parseISO(endDateTime);
  if (!isValid(startDate)) {
    console.error('Invalid end date time', endDateTime, id); // eslint-disable-line no-console
  }

  const eventDurationInMinutes = differenceInMinutes(endDate, startDate);
  const eventDurationInTicks = Math.floor(eventDurationInMinutes / 15);
  const eventDisplayHeight = TICK_HEIGHT * eventDurationInTicks;

  const eventStartInMinutes = differenceInMinutes(startDate, startOfDay(startDate));
  const eventStartInTicks = Math.floor(eventStartInMinutes / 15);
  const eventDisplayTop = eventStartInTicks * TICK_HEIGHT;

  const backgroundColor = isPast(endDate) ? lighenDarkenColor(color, 40) : color;
  const verticalPadding = getPaddingForDuration(eventDurationInMinutes);

  return (
    <>
      <Card
        key={id}
        data-id={id}
        style={{
          height: eventDisplayHeight,
          top: eventDisplayTop,
          zIndex,
          backgroundColor,
          paddingTop: `${verticalPadding}px`,
          paddingBottom: `${verticalPadding}px`,
        }}
        className={classes.eventCard}
        elevation={focused ? 8 : 0}
        role="button"
        tabIndex={0}
        ref={cardRef}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={() => setCalendarDetailsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            setCalendarDetailsOpen(true);
            event.stopPropagation();
          }
        }}
      >
        <Typography
          component="p"
          className={classes.eventName}
          style={{ lineHeight: getLineHeightForDuration(eventDurationInMinutes) }}
        >
          {`${summary},`}
          <span className={classes.eventDate}>
            {' '}
            {isValid(startDate) ? format(startDate, 'h:mm a') : ''}
            {' - '}
            {isValid(endDate) ? format(endDate, 'h:mm a') : ''}
          </span>
        </Typography>
      </Card>

      <Popover
        open={calendarDetailsOpen}
        anchorEl={cardRef.current}
        onClose={() => setCalendarDetailsOpen(false)}
        classes={{ paper: classes.eventPopoverPaper }}
      >
        <DialogTitleWithClose
          onClose={() => setCalendarDetailsOpen(false)}
          title={summary}
          TypographyProps={{ variant: 'h5', component: 'h2' }}
        />

        <Box px={3} pb={3}>
          <Typography variant="body2" gutterBottom>
            {isValid(startDate) ? format(startDate, 'h:mm a') : ''}
            {' - '}
            {isValid(endDate) ? format(endDate, 'h:mm a') : ''}
          </Typography>

          {location && (
            <Typography variant="body2">
              <TextWithLinks text={location} />
            </Typography>
          )}
        </Box>

        {summary && (
          <Box px={3} pb={3}>
            <Typography variant="body2">
              <TextWithLinks text={summary} />
            </Typography>
          </Box>
        )}

        <Box px={3} pb={3}>
          <Typography variant="body2">{`Calendar: ${providerCalendarId}`}</Typography>
        </Box>
      </Popover>
    </>
  );
};

CalendarEvent.propTypes = {
  id: PropTypes.string.isRequired,
  zIndex: PropTypes.number.isRequired,
};

export default CalendarEvent;
