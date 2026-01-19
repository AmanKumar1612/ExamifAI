import React, { useState } from 'react';
import QuestionCard from './QuestionCard';
import FaceRecognition from './FaceRecognition';
import './App.css';

const questions = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correctIndex: 2
  },
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "22", "5"],
    correctIndex: 1
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Venus", "Jupiter"],
    correctIndex: 1
  }
];

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleOptionSelect = (optionIndex) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = optionIndex;
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const calculateScore = () => {
    return answers.reduce((score, ans, idx) => (
      ans === questions[idx].correctIndex ? score + 1 : score
    ), 0);
  };

  if (!authenticated) {
    return <FaceRecognition onAuthenticated={() => setAuthenticated(true)} />;
  }

  if (isSubmitted) {
    return (
      <div className="exam-container">
        <h1>Exam Finished!</h1>
        <p>Your Score: {calculateScore()} / {questions.length}</p>
        <p>Thanks for taking the exam!</p>
      </div>
    );
  }

  return (
    <div className="exam-container">
      <h1>Online Exam</h1>
      <QuestionCard
        question={questions[currentQuestion].question}
        options={questions[currentQuestion].options}
        selectedOption={answers[currentQuestion]}
        onOptionSelect={handleOptionSelect}
      />
      <div className="buttons">
        <button onClick={handlePrevious} disabled={currentQuestion === 0}>Previous</button>
        <button onClick={handleNext} disabled={currentQuestion === questions.length - 1}>Next</button>
        <button onClick={handleSubmit}>Submit Exam</button>
      </div>
    </div>
  );
}

export default App;
