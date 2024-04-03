import { FormEvent, useRef, useState } from 'react';
import './App.css';
import styled from 'styled-components';

type UserDataType = {
  name: string;
  date: Date | string;
};

function App() {
  const [userData, setUserData] = useState<UserDataType>({
    name: '',
    date: ''
  });
  const [isUser, setIsUser] = useState<boolean>(false);
  const [notUser, setNotUser] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);

  const [position, setPosition] = useState({
    right: '',
    top: ''
  });

  const nameRef = useRef<HTMLInputElement | null>(null);
  const dateRef = useRef<HTMLInputElement | null>(null);

  const onSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (notUser) setNotUser(false);
    if (userData.date !== `${import.meta.env.VITE_EXPECT_ANS}`) {
      setNotUser(true);
      if (nameRef.current != null && dateRef.current != null) {
        nameRef.current.value = '';
        dateRef.current.value = '';
      }
      setTimeout(() => {
        setNotUser(false);
      }, 3000);
      return;
    }
    setIsUser(true);
  };

  const handleCLick = () => {
    if (count > 4) return;
    setCount(prev => prev + 1);
    if (count > 3) {
      navigator.clipboard.writeText(`${import.meta.env.VITE_PASSWORD}`);
      setPosition({
        top: `0`,
        right: `0`
      });
      return;
    }
    setPosition(prev => ({
      ...prev,
      top: `${Math.round(Math.random() * 20)}rem`,
      right: `${Math.round(Math.random() * 10)}rem`
    }));
  };

  const { top, right } = position;

  const Code = styled.code`
    font-size: 1rem;
    padding: 0.3rem 0.7rem;
    border-radius: 5px;
    cursor: pointer;
    background-color: #6b6b6baa;
    letter-spacing: 0.2rem;
    position: relative;
    &::after {
      content: attr(data-text);
      position: absolute;
      top: 2rem;
      letter-spacing: 0;
      border-radius: 10px;
      border-top-left-radius: 0;
      left: 2rem;
      font-size: 0.8rem;
      padding: 0.2rem 0.3rem;
      width: 100px;
      ${count > 4
        ? ''
        : `
        animation: ani 0.3s linear infinite alternate-reverse;
        `}
      background-color: ${count > 4 ? 'lightgreen' : 'rgb(53, 53, 53)'};
      color: ${count > 4 ? 'black' : 'white'};
    }
    @keyframes ani {
      to {
        top: 2.3rem;
        background-color: rgb(103, 103, 103);
      }
    }
  `;
  return (
    <>
      {notUser && <h2 style={{ color: 'red' }}>Invalid User Try Again</h2>}
      {isUser ? (
        <h3>
          Hello {userData.name.split(' ')[0]}, Here is your <br />
          password :{' '}
          <Code
            data-text={count > 4 ? 'Copied' : 'Click To Copy'}
            style={{ right, top }}
            onClick={handleCLick}
            className="pass"
          >
            {import.meta.env.VITE_PASSWORD}
          </Code>
        </h3>
      ) : (
        <form className="form" onSubmit={onSubmitHandler}>
          <h2>Enter Details Here</h2>
          <label htmlFor="name">
            Full Name<span>*</span>
          </label>
          <input
            ref={nameRef}
            onChange={e =>
              setUserData(prev => ({ ...prev, name: e.target.value }))
            }
            required
            type="text"
            name="name"
            id="name"
          />
          <label htmlFor="date">
            Date Of Birth<span>*</span>
          </label>
          <input
            ref={dateRef}
            onChange={e =>
              setUserData(prev => ({ ...prev, date: e.target.value }))
            }
            required
            type="date"
            name="date"
            id="date"
          />
          <button type="submit">Submit</button>
        </form>
      )}
    </>
  );
}

export default App;
