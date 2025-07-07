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

  const handleAnswerClick = (answer) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (onAnswerResult) {
      onAnswerResult(question.id, answer.isCorrect);
    }
  };

  const getButtonClassName = (answer) => {
    if (!isAnswered) return "answer-button";
    if (answer.isCorrect) return "answer-button correct";
    if (selectedAnswer === answer && !answer.isCorrect) return "answer-button incorrect";
    return "answer-button disabled";
  };

  const handleToggleExplanation = (e) => {
    e.stopPropagation();
    toggleExplanation();
    if (!showExplanation) {
      setTimeout(() => {
        explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div className="question-card" onClick={toggleExplanation}>
      <h2 className="question-text">❓ {question.question}</h2>
      <div className="answers-container">
        {question.answers.map((answer, index) => (
          <button
            key={index}
            className={getButtonClassName(answer)}
            onClick={() => handleAnswerClick(answer)}
            disabled={isAnswered}
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
