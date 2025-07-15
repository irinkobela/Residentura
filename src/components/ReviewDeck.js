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
  clearIncorrectlyAnsweredQuestions,
}) => {
  const { shortcutPrev, shortcutNext, shortcutExplanation } = useShortcuts();

  const [reviewQueue, setReviewQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const initialQueue = questions.filter(q => incorrectlyAnsweredQuestions.includes(q.id));
    setReviewQueue(initialQueue);
    setCurrentIndex(0);
  }, [questions, incorrectlyAnsweredQuestions]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, reviewQueue.length - 1));
  }, [reviewQueue.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const handleMasteryAnswer = (questionId, isCorrect) => {
    if (onAnswerResult) {
      onAnswerResult(questionId, isCorrect);
    }
    if (isCorrect) {
      const newQueue = reviewQueue.filter(q => q.id !== questionId);
      setReviewQueue(newQueue);
      setCurrentIndex(prevIndex => Math.min(prevIndex, newQueue.length - 1));
    } else {
      setCurrentIndex(prevIndex => (prevIndex + 1) % reviewQueue.length);
    }
  };

  // FIX: Wrap handleBackToQuiz in useCallback and define it before useEffect
  const handleBackToQuiz = useCallback(() => {
    if (clearIncorrectlyAnsweredQuestions) {
      clearIncorrectlyAnsweredQuestions();
    }
    onBackToQuiz();
  }, [clearIncorrectlyAnsweredQuestions, onBackToQuiz]);

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
  }, [
    shortcutPrev,
    shortcutNext,
    shortcutExplanation,
    handleNext,
    handlePrevious,
    toggleExplanation,
    handleBackToQuiz
  ]);

  if (reviewQueue.length === 0) {
    return (
      <div className="review-deck-container">
        <h2>✨ გილოცავთ!</h2>
        <p>თქვენ წარმატებით უპასუხეთ ყველა მანამდე შეცდომით ნაპასუხებ კითხვას.</p>
        <button onClick={handleBackToQuiz}>🔙 დაბრუნება სწავლის რეჟიმზე</button>
      </div>
    );
  }

  const currentQuestion = reviewQueue[currentIndex];

  return (
    <div className="review-deck-container">
      <h2>🧠 "დამხეცების" რეჟიმი ({reviewQueue.length} კითხვა დარჩა)</h2>
      <QuestionView
        question={currentQuestion}
        onAnswerResult={handleMasteryAnswer}
        showExplanation={showExplanation}
        toggleExplanation={toggleExplanation}
        alwaysShowCorrectAnswer={true}
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