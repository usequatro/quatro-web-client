// import React from 'react';
import styled from 'styled-components';
import Input from './Input';

export default styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;

    ${Input} {
        width: 100%;
    }
    ${Input}:not(:last-child) {
        margin-bottom: 1rem;
    }
`;
