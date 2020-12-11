import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const ConnectButton = withStyles((theme) => ({
  root: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.info.main,
    '&:hover': {
      backgroundColor: theme.palette.info.main,
      color: '#FFF',
    },
    borderRadius: '2em',
    padding: ' 0.7em 1.2em',
    marginBottom: 30,
  },
}))(Button);

export default ConnectButton;
