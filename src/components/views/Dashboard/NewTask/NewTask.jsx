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
import Paragraph from 'components/ui/Paragraph';
import withMixpanel from 'components/hoc/withMixpanel';
import { TASK_CREATED } from 'constants/mixpanelTrackingEvents';

// Material Imports
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
  const [startDateLabel, setStartDateLabel] = useState('\u00A0');
  const [dueDateLabel, setDueDateLabel] = useState('\u00A0');

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
    setStartDateLabel('\u00A0');
  };

  const handleConfirmStartDate = (datetime) => {
    setStartDateConfirmed(true);
    setOpenStartDate(false);
    setStartDateLabel(datetime.toLocaleDateString("en-US"));
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
    setDueDateLabel('\u00A0');
  };

  const handleConfirmDueDate = (datetime) => {
    setDueDateConfirmed(true);
    setOpenDueDate(false);
    setDueDateLabel(datetime.toLocaleDateString("en-US"));
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
      maxWidth: '600px'
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
                setStartDateLabel={setStartDateLabel}
                setDueDateLabel={setDueDateLabel}
              />

              <Box mb={6}></Box>
            </ContentContainer>
          </NewTaskMain>

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
            </IconButton>*/}
            <div className={classes.grow} />
            <IconButton
              edge="end"
              color="inherit"
              onClick={createTask}
              classes={{label: classes.iconButtonLabel}}
            >
              <NavigationIcon className={classes.doneIcon} />
              <small>Done</small>
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
