// import React from 'react';
import styled from 'styled-components';

export default styled.input`
    font-size: inherit;
    padding: 1rem;
    ${props => (props.fullWidth ? 'width: 100%;' : '')}
    border: solid 1px ${props => props.theme.colors.border};
    outline-color: ${props => props.theme.colors.textHighlight};

    ::-webkit-input-placeholder { /* Edge */
        color: ${props => props.theme.colors.placeholder};
    }
    :-ms-input-placeholder { /* Internet Explorer 10-11 */
        color: ${props => props.theme.colors.placeholder};
    }
    ::placeholder {
        color: ${props => props.theme.colors.placeholder};
    }
`;
