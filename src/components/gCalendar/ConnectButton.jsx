import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const ConnectButton = withStyles((theme) => ({
  root: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.grey[900],
    '&:hover': {
      backgroundColor: theme.palette.grey[800],
    },
    borderRadius: '2em',
    padding: '1em 1.5em',
  },
}))(Button);

export default ConnectButton;
