import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"; // Use horizontal three-dot icon
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import styles from "./ChatMenuOptions.module.scss";
import { useRenameChat } from "../hooks/useRenameChat";
import { useDeleteChat } from "../hooks/useDeleteChat";
import { useChatHistory } from "../hooks/useChatHistory";
import { useSearch } from "../contexts/SearchContext";
import { useChats } from "../hooks/useChats";

const ChatMenuOptions = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRenameDialog, setOpenRenameDialog] = useState(false);
  const [newName, setNewName] = useState("");

  const { selectedSearch: chatNameFromContext } = useSearch();
  const getChatName =
    chatNameFromContext || JSON.parse(localStorage.getItem("selectedSearch"));
  const { chatTitle: chatName } = useChatHistory(getChatName);

  const { refetch } = useChats();
  const { mutate: renameChat } = useRenameChat();
  const { mutate: deleteChat } = useDeleteChat();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    setOpenDeleteDialog(true);
    handleClose();
  };

  const handleRename = () => {
    setOpenRenameDialog(true);
    handleClose();
  };

  const handleDeleteConfirm = () => {
    if (chatName) {
      deleteChat(chatName, {
        onSuccess: () => {
          refetch(); // Refetch recent searches after deletion
          console.log("It is well!");
        },
      });
    } else {
      console.error("Chat name is undefined");
    }
    setOpenDeleteDialog(false);
  };

  const handleRenameConfirm = () => {
    renameChat(
      { chatName, newChatName: newName },
      {
        onSuccess: () => {
          refetch(); // Refetch recent searches after renaming
          console.log("It is well!");
        },
      }
    );
    setOpenRenameDialog(false);
  };

  return (
    <div>
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreHorizIcon /> {/* Use horizontal three-dot icon */}
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        className={styles.menu}
      >
        <MenuItem onClick={handleRename}>
          <EditIcon className={styles.icon} /> Rename
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon className={styles.icon} /> Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this conversation? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog
        open={openRenameDialog}
        onClose={() => setOpenRenameDialog(false)}
      >
        <DialogTitle>Rename Conversation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a new name for this conversation.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="New Name"
            type="text"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRenameDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRenameConfirm} color="primary">
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ChatMenuOptions;
