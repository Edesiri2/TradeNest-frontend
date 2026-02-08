import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle, XCircle, RefreshCw, Mail, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '../lib/api/authApi';
import { useAuthStore } from '../lib/store/useAuthStore';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setUser, setPermissions, setLoading } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Extract token from URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing. Please check your email for the correct verification link.');
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        
        if (response.success) {
          const { token: jwtToken, user, permissions, redirectTo } = response.data;
          
          setStatus('success');
          setMessage(response.message || 'Your email has been verified successfully! Your account is now active.');
          
          // Use the auth store properly
          setLoading(false);
          setToken(jwtToken); // This will automatically decode the token and set user/permissions
          
          // Show success message
          toast.success('Email verified! Welcome to Trade Nest.', {
            duration: 5000,
            description: 'Your account has been activated with viewer permissions.'
          });
          
          // Store the email for resend functionality
          if (user?.email) {
            localStorage.setItem('pendingVerificationEmail', user.email);
          }
          
          // Start countdown for automatic redirect
          const timer = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate(redirectTo || '/dashboard');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
        } else {
          setStatus('error');
          setMessage(response.message || 'Verification failed. Please try again.');
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        
        if (error.message?.includes('expired') || error.message?.includes('invalid')) {
          setStatus('expired');
          setMessage('This verification link has expired or is invalid. Please request a new verification email.');
        } else {
          setStatus('error');
          setMessage(error.message || 'An error occurred during verification. Please try again.');
        }
      }
    };

    verifyEmail();
  }, [token, navigate, setToken, setUser, setPermissions, setLoading]);

  const handleResendVerification = async () => {
    if (isResending) return;

    const email = localStorage.getItem('pendingVerificationEmail');
    if (!email) {
      setMessage('Unable to find email address. Please try registering again.');
      setStatus('error');
      return;
    }

    setIsResending(true);
    try {
      const response = await authAPI.resendVerification(email);
      if (response.success) {
        setMessage('A new verification email has been sent! Please check your inbox.');
        toast.success('Verification email sent!', {
          description: 'Please check your inbox for the new verification link.'
        });
        setTimeout(() => setIsResending(false), 2000);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to resend verification email. Please try again.');
      toast.error('Failed to resend verification email', {
        description: 'Please try again or contact support.'
      });
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToRegister = () => {
    navigate('/register');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-2 bg-blue-200 rounded-full animate-pulse" />
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Verifying Your Email</h1>
          <p className="text-gray-600 mb-8">Please wait while we verify your email address...</p>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-500">This may take a few moments</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className={`p-8 text-white ${
          status === 'success' ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
          status === 'expired' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
          'bg-gradient-to-r from-rose-500 to-red-500'
        }`}>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
              {status === 'success' ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : status === 'expired' ? (
                <AlertCircle className="w-6 h-6 text-white" />
              ) : (
                <XCircle className="w-6 h-6 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold">
              {status === 'success' ? 'Email Verified!' :
               status === 'expired' ? 'Link Expired' :
               'Verification Failed'}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Status Icon */}
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            status === 'success' ? 'bg-emerald-100' :
            status === 'expired' ? 'bg-amber-100' :
            'bg-rose-100'
          }`}>
            {status === 'success' ? (
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            ) : status === 'expired' ? (
              <Mail className="w-10 h-10 text-amber-600" />
            ) : (
              <XCircle className="w-10 h-10 text-rose-600" />
            )}
          </div>

          {/* Message */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              {status === 'success' ? 'Verification Complete!' :
               status === 'expired' ? 'Oops! Link Expired' :
               'Something Went Wrong'}
            </h2>
            <p className="text-gray-600">{message}</p>
          </div>

          {/* Token Info (for debugging) */}
          {token && import.meta.env.DEV && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Token (dev only):</p>
              <code className="text-xs text-gray-700 break-all bg-gray-100 p-2 rounded">
                {token.substring(0, 50)}...
              </code>
            </div>
          )}

          {/* Actions based on status */}
          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-emerald-800">
                    Redirecting to dashboard in {countdown} seconds...
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGoToDashboard}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={handleGoToLogin}
                  className="w-full px-4 py-3 border border-emerald-300 text-emerald-700 font-medium rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  Go to Login
                </button>
              </div>
            </div>
          )}

          {status === 'expired' && (
            <div className="space-y-4">
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                {isResending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending New Link...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Resend Verification Email
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Or</p>
                <button
                  onClick={handleGoToRegister}
                  className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
                >
                  Register with a different email
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-rose-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                {isResending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Try Resending Verification
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGoToLogin}
                  className="px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Go to Login
                </button>
                <button
                  onClick={handleGoToRegister}
                  className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-colors"
                >
                  Register Again
                </button>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Need Help?</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs">?</span>
                </div>
                <p className="text-sm text-gray-600">
                  Check your spam or junk folder for the verification email
                </p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs">!</span>
                </div>
                <p className="text-sm text-gray-600">
                  Ensure you're clicking the most recent verification link
                </p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs">@</span>
                </div>
                <p className="text-sm text-gray-600">
                  Contact support at{' '}
                  <a href="mailto:support@tradenest.com" className="text-blue-600 hover:text-blue-700 font-medium">
                    support@tradenest.com
                  </a>
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>
    </div>
  );
};

export default VerifyEmail;