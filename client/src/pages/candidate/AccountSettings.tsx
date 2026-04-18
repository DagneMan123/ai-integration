import React, { useState, useEffect } from 'react';
import { Settings, Lock, Bell, Eye } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import { userAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const AccountSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setInitialLoading(true);
      const response = await userAPI.getProfile();
      const userData = response.data.data;
      
      if (userData) {
        setEmail(userData.email || '');
        setPhone(userData.phone || '');
      }
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      // Use fallback from auth store
      if (user) {
        setEmail(user.email || '');
        setPhone(user.phone || '');
      }
    } finally {
      setInitialLoading(false);
    }
  };

  // Email validation
  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  // Phone validation - only numbers
  const validatePhone = (value: string): boolean => {
    const phoneRegex = /^\d+$/;
    return value === '' || phoneRegex.test(value);
  };

  // Password validation - minimum 8 characters
  const validatePassword = (value: string): boolean => {
    return value === '' || value.length >= 8;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (!validatePhone(value)) {
      setPhoneError('Phone number must contain only numbers');
      return;
    }
    
    setPhone(value);
    setPhoneError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value && !validatePassword(value)) {
      setPasswordError('Password must be at least 8 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleSaveChanges = async () => {
    // Validate before saving
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      toast.error('Please fix validation errors');
      return;
    }

    if (phone && !validatePhone(phone)) {
      setPhoneError('Phone number must contain only numbers');
      toast.error('Please fix validation errors');
      return;
    }

    if (password && !validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters');
      toast.error('Please fix validation errors');
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {};
      
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (password) updateData.password = password;

      const response = await userAPI.updateProfile(updateData);
      
      if (response.data.success) {
        // Update auth store with new user data
        updateUser({
          email: email || user?.email,
          phone: phone || user?.phone,
        });
        
        toast.success('Profile updated successfully');
        
        // Clear password field after successful update
        setPassword('');
      }
    } catch (error: any) {
      console.error('Failed to update profile', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'privacy', label: 'Privacy', icon: <Eye className="w-5 h-5" /> },
  ];

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
            <p className="text-gray-500 font-medium mt-1">Manage your account preferences</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-bold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-6">
            {activeTab === 'general' && (
              <div className="space-y-4">
                {initialLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading profile...</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Enter your email address"
                        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors ${
                          emailError ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                      {emailError && (
                        <p className="text-red-500 text-sm mt-1">{emailError}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="Enter your phone number (numbers only)"
                        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors ${
                          phoneError ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                      {phoneError && (
                        <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">New Password (Optional)</label>
                      <input
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Leave blank to keep current password"
                        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors ${
                          passwordError ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                      {passwordError && (
                        <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                      )}
                      {!passwordError && password && (
                        <p className="text-green-600 text-sm mt-1">✓ Password is valid</p>
                      )}
                    </div>

                    <button
                      onClick={handleSaveChanges}
                      disabled={loading || initialLoading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <button className="w-full p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
                  <h4 className="font-bold text-gray-900">Change Password</h4>
                  <p className="text-sm text-gray-500">Update your password regularly</p>
                </button>
                <button className="w-full p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
                  <h4 className="font-bold text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                  <div>
                    <h4 className="font-bold text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                  <div>
                    <h4 className="font-bold text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-500">Get instant alerts</p>
                  </div>
                </label>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5" />
                  <div>
                    <h4 className="font-bold text-gray-900">Profile Visibility</h4>
                    <p className="text-sm text-gray-500">Allow employers to see your profile</p>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
