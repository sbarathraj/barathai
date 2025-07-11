import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('A password reset link has been sent to your email. Please check your inbox.');
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 rounded-3xl shadow-2xl p-8 border border-white/30 dark:border-slate-800/40 animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <Logo size={56} className="mb-2" />
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent mb-1">Forgot Password</h1>
          <p className="text-slate-500 dark:text-slate-400 text-center">Enter your email address and we'll send you a password reset link.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            className="w-full border border-blue-300 focus:border-blue-500 rounded px-3 py-2 text-base outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">{success}</div>}
          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-pink-500 text-white px-6 py-2 rounded-full shadow-lg" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => navigate('/auth')} className="rounded-lg px-4 py-2 text-base font-medium">
            ← Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 