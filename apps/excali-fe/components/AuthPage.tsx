"use client"
import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthPageProps {
    isSignin: boolean;
}

export function AuthPage({ isSignin }:  {
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
        setIsLoading(true);

        try {
            if (isSignin) {
                // Sign In Logic
                const response = await fetch('http://localhost:3001/signin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: formData.email,
                        password: formData.password
                    })
                });

                if (!response.ok) {
                    const data = await response.json();
                    alert(data.message || 'Signin failed');
                    setIsLoading(false);
                    return;
                }

                const data = await response.json();
                localStorage.setItem('token', data.Token); // store JWT
                router.push('/dashboard'); // redirect to dashboard
            } else {
                // Sign Up Logic
                const response = await fetch('http://localhost:3001/signup', {
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
                    alert(data.message || 'Signup failed');
                    setIsLoading(false);
                    return;
                }

                alert('Signup successful! Please login.');
                router.push('/signin');  // After signup, redirect to signin page
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setIsLoading(false);
        }}

    const isFormValid = () => {
        if (isSignin) {
            return formData.email.trim() && formData.password.trim();
        }
        return formData.name.trim() && formData.email.trim() && formData.password.trim();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
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
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
                                }`}  onClick={handleSubmit}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>{isSignin ? 'Signing In...' : 'Creating Account...'}</span>
                                </div>
                            ) : (
                                isSignin ? 'Sign In' : 'Create Account'
                            )}
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