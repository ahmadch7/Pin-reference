import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import Landing from './Landing.tsx';
import './index.css';

function Root() {
  // Show the landing/sign-in front door once; remember the choice so it
  // doesn't reappear on every reload. The app's features are untouched.
  const [entered, setEntered] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pinref_entered') === '1';
    } catch {
      return false;
    }
  });

  if (!entered) {
    return (
      <Landing
        onEnter={() => {
          try {
            localStorage.setItem('pinref_entered', '1');
          } catch {
            /* ignore */
          }
          setEntered(true);
        }}
      />
    );
  }
  return (
    <App
      onGoHome={() => {
        try {
          localStorage.removeItem('pinref_entered');
        } catch {
          /* ignore */
        }
        setEntered(false);
      }}
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
