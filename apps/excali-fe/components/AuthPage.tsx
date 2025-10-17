"use client"
import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BACKEND_URL } from '@repo/backend-common/config';

// LoadingOverlay Component
function LoadingOverlay() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md">
            <div className="bg-white rounded-3xl shadow-2xl p-14 flex flex-col items-center space-y-8 max-w-md w-full mx-4 transform scale-100 opacity-100">
                {/* Animated Progress Bar Container */}
                <div className="w-full space-y-6">
                    {/* Icon with pulsing effect */}
                    <div className="flex justify-center">
                        <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse shadow-2xl shadow-indigo-500/50">
                            <User className="w-14 h-14 text-white" />
                        </div>
                    </div>
                    
                    {/* Single Animated progress bar */}
                    <div className="space-y-4">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-full animate-[progress_1.5s_ease-in-out_infinite]"></div>
                        </div>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="text-center space-y-3">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Loading Dashboard
                    </h3>
                </div>

                {/* Animated dots */}
                <div className="flex space-x-3">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>

            {/* Add keyframes for progress animation */}
            <style>{`
                @keyframes progress {
                    0% {
                        transform: translateX(-100%);
                    }
                    50% {
                        transform: translateX(0%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </div>
    );
}

interface AuthPageProps {
    isSignin: boolean;
}

export function AuthPage({ isSignin }: {
    isSignin: boolean
}) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Show loading immediately
        setIsLoading(true);
        console.log("Loading state set to true");

        // Force a small delay to ensure loading screen renders
        await new Promise(resolve => setTimeout(resolve, 100));

        // Minimum loading time of 2.5 seconds for better UX
        const minimumLoadingTime = 2500;
        const startTime = Date.now();

        try {
            if (isSignin) {
                // Sign In Logic
                const response = await fetch(`${BACKEND_URL}/signin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: formData.email,
                        password: formData.password
                    })
                });

                if (!response.ok) {
                    const data = await response.json();
                    
                    // Calculate remaining time to show loading
                    const elapsedTime = Date.now() - startTime;
                    const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
                    
                    // Wait for minimum loading time before showing error
                    await new Promise(resolve => setTimeout(resolve, remainingTime));
                    
                    alert(data.message || 'Signin failed');
                    setIsLoading(false);
                    return;
                }

                const data = await response.json();
                
                // Calculate remaining time to show loading
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
                
                // Wait for minimum loading time before redirecting
                await new Promise(resolve => setTimeout(resolve, remainingTime));
                
                localStorage.setItem('token', data.Token); // store JWT
                router.push('/dashboard'); // redirect to dashboard
            } else {
                // Sign Up Logic
                const response = await fetch(`${BACKEND_URL}/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: formData.email,
                        password: formData.password,
                        name: formData.name
                    })
                });

                if (!response.ok) {
                    const data = await response.json();
                    
                    // Calculate remaining time to show loading
                    const elapsedTime = Date.now() - startTime;
                    const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
                    
                    // Wait for minimum loading time before showing error
                    await new Promise(resolve => setTimeout(resolve, remainingTime));
                    
                    alert(data.message || 'Signup failed');
                    setIsLoading(false);
                    return;
                }

                // Calculate remaining time to show loading
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
                
                // Wait for minimum loading time before showing success
                await new Promise(resolve => setTimeout(resolve, remainingTime));
                
                alert('Signup successful! Please login.');
                setIsLoading(false);
                router.push('/signin');  // After signup, redirect to signin page
            }
        } catch (error) {
            console.error(error);
            
            // Calculate remaining time to show loading
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
            
            // Wait for minimum loading time before showing error
            await new Promise(resolve => setTimeout(resolve, remainingTime));
            
            alert('Something went wrong');
            setIsLoading(false);
        }
    }

    const isFormValid = () => {
        if (isSignin) {
            return formData.email.trim() && formData.password.trim();
        }
        return formData.name.trim() && formData.email.trim() && formData.password.trim();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
            {/* Loading Overlay - Render at top level */}
            {isLoading && <LoadingOverlay />}

            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/20 to-purple-200/20 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-200/20 to-pink-200/20 blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isSignin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-gray-600">
                        {isSignin
                            ? 'Sign in to continue to DrawSpace'
                            : 'Join DrawSpace and start collaborating'
                        }
                    </p>
                </div>

                {/* Auth Form */}
                <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field - Only show for Sign Up */}
                        {!isSignin && (
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full pl-12 pr-12 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!isFormValid() || isLoading}
                            className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg ${isFormValid() && !isLoading
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:shadow-xl transform hover:-translate-y-0.5'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? 'Loading...' : (isSignin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>
                </div>

                {/* Additional Info */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">
                        {isSignin
                            ? "Don't have an account? "
                            : 'Already have an account? '}
                        <a
                            href={isSignin ? '/signup' : '/signin'}
                            className="text-indigo-600 hover:text-indigo-700 font-semibold"
                        >
                            {isSignin ? 'Sign Up' : 'Sign In'}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}