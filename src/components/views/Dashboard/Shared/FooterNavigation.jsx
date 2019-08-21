import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Box } from 'rebass';
import { connect } from 'react-redux';
import {
  getScheduledTasks, getNextTasks, getBlockedTasks, getNowTasks, getCompletedTasks,
} from '../../../../modules/tasks';
import * as paths from '../../../../constants/paths';
import Button from '../../../ui/Button';

const FooterContainer = styled(Box).attrs({
  px: 2,
  py: 3,
  bg: 'appForeground',
})`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
  border-top: 1px solid ${(props) => props.theme.colors.border};

  a {
    text-decoration: none;
  }
`;

const Icon = styled(Button).attrs({
  variant: 'outline',
})`
  padding: 0;
  border-radius: 3px;
  height: 3rem;
  width: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: ${(props) => (props.hasContents ? 'underline' : 'none')};
`;

const FooterNavigation = ({
  hasScheduled, hasBlocked, hasNow, hasNext, hasCompleted,
}) => (
  <FooterContainer>
    <Link to={paths.SCHEDULED}><Icon hasContents={hasScheduled}>Sch</Icon></Link>
    <Link to={paths.BLOCKED}><Icon hasContents={hasBlocked}>Blo</Icon></Link>
    <Link to={paths.NOW}><Icon hasContents={hasNow}>Now</Icon></Link>
    <Link to={paths.NEXT}><Icon hasContents={hasNext}>Nxt</Icon></Link>
    <Link to={paths.COMPLETED}><Icon hasContents={hasCompleted}>Com</Icon></Link>
  </FooterContainer>
);

const mapStateToProps = (state) => ({
  hasScheduled: getScheduledTasks(state).length > 0,
  hasBlocked: getBlockedTasks(state).length > 0,
  hasNow: getNowTasks(state).length > 0,
  hasNext: getNextTasks(state).length > 0,
  hasCompleted: getCompletedTasks(state).length > 0,
});

export default connect(mapStateToProps)(FooterNavigation);
