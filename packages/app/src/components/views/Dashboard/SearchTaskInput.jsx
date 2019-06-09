import styled from 'styled-components';
import Input from '../../ui/Input';

export default styled(Input).attrs({
  fullWidth: true,
  placeholder: 'Search for a task',
})`
    margin-bottom: 1rem;
`;
