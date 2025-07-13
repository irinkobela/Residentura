import React, { useState, useEffect, useCallback } from 'react';
import { useShortcuts } from '../contexts/ShortcutContext';
import QuestionView from './QuestionView';
import './ReviewDeck.css';

const ReviewDeck = ({
  questions,
  incorrectlyAnsweredQuestions,
  onAnswerResult,
  onBackToQuiz,
  showExplanation,
  toggleExplanation,
}) => {
  const { shortcutPrev, shortcutNext, shortcutExplanation } = useShortcuts();
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const reviewQuestions = questions.filter(q => incorrectlyAnsweredQuestions.includes(q.id));

  useEffect(() => {
    setCurrentReviewIndex(0);
  }, [incorrectlyAnsweredQuestions]);

  const handleNext = useCallback(() => {
    setCurrentReviewIndex(prev => Math.min(prev + 1, reviewQuestions.length - 1));
  }, [reviewQuestions.length]);

  const handlePrevious = useCallback(() => {
    setCurrentReviewIndex(prev => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === shortcutNext) handleNext();
      if (e.key === shortcutPrev) handlePrevious();
      if (e.key === shortcutExplanation || (shortcutExplanation === ' ' && e.code === 'Space')) {
        toggleExplanation();
      }
      if (e.key === 'Escape') {
        onBackToQuiz();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutPrev, shortcutNext, shortcutExplanation, handleNext, handlePrevious, toggleExplanation, onBackToQuiz]);

  if (reviewQuestions.length === 0) {
    return (
      <div className="review-deck-container">
        <h2>🚫 არ არის კითხვები გადასახედად</h2>
        <button onClick={onBackToQuiz}>🔙 დაბრუნება სწავლის რეჟიმზე</button>
      </div>
    );
  }

  return (
    <div className="review-deck-container">
      <h2>🔁 შეცდომების გადახედვა ({currentReviewIndex + 1} / {reviewQuestions.length})</h2>
      <QuestionView
        question={reviewQuestions[currentReviewIndex]}
        onAnswerResult={onAnswerResult}
        showExplanation={showExplanation}
        toggleExplanation={toggleExplanation}
      />
      <div className="navigation">
        <button onClick={handlePrevious} disabled={currentReviewIndex === 0}>
          ◀️ წინა
        </button>
        <button onClick={handleNext} disabled={currentReviewIndex === reviewQuestions.length - 1}>
          ▶️ შემდეგი
        </button>
        <button onClick={onBackToQuiz}>🔙 დაბრუნება სწავლის რეჟიმზე</button>
      </div>
    </div>
  );
};

export default ReviewDeck;
