import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Box } from 'rebass';
import { connect } from 'react-redux';
import {
  getScheduledTasks, getBacklogTasks, getBlockedTasks, getImportantTasks, getCompletedTasks,
} from '../../../modules/tasks';

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
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const Icon = styled.div`
  background-color: gray;
  color: white;
  opacity: ${props => (props.hasContents ? '1' : '0.75')};
  height: 3rem;
  width: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FooterNavigation = ({
  hasScheduled, hasBlocked, hasImportant, hasBacklog, hasCompleted,
}) => (
  <FooterContainer>
    <Link to="/dashboard/scheduled"><Icon hasContents={hasScheduled}>Sc</Icon></Link>
    <Link to="/dashboard/blocked"><Icon hasContents={hasBlocked}>Bl</Icon></Link>
    <Link to="/dashboard/important"><Icon hasContents={hasImportant}>Im</Icon></Link>
    <Link to="/dashboard/backlog"><Icon hasContents={hasBacklog}>Ba</Icon></Link>
    <Link to="/dashboard/completed"><Icon hasContents={hasCompleted}>Co</Icon></Link>
  </FooterContainer>
);

const mapStateToProps = state => ({
  hasScheduled: getScheduledTasks(state).length > 0,
  hasBlocked: getBlockedTasks(state).length > 0,
  hasImportant: getImportantTasks(state).length > 0,
  hasBacklog: getBacklogTasks(state).length > 0,
  hasCompleted: getCompletedTasks(state).length > 0,
});

export default connect(mapStateToProps)(FooterNavigation);
