import styled from 'styled-components';
import InputField from '../../ui/InputField';

export default styled(InputField).attrs({
  fullWidth: true,
  placeholder: 'Search for a task',
})`
    margin-bottom: 1rem;
`;
