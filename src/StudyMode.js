import React, { useState, useEffect, useContext, Suspense, lazy, useCallback } from 'react';
import { QuestionContext } from './contexts/QuestionContext';
import { useShortcuts } from './contexts/ShortcutContext';
import useLocalStorage from './hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import './App.css';

const QuestionView = lazy(() => import('./components/QuestionView'));
const SettingsPopoverComponent = lazy(() => import('./components/SettingsPopover'));
const ReviewDeck = lazy(() => import('./components/ReviewDeck'));
const TagFilter = lazy(() => import('./components/TagFilter'));

const StudyMode = () => {
  const navigate = useNavigate();
  const { questions, loading, error } = useContext(QuestionContext);
  const { shortcutPrev, shortcutNext, shortcutExplanation } = useShortcuts();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useLocalStorage('currentQuestionIndex', 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useLocalStorage('selectedTags', []);
  const [incorrectlyAnsweredQuestions, setIncorrectlyAnsweredQuestions] = useLocalStorage('incorrectlyAnsweredQuestions', []);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const allTags = React.useMemo(() => Array.from(new Set(questions.flatMap(q => q.tags || []))), [questions]);

  const filteredQuestions = React.useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags = selectedTags.length === 0 || q.tags?.some(tag => selectedTags.includes(tag));
      return matchesSearch && matchesTags;
    });
  }, [questions, searchQuery, selectedTags]);

  useEffect(() => {
    if (currentQuestionIndex >= filteredQuestions.length) {
      setCurrentQuestionIndex(Math.max(0, filteredQuestions.length - 1));
    }
  }, [filteredQuestions, currentQuestionIndex, setCurrentQuestionIndex]);

  const handleAnswerResult = useCallback((questionId, isCorrect) => {
    if (!isCorrect) {
      setIncorrectlyAnsweredQuestions(prev => (prev.includes(questionId) ? prev : [...prev, questionId]));
    }
  }, [setIncorrectlyAnsweredQuestions]);

  const handleNext = useCallback(() => {
    setShowExplanation(false);
    setCurrentQuestionIndex(prev => Math.min(prev + 1, filteredQuestions.length - 1));
  }, [setCurrentQuestionIndex, filteredQuestions.length]);

  const handlePrevious = useCallback(() => {
    setShowExplanation(false);
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  }, [setCurrentQuestionIndex]);

  const toggleExplanation = useCallback(() => {
    setShowExplanation(prev => !prev);
  }, []);

  // ⌨️ Custom Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === shortcutNext) handleNext();
      if (e.key === shortcutPrev) handlePrevious();
      if (e.key === shortcutExplanation || (shortcutExplanation === 'Space' && e.code === 'Space')) toggleExplanation();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutPrev, shortcutNext, shortcutExplanation, handleNext, handlePrevious, toggleExplanation]);

  const reviewQuestions = questions.filter(q => incorrectlyAnsweredQuestions.includes(q.id));

  if (loading) {
    return <div className="loading-message">📦 იტვირთება...</div>;
  }

  if (error) {
    return <div className="error-message">❗{error.message}</div>;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🧠 რეზიდენტურის ტესტები</h1>
       <Suspense fallback={
  <div className="settings-popover">
    <button className="settings-button" disabled aria-label="Settings">⚙️</button>
  </div>
}>
  <SettingsPopoverComponent />
</Suspense>

      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔎 მოძებნე კითხვა"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Suspense fallback={<div className="loading-message">📦 იტვირთება...</div>}>
        <TagFilter
          allTags={allTags}
          selectedTags={selectedTags}
          onTagChange={setSelectedTags}
        />

        <div className="mode-toggle">
          <button
            onClick={() => navigate('/quiz')}
          >🎯 ქვიზ რეჟიმი</button>
          <button
            onClick={() => {
              setIsReviewMode(false);
              setCurrentQuestionIndex(0);
              setIncorrectlyAnsweredQuestions([]);
            }}
            className={!isReviewMode ? 'active' : ''}
          >📚 სწავლის რეჟიმი</button>
          <button
            onClick={() => setIsReviewMode(true)}
            disabled={isReviewMode || reviewQuestions.length === 0}
            className={isReviewMode ? 'active' : ''}
          >🔁 გადახედვა ({reviewQuestions.length})</button>
        </div>

        {filteredQuestions.length > 0 ? (
          isReviewMode ? (
            <ReviewDeck
              questions={reviewQuestions}
              incorrectlyAnsweredQuestions={incorrectlyAnsweredQuestions}
              onAnswerResult={handleAnswerResult}
              onBackToQuiz={() => setIsReviewMode(false)}
              showExplanation={showExplanation}
              toggleExplanation={toggleExplanation}
            />
          ) : (
            <QuestionView
              question={filteredQuestions[currentQuestionIndex]}
              onAnswerResult={handleAnswerResult}
              showExplanation={showExplanation}
              toggleExplanation={toggleExplanation}
            />
          )
        ) : (
          <p>❗შესატყვისი კითხვები ვერ მოიძებნა</p>
        )}

        {!isReviewMode && filteredQuestions.length > 0 && (
          <div className="navigation-controls">
            <span>📍 კითხვა {currentQuestionIndex + 1} / {filteredQuestions.length}</span>
            <div className="navigation-buttons">
              <button onClick={handlePrevious} disabled={currentQuestionIndex === 0}>◀️ წინა</button>
              <button onClick={handleNext} disabled={currentQuestionIndex >= filteredQuestions.length - 1}>▶️ შემდეგი</button>
            </div>
          </div>
        )}
      </Suspense>
    </div>
  );
};

export default StudyMode;
