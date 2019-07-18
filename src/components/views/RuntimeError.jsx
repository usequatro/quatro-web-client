import React from 'react';
import { Text, Box } from 'rebass';
import styled from 'styled-components';

const Container = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  componentDidCatch(error, info) {
    console.error(error, info);
    this.setState({ hasError: true });
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <Container>
          <Text p={4}>
            {'There\'s been an error '}
            <a href="/">Reload app</a>
          </Text>
        </Container>
      );
    }
    return children;
  }
}

export default ErrorBoundary;
