import { useEffect, useState } from "react";
import { getSuggestedQuestions } from "../../services/api";
import styles from "./SuggestedQuestions.module.scss";
import { useSearch } from "../../contexts/SearchContext";

function SuggestedQuestions() {
  const [questions, setQuestions] = useState([]);
  const { handleQueryInput } = useSearch();

  useEffect(() => {
    const fetchQuestions = async () => {
      const suggestedQuestions = await getSuggestedQuestions();
      setQuestions(suggestedQuestions);
    };

    fetchQuestions();
  }, []);

  const handleQuestionClick = (question) => {
    handleQueryInput(question);
  };

  return (
    <div className={styles.suggestedContainer}>
      <h3 className={styles.heading}>Suggested Questions</h3>
      <ul className={styles.list}>
        {questions.map((question, index) => (
          <li
            key={index}
            className={styles.item}
            onClick={() => handleQuestionClick(question)}
          >
            {question}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SuggestedQuestions;
