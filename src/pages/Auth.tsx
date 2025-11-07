import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Sparkles, Shield, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import { FcGoogle } from 'react-icons/fc';
import { AnimatedBackground } from "@/components/AnimatedBackground";

export const Auth = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('signin');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });
    const [formErrors, setFormErrors] = useState({
        email: '',
        password: '',
        fullName: ''
    });
    const [focusedField, setFocusedField] = useState('');
    const [scrollPosition, setScrollPosition] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);

    useEffect(() => {
        // Check if user is already authenticated and redirect to chat
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate('/chat');
            }
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                navigate('/chat');
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

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
            case 'email':
                if (!value) {
                    error = 'Email is required';
                } else if (!/\S+@\S+\.\S+/.test(value)) {
                    error = 'Please enter a valid email';
                }
                break;
            case 'password':
                if (!value) {
                    error = 'Password is required';
                } else if (value.length < 6) {
                    error = 'Password must be at least 6 characters';
                }
                break;
            case 'fullName':
                if (!value) {
                    error = 'Full name is required';
                } else if (value.length < 2) {
                    error = 'Name must be at least 2 characters';
                }
                break;
        }

        setFormErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) {
                toast({
                    title: "Sign In Failed",
                    description: error.message,
                    variant: "destructive",
                });
            } else if (data?.user) {
                // Fetch profile and check account_status
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('account_status')
                    .eq('id', data.user.id)
                    .single();
                if (profileError || !profile) {
                    toast({
                        title: "Error",
                        description: "Could not fetch user profile.",
                        variant: "destructive",
                    });
                    await supabase.auth.signOut();
                } else if (profile.account_status !== 'active') {
                    toast({
                        title: "Account Inactive",
                        description: `Your account is ${profile.account_status}. Please contact support.`,
                        variant: "destructive",
                    });
                    await supabase.auth.signOut();
                } else {
                    // Update last_login in profiles
                    await supabase
                        .from('profiles')
                        .update({ last_login: new Date().toISOString() })
                        .eq('id', data.user.id);
                    toast({
                        title: "Success",
                        description: "Signed in successfully!",
                    });
                    navigate('/chat');
                }
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

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password || !formData.fullName) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                    },
                    emailRedirectTo: `${window.location.origin}/chat`
                }
            });

            if (error) {
                toast({
                    title: "Sign Up Failed",
                    description: error.message,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: "Account created successfully! Please check your email to verify your account.",
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

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signInWithOAuth({ provider: 'google' });
        } catch (error) {
            toast({
                title: 'Google Sign In Failed',
                description: 'Could not sign in with Google.',
                variant: 'destructive',
            });
            setIsLoading(false);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const element = e.currentTarget;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;
        const maxScroll = scrollHeight - clientHeight;

        setScrollPosition(scrollTop);
        setScrollProgress(maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0);
        setShowScrollIndicator(scrollHeight > clientHeight);
    };

    return (
        <div className="h-screen bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 dark:from-cyan-600 dark:via-violet-700 dark:to-pink-600 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden transition-colors duration-500">
            {/* Enhanced animated background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/60 via-violet-400/50 to-pink-400/60 dark:from-cyan-700/60 dark:via-violet-800/50 dark:to-pink-700/60 animate-gradient-move" />
                <div className="absolute inset-0 bg-gradient-to-tl from-pink-300/40 via-cyan-400/30 to-violet-400/40 dark:from-pink-700/40 dark:via-cyan-800/30 dark:to-violet-800/40 animate-gradient-move" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 via-orange-400/15 to-red-400/20 dark:from-yellow-600/20 dark:via-orange-700/15 dark:to-red-700/20 animate-gradient-move" style={{ animationDelay: '4s' }} />
            </div>

            {/* Animated background with balls */}
            <AnimatedBackground />

            <Card className={`w-full max-w-md h-fit max-h-[96vh] shadow-2xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-2xl transition-all duration-500 ${activeTab === 'signin' ? 'animate-slide-in-left' : 'animate-slide-in-right'
                }`}>
                <CardHeader className="text-center pb-1 pt-2 relative">
                    {/* Back button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/')}
                        className="absolute left-2 top-2 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 hover:scale-110"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>

                    {/* Clean clickable logo without jumping */}
                    <div className="flex justify-center mb-1">
                        <button
                            onClick={() => navigate('/')}
                            className="transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-violet-500/30 rounded-full p-1"
                            aria-label="Go to Home"
                        >
                            <Logo size={32} className="animate-float drop-shadow-xl" />
                        </button>
                    </div>

                    <CardTitle className="text-xl sm:text-2xl font-black bg-gradient-to-r from-cyan-600 via-violet-600 to-pink-600 bg-clip-text text-transparent tracking-tight mb-0 animate-gradient-text">
                        Welcome to BarathAI
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-0 flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-violet-500 animate-pulse" />
                        Your AI-powered assistant awaits
                        <Sparkles className="w-3 h-3 text-violet-500 animate-pulse" />
                    </CardDescription>
                </CardHeader>
                <CardContent
                    className="space-y-2 sm:space-y-3 pt-0 px-3 sm:px-4 pb-3 overflow-y-auto max-h-[calc(96vh-100px)] auth-scroll relative"
                    onScroll={handleScroll}
                >
                    {/* Scroll fade indicators */}
                    {showScrollIndicator && scrollPosition > 10 && (
                        <div className="scroll-fade-top" />
                    )}
                    {showScrollIndicator && (
                        <div className="scroll-fade-bottom" />
                    )}

                    {/* Scroll progress indicator */}
                    {showScrollIndicator && (
                        <div className="absolute right-1 top-2 bottom-2 w-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden z-20">
                            <div
                                className="w-full bg-gradient-to-b from-cyan-500 via-violet-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                                style={{
                                    height: `${scrollProgress}%`
                                }}
                            />
                        </div>
                    )}
                    {/* Social login button */}
                    <div className="space-y-2">
                        <Button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 text-sm sm:text-base font-semibold text-slate-700 dark:text-white hover:scale-105 group"
                            variant="outline"
                        >
                            <FcGoogle size={20} className="group-hover:scale-110 transition-transform duration-300" />
                            {isLoading ? 'Connecting...' : 'Continue with Google'}
                        </Button>
                    </div>

                    <div className="relative flex items-center my-2">
                        <div className="flex-grow border-t-2 border-gradient-to-r from-cyan-200 via-violet-200 to-pink-200" />
                        <span className="mx-2 text-xs text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                            or continue with email
                        </span>
                        <div className="flex-grow border-t-2 border-gradient-to-r from-pink-200 via-violet-200 to-cyan-200" />
                    </div>
                    <Tabs defaultValue="signin" className="w-full" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 mb-2 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                            <TabsTrigger
                                value="signin"
                                className="rounded-md py-1.5 text-xs font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:via-violet-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
                            >
                                Sign In
                            </TabsTrigger>
                            <TabsTrigger
                                value="signup"
                                className="rounded-md py-1.5 text-xs font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:via-violet-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
                            >
                                Sign Up
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="signin" className="space-y-2 animate-fade-in">
                            <form onSubmit={handleSignIn} className="space-y-2">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="signin-email"
                                        className={`text-xs font-semibold transition-colors duration-300 ${focusedField === 'email' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        Email Address
                                    </Label>
                                    <div className="relative group">
                                        <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focusedField === 'email' ? 'text-violet-500' : 'text-slate-400'
                                            }`} />
                                        <Input
                                            id="signin-email"
                                            name="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField('')}
                                            className={`pl-10 pr-4 py-2 text-sm rounded-lg border-2 transition-all duration-300 ${formErrors.email
                                                ? 'border-red-300 focus:border-red-500'
                                                : focusedField === 'email'
                                                    ? 'border-violet-300 focus:border-violet-500 shadow-lg'
                                                    : 'border-slate-200 dark:border-slate-700 focus:border-violet-400'
                                                }`}
                                            required
                                        />
                                        {formData.email && !formErrors.email && (
                                            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                    {formErrors.email && (
                                        <p className="text-red-500 text-xs animate-fade-in">{formErrors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="signin-password"
                                        className={`text-xs font-semibold transition-colors duration-300 ${focusedField === 'password' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        Password
                                    </Label>
                                    <div className="relative group">
                                        <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focusedField === 'password' ? 'text-violet-500' : 'text-slate-400'
                                            }`} />
                                        <Input
                                            id="signin-password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField('')}
                                            className={`pl-10 pr-10 py-2 text-sm rounded-lg border-2 transition-all duration-300 ${formErrors.password
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
                                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-300"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-3 w-3 text-slate-500" />
                                            ) : (
                                                <Eye className="h-3 w-3 text-slate-500" />
                                            )}
                                        </Button>
                                    </div>
                                    {formErrors.password && (
                                        <p className="text-red-500 text-xs animate-fade-in">{formErrors.password}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:from-cyan-600 hover:via-violet-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl group relative overflow-hidden"
                                    disabled={isLoading}
                                >
                                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                    <span className="relative z-10">
                                        {isLoading ? "Signing In..." : "Sign In"}
                                    </span>
                                    {!isLoading && <Shield className="ml-2 h-3 w-3 relative z-10" />}
                                </Button>

                                <div className="text-center">
                                    <Button
                                        variant="link"
                                        onClick={() => navigate('/forgot-password')}
                                        className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition-colors duration-300 p-0 h-auto"
                                    >
                                        Forgot your password?
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>
                        <TabsContent value="signup" className="space-y-2 animate-fade-in">
                            <form onSubmit={handleSignUp} className="space-y-2">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="signup-name"
                                        className={`text-xs font-semibold transition-colors duration-300 ${focusedField === 'fullName' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        Full Name
                                    </Label>
                                    <div className="relative group">
                                        <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focusedField === 'fullName' ? 'text-violet-500' : 'text-slate-400'
                                            }`} />
                                        <Input
                                            id="signup-name"
                                            name="fullName"
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            onFocus={() => setFocusedField('fullName')}
                                            onBlur={() => setFocusedField('')}
                                            className={`pl-10 pr-4 py-2 text-sm rounded-lg border-2 transition-all duration-300 ${formErrors.fullName
                                                ? 'border-red-300 focus:border-red-500'
                                                : focusedField === 'fullName'
                                                    ? 'border-violet-300 focus:border-violet-500 shadow-lg'
                                                    : 'border-slate-200 dark:border-slate-700 focus:border-violet-400'
                                                }`}
                                            required
                                        />
                                        {formData.fullName && !formErrors.fullName && (
                                            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                    {formErrors.fullName && (
                                        <p className="text-red-500 text-xs animate-fade-in">{formErrors.fullName}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="signup-email"
                                        className={`text-xs font-semibold transition-colors duration-300 ${focusedField === 'email' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        Email Address
                                    </Label>
                                    <div className="relative group">
                                        <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focusedField === 'email' ? 'text-violet-500' : 'text-slate-400'
                                            }`} />
                                        <Input
                                            id="signup-email"
                                            name="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField('')}
                                            className={`pl-10 pr-4 py-2 text-sm rounded-lg border-2 transition-all duration-300 ${formErrors.email
                                                ? 'border-red-300 focus:border-red-500'
                                                : focusedField === 'email'
                                                    ? 'border-violet-300 focus:border-violet-500 shadow-lg'
                                                    : 'border-slate-200 dark:border-slate-700 focus:border-violet-400'
                                                }`}
                                            required
                                        />
                                        {formData.email && !formErrors.email && (
                                            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                    {formErrors.email && (
                                        <p className="text-red-500 text-xs animate-fade-in">{formErrors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="signup-password"
                                        className={`text-xs font-semibold transition-colors duration-300 ${focusedField === 'password' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        Password
                                    </Label>
                                    <div className="relative group">
                                        <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focusedField === 'password' ? 'text-violet-500' : 'text-slate-400'
                                            }`} />
                                        <Input
                                            id="signup-password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Create a secure password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField('')}
                                            className={`pl-10 pr-10 py-2 text-sm rounded-lg border-2 transition-all duration-300 ${formErrors.password
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
                                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-300"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-3 w-3 text-slate-500" />
                                            ) : (
                                                <Eye className="h-3 w-3 text-slate-500" />
                                            )}
                                        </Button>
                                    </div>
                                    {formErrors.password && (
                                        <p className="text-red-500 text-xs animate-fade-in">{formErrors.password}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:from-cyan-600 hover:via-violet-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl group relative overflow-hidden"
                                    disabled={isLoading}
                                >
                                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                    <span className="relative z-10">
                                        {isLoading ? "Creating Account..." : "Create Account"}
                                    </span>
                                    {!isLoading && <Sparkles className="ml-2 h-3 w-3 relative z-10" />}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {/* Trust indicators */}
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3 text-green-500" />
                                <span>Secure</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-blue-500" />
                                <span>Verified</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-violet-500" />
                                <span>AI-Powered</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};