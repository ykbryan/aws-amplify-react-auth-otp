import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

const NOTSIGNIN = 'You are NOT logged in';
const SIGNEDIN = 'You have logged in successfully';
const SIGNEDOUT = 'You have logged out successfully';
const WAITINGFOROTP = 'Enter OTP number';
const VERIFYNUMBER = 'Verifying number (Country code +XX needed)';

function App() {
  const [message, setMessage] = useState('Welcome to AWS Amplify Demo');
  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(null);
  const [otp, setOtp] = useState('');
  const [number, setNumber] = useState('');
  const [waiting, setWaiting] = useState(false);
  const password = Math.random().toString(10) + 'Abc#';

  useEffect(() => {
    console.log('Ready to auth');
    setTimeout(verifyAuth, 1500);
  }, []);

  const verifyAuth = () => {
    Auth.currentAuthenticatedUser()
      .then((user) => {
        setUser(user);
        setMessage(SIGNEDIN);
      })
      .catch((err) => {
        console.error(err);
        setMessage(NOTSIGNIN);
      });
  };

  const signOut = () => {
    if (user) {
      Auth.signOut();
      setUser(null);
      setOtp('');
      setMessage(SIGNEDOUT);
    } else {
      setMessage(NOTSIGNIN);
    }
  };

  const signIn = () => {
    setMessage(VERIFYNUMBER);
    Auth.signIn(number)
      .then((user) => {
        setGuest(user);
        setMessage(WAITINGFOROTP);
        setWaiting(true);
      })
      .catch((e) => {
        if (e.code === 'UserNotFoundException') {
          signUp();
          // setMessage(WAITINGFOROTP);
          setWaiting(true);
        } else if (e.code === 'UsernameExistsException') {
          setMessage(WAITINGFOROTP);
          setWaiting(true);
          signIn();
        } else {
          console.log(e.code);
          console.error(e);
        }
      });
  };

  const signUp = async () => {
    const result = await Auth.signUp({
      username: number,
      password,
      attributes: {
        phone_number: number,
      },
    }).then(() => signIn());
    return result;
  };

  const verifyOtp = () => {
    Auth.sendCustomChallengeAnswer(guest, otp)
      .then((user) => {
        setUser(user);
        setMessage(SIGNEDIN);
        setWaiting(false);
      })
      .catch((err) => {
        signIn();
        setMessage(err.message);
        setOtp('');
        console.log(err);
      });
  };

  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <p>{message}</p>
        {!user && !waiting && (
          <div>
            <InputGroup className='mb-3'>
              <FormControl
                placeholder='Phone Number (+XX)'
                aria-label='Your Phone Number'
                aria-describedby='basic-addon2'
                onChange={(event) => setNumber(event.target.value)}
              />
              <InputGroup.Append>
                <Button variant='outline-secondary' onClick={signIn}>
                  Get OTP
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </div>
        )}
        {!user && waiting && (
          <div>
            <InputGroup className='mb-3'>
              <FormControl
                placeholder='Your OTP'
                aria-label='Your OTP'
                aria-describedby='basic-addon2'
                onChange={(event) => setOtp(event.target.value)}
                value={otp}
              />
              <InputGroup.Append>
                <Button variant='outline-secondary' onClick={verifyOtp}>
                  Confirm
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </div>
        )}
        <div>
          <ButtonGroup aria-label='Basic example'>
            <Button variant='outline-primary' onClick={verifyAuth}>
              Am I sign in?
            </Button>
            <Button variant='outline-danger' onClick={signOut}>
              Sign Out
            </Button>
          </ButtonGroup>
        </div>
      </header>
    </div>
  );
}

export default App;
