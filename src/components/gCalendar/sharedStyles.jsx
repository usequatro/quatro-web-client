import { makeStyles } from '@material-ui/core/styles';

const tickHeight = 25;

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: 230,
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    overflow: 'auto',
    backgroundColor: '#ffffff',
    flexDirection: 'column',
  },
  tick: {
    flex: 1,
    width: '100%',
    minHeight: tickHeight,
    borderTop: 'solid 1px #F1F1F1',
  },
  halfTick: {
    flex: 1,
    borderTop: 'solid 1px #F6F6F6',
    width: '100%',
    minHeight: tickHeight,
  },
  quarterTick: {
    flex: 1,
    borderBottom: 'solid 1px #FFFFFF',
    width: '100%',
    minHeight: tickHeight,
    fontSize: 0,
  },
  tickLabel: {
    color: '#AAAAAA',
    marginTop: -11,
    display: 'block',
    backgroundColor: '#ffffff',
    width: 80,
    textAlign: 'right',
    paddingRight: 10,
  },
  eventsContainer: {
    position: 'relative',
    width: '100%',
    display: "flex",
    justifyContent: "flex-end"
  },
  eventDefaultStyle: {
    position: 'absolute',
    width: '80%',
    padding: 10,
    borderRadius: 5,
    color: '#FFFFFF',
    border: '1px solid #FFFFFF'
  },
  eventName: {
    fontWeight: 'bold',
    display: 'block',
    fontSize: 14,
  },
  eventInfo: {
    display: 'block',
    fontSize: 12,
  },
  eventDuration: {
    width: '100%',
    border: `solid 0px ${theme.palette.divider}`,
    color: '#FFFFFF',
    height: 'auto'
  },
  radioMagenta: {
    backgroundColor: '#EB40AC',
  },
  radioOrange: {
    backgroundColor: '#F08934',
  },
  radioBlackboard: {
    backgroundColor: '#3C717B',
  },
}));

export default useStyles;