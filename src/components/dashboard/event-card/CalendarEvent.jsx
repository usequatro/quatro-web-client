import React, { useState, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import startOfDay from 'date-fns/startOfDay';
import differenceInMinutes from 'date-fns/differenceInMinutes';

import {
  selectCalendarEventSummary,
  selectCalendarEventStartTimestamp,
  selectCalendarEventEndTimestamp,
  selectCalendarEventAllDay,
  selectCalendarEventDeclined,
  selectCalendarEventCollisionCount,
  selectCalendarEventCollisionOrder,
  selectCalendarEventCalendarId,
  selectCalendarEventPlaceholderUntilCreated,
  selectCalendarEventTaskId,
} from '../../../modules/calendarEvents';
import {
  selectTaskShowsAsCompleted,
  selectTaskWasLoadedButNotAnymore,
} from '../../../modules/tasks';
import { selectCalendarColor } from '../../../modules/calendars';
import EventCardView from './EventCardView';
import CalendarEventPopover from './CalendarEventPopover';
import { useAppDragDropContext } from '../DashboardDragDropContext';

const CalendarEvent = ({ id, scrollAnchorRef, interactive, tickHeight, ticksPerHour }) => {
  const { draggableTaskId } = useAppDragDropContext();

  const summary = useSelector((state) => selectCalendarEventSummary(state, id));
  const startTimestamp = useSelector((state) => selectCalendarEventStartTimestamp(state, id));
  const endTimestamp = useSelector((state) => selectCalendarEventEndTimestamp(state, id));
  const allDay = useSelector((state) => selectCalendarEventAllDay(state, id));
  const declined = useSelector((state) => selectCalendarEventDeclined(state, id));
  const collisionCount = useSelector((state) => selectCalendarEventCollisionCount(state, id));
  const collisionOrder = useSelector((state) => selectCalendarEventCollisionOrder(state, id));
  const calendarId = useSelector((state) => selectCalendarEventCalendarId(state, id));
  const taskId = useSelector((state) => selectCalendarEventTaskId(state, id));
  const placeholderUntilCreated = useSelector((state) =>
    selectCalendarEventPlaceholderUntilCreated(state, id),
  );
  const color = useSelector((state) => selectCalendarColor(state, calendarId)) || '#000000';

  const completed = useSelector((state) =>
    taskId ? selectTaskShowsAsCompleted(state, taskId) : false,
  );

  // As long as the only reasons why a task is gone is being deleted or completed,
  // and that the calendar events are removed in both cases, we can show the synching spinner.
  const associatedTaskIsGone = useSelector((state) =>
    taskId ? selectTaskWasLoadedButNotAnymore(state, taskId) : false,
  );

  const [calendarDetailsOpen, setCalendarDetailsOpen] = useState(false);
  const cardRef = useRef();

  const minutesForOneTick = 60 / ticksPerHour;
  const durationInMinutes = differenceInMinutes(endTimestamp, startTimestamp);
  const startTimeInMinutes = differenceInMinutes(startTimestamp, startOfDay(startTimestamp));

  const cardWidth = Math.floor(100 / (1 + (collisionCount || 0)));
  const cardLeft = (collisionOrder || 0) * cardWidth;

  const onSelect = useCallback(() => {
    setCalendarDetailsOpen(true);
  }, [setCalendarDetailsOpen]);

  const coordinates = useMemo(
    () => ({
      x: `${cardLeft}%`,
      y: Math.floor(tickHeight * (startTimeInMinutes / minutesForOneTick)),
    }),
    [cardLeft, tickHeight, startTimeInMinutes, minutesForOneTick],
  );

  const onClose = useCallback(() => {
    setCalendarDetailsOpen(false);
  }, []);

  return (
    <>
      <EventCardView
        id={id}
        key={id}
        scrollAnchorRef={scrollAnchorRef}
        elevated={calendarDetailsOpen}
        synching={Boolean(associatedTaskIsGone || placeholderUntilCreated)}
        summary={summary}
        startTimestamp={startTimestamp}
        endTimestamp={endTimestamp}
        allDay={allDay}
        declined={Boolean(declined)}
        taskId={taskId}
        showCompleteButton={interactive && Boolean(taskId)}
        selectable={Boolean(interactive && !associatedTaskIsGone && !placeholderUntilCreated)}
        isBeingRedragged={draggableTaskId === taskId}
        color={color}
        height={allDay ? 40 : Math.floor(tickHeight * (durationInMinutes / minutesForOneTick))}
        width={`${cardWidth}%`}
        coordinates={coordinates}
        onSelect={onSelect}
        completed={completed}
        ref={cardRef}
      />

      {interactive && (
        <CalendarEventPopover
          id={id}
          open={calendarDetailsOpen}
          anchorEl={cardRef.current}
          onClose={onClose}
        />
      )}
    </>
  );
};

CalendarEvent.propTypes = {
  id: PropTypes.string.isRequired,
  interactive: PropTypes.bool.isRequired,
  scrollAnchorRef: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  tickHeight: PropTypes.number.isRequired,
  ticksPerHour: PropTypes.number.isRequired,
};

CalendarEvent.defaultProps = {
  scrollAnchorRef: undefined,
};

export default CalendarEvent;
