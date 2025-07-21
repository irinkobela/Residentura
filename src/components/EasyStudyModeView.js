import React, { useEffect, memo, useRef } from 'react';
import './QuestionView.css'; // Reusing existing CSS

const EasyStudyModeView = ({
  question
  // onAnswerResult prop is no longer strictly needed here if we don't track answers
  // but keeping it won't hurt if you use it elsewhere for statistics.
}) => {
  const explanationRef = useRef(null);

  // In Easy Study Mode, the explanation and correct answer are always visible immediately.
  // No need for selectedAnswer or isAnswered state within this component.

  useEffect(() => {
    // Scroll to explanation when a new question loads
    // This will effectively scroll down on 'Next' or 'Previous'
    if (explanationRef.current) {
      explanationRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [question]); // Scroll effect runs every time the question prop changes

  // Find the correct answer text for display
  const correctAnswerText = question.answers.find(a => a.isCorrect)?.text;

  return (
    <div className="question-card">
      <h2 className="question-text">❓ {question.question}</h2>
      <div className="answers-container">
        {/* Buttons are just for display now, no interaction needed to reveal answer/explanation */}
        {question.answers.map((answer, index) => (
          <button
            key={index}
            className={answer.isCorrect ? "answer-button correct" : "answer-button"} // Highlight correct answer always
          >
            {answer.text}
          </button>
        ))}
      </div>

      {/* Correct answer text is always shown */}
      <div className="correct-answer-section">
        <p className="correct-answer-text">
          ✅ სწორი პასუხია: <strong>{correctAnswerText}</strong>
        </p>
      </div>

      {/* Explanation section is always shown */}
      <div className="explanation-section" ref={explanationRef}>
        <p className="explanation-text">ℹ️ {question.explanation}</p>
      </div>
    </div>
  );
};

export default memo(EasyStudyModeView);