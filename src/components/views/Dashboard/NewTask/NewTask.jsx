import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import uuid from 'uuid/v4';
import { Box } from 'rebass/styled-components';

import { addTask } from 'modules/tasks';

import FullScreenPaper from 'components/ui/FullScreenPaper';
import PapelHeader from 'components/ui/PaperHeader';
import BasicMain from 'components/ui/BasicMain';
import TaskForm from 'components/views/Dashboard/EditTask/TaskForm';
import Button from 'components/ui/Button';

import withMixpanel from 'components/hoc/withMixpanel';
import { TASK_CREATED } from 'constants/mixpanelTrackingEvents';

// Material Imports
import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import AlarmIcon from '@material-ui/icons/Alarm';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import NoteAddOutlinedIcon from '@material-ui/icons/NoteAddOutlined';

const FormFlexContainer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
`;
const NewTaskMain = styled(BasicMain).attrs({ pt: 4 })``;
const ContentContainer = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const NewTask = ({ history, mixpanel }) => {
  const [temporaryId, setTemporaryId] = useState('');
  const [title, setTitle] = useState('');
  const [impact, setImpact] = useState(5);
  const [effort, setEffort] = useState(1);
  const [description, setDescription] = useState('');
  const [due, setDue] = useState(null);
  const [scheduledStart, setScheduledStart] = useState(null);
  const [dependencies, setDependencies] = useState([]);
  const [recurringConfig, setRecurringConfig] = useState(null);
  const [startDateConfirmed, setStartDateConfirmed] = useState(false);
  const [dueDateConfirmed, setDueDateConfirmed] = useState(false);
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openDueDate, setOpenDueDate] = useState(false);

  const handleOpenStartDate = () => {
    setOpenStartDate(true);
  };

  const handleCloseStartDate = () => {
    setOpenStartDate(false);
  };

  const handleCancelStartDate = () => {
    setStartDateConfirmed(false);
    setOpenStartDate(false);
    setScheduledStart(null);
  };

  const handleConfirmStartDate = () => {
    setStartDateConfirmed(true);
    setOpenStartDate(false);
  };

  const handleOpenDueDate = () => {
    setOpenDueDate(true);
  };

  const handleCloseDueDate = () => {
    setOpenDueDate(false);
  };

  const handleCancelDueDate = () => {
    setDueDateConfirmed(false);
    setOpenDueDate(false);
    setDue(null);
  };

  const handleConfirmDueDate = () => {
    setDueDateConfirmed(true);
    setOpenDueDate(false);
  };

  useEffect(() => {
    setTemporaryId(`_${uuid()}`);
  }, []);
  const dispatch = useDispatch();

  const createTask = (event) => {
    event.preventDefault();
    const newTask = {
      temporaryId,
      title,
      impact,
      effort,
      description,
      due,
      scheduledStart,
    };
    dispatch(addTask(newTask, dependencies, recurringConfig, history));
    mixpanel.track(TASK_CREATED, {
      hasBlockers: dependencies.length > 0,
      hasScheduledStart: !!scheduledStart,
      hasDueDate: !!due,
    });
  };

  const onUpdateTaskDependency = (id, updatedDependency) => {
    setDependencies(dependencies.map((dependency) => (
      dependency.id !== id
        ? dependency
        : {
          ...updatedDependency,
          taskId: temporaryId,
          id,
        }
    )));
  };
  const onRemoveTaskDependency = (idToRemove) => {
    setDependencies(dependencies.filter((dependency) => dependency.id !== idToRemove));
  };
  const onCreateTaskDependency = (dependency) => {
    setDependencies([
      ...dependencies,
      {
        ...dependency,
        taskId: temporaryId,
      },
    ]);
  };

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
      borderRadius: '30%',
      padding: '.3em',
      width: '3em'
    },
    rootOther: {
      borderRadius: '30%',
      margin: '.1em',
      padding: '.3em',
      width: '3em'
    },
    rootClicked: {
      backgroundColor: '#414D67',
      color: 'white',
      borderRadius: '30%',
      padding: '.3em',
      width: '3em'
    },
    rootOtherClicked: {
      backgroundColor: '#414D67',
      color: 'white',
      borderRadius: '30%',
      margin: '.1em',
      padding: '.3em',
      width: '3em'
    }
  }));

  const classes = useStyles();

  return (
    <FullScreenPaper>
      {(onRequestClose) => (
        <FormFlexContainer>
          <PapelHeader
            headline="Create Task"
            buttonRight={(
              <Button variant="textOverBackground" onClick={onRequestClose}>
                Cancel
              </Button>
            )}
          />
          <NewTaskMain>
            <ContentContainer>
              <TaskForm
                id={temporaryId}
                title={title}
                setTitle={setTitle}
                impact={impact}
                setImpact={setImpact}
                effort={effort}
                setEffort={setEffort}
                description={description}
                setDescription={setDescription}
                due={due}
                setDue={setDue}
                scheduledStart={scheduledStart}
                setScheduledStart={setScheduledStart}
                dependencies={dependencies}
                updateTaskDependency={onUpdateTaskDependency}
                removeTaskDependency={onRemoveTaskDependency}
                createTaskDependency={onCreateTaskDependency}
                recurringConfig={recurringConfig}
                setRecurringConfig={(newRecurringConfig) => setRecurringConfig(newRecurringConfig)}
                removeRecurringConfig={() => setRecurringConfig(null)}
                handleConfirmStartDate={handleConfirmStartDate}
                openStartDate={openStartDate}
                handleOpenStartDate={handleOpenStartDate}
                handleCloseStartDate={handleCloseStartDate}
                handleCancelStartDate={handleCancelStartDate}
                handleConfirmDueDate={handleConfirmDueDate}
                openDueDate={openDueDate}
                handleOpenDueDate={handleOpenDueDate}
                handleCloseDueDate={handleCloseDueDate}
                handleCancelDueDate={handleCancelDueDate}
              />
            </ContentContainer>
          </NewTaskMain>

          <AppBar position="fixed" color="primary" className={classes.appBar}>
            <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleOpenStartDate}
              classes={{label: classes.iconButtonLabel, root: startDateConfirmed ? classes.rootClicked : classes.root}}
            >
              <CalendarTodayIcon />
              <small>Start Date</small>
            </IconButton>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleOpenDueDate}
              classes={{label: classes.iconButtonLabel, root: dueDateConfirmed ? classes.rootOtherClicked : classes.rootOther}}
            >
              <AlarmIcon />
              <small>Due Date</small>
            </IconButton>
            <IconButton
              edge="start"
              color="inherit"
              classes={{label: classes.iconButtonLabel, root: classes.rootOther}}
            >
              <NoteAddOutlinedIcon />
              <small>Notes</small>
            </IconButton>
            <div className={classes.grow} />
            <IconButton edge="end" color="inherit" onClick={createTask}>
              <ArrowForwardIosIcon />
            </IconButton>
            </Toolbar>
          </AppBar>

          {/*<ButtonFooter.Container>
            <ButtonFooter.Button type="submit" variant="primary">
              Create Task
            </ButtonFooter.Button>
          </ButtonFooter.Container>*/}
        </FormFlexContainer>
      )}
    </FullScreenPaper>
  );
};

export default withMixpanel(withRouter(NewTask));
