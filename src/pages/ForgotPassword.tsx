import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import { AnimatedBackground } from "@/components/AnimatedBackground";


export const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setEmailSent(true);
        toast({
          title: "Success",
          description: "Password reset link sent! Check your email inbox.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  if (emailSent) {
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
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <Logo size={56} className="animate-float drop-shadow-xl" />
            </div>
            <CardTitle className="text-3xl font-black bg-gradient-to-r from-cyan-600 via-violet-600 to-pink-600 bg-clip-text text-transparent tracking-tight mb-2">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
              We've sent a password reset link to your email address.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-0 px-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Click the link in your email to reset your password. The link will expire in 1 hour.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                variant="outline"
                className="w-full py-3 text-base font-medium rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 transition-all duration-300"
              >
                Try Different Email
              </Button>
              
              <Button 
                onClick={() => navigate('/auth')}
                className="w-full py-3 text-base font-medium rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:from-cyan-600 hover:via-violet-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105"
              >
                Back to Sign In
              </Button>
            </div>
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
            Forgot Password
          </CardTitle>
          <CardDescription className="text-lg text-slate-600 dark:text-slate-300 mb-4">
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-0 px-8">
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-3">
              <Label 
                htmlFor="email"
                className={`text-sm font-semibold transition-colors duration-300 ${
                  focusedField === 'email' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                Email Address
              </Label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                  focusedField === 'email' ? 'text-violet-500' : 'text-slate-400'
                }`} />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  className={`pl-12 pr-4 py-4 text-base rounded-xl border-2 transition-all duration-300 ${
                    focusedField === 'email'
                      ? 'border-violet-300 focus:border-violet-500 shadow-lg'
                      : 'border-slate-200 dark:border-slate-700 focus:border-violet-400'
                  }`}
                  required
                />
                {email && /\S+@\S+\.\S+/.test(email) && (
                  <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:from-cyan-600 hover:via-violet-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl group relative overflow-hidden" 
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              <span className="relative z-10">
                {isLoading ? "Sending..." : "Send Reset Link"}
              </span>
              {!isLoading && <Mail className="ml-2 h-5 w-5 relative z-10" />}
            </Button>
          </form>

          {/* Help text */}
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Remember your password?{' '}
              <button
                onClick={() => navigate('/auth')}
                className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition-colors duration-300"
              >
                Sign in here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;