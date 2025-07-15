import React, { useState, useEffect, memo, useRef } from 'react';
import './QuestionView.css';

const QuestionView = ({ question, onAnswerResult, showExplanation, toggleExplanation }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const explanationRef = useRef(null);

  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
  }, [question]);

  useEffect(() => {
    if (showExplanation && explanationRef.current) {
      explanationRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [showExplanation]);

  const handleAnswerClick = (answer) => {
    // This guard prevents the user from changing their answer or re-submitting.
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);
    if (onAnswerResult) {
      onAnswerResult(question.id, answer.isCorrect);
    }
  };

  const handleToggleExplanation = (e) => {
    e.stopPropagation();
    toggleExplanation();
  };

  // --- MODIFIED FUNCTION ---
  const getButtonClassName = (answer) => {
    if (isAnswered) {
      if (answer.isCorrect) return "answer-button correct";
      if (selectedAnswer === answer && !answer.isCorrect) return "answer-button incorrect";
    }
    // All other buttons (before answering or non-relevant ones after) get the default class.
    return "answer-button";
  };
  
  return (
    <div className="question-card">
      <h2 className="question-text">❓ {question.question}</h2>
      <div className="answers-container">
        {question.answers.map((answer, index) => (
          <button
            key={index}
            className={getButtonClassName(answer)}
            onClick={() => handleAnswerClick(answer)}
          >
            {answer.text}
          </button>
        ))}
      </div>

      {isAnswered && (
        <div className="explanation-section" ref={explanationRef}>
          <button className="explanation-toggle" onClick={handleToggleExplanation}>
            {showExplanation ? '🙈 ახსნის დამალვა' : '📖 ახსნის ნახვა'}
          </button>
          {showExplanation && (
            <p className="explanation-text">ℹ️ {question.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(QuestionView);