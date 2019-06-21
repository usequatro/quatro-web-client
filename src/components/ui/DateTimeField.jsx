import React from 'react';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { Box } from 'rebass';
import InputField from './InputField';
import FieldLabel from './FieldLabel';

const Container = styled(Box)`
  display: flex;
  justify-content: space-between;
`;

const FieldContainer = styled(Box)`
  width: calc(50% - 1rem);
`;

const DateTimeField = ({
  value, label, onChange, disabled,
}) => {
  const propagateChange = (event, newDate, newTime) => {
    if (!newDate) {
      onChange(event, null);
    } else if (newDate && !newTime) {
      onChange(event, dayjs(newDate).valueOf());
    } else if (newDate && newTime) {
      onChange(event, dayjs(`${newDate} ${newTime}`).valueOf());
    }
  };

  const date = value ? dayjs(value).format('YYYY-MM-DD') : '';
  const time = value ? dayjs(value).format('HH:mm') : '';

  const onDateChange = (event) => {
    propagateChange(event, event.target.value, time);
  };
  const onTimeChange = (event) => {
    propagateChange(event, date, event.target.value);
  };

  return (
    <React.Fragment>
      <FieldLabel>{label}</FieldLabel>
      <Container>
        <FieldContainer>
          <InputField type="date" onChange={onDateChange} value={date} disabled={disabled} />
        </FieldContainer>
        <FieldContainer>
          <InputField type="time" onChange={onTimeChange} value={time} disabled={disabled} />
        </FieldContainer>
      </Container>
    </React.Fragment>
  );
};

export default DateTimeField;
