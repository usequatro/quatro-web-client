import React, { useState, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import isValid from 'date-fns/isValid';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';

import LaunchRoundedIcon from '@material-ui/icons/LaunchRounded';

import {
  selectCalendarEventSummary,
  selectCalendarEventDescription,
  selectCalendarEventHtmlLink,
  selectCalendarEventLocation,
  selectCalendarEventStartDateTime,
  selectCalendarEventEndDateTime,
  selectCalendarEventAllDay,
  selectCalendarEventCalendarId,
  selectCalendarEventProviderCalendarId,
  selectCalendarEventStyle,
} from '../../../modules/calendarEvents';
import { selectCalendarColor } from '../../../modules/calendars';
import TextWithLinks from '../../ui/TextWithLinks';
import DialogTitleWithClose from '../../ui/DialogTitleWithClose';
import parseHtml from '../../../utils/parseHtml';

const useStyles = makeStyles((theme) => ({
  eventCard: ({ color }) => ({
    width: '100%',
    padding: `${theme.spacing(1) / 2}px ${theme.spacing(1)}px`,
    borderRadius: 5,
    color: theme.palette.getContrastText(color),
    backgroundColor: color,
    border: `solid 1px ${theme.palette.getContrastText(color)}`,
    outline: 'none',
    cursor: 'pointer',
  }),
  scrollAnchor: {
    width: 0,
    height: 0,
    display: 'block',
    transform: 'translateY(-100px)',
  },
  eventName: {
    fontSize: theme.typography.body2.fontSize,
    lineHeight: 'inherit',
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
  eventPopoverDescription: {
    whiteSpace: 'pre-wrap',
  },
}));

const EventCard = ({ id, scrollAnchorRef }) => {
  const summary = useSelector((state) => selectCalendarEventSummary(state, id));
  const description = useSelector((state) => selectCalendarEventDescription(state, id));
  const htmlLink = useSelector((state) => selectCalendarEventHtmlLink(state, id));
  const location = useSelector((state) => selectCalendarEventLocation(state, id));
  const providerCalendarId = useSelector((state) =>
    selectCalendarEventProviderCalendarId(state, id),
  );
  const startDateTime = useSelector((state) => selectCalendarEventStartDateTime(state, id));
  const endDateTime = useSelector((state) => selectCalendarEventEndDateTime(state, id));
  const allDay = useSelector((state) => selectCalendarEventAllDay(state, id));
  const calendarId = useSelector((state) => selectCalendarEventCalendarId(state, id));
  const color = useSelector((state) => selectCalendarColor(state, calendarId)) || '#000000';

  const style = useSelector((state) => selectCalendarEventStyle(state, id));

  const classes = useStyles({ color });

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

  return (
    <>
      <Card
        key={id}
        data-id={id}
        style={style}
        className={classes.eventCard}
        elevation={focused || calendarDetailsOpen ? 8 : 0}
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
        {scrollAnchorRef && (
          <span
            id="event-card-scroll-anchor"
            ref={scrollAnchorRef}
            className={classes.scrollAnchor}
          />
        )}
        <Typography component="p" className={classes.eventName}>
          {summary || '(No title)'}
          {!allDay && (
            <span className={classes.eventDate}>
              {', '}
              {isValid(startDate) ? format(startDate, 'h:mm a') : ''}
              {' - '}
              {isValid(endDate) ? format(endDate, 'h:mm a') : ''}
            </span>
          )}
        </Typography>
      </Card>
      <Popover
        open={calendarDetailsOpen}
        anchorEl={cardRef.current}
        onClose={() => setCalendarDetailsOpen(false)}
        classes={{ paper: classes.eventPopoverPaper }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
      >
        <DialogTitleWithClose
          onClose={() => setCalendarDetailsOpen(false)}
          title={summary || '(No title)'}
          TypographyProps={{ variant: 'h5', component: 'h2' }}
          extraButtons={
            <Tooltip title="Open in Google Calendar" enterDelay={1000} arrow>
              <IconButton
                edge="end"
                color="inherit"
                href={htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="open in calendar app"
              >
                <LaunchRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          }
        />

        <Box px={3} pb={3}>
          <Typography variant="body2" gutterBottom>
            {allDay
              ? 'All Day'
              : `${isValid(startDate) ? format(startDate, 'h:mm a') : ''} - ${
                  isValid(endDate) ? format(endDate, 'h:mm a') : ''
                }`}
          </Typography>

          {location && (
            <Typography variant="body2">
              <TextWithLinks text={location} />
            </Typography>
          )}
        </Box>

        {description && (
          <Box px={3} pb={3}>
            <Typography
              variant="body2"
              className={classes.eventPopoverDescription}
              dangerouslySetInnerHTML={{
                __html: parseHtml(description),
              }}
            />
          </Box>
        )}

        <Box px={3} pb={3}>
          <Typography variant="body2">{`Calendar: ${providerCalendarId}`}</Typography>
        </Box>
      </Popover>
    </>
  );
};

EventCard.propTypes = {
  id: PropTypes.string.isRequired,
  scrollAnchorRef: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

EventCard.defaultProps = {
  scrollAnchorRef: undefined,
};

export default memo(EventCard);
