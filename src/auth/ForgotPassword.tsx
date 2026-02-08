import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Shield } from 'lucide-react';
import { authAPI } from '../lib/api/authApi';
import { toast } from 'sonner';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      const errorMsg = 'Please enter your email address';
      setError(errorMsg);
      toast.error('Email Required', {
        description: errorMsg,
        duration: 3000,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorMsg = 'Please enter a valid email address';
      setError(errorMsg);
      toast.error('Invalid Email', {
        description: errorMsg,
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    
    toast.loading('Sending reset instructions...', {
      id: 'forgot-password',
    });

    try {
      const response = await authAPI.forgotPassword(email);
      
      if (response.success) {
        toast.dismiss('forgot-password');
        toast.success('Reset Email Sent!', {
          description: `Instructions sent to ${email}`,
          duration: 5000,
          action: {
            label: 'Check Email',
            onClick: () => window.open('https://mail.google.com', '_blank'),
          },
        });
        
        // Store email for verification page
        localStorage.setItem('pendingVerificationEmail', email);
        setIsSubmitted(true);
        
        // Show success details
        toast.info('Check Your Inbox', {
          description: 'Please check your email and follow the instructions',
          duration: 6000,
        });
      } else {
        toast.dismiss('forgot-password');
        setError(response.message || 'Failed to send reset instructions.');
        toast.error('Failed to Send', {
          description: response.message || 'Failed to send reset instructions.',
          duration: 5000,
        });
      }
    } catch (err: any) {
      toast.dismiss('forgot-password');
      
      if (err.message?.includes('not found')) {
        // Don't reveal user doesn't exist for security
        toast.success('Instructions Sent', {
          description: 'If an account exists with this email, you will receive reset instructions.',
          duration: 5000,
        });
        setIsSubmitted(true);
      } else {
        const errorMsg = err.message || 'An error occurred. Please try again.';
        setError(errorMsg);
        toast.error('Request Failed', {
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
          
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Check Your Email</h1>
          <p className="text-gray-600 mb-6">
            We've sent password reset instructions to <strong className="text-indigo-600">{email}</strong>.
            Please check your inbox and follow the link to reset your password.
          </p>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-3">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-800">
                Reset link expires in 1 hour
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setIsSubmitted(false);
                toast.info('Enter a different email');
              }}
              className="w-full border border-indigo-600 text-indigo-600 font-semibold py-3 px-4 rounded-lg hover:bg-indigo-50 transition-all duration-200"
            >
              Try a different email address
            </button>
            <Link
              to="/login"
              className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl"
            >
              Back to Login
            </Link>
            <button
              onClick={() => {
                toast.info('Opening email client...');
                window.open('https://mail.google.com', '_blank');
              }}
              className="w-full text-indigo-600 hover:text-indigo-700 font-medium py-2 flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Open Email Client
            </button>
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
          <p className="text-indigo-100 text-center opacity-90">Account Recovery</p>
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
              <Mail className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h1>
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
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
                  Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Back to Login
            </Link>
          </div>
          
          <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-indigo-800 mb-1">Security Notice</p>
                <p className="text-xs text-indigo-600">
                  For security reasons, we don't reveal if an email exists in our system. 
                  Check your inbox and spam folder for reset instructions.
                </p>
              </div>
            </div>
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

export default ForgotPassword;