import { FiPlus } from "react-icons/fi";
import { useSearch } from "../../contexts/SearchContext";
import styles from "./NewChat.module.scss";

const NewChat = () => {
  const { onClickNewChat } = useSearch();

  return (
    <div className={styles.newChatButton} onClick={onClickNewChat}>
      <FiPlus />
      <span>New Chat</span>
    </div>
  );
};

export default NewChat;
