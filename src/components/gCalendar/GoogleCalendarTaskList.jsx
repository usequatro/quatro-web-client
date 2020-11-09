import React, { useState } from 'react';

import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';

import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from "react-router-dom";

import {
  setDashboardActiveTab
} from '../../modules/dashboard';

import {
  selectConnectedGoogleCalendars
} from '../../modules/googleCalendar';
import { cond } from 'lodash';

const useStyles = makeStyles(() => ({
  container: {
    paddingHorizontal: 90,
    paddingTop: 130,
    display: "flex",
    alignItems: "center",
    alignContent: "center",
    overflow: 'auto',
    backgroundColor: '#ffffff',
    flexDirection: "column"
  },
}));


const GoogleCalendarTaskList = () => {
  const classes = useStyles();
  const connectedGoogleCalendars = useSelector(selectConnectedGoogleCalendars);

  console.log('connectedGoogleCalendars', connectedGoogleCalendars)

  return (
    <Box className={classes.container}>
      {cond([
        [() => connectedGoogleCalendars.length === 0 , () => <ConnectCalendar />],
      ])}
    </Box>
  )
};

export default GoogleCalendarTaskList;

const ConnectCalendar = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const classes = useStyles();

  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => {
    dispatch(setDashboardActiveTab("/dashboard/backlog"));
    history.push("/dashboard/backlog");
  }
  const closeModal = () => {
    setModalVisible(false)
  }
  const renderConnectCalendarList = () => {
    return(
      <Box className={classes.container}>
        <p>My modal</p>
      </Box>
    )
  }
  return (
    <Box className={classes.container}>
      {/* <Typography>
      You haven`t connected any calendar.
      </Typography> */}
      <Button onClick={() => openModal()} variant="contained">Connect Calendar</Button>
      <Modal open={modalVisible} onClose={() => closeModal()}>
        {renderConnectCalendarList()}
      </Modal> 
    </Box>
  )
}