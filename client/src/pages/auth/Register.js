import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const role = watch('role', 'candidate');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.register(data);
      const { user, token, refreshToken } = response.data;
      
      setAuth(user, token, refreshToken);
      toast.success('Registration successful! Please verify your email.');
      navigate(`/${user.role}/dashboard`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join SimuAI today</p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label className="label">I am a</label>
            <select className="input" {...register('role', { required: true })}>
              <option value="candidate">Job Seeker / Candidate</option>
              <option value="employer">Employer / Company</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">First Name</label>
              <input
                type="text"
                className="input"
                {...register('firstName', { required: 'First name is required' })}
                placeholder="John"
              />
              {errors.firstName && <span className="error">{errors.firstName.message}</span>}
            </div>

            <div className="form-group">
              <label className="label">Last Name</label>
              <input
                type="text"
                className="input"
                {...register('lastName', { required: 'Last name is required' })}
                placeholder="Doe"
              />
              {errors.lastName && <span className="error">{errors.lastName.message}</span>}
            </div>
          </div>

          {role === 'employer' && (
            <div className="form-group">
              <label className="label">Company Name</label>
              <input
                type="text"
                className="input"
                {...register('companyName', { required: 'Company name is required' })}
                placeholder="Your Company"
              />
              {errors.companyName && <span className="error">{errors.companyName.message}</span>}
            </div>
          )}

          <div className="form-group">
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              placeholder="john@example.com"
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              placeholder="Create a password"
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
