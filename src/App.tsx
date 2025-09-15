import React, { useState, useRef, useMemo, useEffect } from 'react';
import './App.scss';
import { peopleFromServer } from './data/people';
import debounce from 'lodash.debounce';
import { Person } from './types/Person';
import 'bulma/css/bulma.min.css';

type Props = {
  delay?: number; // delay опциональный
  onSelected?: (person: Person) => void; // коллбек для выбранного человека
};

export const App: React.FC<Props> = ({ delay = 300, onSelected }) => {
  const [filteredPeople, setFilteredPeople] =
    useState<Person[]>(peopleFromServer);

  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState(false);

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [inputValue, setInputValue] = useState('');

  // Чтобы не фильтровать повторно одно и то же
  const lastQueryRef = useRef('');

  // Дебаунс для фильтрации
  const handleShowList = useMemo(
    () =>
      debounce((query: string) => {
        const normalized = query.trim().toLowerCase();

        const results = peopleFromServer.filter(person =>
          person.name.toLowerCase().includes(normalized),
        );

        setFilteredPeople(results);

        if (query && results.length === 0) {
          setError(true);
        } else {
          setError(false);
        }

        if (!query) {
          setFilteredPeople(peopleFromServer);
        }
      }, delay),
    [delay],
  );

  useEffect(() => {
    return () => {
      handleShowList.cancel();
    };
  }, [handleShowList]);

  const handleSelect = (person: Person) => {
    setSelectedPerson(person);
    setInputValue(person.name);
    setIsFocused(false);
    onSelected?.(person); // коллбек наружу
  };

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-qa="title" data-cy="title">
          {selectedPerson
            ? `${selectedPerson.name} (${selectedPerson.born} - ${selectedPerson.died})`
            : 'No selected person'}
        </h1>

        <div
          className={`dropdown ${
            isFocused && filteredPeople.length > 0 ? 'is-active' : ''
          }`}
        >
          <div className="dropdown-trigger">
            <input
              type="text"
              value={inputValue}
              placeholder="Enter a part of the name"
              className="input"
              data-qa="search-input"
              data-cy="search-input"
              onChange={event => {
                const raw = event.target.value;
                const normalized = raw.trim();

                setInputValue(raw);

                if (normalized === '') {
                  setFilteredPeople(peopleFromServer);
                  setError(false);
                  setIsFocused(true);

                  return;
                }

                if (normalized !== lastQueryRef.current) {
                  handleShowList(normalized);
                  lastQueryRef.current = normalized;
                }

                setSelectedPerson(null);
                setIsFocused(true);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setTimeout(() => {
                  if (!document.activeElement?.closest('.dropdown')) {
                    setIsFocused(false);
                  }
                }, 200);
              }}
            />
          </div>

          <div
            className="dropdown-menu"
            role="menu"
            data-qa="suggestions-list"
            data-cy="suggestions-list"
          >
            <div className="dropdown-content">
              {filteredPeople.map(person => (
                <a
                  key={person.name}
                  className="dropdown-item"
                  data-qa="suggestion-item"
                  data-cy="suggestion-item"
                  onClick={() => handleSelect(person)}
                >
                  {person.name}
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
            data-qa="no-suggestions-message"
            data-cy="no-suggestions-message"
          >
            <p className="has-text-danger">No matching suggestions</p>
          </div>
        )}
      </main>
    </div>
  );
};
