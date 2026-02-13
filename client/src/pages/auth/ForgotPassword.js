import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import './Auth.css';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(data);
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-container">
        <div className="auth-card text-center">
          <h1>Check Your Email</h1>
          <p className="auth-subtitle">
            We've sent you a password reset link. Please check your email.
          </p>
          <Link to="/login" className="btn btn-primary">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Forgot Password?</h1>
        <p className="auth-subtitle">Enter your email to reset your password</p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              {...register('email', { required: 'Email is required' })}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="auth-footer">
          Remember your password? <Link to="/login" className="link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
