import React from 'react';

const QuestionCard = ({ question, options, selectedOption, onOptionSelect }) => {
  return (
    <div className="question-card">
      <h2>{question}</h2>
      <ul>
        {options.map((option, index) => (
          <li key={index}>
            <label>
              <input
                type="radio"
                name="option"
                checked={selectedOption === index}
                onChange={() => onOptionSelect(index)}
              />
              {option}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionCard;
