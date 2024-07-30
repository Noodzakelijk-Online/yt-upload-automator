import { useState } from 'react';

export const useErrorLogger = () => {
  const [errorLogs, setErrorLogs] = useState([]);

  const addErrorLog = (process, error) => {
    const newLog = {
      process,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };
    setErrorLogs(prevLogs => [...prevLogs, newLog]);
  };

  return { errorLogs, addErrorLog };
};
