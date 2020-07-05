import React, { useState } from 'react';
import { useSelector, useDispatch, connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import styled from 'styled-components';
import { Box } from 'rebass/styled-components';
import get from 'lodash/get';

import {
  selectUndeletedTask,
  updateTask,
  moveToTrashTask,
  updateTaskDependency,
  removeTaskDependency,
  createTaskDependency,
  clearRelativePrioritization,
  navigateToTabForTask,
  removeTaskRecurringConfig,
  updateTaskRecurringConfig,
  createTaskRecurringConfig,
  selectTask,
  selectTaskDependencies,
  selectRecurringConfig,
} from 'modules/tasks';
import { selectLoaded } from 'modules/dashboard';
import * as paths from 'constants/paths';

import LeftArrowIcon from 'components/icons/LeftArrow';
import FullScreenPaper from 'components/ui/FullScreenPaper';
import PapelHeader from 'components/ui/PaperHeader';
import Loader from 'components/ui/Loader';
import BasicMain from 'components/ui/BasicMain';
import Button from 'components/ui/Button';
import withLoadTasks from 'components/hoc/withLoadTasks';
import Paragraph from 'components/ui/Paragraph';

import withMixpanel from 'components/hoc/withMixpanel';
import { TASK_UPDATED, TASK_DELETED } from 'constants/mixpanelTrackingEvents';

import TaskForm from './TaskForm';
import DeleteConfirmationPopup from './DeleteConfirmationPopup';

import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import AlarmIcon from '@material-ui/icons/Alarm';
import NavigationIcon from '@material-ui/icons/Navigation';
import NoteAddOutlinedIcon from '@material-ui/icons/NoteAddOutlined';

const FormFlexContainer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
`;
const EditTaskMain = styled(BasicMain)``;
const ContentContainer = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const IconContainer = styled.div`
  height: 1rem;
  width: 1rem;
  cursor: pointer;
`;

const EditTask = ({
  loaded,
  id,
  title,
  impact,
  effort,
  description,
  due,
  completed,
  score,
  scheduledStart,
  associatedRecurringConfig,
  taskPrioritizedAheadOfTitle,
  dependencyIds,
  mixpanel,
}) => {
  const dispatch = useDispatch();

  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [startDateConfirmed, setStartDateConfirmed] = useState(scheduledStart || false);
  const [dueDateConfirmed, setDueDateConfirmed] = useState(due || false);
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openDueDate, setOpenDueDate] = useState(false);
  const [startDateLabel, setStartDateLabel] = useState(scheduledStart ? new Date(scheduledStart).toLocaleDateString("en-US") : '\u00A0');
  const [dueDateLabel, setDueDateLabel] = useState(due ? new Date(due).toLocaleDateString("en-US") : '\u00A0');

  const handleOpenStartDate = () => {
    setOpenStartDate(true);
  };

  const handleCloseStartDate = () => {
    setOpenStartDate(false);
  };

  const handleConfirmStartDate = (datetime) => {
    setStartDateConfirmed(true);
    setOpenStartDate(false);
    setStartDateLabel(datetime.toLocaleDateString("en-US"));
  };

  const handleCancelStartDate = () => {
    setStartDateConfirmed(false);
    setOpenStartDate(false);
    onUpdate('scheduledStart', null);
    setStartDateLabel('\u00A0');
  };

  const handleOpenDueDate = () => {
    setOpenDueDate(true);
  };

  const handleCloseDueDate = () => {
    setOpenDueDate(false);
  };

  const handleConfirmDueDate = (datetime) => {
    setDueDateConfirmed(true);
    setOpenDueDate(false);
    setDueDateLabel(datetime.toLocaleDateString("en-US"));
  };

  const handleCancelDueDate = () => {
    setDueDateConfirmed(false);
    setOpenDueDate(false);
    onUpdate('due', null);
    setDueDateLabel('\u00A0');
  };

  const onUpdate = (key, value) => {
    dispatch(updateTask(id, { [key]: value }));
    // mixpanel.track(TASK_UPDATED, {
    //   taskId: id,
    //   field: key,
    //   value,
    // });
  };

  const dependencyDescriptors = useSelector((state) => (
    selectTaskDependencies(state, dependencyIds)
  ));

  const useStyles = makeStyles((theme) => ({
    appBar: {
      top: 'auto',
      bottom: 0,
      backgroundColor:'white',
      color: theme.palette.text.primary,
    },
    grow: {
      flexGrow: 1,
    },
    iconButtonLabel: {
      fontSize: '10px',
      display: 'flex',
      flexDirection: 'column',
    },
    root: {
      borderRadius: '40%',
      width: '30px',
      height: '30px'
    },
    rootClicked: {
      backgroundColor: '#414D67',
      color: 'white',
      borderRadius: '40%',
      width: '30px',
      height: '30px'
    },
    smallLabel: {
      paddingTop: '.5em'
    },
    smallIcon: {
      width: '20px',
      height: '30px'
    },
    doneIcon: {
      'transform': 'rotate(90deg)',
      color: '#7187b5',
      width: '30px',
      height: '35px'
    },
    dateLabel: {
      marginTop: '2px',
      fontSize: '8px'
    }
  }));

  const classes = useStyles();

  return (
    <FullScreenPaper onCloseCustom={(history) => dispatch(navigateToTabForTask(id, history))}>
      {(onRequestClose) => (
        <FormFlexContainer>
          <PapelHeader
            headline="Edit Task"
            buttonLeft={(
              <Button
                variant="textOverBackground"
                onClick={onRequestClose}
              >
                <IconContainer>
                  <LeftArrowIcon size="fill" title="Back" />
                </IconContainer>
              </Button>
            )}
            buttonRight={(
              <Button
                variant="textOverBackground"
                onClick={() => setDeletePopupVisible(true)}
              >
                Delete
              </Button>
            )}
          />
          <EditTaskMain>
            {!loaded &&  (
              <Loader />
            )}
            {loaded && !id && (
              <Redirect to={paths.DASHBOARD} />
            )}
            {loaded && id && (
              <ContentContainer>
                {completed && (
                  <Button
                    variant="outline"
                    onClick={() => onUpdate('completed', null)}
                    mb={4}
                  >
                    Set as not completed
                  </Button>
                )}

                <TaskForm
                  id={id}
                  title={title}
                  setTitle={(value) => onUpdate('title', value)}
                  impact={impact}
                  setImpact={(value) => onUpdate('impact', value)}
                  effort={effort}
                  setEffort={(value) => onUpdate('effort', value)}
                  description={description}
                  setDescription={(value) => onUpdate('description', value)}
                  due={due}
                  taskPrioritizedAheadOfTitle={taskPrioritizedAheadOfTitle}
                  setDue={(value) => onUpdate('due', value)}
                  scheduledStart={scheduledStart}
                  setScheduledStart={(value) => onUpdate('scheduledStart', value)}
                  dependencies={dependencyDescriptors}
                  updateTaskDependency={(...args) => dispatch(updateTaskDependency(...args))}
                  removeTaskDependency={(...args) => dispatch(removeTaskDependency(...args))}
                  createTaskDependency={(...args) => dispatch(createTaskDependency(...args))}
                  clearRelativePrioritization={(...args) => dispatch(clearRelativePrioritization(...args))}
                  recurringConfig={associatedRecurringConfig}
                  setRecurringConfig={(recurringConfig) => {
                    if (associatedRecurringConfig) {
                      dispatch(updateTaskRecurringConfig(id, recurringConfig));
                    } else {
                      dispatch(createTaskRecurringConfig(id, recurringConfig));
                    }
                  }}
                  removeRecurringConfig={() => dispatch(removeTaskRecurringConfig(id))}
                  handleConfirmStartDate={handleConfirmStartDate}
                  openStartDate={openStartDate}
                  handleOpenStartDate={handleOpenStartDate}
                  handleCloseStartDate={handleCloseStartDate}
                  handleConfirmDueDate={handleConfirmDueDate}
                  handleCancelStartDate={handleCancelStartDate}
                  openDueDate={openDueDate}
                  handleOpenDueDate={handleOpenDueDate}
                  handleCloseDueDate={handleCloseDueDate}
                  handleCancelDueDate={handleCancelDueDate}
                  setStartDateLabel={setStartDateLabel}
                  setDueDateLabel={setDueDateLabel}
                />

                <Box mb={4}>
                  <Paragraph>
                    {`Score: ${score.toFixed(2)}${score === Infinity ? ' (it was already due)' : ''}`}
                  </Paragraph>
                </Box>
              </ContentContainer>
            )}
          </EditTaskMain>

          <AppBar position="static" color="primary" className={classes.appBar}>
            <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleOpenStartDate}
              classes={{label: classes.iconButtonLabel}}
            >
              <div className={startDateConfirmed ? classes.rootClicked : classes.root}>
                <CalendarTodayIcon className={classes.smallIcon} />
              </div>
              <small className={classes.smallLabel}>Start Date</small>
              <small className={classes.dateLabel}>{startDateLabel}</small>
            </IconButton>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleOpenDueDate}
              classes={{label: classes.iconButtonLabel}}
            >
              <div className={dueDateConfirmed ? classes.rootClicked : classes.root}>
                <AlarmIcon className={classes.smallIcon} />
              </div>
              <small className={classes.smallLabel}>Due Date</small>
              <small className={classes.dateLabel}>{dueDateLabel}</small>
            </IconButton>
{/*            <IconButton
              edge="start"
              color="inherit"
              classes={{label: classes.iconButtonLabel, root: classes.rootOther}}
            >
              <NoteAddOutlinedIcon />
              <small>Notes</small>
            </IconButton>
*/}         <div className={classes.grow} />
            <IconButton
              edge="end"
              color="inherit"
              onClick={onRequestClose}
              classes={{label: classes.iconButtonLabel}}
            >
              <NavigationIcon className={classes.doneIcon} />
              <small>Done</small>
            </IconButton>
            </Toolbar>
          </AppBar>

          <DeleteConfirmationPopup
            open={deletePopupVisible}
            onCancel={() => setDeletePopupVisible(false)}
            onConfirm={() => {
              dispatch(moveToTrashTask(id));
              mixpanel.track(TASK_DELETED, { taskId: id });
              onRequestClose();
            }}
          />
        </FormFlexContainer>
      )}
    </FullScreenPaper>
  );
};

const mapStateToProps = (state, ownProps) => {
  const task = selectUndeletedTask(state, ownProps.match.params.id);

  return {
    loaded: selectLoaded(state, 'default'),
    ...task,
    taskPrioritizedAheadOfTitle: task && task.prioritizedAheadOf
      ? get(selectTask(state, task.prioritizedAheadOf), 'title', null)
      : null,
    associatedRecurringConfig: task && task.recurringConfigId
      ? selectRecurringConfig(state, task.recurringConfigId)
      : null,
  };
};

export default withMixpanel(withLoadTasks(
  connect(mapStateToProps)(EditTask),
  'default',
));
