# Building OTP authentication with ReactJS and AWS Amplify

Today, year 2020, passwords are widely used in our everyday life for many user authentications on the Internet. Primarily due to its convenience and simplicity, the use of passwords has been shown to be plagued by various security problems, especially in [recent times](https://www.weforum.org/agenda/2020/04/covid-19-is-a-reminder-that-its-time-to-get-rid-of-passwords/). Password theft is becoming a common occurence and for this primary and security reason, many business companies and organisations are adopting alternative solutions. This is where one-time password (OTP) becomes really popular in recent times.

Password authentication with static password is particularly vulnerable as these passwords can easily be stolen by, for example, keyloggers, phishing attacks, trojans and etc, without owner's knowledge as well. This has led to the increasing popularity of One-Time Password (OTP) where the generated password is only valid for one login session. To do this securely and scalably, we are going to build a ReactJS app with OTP features using AWS Amplify.

## Create React App

In this project, I am going to create a new React application via [create-react-app](https://create-react-app.dev/) and you will need **at least node >= 8.10** on your local development machine. I am currently using node `v13.14.0` (npm `v6.14.4`)

```
create-react-app amplify-react-otp --template typescript
```

Once the app is freshly brewed, go to the project directory by entering the following command and open it up with your favourite IDE.

```
cd amplify-react-otp
```

Okay, now we are ready to get our hands dirty.

## Adding UI libraries

We are going to use the [Bootstrap UI library](https://getbootstrap.com/) with [react-bootstrap](https://react-bootstrap.github.io/) to make our React app looks _nicer_. Let's add them to our current React app.

```
yarn add react-bootstrap bootstrap
```

## Scaffolding some codes for UI components

The basic react app comes with some basic CSS stylings and we are going to reuse some of that in this guide. Next, I will be adding some UI components to work with later on.

- Input form for entering phone number
- Input form for entering the OTP
- A sign out button
- A button to check if I am logged in (Optional)

The javascript codes will now look like this

```
<div className='App'>
  <header className='App-header'>
    <img src={logo} className='App-logo' alt='logo' />
    <p>Some message here</p>
    <div>
      <InputGroup className='mb-3'>
        <FormControl
          placeholder='Phone Number (+XX)'
          aria-label='Your Phone Number'
          aria-describedby='basic-addon2'
        />
        <InputGroup.Append>
          <Button variant='outline-secondary'>Get OTP</Button>
        </InputGroup.Append>
      </InputGroup>
    </div>
    <div>
      <InputGroup className='mb-3'>
        <FormControl
          placeholder='Your OTP'
        />
        <InputGroup.Append>
          <Button variant='outline-secondary'>Confirm</Button>
        </InputGroup.Append>
      </InputGroup>
    </div>
    <div>
      <ButtonGroup>
        <Button variant='outline-primary'>Am I sign in?</Button>
        <Button variant='outline-danger'>Sign Out</Button>
      </ButtonGroup>
    </div>
  </header>
</div>
```

## Scaffolding some functionalities

We will now add 4 key functions that we will need to be triggered by the buttons we setup earlier.

```
const signOut = () => {};
const signIn = () => {};
const verifyOtp = () => {};
const verifyAuth = () => {};
```

Notice that we do not have `signUp` function and that is because we can handle that part of the logic under the `signIn`. Later on, we can do some code cleaning if the functions get messy. Let's now tie the function to each button allocated in the `render` function. Now, your javascript codes should look the following.

```
function App() {
  const signOut = () => {};
  const signIn = () => {};
  const verifyOtp = () => {};
  const verifyAuth = () => {};
  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <p>Some message here</p>
        <div>
          <InputGroup className='mb-3'>
            <FormControl placeholder='Phone Number (+XX)' />
            <InputGroup.Append>
              <Button variant='outline-secondary' onClick={signIn}>
                Get OTP
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </div>
        <div>
          <InputGroup className='mb-3'>
            <FormControl placeholder='Your OTP' />
            <InputGroup.Append>
              <Button variant='outline-secondary' onClick={verifyOtp}>
                Confirm
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </div>
        <div>
          <ButtonGroup>
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
```

## Authentication & Authorization with AWS Amplify

Before we deep-dive into [AWS Amplify](https://docs.amplify.aws/), we have to first understand how [Amazon Cognito](https://aws.amazon.com/cognito/) works.

### Advanced Security

Amazon Cognito serves as a managed Auth service for applications that provides developers the [user authentication and authorization capabilities](https://aws.amazon.com/cognito/details/) to control access to your web and mobile apps. With Amazon Cognito, you also have access to [Advanced Security](https://aws.amazon.com/blogs/security/how-to-use-new-advanced-security-features-for-amazon-cognito-user-pools/) features which includes risk-based adaptive authentication and compromised credentials protection.

### User Management

Amazon Cognito provides you the capability to better [manage your users](https://docs.aws.amazon.com/cognito/latest/developerguide/managing-users.html) with [User Groups](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html) and [Custom Lambda Triggers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html) that can be triggered during the user pool authentication such as user sign-up, confirmation, and post-confirmation. We are going to explore these triggers in the Amplify CLI later on to tweak the way we are going to authenticate the users.

### Customizable Auth Flow

Lastly, modern authentication flows incorporate new challenge types such as Captcha and OTP to verify the identity of the user on top of the existing passsword verifier. Amazon Cognito provide the ability to [customize your authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow.html) with AWS Lambda triggers as well.

Since we are implementing the OTP authentication, let's discuss the authentication flow that we need.

By default, the newly-created user has an `unconfirmed` status in the Cognito User Pool and the user can verify the account via either email or phone number. Since we are using OTP to authenticate in this project, we do not need to verify the phone number (again). And so, we need to auto-confirm the user in the `pre sign-up` stage during the user pool authentication. In total, in order for us to add and update the following 4 Cognito lambda triggers.

- Define auth challenge
- Create auth challenge
- Verify auth challenge response
- [Pre sign-in lambda trigger](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-pre-sign-up.html)

Now we have gone through the concepts and features that Amazon Cognito provides, and what we need to configure, let's go back to our main agenda that is to use [AWS Amplify](https://github.com/aws-amplify/amplify-cli) to provision the [Auth](https://docs.amplify.aws/cli/auth/overview) features in AWS.

## Check your node version

Before we begin to amplify, you have to make sure that you are using at least node version 10 and above. You can enter the following command to verify your node version.

```
node -v
```

If you realize that you are not using the latest node/npm, you can use the [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm/blob/master/README.md#installing-and-updating) to install and select the node version you need. You can enter the following command to install and use node version 13.

```
nvm install 13 && nvm use 13
```

## Time to Amplify

The [Amplify Command Line Interface (CLI)](https://github.com/aws-amplify/amplify-cli) is a unified toolchain to create AWS cloud services for your app. Let’s go ahead and install the Amplify CLI.

```
yarn global add @aws-amplify/cli
```

Now, you can proceed to initialize your Amplify project within the React app folder.

```
amplify init
```

## Add Auth via Amplify CLI

The Amplify CLI supports configuring many different Authentication and Authorization workflows, including simple and advanced configurations of the login options, triggering Lambda functions during different lifecycle events, and administrative actions which you can optionally expose to your applications. And that is why we do not actually need to go back to the AWS Console to click and setup manually in the browser. Let's now add `auth` features by selecting `Manual Configuration`.

```
amplify add auth
```

You have to give your friendly name for your resource, user pool and identity pool so that you can easily locate them in future. In this project I named my resources as `amplifyreactotp`.

Under `What attributes are required for signing up?`, you have to manually select `Phone Number` and unselect `Email` as we are going to use phone number only for user authentication. You also have to note that you cannot change this attribute requirement for the sign up process in future. If you do need to change, you re-configure the `auth` components from start again.

Under `Do you want to specify the user attributes this app can read and write?`, you have to also manual select `Phone Number` for read and write.

Under `Do you want to enable any of the following capabilities?`, you have to select `Custom Auth Challenge Flow (basic scaffolding - not for production)` and we are going to update the code to make OTP authentication works for production usage.

Under `Which triggers do you want to enable for Cognito`, you will see that 3 of the lambda triggers are automatically selected for custom auth flow. Now, you have select `Pre Sign-up` option too.

As you have step through the amplify auth setup, you will need to update the javascript code for `create-challenge` lambda trigger. You should also note that in this function, we are going to:

1. Generate 6 random numbers as OTP
2. Create a SNS to send out SMS with the OTP
3. Pass the OTP as the _answer_ back to Amazon Cognito for verification

```
const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  //Create a random number for otp
  const challengeAnswer = Math.random().toString(10).substr(2, 6);
  const phoneNumber = event.request.userAttributes.phone_number;

  //sns sms
  const sns = new AWS.SNS({ region: 'us-east-1' });
  sns.publish(
    {
      Message: 'your otp: ' + challengeAnswer,
      PhoneNumber: phoneNumber,
      MessageStructure: 'string',
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: 'AMPLIFY',
        },
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
      },
    },
    function (err, data) {
      if (err) {
        console.log(err.stack);
        console.log(data);
        return;
      }
      console.log(`SMS sent to ${phoneNumber} and otp = ${challengeAnswer}`);
      return data;
    }
  );

  //set return params
  event.response.privateChallengeParameters = {};
  event.response.privateChallengeParameters.answer = challengeAnswer;
  event.response.challengeMetadata = 'CUSTOM_CHALLENGE';

  callback(null, event);
};
```

Since we need to have the ability to send out OTP via SMS, we will make use of the Amazon Simple Notification Service (SNS) to send out SMS with the OTP auto-generated in `Create auth challenge` lambda trigger. By default, the lambda function does not have the permission to use SNS because it is granted with least privileged permission via AWS Identity and Access Management (IAM). Therefore, we will need to update the CloudFormation `json` located in the `amplify` folder that is auto-generated by the `amplify-cli`.

Under the `lambdaexecutionpolicy`, you can paste in the following to add the permission to send SMS via SNS.

```
{
  "Sid": "VisualEditor1",
  "Effect": "Allow",
  "Action": "sns:Publish",
  "Resource": "*"
}
```

Proceed to the next function, you can update the `define challenge` function to the following javascript codes.

```
exports.handler = (event, context) => {
  if (event.request.session.length === 0) {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = 'CUSTOM_CHALLENGE';
  } else if (
    event.request.session.length === 1 &&
    event.request.session[0].challengeName === 'CUSTOM_CHALLENGE' &&
    event.request.session[0].challengeResult === true
  ) {
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
  } else {
    event.response.issueTokens = false;
    event.response.failAuthentication = true;
  }
  context.done(null, event);
};
```

Next, you can update the code for `pre sign-up` function. You can see that in the code, we also auto-verified the email and phone number if it is in the request. This is mainly done for reusability and you can use and customise this code to your need in future. In this project, the email condition does not matter.

```
exports.handler = (event, context, callback) => {
  // Confirm the user
  event.response.autoConfirmUser = true;

  // Set the email as verified if it is in the request
  if (event.request.userAttributes.hasOwnProperty('email')) {
    event.response.autoVerifyEmail = true;
  }

  // Set the phone number as verified if it is in the request
  if (event.request.userAttributes.hasOwnProperty('phone_number')) {
    event.response.autoVerifyPhone = true;
  }

  // Return to Amazon Cognito
  callback(null, event);
};
```

And lastly, these are the codes for `verify` function.

```
exports.handler = (event, context) => {
  if (event.request.privateChallengeParameters.answer === event.request.challengeAnswer) {
    event.response.answerCorrect = true;
  } else {
    event.response.answerCorrect = false;
  }
  context.done(null, event);
};
```

Lastly, let's check that you have the `auth` and `function` added correctly by entering the following command.

```
amplify status
```

And now, let's push the changes to AWS and let amplify does its magic.

```
amplify push
```

## Add Amplify to your React app

We will need 2 npm libraries from @aws-amplify to configure and add auth to the React app.

```
yarn add @aws-amplify/core @aws-amplify/auth
```

Once the packages are added, you can go to your `App.tsx` to begin by importing and adding the following.

```
import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);
```

## Adding some variables and constants

We will need some variables to store certain messages and values for us to add the authentication in the React app. First, we will definitely need to display relevant messages to tell the user at what state they are at. If they are not logged in, the message should be `You are NOT logged in`. You can put these constants at the top of the codes for future easy reference and iterations.

```
const NOTSIGNIN = 'You are NOT logged in';
const SIGNEDIN = 'You have logged in successfully';
const SIGNEDOUT = 'You have logged out successfully';
const WAITINGFOROTP = 'Enter OTP number';
const VERIFYNUMBER = 'Verifying number (Country code +XX needed)';
```

Next, we will update the following four key functions to use the amplify auth functionalities.

```
const signOut = () => {};
const signIn = () => {};
const verifyOtp = () => {};
const verifyAuth = () => {};
```

We will also need to capture the user inputs for `number` as the user's phone number and `otp` for the OTP value needed to verify the challenge.

```
<FormControl
  placeholder='Phone Number (+XX)'
  onChange={(event) => setNumber(event.target.value)}
/>
```

```
<FormControl
  placeholder='Your OTP'
  onChange={(event) => setOtp(event.target.value)}
  value={otp}
/>
```

Let's take a look at the `signIn` function below. We will going to use the exception code to tell if the user exists in Cognito User Pool or not. If it exists, it will trigger the `create-challenge` lambda trigger and you should be able to receive the OTP.

```
const signIn = () => {
  Auth.signIn(number)
    .then((result) => {
      // OTP TRIGGERED
    })
    .catch((e) => {
      if (e.code === 'UserNotFoundException') {
        // SIGN UP HERE
      } else if (e.code === 'UsernameExistsException') {
        // SIGN IN HERE
      } else {
        // SOMETHING IS WRONG
      }
    });
};
```

For better UX, you can set a different message when the "Login" button is pressed and show a different message when OTP is sent. This way, to the user's point of view, the React app is "working in process". You can update the `signIn` function to the following.

```
const signIn = () => {
  setMessage(VERIFYNUMBER);
  Auth.signIn(number)
    .then((result) => {
      setSession(result);
      setMessage(WAITINGFOROTP);
    })
    .catch((e) => {
      if (e.code === 'UserNotFoundException') {
        signUp(); // Note that this is a new function to be created later
      } else if (e.code === 'UsernameExistsException') {
        setMessage(WAITINGFOROTP);
        signIn();
      } else {
        console.log(e.code);
        console.error(e);
      }
    });
};
```

In this case, since the new `signUp` process is asynchronous, we can create another function to capture the result.

```
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
```

Next, let's take a look at `verifyOtp` function. Did you notice that you will need to pass the `session` variable set by the `signIn` function earlier? Once the otp is verified and the challenge is accepted, you will be able to receive the `user` as Cognito user (as shown in the following).

```
const verifyOtp = () => {
  Auth.sendCustomChallengeAnswer(session, otp)
    .then((user) => {
      setUser(user);
      setMessage(SIGNEDIN);
      setSession(null);
    })
    .catch((err) => {
      setMessage(err.message);
      setOtp('');
      console.log(err);
    });
};
```

It looks like we are more or less done, let's now implement the `signOut` function, which is very straight-forward. Do you know that you can also trigger a `signOut` [globally](https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js#global-sign-out) if you want the current user to sign out all of its existing sessions in other browsers?

```
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
```

The last function `verifyAuth` is optional but it is great for you to auto-trigger this function when the page is loaded. We can make use of `useEffect` to achieve this.

```
useEffect(() => {
  verifyAuth()
}, []);

const verifyAuth = () => {
  Auth.currentAuthenticatedUser()
    .then((user) => {
      setUser(user);
      setMessage(SIGNEDIN);
      setSession(null);
    })
    .catch((err) => {
      console.error(err);
      setMessage(NOTSIGNIN);
    });
};
```

Next step, let's hide the OTP input form and wait for the user to press the "Login" button. If you have noticed that we have a few variables to work with, we will need to put conditions with a few variables to hold certain values as we hide and show certain UI elements.

When user is not logged in and have not attempted to login, you can make use of the following.

```
!user && !session
```

And when user is not logged in and attempting to login, you can make use of the following condition.

```
!user && session
```

## The Entire React App

Okay, now, let's take a look at the whole React app in `App.tsx`.

```
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
  const [session, setSession] = useState(null);
  const [otp, setOtp] = useState('');
  const [number, setNumber] = useState('');
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
        setSession(null);
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
      .then((result) => {
        setSession(result);
        setMessage(WAITINGFOROTP);
      })
      .catch((e) => {
        if (e.code === 'UserNotFoundException') {
          signUp();
        } else if (e.code === 'UsernameExistsException') {
          setMessage(WAITINGFOROTP);
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
    Auth.sendCustomChallengeAnswer(session, otp)
      .then((user) => {
        setUser(user);
        setMessage(SIGNEDIN);
        setSession(null);
      })
      .catch((err) => {
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
        {!user && !session && (
          <div>
            <InputGroup className='mb-3'>
              <FormControl
                placeholder='Phone Number (+XX)'
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
        {!user && session && (
          <div>
            <InputGroup className='mb-3'>
              <FormControl
                placeholder='Your OTP'
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
          <ButtonGroup>
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
```

## Test Yourself

With Amplify Hosting, I already pushed my codes and published them at [otp.bryanchua.io](https://otp.bryanchua.io).
