import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import throttle from 'lodash/throttle';

import startOfDay from 'date-fns/startOfDay';
import addMinutes from 'date-fns/addMinutes';

import { makeStyles } from '@material-ui/core/styles';

import { useAppDragDropContext } from '../DashboardDragDropContext';
import EventCardView from '../event-card/EventCardView';

import {
  selectTaskTitle,
  selectTaskCalendarBlockCalendarId,
  selectTaskEffort,
  selectTaskCalendarBlockDuration,
} from '../../../modules/tasks';
import { selectCalendarColor, selectDefaultCalendarId } from '../../../modules/calendars';
import { EFFORT_TO_DURATION } from '../../../constants/effort';

const useStyles = makeStyles(() => ({
  '@keyframes calendarEventPlaceholderBlink': {
    '0%': { opacity: 0.6 },
    '50%': { opacity: 0.9 },
    '100%': { opacity: 0.6 },
  },
  placeholder: {
    animationName: '$calendarEventPlaceholderBlink',
    animationDuration: '1.5s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
}));

const clientYGetters = {
  touchmove: (event) => get(event, 'touches[0].clientY'),
  mousemove: (event) => get(event, 'clientY'),
};
const noop = () => {};

const round = (value, step) => {
  const factor = value / step;
  const floor = Math.floor(factor);
  const times = floor + (Math.abs(factor - floor) < 0.5 ? 0 : 1);
  return times * step;
};

const CalendarEventPlaceholder = ({ containerRef, tickHeight, ticksPerHour }) => {
  const classes = useStyles();

  const [minutes, setMinutes] = useState(0);

  const { draggableTaskId, getCalendarDragPlaceholderPositionRef } = useAppDragDropContext();

  // Update ref so upon dropping we can read that from DashboardDragDropContext
  getCalendarDragPlaceholderPositionRef.current = () => ({ minutes });

  // Listener for moving the cursor over the calendar while dragging a task
  useEffect(() => {
    const updateMouseCoordinates = throttle((event) => {
      if (!containerRef.current) {
        return;
      }

      const clientY = (clientYGetters[event.type] || noop)(event);
      if (clientY == null) {
        console.warn('Invalid clientY on event', event); // eslint-disable-line no-console
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const paddingTop = window
        .getComputedStyle(containerRef.current, null)
        .getPropertyValue('padding-top');
      const paddingTopInt = parseInt(paddingTop, 10);

      const y = clientY - rect.top - paddingTopInt + containerRef.current.scrollTop;
      const snapHeight = (ticksPerHour * tickHeight) / 4;
      const snappedY = Math.max(0, round(y, snapHeight));
      const currentMinutes = (snappedY / snapHeight / 4) * ticksPerHour * 60;

      setMinutes(currentMinutes);
    }, 10);
    document.addEventListener('mousemove', updateMouseCoordinates);
    document.addEventListener('touchmove', updateMouseCoordinates);
    return () => {
      document.removeEventListener('mousemove', updateMouseCoordinates);
      document.removeEventListener('touchmove', updateMouseCoordinates);
    };
  }, [containerRef, tickHeight, ticksPerHour]);

  const taskTitle = useSelector((state) => selectTaskTitle(state, draggableTaskId));
  const startTimestamp = addMinutes(startOfDay(new Date()), minutes).getTime();

  const duration = useSelector(
    (state) =>
      selectTaskCalendarBlockDuration(state, draggableTaskId) ||
      EFFORT_TO_DURATION[selectTaskEffort(state, draggableTaskId)] ||
      EFFORT_TO_DURATION[2],
  );
  const endTimestamp = addMinutes(startTimestamp, duration).getTime();

  const color =
    useSelector((state) => {
      const calendarId =
        selectTaskCalendarBlockCalendarId(state, draggableTaskId) || selectDefaultCalendarId(state);
      return selectCalendarColor(state, calendarId);
    }) || '#000000';

  const minutesForOneTick = 60 / ticksPerHour;

  return (
    <EventCardView
      id="calendar-event-placeholder"
      className={classes.placeholder}
      scrollAnchorRef={null}
      elevated={false}
      summary={taskTitle}
      startTimestamp={startTimestamp}
      endTimestamp={endTimestamp}
      allDay={false}
      declined={false}
      taskId={draggableTaskId}
      showComplete={false}
      selectable={false}
      isBeingRedragged={false}
      color={color}
      height={Math.floor(tickHeight * (duration / minutesForOneTick))}
      width="88%"
      coordinates={{
        x: '12%',
        y: Math.floor(tickHeight * (minutes / minutesForOneTick)),
      }}
      onSelect={() => {}}
      ref={undefined}
    />
  );
};

CalendarEventPlaceholder.propTypes = {
  containerRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired,
  tickHeight: PropTypes.number.isRequired,
  ticksPerHour: PropTypes.number.isRequired,
};

export default CalendarEventPlaceholder;