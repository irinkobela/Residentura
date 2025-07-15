import React, { useState, useEffect, useCallback } from 'react';
import { useShortcuts } from '../contexts/ShortcutContext';
import QuestionView from './QuestionView';
import './ReviewDeck.module.css';

const ReviewDeck = ({
  questions,
  incorrectlyAnsweredQuestions,
  onAnswerResult, // We can still call this to notify the parent if needed
  onBackToQuiz,
  showExplanation,
  toggleExplanation,
}) => {
  const { shortcutExplanation } = useShortcuts();
  
  // State to manage the dynamic list of questions for this mastery session
  const [reviewQueue, setReviewQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize the review queue when the component mounts or the initial incorrect list changes
  useEffect(() => {
    const initialReviewQuestions = questions.filter(q => 
      incorrectlyAnsweredQuestions.includes(q.id)
    );
    setReviewQueue(initialReviewQuestions);
    setCurrentIndex(0); // Always start from the first question
  }, [questions, incorrectlyAnsweredQuestions]); // Dependency array ensures this runs only when needed

  // The core logic for mastery mode
  const handleMasteryAnswer = (questionId, isCorrect) => {
    // Optionally, notify the parent component about the answer
    if (onAnswerResult) {
      onAnswerResult(questionId, isCorrect);
    }

    if (isCorrect) {
      // ✅ Correct answer: Remove the question from the queue.
      const newQueue = reviewQueue.filter(q => q.id !== questionId);
      
      // If we remove the last item, the index needs to be capped.
      // Math.min prevents the index from going out of bounds.
      setCurrentIndex(prevIndex => Math.min(prevIndex, newQueue.length - 1));
      setReviewQueue(newQueue);
    } else {
      // ❌ Incorrect answer: Move to the next question in the queue.
      // The question stays in the list. We use modulo to loop back to the start.
      setCurrentIndex(prevIndex => (prevIndex + 1) % reviewQueue.length);
    }
  };

  // Effect for keyboard shortcuts (simplified without Next/Prev)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === shortcutExplanation || (shortcutExplanation === ' ' && e.code === 'Space')) {
        toggleExplanation();
      }
      if (e.key === 'Escape') {
        onBackToQuiz();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutExplanation, toggleExplanation, onBackToQuiz]);


  // When the queue is empty, the user has mastered all questions.
  if (reviewQueue.length === 0) {
    return (
      <div className="review-deck-container">
        <h2>✨ გილოცავთ!</h2>
        <p>თქვენ წარმატებით უპასუხეთ ყველა მანამდე შეცდომით ნაპასუხებ კითხვას.</p>
        <button onClick={onBackToQuiz}>🔙 დაბრუნება სწავლის რეჟიმზე</button>
      </div>
    );
  }

  // Get the current question from our dynamic queue
  const currentQuestion = reviewQueue[currentIndex];

  return (
    <div className="review-deck-container">
      {/* The title now shows the number of remaining questions */}
      <h2>🧠 "დამხეცების" რეჟიმი ({reviewQueue.length} კითხვა დარჩა)</h2>
      
      <QuestionView
        question={currentQuestion}
        // Pass our new handler to the QuestionView
        onAnswerResult={handleMasteryAnswer} 
        showExplanation={showExplanation}
        toggleExplanation={toggleExplanation}
      />
      
      <div className="navigation">
        {/* Navigation is now simplified, as answering drives progress */}
        <button onClick={onBackToQuiz}>🔙 გასვლა</button>
      </div>
    </div>
  );
};

export default ReviewDeck;