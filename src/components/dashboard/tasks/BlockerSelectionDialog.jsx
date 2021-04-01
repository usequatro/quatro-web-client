import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';

import SearchRoundedIcon from '@material-ui/icons/SearchRounded';

import BlockedIcon from '../../icons/BlockedIcon';
import { selectAllTasksOrderedAlphabetically } from '../../../modules/tasks';
import DialogTitleWithClose from '../../ui/DialogTitleWithClose';

const useStyles = makeStyles(() => ({
  dialogContent: {
    height: '35rem',
    maxHeight: '45vh',
  },
  paper: {
    width: '25rem',
    maxWidth: '90vw',
  },
  freeTextField: {
    flexGrow: 1,
    marginRight: '0.5rem',
  },
}));

const BlockerSelectionDialog = ({
  open,
  onClose,
  onSelect,
  onFreeTextEntered,
  disabledTasks,
  hiddenTasks,
}) => {
  const classes = useStyles();
  const [searchTerm, setSearchTerm] = useState('');
  const [freeTextValue, setFreeTextValue] = useState('');
  const [freeTextError, setFreeTextError] = useState(false);

  const tasks = useSelector((state) => (!open ? [] : selectAllTasksOrderedAlphabetically(state)));
  const nonHiddenTasks = tasks.filter(([id]) => !hiddenTasks.includes(id));
  const filteredTasks =
    searchTerm.length > 0
      ? nonHiddenTasks.filter(([, task]) =>
          `${task.title}`.toLowerCase().includes(`${searchTerm}`.toLowerCase()),
        )
      : nonHiddenTasks;

  // Clear state when closing
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setFreeTextValue('');
      setFreeTextError(false);
    }
  }, [open]);

  const handleFreeTextEntered = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!freeTextValue) {
      setFreeTextError(true);
      return;
    }
    onClose();
    onFreeTextEntered(freeTextValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="task-selection-dialog"
      PaperProps={{
        className: classes.paper,
      }}
    >
      <DialogTitleWithClose
        TypographyProps={{ id: 'task-selection-dialog', variant: 'h6' }}
        iconStart={<BlockedIcon />}
        title="Blockers"
        onClose={onClose}
      />

      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          value={searchTerm}
          label="Search task"
          onChange={(event) => setSearchTerm(event.target.value)}
          InputProps={{ endAdornment: <SearchRoundedIcon /> }}
        />
      </DialogContent>

      <DialogContent className={classes.dialogContent}>
        <MenuList>
          {filteredTasks.map(([id, task]) => (
            <MenuItem
              key={id}
              disableGutters
              divider
              disabled={disabledTasks.includes(id)}
              onClick={() => {
                onClose();
                onSelect(id, task);
              }}
            >
              {task.title}
            </MenuItem>
          ))}
        </MenuList>
      </DialogContent>

      <Divider />

      <DialogContent>
        <Typography component="p" variant="body1">
          Custom
        </Typography>

        <form onSubmit={handleFreeTextEntered}>
          <Box display="flex" alignItems="flex-end" flexGrow={1} pb={2}>
            <TextField
              className={classes.freeTextField}
              label="What's blocking you?"
              value={freeTextValue}
              error={freeTextError}
              onChange={(event) => {
                setFreeTextValue(event.target.value);
                if (freeTextError) {
                  setFreeTextError(false);
                }
              }}
            />

            <Button variant="text" color="primary" type="submit">
              Done
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

BlockerSelectionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onFreeTextEntered: PropTypes.func.isRequired,
  disabledTasks: PropTypes.arrayOf(PropTypes.string).isRequired,
  hiddenTasks: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default BlockerSelectionDialog;
