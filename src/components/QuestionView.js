import React, { useState, useEffect, memo, useRef } from 'react';
import './QuestionView.css';

const QuestionView = ({
  question,
  onAnswerResult,
  showExplanation,
  toggleExplanation,
  alwaysShowCorrectAnswer 
}) => {
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

  const getButtonClassName = (answer) => {
    if (isAnswered) {
      if (answer.isCorrect) return "answer-button correct";
      if (selectedAnswer === answer && !answer.isCorrect) return "answer-button incorrect";
    }
    return "answer-button";
  };

  // Find the correct answer text for display
  const correctAnswerText = question.answers.find(a => a.isCorrect)?.text;

  return (
    <div className="question-card">
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
        <div className="correct-answer-section">
          <p className="correct-answer-text">
            ✅ სწორი პასუხია: <strong>{correctAnswerText}</strong>
          </p>
        </div>
      )}

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