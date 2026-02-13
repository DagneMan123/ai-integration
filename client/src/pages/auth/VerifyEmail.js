import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import Loading from '../../components/Loading';
import './Auth.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully!');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Verification failed');
      }
    };

    verifyEmail();
  }, [token]);

  if (status === 'verifying') {
    return <Loading />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card text-center">
        {status === 'success' ? (
          <>
            <h1>✓ Email Verified!</h1>
            <p className="auth-subtitle">{message}</p>
            <Link to="/login" className="btn btn-primary">Go to Login</Link>
          </>
        ) : (
          <>
            <h1>✗ Verification Failed</h1>
            <p className="auth-subtitle">{message}</p>
            <Link to="/login" className="btn btn-primary">Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
