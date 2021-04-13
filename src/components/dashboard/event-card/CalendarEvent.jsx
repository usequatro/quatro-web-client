import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import endOfDay from 'date-fns/endOfDay';
import startOfDay from 'date-fns/startOfDay';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import { Draggable } from 'react-beautiful-dnd';

import {
  selectCalendarEventSummary,
  selectCalendarEventStartTimestamp,
  selectCalendarEventEndTimestamp,
  selectCalendarEventAllDay,
  selectCalendarEventEventType,
  selectCalendarEventResponseStatus,
  selectCalendarEventCollisionCount,
  selectCalendarEventCollisionOrder,
  selectCalendarEventCalendarId,
  selectCalendarEventPlaceholderUntilCreated,
  selectCalendarEventTaskId,
  selectCalendarEventTaskCompleted,
} from '../../../modules/calendarEvents';
import { selectTaskShowsAsCompleted, selectTaskWasManuallyDeleted } from '../../../modules/tasks';
import { selectCalendarColor } from '../../../modules/calendars';
import EventCardView from './EventCardView';
import CalendarEventPopover from './CalendarEventPopover';
import CardPositionedBoundaries from './CardPositionedBoundaries';
import { useAppDragDropContext } from '../DashboardDragDropContext';

const CalendarEvent = ({
  id,
  scrollAnchorRef,
  interactive,
  tickHeight,
  ticksPerHour,
  displayDateTimestamp,
  index,
}) => {
  const { draggableTaskId } = useAppDragDropContext();

  const summary = useSelector((state) => selectCalendarEventSummary(state, id));
  const startTimestamp = useSelector((state) => selectCalendarEventStartTimestamp(state, id));
  const endTimestamp = useSelector((state) => selectCalendarEventEndTimestamp(state, id));
  const allDay = useSelector((state) => selectCalendarEventAllDay(state, id));
  const eventType = useSelector((state) => selectCalendarEventEventType(state, id));
  const responseStatus = useSelector((state) => selectCalendarEventResponseStatus(state, id));
  const collisionCount = useSelector((state) => selectCalendarEventCollisionCount(state, id));
  const collisionOrder = useSelector((state) => selectCalendarEventCollisionOrder(state, id));
  const calendarId = useSelector((state) => selectCalendarEventCalendarId(state, id));
  const taskId = useSelector((state) => selectCalendarEventTaskId(state, id));
  const taskCompleted = useSelector((state) => selectCalendarEventTaskCompleted(state, id));
  const placeholderUntilCreated = useSelector((state) =>
    selectCalendarEventPlaceholderUntilCreated(state, id),
  );
  const color = useSelector((state) => selectCalendarColor(state, calendarId)) || '#000000';

  const completed = useSelector((state) =>
    taskId ? selectTaskShowsAsCompleted(state, taskId) : false,
  );
  const associatedTaskDeleted = useSelector((state) =>
    taskId ? selectTaskWasManuallyDeleted(state, taskId) : false,
  );

  const [calendarDetailsOpen, setCalendarDetailsOpen] = useState(false);
  const popoverAnchorRef = useRef();

  const displayDateStart = startOfDay(displayDateTimestamp).getTime();
  const displayDateEnd = endOfDay(displayDateTimestamp).getTime();

  const minutesForOneTick = 60 / ticksPerHour;
  const durationInMinutes = differenceInMinutes(
    Math.min(endTimestamp, displayDateEnd),
    Math.max(startTimestamp, displayDateStart),
  );
  const startTimeInMinutes = differenceInMinutes(
    Math.max(startTimestamp, displayDateStart),
    displayDateStart,
  );

  const cardWidth = Math.floor(100 / (1 + (collisionCount || 0)));
  const cardLeft = (collisionOrder || 0) * cardWidth;

  const onSelect = useCallback(() => {
    setCalendarDetailsOpen(true);
  }, [setCalendarDetailsOpen]);

  const coordinates = {
    x: `${cardLeft}%`,
    y: Math.floor(tickHeight * (startTimeInMinutes / minutesForOneTick)),
  };

  const onClose = useCallback(() => {
    setCalendarDetailsOpen(false);
  }, []);

  const maxCardHeight = tickHeight * ((24 * 60) / minutesForOneTick); // 24h event
  const cardHeight = allDay
    ? 40
    : Math.min(Math.floor(tickHeight * (durationInMinutes / minutesForOneTick)), maxCardHeight);

  const isDraggable = Boolean(interactive && taskId);

  const renderCardView = () => (
    <EventCardView
      id={id}
      key={id}
      scrollAnchorRef={scrollAnchorRef}
      elevated={calendarDetailsOpen}
      synching={Boolean(associatedTaskDeleted || placeholderUntilCreated)}
      summary={summary}
      startTimestamp={startTimestamp}
      endTimestamp={endTimestamp}
      allDay={allDay}
      eventType={eventType}
      responseStatus={responseStatus}
      taskId={taskId}
      showCompleteButton={Boolean(interactive && taskId && !taskCompleted)}
      showCheckmark={taskCompleted}
      selectable={Boolean(interactive && !associatedTaskDeleted && !placeholderUntilCreated)}
      draggable={isDraggable}
      isBeingRedragged={draggableTaskId === taskId}
      color={color}
      smallCard={cardHeight < 30}
      onSelect={onSelect}
      completed={completed}
    />
  );

  const renderPopover = () => (
    <CalendarEventPopover
      id={id}
      open={calendarDetailsOpen}
      anchorEl={popoverAnchorRef.current}
      onClose={onClose}
    />
  );

  return isDraggable ? (
    <>
      {/* @todo: the index here should increase only for the isDraggable cards */}
      <Draggable draggableId={`draggable-calendar-${taskId}`} index={index}>
        {(draggableProvided, draggableSnapshot) => (
          <CardPositionedBoundaries
            id={id}
            allDay={allDay}
            height={cardHeight}
            width={`${cardWidth}%`}
            coordinates={coordinates}
            ref={(ref) => {
              popoverAnchorRef.current = ref;
              draggableProvided.innerRef(ref);
            }}
            draggableProps={{
              ...draggableProvided.draggableProps,
              ...draggableProvided.dragHandleProps,
            }}
            isDragging={Boolean(draggableSnapshot.isDragging)}
            isDropAnimating={Boolean(draggableSnapshot.isDropAnimating)}
          >
            {renderCardView()}
          </CardPositionedBoundaries>
        )}
      </Draggable>

      {interactive && renderPopover()}
    </>
  ) : (
    <>
      <CardPositionedBoundaries
        id={id}
        allDay={allDay}
        height={cardHeight}
        width={`${cardWidth}%`}
        coordinates={coordinates}
        ref={popoverAnchorRef}
      >
        {renderCardView()}
      </CardPositionedBoundaries>

      {interactive && renderPopover()}
    </>
  );
};

CalendarEvent.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  displayDateTimestamp: PropTypes.number.isRequired,
  interactive: PropTypes.bool.isRequired,
  scrollAnchorRef: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  tickHeight: PropTypes.number.isRequired,
  ticksPerHour: PropTypes.number.isRequired,
};

CalendarEvent.defaultProps = {
  scrollAnchorRef: undefined,
};

export default CalendarEvent;
