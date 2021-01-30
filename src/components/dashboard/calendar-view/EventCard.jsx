import React, { useState, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import cond from 'lodash/cond';

import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import startOfDay from 'date-fns/startOfDay';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import isPast from 'date-fns/isPast';
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
  selectCalendarEventStartTimestamp,
  selectCalendarEventEndDateTime,
  selectCalendarEventEndTimestamp,
  selectCalendarEventAllDay,
  selectCalendarEventDeclined,
  selectCalendarEventCollisionCount,
  selectCalendarEventCollisionOrder,
  selectCalendarEventCalendarId,
  selectCalendarEventTaskId,
  selectCalendarEventProviderCalendarId,
} from '../../../modules/calendarEvents';
import { completeTask, markTaskIncomplete } from '../../../modules/tasks';
import { selectCalendarColor } from '../../../modules/calendars';
import TextWithLinks from '../../ui/TextWithLinks';
import parseHtml from '../../../utils/parseHtml';
import CompleteButton from '../tasks/CompleteButton';

const useStyles = makeStyles((theme) => ({
  eventCard: ({ color, declined }) => ({
    width: '100%',
    padding: `${theme.spacing(1) / 2}px ${theme.spacing(1)}px`,
    borderRadius: 5,
    color: declined ? color : theme.palette.getContrastText(color),
    backgroundColor: declined ? theme.palette.background.paper : color,
    border: `solid 1px ${declined ? color : theme.palette.getContrastText(color)}`,
    outline: 'none',
    textDecoration: declined ? 'line-through' : 'initial',
    clipPath: 'border-box', // needed by iOS Safari, otherwise it shows overflowing text (ignores overflow hidden)
    display: 'flex',
    flexShrink: 0,
    alignItems: 'flex-start',
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
    flexGrow: 1,
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
  eventPopoverName: {
    flexGrow: 1,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  eventPopoverDescription: {
    whiteSpace: 'pre-wrap',
  },
  completeButtonIddle: {},
  completeButtonSuccess: {
    color: theme.palette.success.main,
  },
}));

const EventCard = ({ id, scrollAnchorRef, selectable, tickHeight, ticksPerHour }) => {
  const dispatch = useDispatch();

  const summary = useSelector((state) => selectCalendarEventSummary(state, id));
  const description = useSelector((state) => selectCalendarEventDescription(state, id));
  const htmlLink = useSelector((state) => selectCalendarEventHtmlLink(state, id));
  const location = useSelector((state) => selectCalendarEventLocation(state, id));
  const providerCalendarId = useSelector((state) =>
    selectCalendarEventProviderCalendarId(state, id),
  );
  const startDateTime = useSelector((state) => selectCalendarEventStartDateTime(state, id));
  const startTimestamp = useSelector((state) => selectCalendarEventStartTimestamp(state, id));
  const endDateTime = useSelector((state) => selectCalendarEventEndDateTime(state, id));
  const endTimestamp = useSelector((state) => selectCalendarEventEndTimestamp(state, id));
  const allDay = useSelector((state) => selectCalendarEventAllDay(state, id));
  const declined = useSelector((state) => selectCalendarEventDeclined(state, id));
  const collisionCount = useSelector((state) => selectCalendarEventCollisionCount(state, id));
  const collisionOrder = useSelector((state) => selectCalendarEventCollisionOrder(state, id));
  const calendarId = useSelector((state) => selectCalendarEventCalendarId(state, id));
  const taskId = useSelector((state) => selectCalendarEventTaskId(state, id));
  const color = useSelector((state) => selectCalendarColor(state, calendarId)) || '#000000';

  const classes = useStyles({ color, declined });

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

  const minutesForOneTick = 60 / ticksPerHour;
  const durationInMinutes = differenceInMinutes(endTimestamp, startTimestamp);
  const startTimeInMinutes = differenceInMinutes(startTimestamp, startOfDay(startTimestamp));

  const cardWidth = allDay ? 100 : Math.floor(100 / (1 + (collisionCount || 0)));
  const cardLeft = allDay ? 0 : (collisionOrder || 0) * cardWidth;

  return (
    <>
      <Card
        key={id}
        data-id={id}
        style={{
          height: allDay ? 40 : Math.floor(tickHeight * (durationInMinutes / minutesForOneTick)),
          transform: `translateY(${Math.floor(
            tickHeight * (startTimeInMinutes / minutesForOneTick),
          )}px)`,
          opacity: cond([
            [() => !allDay && isPast(endTimestamp), () => 0.7],
            [() => declined, () => 0.7],
            [() => true, () => 1],
          ])(),
          cursor: selectable ? 'pointer' : 'auto',
          zIndex: 1,
          ...(!allDay
            ? {
                position: 'absolute',
                width: `${cardWidth}%`,
                left: `${cardLeft}%`,
              }
            : {}),
        }}
        className={[classes.eventCard, selectable && classes.selectableEventCard]
          .filter(Boolean)
          .join(' ')}
        elevation={focused || calendarDetailsOpen ? 8 : 0}
        ref={cardRef}
        {...(selectable
          ? {
              role: 'button',
              tabIndex: 0,
              onFocus: () => setFocused(true),
              onBlur: () => setFocused(false),
              onClick: () => setCalendarDetailsOpen(true),
              onKeyDown: () => (event) => {
                if (event.key === ' ' || event.key === 'Enter') {
                  setCalendarDetailsOpen(true);
                  event.stopPropagation();
                }
              },
            }
          : {
              title: summary,
            })}
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

        {taskId && (
          <CompleteButton
            taskId={taskId}
            completed={null}
            onCompleteTask={() => dispatch(completeTask(taskId))}
            onMarkTaskIncomplete={() => dispatch(markTaskIncomplete(taskId))}
            fontSize="default"
            size="small"
          />
        )}
      </Card>

      {selectable && (
        <Popover
          open={calendarDetailsOpen}
          anchorEl={cardRef.current}
          onClose={() => setCalendarDetailsOpen(false)}
          classes={{ paper: classes.eventPopoverPaper }}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          transformOrigin={{ horizontal: 'center', vertical: 'top' }}
          aria-labelledby={`event-popover-title-${id}`}
        >
          <Box px={3} pt={1} pb={3}>
            <Box display="flex" alignItems="flex-start">
              <Typography
                className={classes.eventPopoverName}
                variant="h5"
                component="h2"
                id={`event-popover-title-${id}`}
              >
                {summary || '(No title)'}
              </Typography>

              {taskId && (
                <CompleteButton
                  taskId={taskId}
                  completed={null}
                  onCompleteTask={() => dispatch(completeTask(taskId))}
                  onMarkTaskIncomplete={() => dispatch(markTaskIncomplete(taskId))}
                  fontSize="default"
                />
              )}
            </Box>
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
            <Typography variant="body2">
              {`Calendar: ${providerCalendarId} `}

              <Tooltip title="Open in Google Calendar" enterDelay={1000} arrow>
                <IconButton
                  edge="end"
                  size="small"
                  color="inherit"
                  href={htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="open in calendar app"
                >
                  <LaunchRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
          </Box>
        </Popover>
      )}
    </>
  );
};

EventCard.propTypes = {
  id: PropTypes.string.isRequired,
  selectable: PropTypes.bool.isRequired,
  scrollAnchorRef: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  tickHeight: PropTypes.number.isRequired,
  ticksPerHour: PropTypes.number.isRequired,
};

EventCard.defaultProps = {
  scrollAnchorRef: undefined,
};

export default memo(EventCard);
