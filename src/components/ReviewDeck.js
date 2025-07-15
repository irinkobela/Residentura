import React, { useState, useEffect, useCallback } from 'react';
import { useShortcuts } from '../contexts/ShortcutContext';
import QuestionView from './QuestionView';
import './ReviewDeck.module.css';

const ReviewDeck = ({
  questions,
  incorrectlyAnsweredQuestions,
  onAnswerResult,
  onBackToQuiz,
  showExplanation,
  toggleExplanation,
  clearIncorrectlyAnsweredQuestions, // <-- Add this prop from parent
}) => {
  const { shortcutPrev, shortcutNext, shortcutExplanation } = useShortcuts();

  // Track the review queue in state
  const [reviewQueue, setReviewQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize the review queue when incorrectlyAnsweredQuestions changes
  useEffect(() => {
    const initialQueue = questions.filter(q => incorrectlyAnsweredQuestions.includes(q.id));
    setReviewQueue(initialQueue);
    setCurrentIndex(0);
  }, [questions, incorrectlyAnsweredQuestions]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, reviewQueue.length - 1));
  }, [reviewQueue.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  // Mastery answer handler
  const handleMasteryAnswer = (questionId, isCorrect) => {
    if (onAnswerResult) {
      onAnswerResult(questionId, isCorrect);
    }

    if (isCorrect) {
      // Remove the question from the queue
      const newQueue = reviewQueue.filter(q => q.id !== questionId);
      setReviewQueue(newQueue);

      // Adjust index if needed
      setCurrentIndex(prevIndex => Math.min(prevIndex, newQueue.length - 1));
    } else {
      // Move to next question
      setCurrentIndex(prevIndex => (prevIndex + 1) % reviewQueue.length);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === shortcutNext) handleNext();
      if (e.key === shortcutPrev) handlePrevious();
      if (e.key === shortcutExplanation || (shortcutExplanation === ' ' && e.code === 'Space')) {
        toggleExplanation();
      }
      if (e.key === 'Escape') {
        handleBackToQuiz();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutPrev, shortcutNext, shortcutExplanation, handleNext, handlePrevious, toggleExplanation]);

  // When the queue is empty, show mastered message
  const handleBackToQuiz = () => {
    if (clearIncorrectlyAnsweredQuestions) {
      clearIncorrectlyAnsweredQuestions(); // <-- Clear incorrect questions in parent
    }
    onBackToQuiz();
  };

  if (reviewQueue.length === 0) {
    return (
      <div className="review-deck-container">
        <h2>✨ გილოცავთ!</h2>
        <p>თქვენ წარმატებით უპასუხეთ ყველა მანამდე შეცდომით ნაპასუხებ კითხვას.</p>
        <button onClick={handleBackToQuiz}>🔙 დაბრუნება სწავლის რეჟიმზე</button>
      </div>
    );
  }

  // Render current question and navigation
  const currentQuestion = reviewQueue[currentIndex];

  return (
    <div className="review-deck-container">
      <h2>🧠 "დამხეცების" რეჟიმი ({reviewQueue.length} კითხვა დარჩა)</h2>
      <QuestionView
        question={currentQuestion}
        onAnswerResult={handleMasteryAnswer}
        showExplanation={showExplanation}
        toggleExplanation={toggleExplanation}
        alwaysShowCorrectAnswer={true} // <-- Always show correct answer in review
      />
      <div className="navigation">
        <button onClick={handlePrevious} disabled={currentIndex === 0}>
          ◀️ წინა
        </button>
        <button onClick={handleNext} disabled={currentIndex === reviewQueue.length - 1}>
          ▶️ შემდეგი
        </button>
        <button onClick={handleBackToQuiz}>🔙 დაბრუნება სწავლის რეჟიმზე</button>
      </div>
    </div>
  );
};

export default ReviewDeck;