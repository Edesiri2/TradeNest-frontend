import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { authAPI } from '../lib/api/authApi';
import { toast } from 'sonner';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get('token');
    
    if (!tokenParam) {
      const errorMsg = 'Reset token is missing. Please use the link from your email.';
      setError(errorMsg);
      toast.error('Invalid Reset Link', {
        description: errorMsg,
        duration: 5000,
      });
      return;
    }
    
    setToken(tokenParam);
    toast.info('Reset Link Verified', {
      description: 'Please enter your new password',
      duration: 3000,
    });
  }, [location.search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.password || !formData.confirmPassword) {
      const errorMsg = 'Please fill in all fields';
      setError(errorMsg);
      toast.error('Validation Error', {
        description: errorMsg,
        duration: 3000,
      });
      return false;
    }

    if (formData.password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters';
      setError(errorMsg);
      toast.error('Password Too Short', {
        description: errorMsg,
        duration: 3000,
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match';
      setError(errorMsg);
      toast.error('Password Mismatch', {
        description: errorMsg,
        duration: 3000,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    if (!token) {
      const errorMsg = 'Invalid reset token. Please request a new password reset.';
      setError(errorMsg);
      toast.error('Invalid Token', {
        description: errorMsg,
        duration: 5000,
      });
      return;
    }

    setIsLoading(true);
    
    toast.loading('Resetting password...', {
      id: 'reset-password',
    });

    try {
      const response = await authAPI.resetPassword({
        token,
        newPassword: formData.password
      });

      if (response.success) {
        toast.dismiss('reset-password');
        toast.success('Password Reset Successful!', {
          description: 'Your password has been reset successfully',
          duration: 4000,
        });
        
        setIsSubmitted(true);
        
        // Show countdown toast
        let countdown = 3;
        const countdownToast = toast.success(`Redirecting to login in ${countdown} seconds...`);
        
        const interval = setInterval(() => {
          countdown--;
          if (countdown > 0) {
            toast.success(`Redirecting to login in ${countdown} seconds...`, {
              id: countdownToast,
            });
          } else {
            clearInterval(interval);
          }
        }, 1000);
        
        setTimeout(() => {
          navigate('/login');
          toast.dismiss(countdownToast);
        }, 3000);
      } else {
        toast.dismiss('reset-password');
        setError(response.message || 'Failed to reset password.');
        toast.error('Reset Failed', {
          description: response.message || 'Failed to reset password.',
          duration: 5000,
        });
      }
    } catch (err: any) {
      toast.dismiss('reset-password');
      
      if (err.message?.includes('expired') || err.message?.includes('invalid')) {
        const errorMsg = 'This reset link has expired or is invalid. Please request a new password reset.';
        setError(errorMsg);
        toast.error('Link Expired', {
          description: errorMsg,
          duration: 5000,
          action: {
            label: 'Request New',
            onClick: () => navigate('/forgot-password'),
          },
        });
      } else {
        const errorMsg = err.message || 'An error occurred. Please try again.';
        setError(errorMsg);
        toast.error('Reset Failed', {
          description: errorMsg,
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-indigo-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Password Reset Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Your password has been successfully reset. You will be redirected to login in 3 seconds...
          </p>
          
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl"
            >
              Go to Login Now
            </Link>
            <Link
              to="/"
              className="block w-full border border-indigo-600 text-indigo-600 font-semibold py-3 px-4 rounded-lg hover:bg-indigo-50 transition-all duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Brand Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">TN</span>
            </div>
            <h1 className="text-2xl font-bold">TradeNest</h1>
          </div>
          <p className="text-indigo-100 text-center opacity-90">Secure Password Reset</p>
        </div>
        
        <div className="p-8">
          <Link
            to="/login"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Create New Password</h1>
            <p className="text-gray-600">
              Enter your new password below. Make sure it's strong and memorable!
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-shake">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-sm">⚠️</span>
                </div>
                <p className="text-red-700 text-sm flex-1">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">Must be at least 6 characters</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>
    </div>
  );
};

export default ResetPassword;