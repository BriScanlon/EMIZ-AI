import { useEffect, useState } from "react";
import { getSuggestedQuestions } from "../../services/api";
import styles from "./SuggestedQuestions.module.scss";

function SuggestedQuestions() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    setQuestions(getSuggestedQuestions());
  }, []);

  return (
    <div className={styles.suggestedContainer}>
      <h3 className={styles.heading}>Suggested Questions</h3>
      <ul className={styles.list}>
        {questions.map((question, index) => (
          <li
            key={index}
            className={styles.item}
            onClick={() => console.log("clicked")}
          >
            {question}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SuggestedQuestions;
