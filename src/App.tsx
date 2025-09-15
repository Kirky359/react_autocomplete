import React, { useState } from 'react';
import './App.scss';
import { peopleFromServer } from './data/people';
import debounce from 'lodash.debounce';
import { Person } from './types/Person';
import 'bulma/css/bulma.min.css';

type Props = {
  delay: number;
};

export const App: React.FC<Props> = ({ delay = 300 }) => {
  const [filteredPeople, setFilteredPeople] =
    useState<Person[]>(peopleFromServer);

  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState(false);

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [inputValue, setInputValue] = useState('');

  const handleShowList = debounce((value: string) => {
    const results = peopleFromServer.filter(person =>
      person.name.toLowerCase().includes(value.toLowerCase()),
    );

    setFilteredPeople(results);

    if (value && results.length === 0) {
      setError(true);
    } else {
      setError(false);
    }

    if (!value) {
      setFilteredPeople(peopleFromServer);
    }
  }, delay);

  const handleSelect = (person: Person) => {
    setSelectedPerson(person);
    setInputValue(person.name);
    setIsFocused(false);
  };

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {selectedPerson
            ? `${selectedPerson.name} (${selectedPerson.born} - ${selectedPerson.died})`
            : 'No selected person'}
        </h1>

        <div className={`dropdown ${isFocused ? 'is-active' : ''}`}>
          <div className="dropdown-trigger">
            <input
              type="text"
              value={inputValue}
              placeholder="Enter a part of the name"
              className="input"
              data-cy="search-input"
              onChange={event => {
                const value = event.target.value;

                setInputValue(value);
                handleShowList(value);
                setSelectedPerson(null);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />
          </div>

          <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
            <div className="dropdown-content">
              {isFocused &&
                filteredPeople.map(person => (
                  <a
                    key={person.name}
                    className="dropdown-item"
                    data-cy="suggestion-item"
                    onClick={() => handleSelect(person)}
                  >
                    <p className="has-text-link">{person.name}</p>
                  </a>
                ))}
            </div>
          </div>
        </div>

        {error && (
          <div
            className="
            notification
            is-danger
            is-light
            mt-3
            is-align-self-flex-start
          "
            role="alert"
            data-cy="no-suggestions-message"
          >
            <p className="has-text-danger">No matching suggestions</p>
          </div>
        )}
      </main>
    </div>
  );
};
