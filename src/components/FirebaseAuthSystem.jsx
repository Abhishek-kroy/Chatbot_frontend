import { useState, useEffect } from 'react';
import {
  Eye, EyeOff, Mail, Lock, User, CheckCircle,
  AlertCircle, Chrome, Shield, Loader, Sparkles, Star,
  RefreshCw, ArrowRight, X
} from 'lucide-react';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signInWithRedirect, getRedirectResult
} from 'firebase/auth';

import { auth, googleProvider } from '../firebase';

const EnhancedFirebaseAuth = ({ onAuthSuccess, darkMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [animateSwitch, setAnimateSwitch] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const token = await result.user.getIdToken();
          const user = await callBackend(isLogin ? 'signin' : 'signup', token);
          if (onAuthSuccess) onAuthSuccess(user);
          setMessage({ type: 'success', text: `Google ${isLogin ? 'login' : 'signup'} successful!` });
        }
      })
      .catch((err) => {
        setMessage({ type: 'error', text: getFirebaseErrorMessage(err) });
      });
  }, []);

  // Real-time validation
  useEffect(() => {
    const errors = {};

    if (touchedFields.email && form.email) {
      if (!/\S+@\S+\.\S+/.test(form.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (touchedFields.password && form.password) {
      if (form.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }

    if (touchedFields.name && !isLogin && !form.name.trim()) {
      errors.name = 'Name is required';
    }

    if (touchedFields.confirmPassword && !isLogin && form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);

    // Update password strength
    if (form.password) {
      setPasswordStrength(checkPasswordStrength(form.password));
    }
  }, [form, touchedFields, isLogin]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    if (passwordStrength <= 4) return 'Strong';
    return 'Very Strong';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setTouchedFields(prev => ({ ...prev, [name]: true }));

    // Clear global message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleBlur = (fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  const validate = () => {
    const errors = {};

    if (!form.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      errors.password = 'Password is required';
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!form.name.trim()) {
        errors.name = 'Name is required';
      }
      if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFieldErrors(errors);
    setTouchedFields({
      email: true,
      password: true,
      name: !isLogin,
      confirmPassword: !isLogin
    });

    return Object.keys(errors).length === 0;
  };

  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        >
          <div className="w-2 h-2 bg-white/10 rounded-full blur-sm"></div>
        </div>
      ))}
    </div>
  );

  const getFirebaseErrorMessage = (error) => {
    const errorCode = error.code || error.message;

    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered. Please try logging in instead.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/user-not-found': 'No account found with this email. Please sign up first.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/requires-recent-login': 'Please log out and log back in to perform this action.',
    };

    for (const [code, message] of Object.entries(errorMessages)) {
      if (errorCode.includes(code)) return message;
    }

    if (errorCode.includes('Email not verified')) {
      return 'Please verify your email before signing in.';
    }

    return error.message || 'An unexpected error occurred. Please try again.';
  };

  const callBackend = async (endpoint, token) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || `Server error: ${res.status}`);
      }

      return data.user;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let cred;

      if (isLogin) {
        cred = await signInWithEmailAndPassword(auth, form.email, form.password);
      } else {
        cred = await createUserWithEmailAndPassword(auth, form.email, form.password);

        // Update display name
        await updateProfile(cred.user, {
          displayName: form.name
        });

        // Send email verification
        await sendEmailVerification(cred.user);
        setEmailVerificationSent(true);
        setMessage({
          type: 'success',
          text: 'Account created! Please verify your email before logging in.'
        });
        setLoading(false);
        return;
      }

      if (!cred.user.emailVerified) {
        setMessage({
          type: 'error',
          text: 'Please verify your email before signing in.'
        });
        setLoading(false);
        return;
      }

      const token = await cred.user.getIdToken();
      const user = await callBackend(isLogin ? 'signin' : 'signup', token);

      setMessage({ type: 'success', text: `${isLogin ? 'Login' : 'Signup'} successful!` });

      // Clear form and notify parent
      resetForm();
      if (onAuthSuccess) onAuthSuccess(user);

    } catch (err) {
      setMessage({ type: 'error', text: getFirebaseErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await signInWithRedirect(auth, googleProvider);
      // No need to do anything after this, the user will be redirected.
    } catch (err) {
      setMessage({ type: 'error', text: getFirebaseErrorMessage(err) });
      setLoading(false); // You still need to stop the spinner if error occurs before redirect
    }
  };

  const resendVerification = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setMessage({ type: 'success', text: 'Verification email sent successfully!' });
      } else {
        setMessage({ type: 'error', text: 'No user is currently logged in.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: getFirebaseErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setAnimateSwitch(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setForm({ email: '', password: '', confirmPassword: '', name: '' });
      setMessage({ type: '', text: '' });
      setFieldErrors({});
      setTouchedFields({});
      setEmailVerificationSent(false);
      setPasswordStrength(0);
      setAnimateSwitch(false);
    }, 300);
  };

  const resetForm = () => {
    setForm({ email: '', password: '', confirmPassword: '', name: '' });
    setFieldErrors({});
    setTouchedFields({});
    setMessage({ type: '', text: '' });
    setEmailVerificationSent(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <FloatingParticles />

      {/* Centered Auth Form */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className={`backdrop-blur-3xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl w-full max-w-md transition-all duration-500 ${animateSwitch ? 'scale-95 opacity-75' : 'scale-100 opacity-100'
            }`}
        >

          {/* Form Header */}
          <div className="p-8 pb-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Join Us Today'}
              </h2>
              <p className="text-white/70">
                {isLogin ? 'Sign in to continue your journey' : 'Create your account in seconds'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="relative mb-8">
              <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
                <button
                  onClick={() => !loading && setIsLogin(true)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${isLogin
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white'
                    }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => !loading && setIsLogin(false)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${!isLogin
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white'
                    }`}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 pb-8">
            {/* Global Message */}
            {message.text && (
              <div className={`flex items-start p-4 rounded-2xl mb-6 border backdrop-blur-sm ${message.type === 'error'
                ? 'bg-red-500/20 text-red-100 border-red-500/30'
                : 'bg-green-500/20 text-green-100 border-green-500/30'
                }`}>
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  {message.type === 'error' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{message.text}</p>
                  {emailVerificationSent && (
                    <button
                      onClick={resendVerification}
                      disabled={loading}
                      className="text-sm underline mt-2 disabled:opacity-50 text-blue-200 hover:text-blue-100"
                    >
                      Resend verification email
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setMessage({ type: '', text: '' })}
                  className="flex-shrink-0 ml-2 text-white/50 hover:text-white/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="space-y-6">
              {/* Name Field (Signup only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white/90">
                    Full Name *
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white/70 transition-colors" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('name')}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all duration-300 text-white placeholder-white/50 ${fieldErrors.name
                        ? 'border-2 border-red-500/50 bg-red-500/10'
                        : 'border border-white/20 bg-white/10 focus:bg-white/15 hover:bg-white/12'
                        }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="text-sm text-red-300 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {fieldErrors.name}
                    </p>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white/90">
                  Email Address *
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white/70 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('email')}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all duration-300 text-white placeholder-white/50 ${fieldErrors.email
                      ? 'border-2 border-red-500/50 bg-red-500/10'
                      : 'border border-white/20 bg-white/10 focus:bg-white/15 hover:bg-white/12'
                      }`}
                    placeholder="Enter your email address"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-sm text-red-300 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white/90">
                  Password *
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white/70 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('password')}
                    onFocus={() => setShowPasswordRequirements(!isLogin)}
                    className={`w-full pl-12 pr-14 py-4 rounded-2xl backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all duration-300 text-white placeholder-white/50 ${fieldErrors.password
                      ? 'border-2 border-red-500/50 bg-red-500/10'
                      : 'border border-white/20 bg-white/10 focus:bg-white/15 hover:bg-white/12'
                      }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {!isLogin && form.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Password strength:</span>
                      <span className={`font-medium ${passwordStrength <= 2 ? 'text-red-300' :
                        passwordStrength <= 3 ? 'text-yellow-300' : 'text-green-300'
                        }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full rounded-full h-2 bg-white/10">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 bg-gradient-to-r ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Password Requirements */}
                {showPasswordRequirements && !isLogin && (
                  <div className="backdrop-blur-sm bg-blue-500/20 border border-blue-500/30 rounded-2xl p-4">
                    <p className="text-sm font-medium mb-3 text-blue-200">Password Requirements:</p>
                    <ul className="text-xs space-y-2 text-blue-100">
                      {[
                        { check: form.password.length >= 8, text: 'At least 8 characters' },
                        { check: /[A-Z]/.test(form.password), text: 'One uppercase letter' },
                        { check: /[0-9]/.test(form.password), text: 'One number' },
                        { check: /[^A-Za-z0-9]/.test(form.password), text: 'One special character' }
                      ].map((req, index) => (
                        <li key={index} className={`flex items-center ${req.check ? 'text-green-300' : ''}`}>
                          <CheckCircle className={`w-3 h-3 mr-2 ${req.check ? 'text-green-400' : 'text-white/30'
                            }`} />
                          {req.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {fieldErrors.password && (
                  <p className="text-sm text-red-300 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              {!isLogin && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white/90">
                    Confirm Password *
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white/70 transition-colors" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('confirmPassword')}
                      className={`w-full pl-12 pr-14 py-4 rounded-2xl backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all duration-300 text-white placeholder-white/50 ${fieldErrors.confirmPassword
                        ? 'border-2 border-red-500/50 bg-red-500/10'
                        : 'border border-white/20 bg-white/10 focus:bg-white/15 hover:bg-white/12'
                        }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-sm text-red-300 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading || Object.keys(fieldErrors).length > 0}
                className="w-full bg-blue-500 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:hover:scale-100 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-white/20"></div>
                <div className="px-4 text-white/60 text-sm font-medium">or continue with</div>
                <div className="flex-1 border-t border-white/20"></div>
              </div>

              {/* Google Sign In */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-3"
              >
                <Chrome className="w-5 h-5" />
                <span>Continue with Google</span>
              </button>

              {/* Switch Mode */}
              <div className="text-center mt-8">
                <p className="text-white/70 text-sm">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    onClick={switchMode}
                    disabled={loading}
                    className="ml-2 text-blue-300 hover:text-blue-200 font-semibold transition-colors disabled:opacity-50"
                  >
                    {isLogin ? 'Sign up here' : 'Sign in here'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFirebaseAuth;