import React, { createContext, useState, useEffect } from 'react';

export const QuestionContext = createContext();

export const QuestionProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/tests.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch questions');
        }
        return res.json();
      })
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  return (
    <QuestionContext.Provider value={{ questions, loading, error }}>
      {children}
    </QuestionContext.Provider>
  );
};
