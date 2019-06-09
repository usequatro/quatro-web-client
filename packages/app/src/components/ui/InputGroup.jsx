// import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';
import InputField from './InputField';

export default styled(Box)`
    display: flex;
    flex-direction: column;
    width: 100%;

    ${InputField} {
        width: 100%;
    }
    ${InputField}:not(:last-child) {
        margin-bottom: 1rem;
    }
`;
