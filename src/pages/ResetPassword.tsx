import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle, Shield } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import { AnimatedBackground } from "@/components/AnimatedBackground";


export const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidLink, setIsValidLink] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({
    password: '',
    confirmPassword: ''
  });
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => {
    const handlePasswordReset = async () => {
      setIsVerifying(true);
      
      // Check for hash fragments first (Supabase PKCE flow)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashAccessToken = hashParams.get('access_token');
      const hashRefreshToken = hashParams.get('refresh_token');
      const hashType = hashParams.get('type');
      
      // Check for query parameters (legacy format)
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      // Handle hash fragment format (PKCE flow - most common)
      if (hashAccessToken && hashType === 'recovery') {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: hashAccessToken,
            refresh_token: hashRefreshToken || '',
          });
          
          if (error) {
            console.error('Session setup error:', error);
            setIsValidLink(false);
            toast({
              title: "Invalid Reset Link",
              description: "This password reset link is invalid or has expired. Please request a new one.",
              variant: "destructive",
            });
            setTimeout(() => navigate('/forgot-password'), 3000);
            return;
          }
          
          if (data?.session) {
            setIsValidLink(true);
            toast({
              title: "Link Verified ✓",
              description: "You can now set your new password.",
            });
          }
        } catch (error) {
          console.error('Password reset verification error:', error);
          setIsValidLink(false);
          toast({
            title: "Error",
            description: "Failed to verify reset link. Please try again.",
            variant: "destructive",
          });
          setTimeout(() => navigate('/forgot-password'), 3000);
        }
      }
      // Handle query parameter format with token hash
      else if (token && type === 'recovery') {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
          });
          
          if (error) {
            console.error('Token verification error:', error);
            setIsValidLink(false);
            toast({
              title: "Invalid Reset Link",
              description: "This password reset link is invalid or has expired. Please request a new one.",
              variant: "destructive",
            });
            setTimeout(() => navigate('/forgot-password'), 3000);
            return;
          }
          
          if (data?.session) {
            setIsValidLink(true);
            toast({
              title: "Link Verified ✓",
              description: "You can now set your new password.",
            });
          }
        } catch (error) {
          console.error('Password reset verification error:', error);
          setIsValidLink(false);
          toast({
            title: "Error",
            description: "Failed to verify reset link. Please try again.",
            variant: "destructive",
          });
          setTimeout(() => navigate('/forgot-password'), 3000);
        }
      }
      // Handle legacy query parameter format with access/refresh tokens
      else if (accessToken && refreshToken) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            setIsValidLink(false);
            toast({
              title: "Invalid Reset Link",
              description: "This password reset link is invalid or has expired. Please request a new one.",
              variant: "destructive",
            });
            setTimeout(() => navigate('/forgot-password'), 3000);
            return;
          }
          
          setIsValidLink(true);
        } catch (error) {
          console.error('Session setup error:', error);
          setIsValidLink(false);
          toast({
            title: "Error",
            description: "Failed to verify reset link. Please try again.",
            variant: "destructive",
          });
          setTimeout(() => navigate('/forgot-password'), 3000);
        }
      }
      // No valid parameters found
      else {
        setIsValidLink(false);
        toast({
          title: "Invalid Reset Link",
          description: "This password reset link is invalid or has expired. Please request a new one.",
          variant: "destructive",
        });
        setTimeout(() => navigate('/forgot-password'), 3000);
      }
      
      setIsVerifying(false);
    };

    handlePasswordReset();
  }, [searchParams, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
    }

    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.password || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if user is authenticated first
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Session Expired",
          description: "Your reset session has expired. Please request a new password reset link.",
          variant: "destructive",
        });
        navigate('/forgot-password');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        console.error('Password update error:', error);
        toast({
          title: "Reset Failed",
          description: error.message || "Failed to update password. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Your password has been reset successfully! You can now sign in with your new password.",
        });
        
        // Sign out the user so they can sign in with new password
        await supabase.auth.signOut();
        navigate('/auth');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  // Show loading state while verifying the link
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
        {/* Enhanced animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/30 via-violet-100/20 to-pink-100/30 dark:from-cyan-900/30 dark:via-violet-900/20 dark:to-pink-900/30 animate-gradient-move" />
          <div className="absolute inset-0 bg-gradient-to-tl from-pink-100/20 via-cyan-100/10 to-violet-100/20 dark:from-pink-900/20 dark:via-cyan-900/10 dark:to-violet-900/20 animate-gradient-move" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Animated background with balls */}
        <AnimatedBackground />

        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl animate-fade-in">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4"></div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Verifying Reset Link</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center">Please wait while we verify your password reset link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if link is invalid
  if (!isValidLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
        {/* Enhanced animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/30 via-violet-100/20 to-pink-100/30 dark:from-cyan-900/30 dark:via-violet-900/20 dark:to-pink-900/30 animate-gradient-move" />
          <div className="absolute inset-0 bg-gradient-to-tl from-pink-100/20 via-cyan-100/10 to-violet-100/20 dark:from-pink-900/20 dark:via-cyan-900/10 dark:to-violet-900/20 animate-gradient-move" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Animated background with balls */}
        <AnimatedBackground />

        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl animate-fade-in">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Invalid Reset Link</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">This password reset link is invalid or has expired. You'll be redirected to request a new one.</p>
            <Button 
              onClick={() => navigate('/forgot-password')}
              className="bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:from-cyan-600 hover:via-violet-600 hover:to-pink-600 text-white"
            >
              Request New Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/30 via-violet-100/20 to-pink-100/30 dark:from-cyan-900/30 dark:via-violet-900/20 dark:to-pink-900/30 animate-gradient-move" />
        <div className="absolute inset-0 bg-gradient-to-tl from-pink-100/20 via-cyan-100/10 to-violet-100/20 dark:from-pink-900/20 dark:via-cyan-900/10 dark:to-violet-900/20 animate-gradient-move" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Animated background with balls */}
      <AnimatedBackground />

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl animate-fade-in">
        <CardHeader className="text-center pb-6 relative">
          {/* Back button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/auth')}
            className="absolute left-4 top-4 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 hover:scale-110"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <button 
              onClick={() => navigate('/')}
              className="transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-violet-500/30 rounded-full p-2"
              aria-label="Go to Home"
            >
              <Logo size={56} className="animate-float drop-shadow-xl" />
            </button>
          </div>

          <CardTitle className="text-3xl font-black bg-gradient-to-r from-cyan-600 via-violet-600 to-pink-600 bg-clip-text text-transparent tracking-tight mb-2 animate-gradient-text">
            Reset Password
          </CardTitle>
          <CardDescription className="text-lg text-slate-600 dark:text-slate-300 mb-4">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-0 px-8">
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-3">
              <Label 
                htmlFor="password"
                className={`text-sm font-semibold transition-colors duration-300 ${
                  focusedField === 'password' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                New Password
              </Label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                  focusedField === 'password' ? 'text-violet-500' : 'text-slate-400'
                }`} />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  className={`pl-12 pr-12 py-4 text-base rounded-xl border-2 transition-all duration-300 ${
                    formErrors.password 
                      ? 'border-red-300 focus:border-red-500' 
                      : focusedField === 'password'
                      ? 'border-violet-300 focus:border-violet-500 shadow-lg'
                      : 'border-slate-200 dark:border-slate-700 focus:border-violet-400'
                  }`}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-300"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </div>
              {formErrors.password && (
                <p className="text-red-500 text-sm animate-fade-in">{formErrors.password}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label 
                htmlFor="confirmPassword"
                className={`text-sm font-semibold transition-colors duration-300 ${
                  focusedField === 'confirmPassword' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                Confirm New Password
              </Label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                  focusedField === 'confirmPassword' ? 'text-violet-500' : 'text-slate-400'
                }`} />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField('')}
                  className={`pl-12 pr-12 py-4 text-base rounded-xl border-2 transition-all duration-300 ${
                    formErrors.confirmPassword 
                      ? 'border-red-300 focus:border-red-500' 
                      : focusedField === 'confirmPassword'
                      ? 'border-violet-300 focus:border-violet-500 shadow-lg'
                      : 'border-slate-200 dark:border-slate-700 focus:border-violet-400'
                  }`}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
                {formData.confirmPassword && !formErrors.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle className="absolute right-12 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
              {formErrors.confirmPassword && (
                <p className="text-red-500 text-sm animate-fade-in">{formErrors.confirmPassword}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:from-cyan-600 hover:via-violet-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl group relative overflow-hidden" 
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              <span className="relative z-10">
                {isLoading ? "Updating Password..." : "Update Password"}
              </span>
              {!isLoading && <Shield className="ml-2 h-5 w-5 relative z-10" />}
            </Button>
          </form>

          {/* Security note */}
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Your password will be encrypted and stored securely</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};