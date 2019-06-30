import React from 'react';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { Box } from 'rebass';
import InputField from './InputField';
import FieldLabel from './FieldLabel';

const Container = styled(Box).attrs({ mb: 2 })``;
const FieldsContainer = styled(Box)`
  display: flex;
  justify-content: space-between;
`;
const FieldContainer = styled(Box)`
  width: calc(50% - 0.5rem);
`;

const DateTimeField = ({
  value, label, onChange, disabled,
}) => {
  const propagateChange = (event, newDate, newTime) => {
    let newValue;
    if (!newDate) {
      newValue = null;
    } else if (newDate && !newTime) {
      newValue = dayjs(newDate).valueOf();
    } else if (newDate && newTime) {
      newValue = dayjs(`${newDate} ${newTime}`).valueOf();
    }

    console.log('DateTimeField', newValue);
    onChange(event, newValue);
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
    <Container>
      <FieldLabel>{label}</FieldLabel>
      <FieldsContainer>
        <FieldContainer>
          <InputField type="date" onBlur={onDateChange} defaultValue={date} disabled={disabled} />
        </FieldContainer>
        <FieldContainer>
          <InputField type="time" onBlur={onTimeChange} defaultValue={time} disabled={disabled} />
        </FieldContainer>
      </FieldsContainer>
    </Container>
  );
};

export default DateTimeField;
