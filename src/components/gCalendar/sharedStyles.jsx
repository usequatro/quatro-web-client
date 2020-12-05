import { makeStyles } from '@material-ui/core/styles';

export const tickHeight = 25;
export const extraTicks = 2;

export const useStyles = makeStyles((theme) => ({
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
    display: 'flex',
    justifyContent: 'flex-end',
  },
  eventDefaultStyle: {
    position: 'absolute',
    width: '80%',
    padding: 10,
    borderRadius: 5,
    color: '#FFFFFF',
    border: '1px solid #FFFFFF',
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
    height: 'auto',
  },
}));

export const colors = {
  263573: '#263573',
  '077EC0': '#077EC0',
  '57C7E4': '#57C7E4',
  F6891F: '#F6891F',
};

export const eventBackgroundStyles = {};
Object.keys(colors).forEach((key) => {
  eventBackgroundStyles[key] = {
    backgroundColor: colors[key],
  };
});
export const useEventBackgroundStyles = makeStyles(eventBackgroundStyles);

const checkBoxesStyles = {};
Object.keys(colors).forEach((key) => {
  checkBoxesStyles[key] = {
    color: colors[key],
    [`&$checked${key}`]: {
      color: colors[key],
    },
  };
  checkBoxesStyles[`checked${key}`] = {
    color: colors[key],
  };
});
export const useCheckboxStyles = makeStyles(checkBoxesStyles);
