import './App.scss';
import { useState } from 'react';

import usersFromServer from './api/users';
import todosFromServer from './api/todos';
import { User } from './types/User';
import { Todo } from './types/Todo';
import { TodoList } from './components/TodoList';

function getUser(userId: number): User | null {
  const foundUser = usersFromServer.find(user => user.id === userId);

  return foundUser || null;
}

function onlySpaces(todoTitle: string): boolean {
  return /^\s*$/.test(todoTitle);
}

export const todos: Todo[] = todosFromServer.map(todo => ({
  ...todo,
  user: getUser(todo.userId),
}));

export const App = () => {
  const [todosList, setTodos] = useState<Todo[]>(todos);
  const [newTitle, setTitle] = useState('');
  const [selectedUserId, setselectedUserId] = useState(0);
  const [titleError, setTitleError] = useState(false);
  const [userError, setUserIdError] = useState(false);

  return (
    <div className="App">
      <h1>Add todo form</h1>

      <form
        action="/api/users"
        method="POST"
        onSubmit={(event) => {
          event.preventDefault();

          if (onlySpaces(newTitle)) {
            setTitleError(true);
          }

          if (!selectedUserId) {
            setUserIdError(true);
          }

          if (titleError || onlySpaces(newTitle) || !selectedUserId) {
            return;
          }

          setTodos((prevTodos) => {
            return [
              ...prevTodos,
              {
                title: newTitle,
                userId: selectedUserId,
                completed: false,
                user: getUser(selectedUserId),
                id: prevTodos
                  .map(({ id }) => id)
                  .reduce((idA, idB) => Math.max(idA, idB), 0) + 1,
              },
            ];
          });
          setTitle('');
          setselectedUserId(0);
        }}
      >

        <div className="field">
          <label>
            {'Title: '}
            <input
              type="text"
              data-cy="titleInput"
              placeholder="Enter a title"
              value={newTitle}
              onChange={(event) => {
                setTitle(event.target.value);
                if (event.target.value.match(/^[\sа-яіїєa-z0-9]+$/i)) {
                  setTitleError(false);
                } else {
                  setTitleError(true);
                }
              }}
            />
            {titleError
              && (
                <>
                  <span className="error">Please enter a title</span>
                  <span className="error_extension">
                    {' '}
                    Title should include UA or EN letters,
                    numbers and spaces.
                  </span>
                </>
              )}

          </label>
        </div>

        <div className="field">
          <label>
            {'User: '}
            <select
              value={selectedUserId}
              data-cy="userSelect"
              onChange={(event) => {
                setUserIdError(false);
                setselectedUserId(Number(event.target.value));
              }}
            >
              <option value="0" disabled>
                Choose a user
              </option>
              {usersFromServer.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.name.trim()}
                </option>
              ))}

            </select>
            {userError
              && <span className="error">Please choose a user</span>}

          </label>
        </div>

        <button
          type="submit"
          data-cy="submitButton"
        >
          Add
        </button>
      </form>

      <TodoList todos={todosList} />
    </div>
  );
};
