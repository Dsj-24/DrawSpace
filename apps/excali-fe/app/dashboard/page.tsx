"use client"
import React, { useState, useEffect } from 'react';
import { PenTool, Users, Zap, ArrowRight, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BACKEND_URL } from '@repo/backend-common/config';
import axios from 'axios';

// LoadingOverlay Component
function LoadingOverlay({ text }: { text: string }) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md">
            <div className="bg-white rounded-3xl shadow-2xl p-14 flex flex-col items-center space-y-8 max-w-md w-full mx-4 transform scale-100 opacity-100">
                {/* Animated Progress Bar Container */}
                <div className="w-full space-y-6">
                    {/* Icon with pulsing effect */}
                    <div className="flex justify-center">
                        <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse shadow-2xl shadow-indigo-500/50">
                            <PenTool className="w-14 h-14 text-white" />
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
                        {text}
                    </h3>
                    <p className="text-base text-gray-500">
                        Please wait a moment...
                    </p>
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

function Dashboard() {
    const [joinRoomName, setJoinRoomName] = useState('');
    const [createRoomName, setCreateRoomName] = useState('');
    const [isJoinHovered, setIsJoinHovered] = useState(false);
    const [isCreateHovered, setIsCreateHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            router.push('/signin');
        }
    }, []);

    const handleJoinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Show loading overlay
        setLoadingText('Joining Workspace');
        setIsLoading(true);

        // Force a small delay to ensure loading screen renders
        await new Promise(resolve => setTimeout(resolve, 100));

        // Minimum loading time of 2 seconds
        const minimumLoadingTime = 2000;
        const startTime = Date.now();

        try {
            const response = await axios.get(`${BACKEND_URL}/room/${joinRoomName}`);
            const room = response.data.room;

            if (!room) {
                // Calculate remaining time
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
                await new Promise(resolve => setTimeout(resolve, remainingTime));

                setIsLoading(false);
                alert("Room not found");
                return;
            }

            // Calculate remaining time
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
            await new Promise(resolve => setTimeout(resolve, remainingTime));

            const roomId = room.id;
            router.push(`/canvas/${roomId}`);
        } catch (error: any) {
            // Calculate remaining time
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
            await new Promise(resolve => setTimeout(resolve, remainingTime));

            setIsLoading(false);
            if (error.response && error.response.data) {
                alert(error.response.data.message);
            } else {
                alert("An error occurred while joining room");
            }
            console.error('Error joining room:', error);
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Show loading overlay
        setLoadingText('Creating Workspace');
        setIsLoading(true);

        // Force a small delay to ensure loading screen renders
        await new Promise(resolve => setTimeout(resolve, 100));

        // Minimum loading time of 2 seconds
        const minimumLoadingTime = 2000;
        const startTime = Date.now();

        try {
            const token = localStorage.getItem('token');
            console.log("Token:", token);
            
            const response = await axios.post(`${BACKEND_URL}/room`,
                { slug: createRoomName },
                {
                    headers: {
                        authorization: `${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Calculate remaining time
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
            await new Promise(resolve => setTimeout(resolve, remainingTime));

            const roomId = response.data.id;
            router.push(`/canvas/${roomId}`);
        } catch (error: any) {
            // Calculate remaining time
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
            await new Promise(resolve => setTimeout(resolve, remainingTime));

            setIsLoading(false);
            if (error.response && error.response.data) {
                alert(error.response.data.message);
            } else {
                alert("An error occurred while creating room");
            }
            console.error('Error creating room:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Loading Overlay */}
            {isLoading && <LoadingOverlay text={loadingText} />}

            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/30 to-purple-200/30 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-200/30 to-pink-200/30 blur-3xl"></div>
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
                <div className="w-full max-w-4xl">
                    {/* Logo and Title */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
                            <PenTool className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">
                            DrawSpace
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Collaborative drawing made simple. Create, share, and collaborate in real-time.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="flex justify-center mb-8">
                        <div className="grid grid-cols-3 gap-4 max-w-md">
                            <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm">
                                <Users className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Collaborate</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm">
                                <Zap className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Real-time</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm">
                                <PenTool className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Intuitive</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Cards - Side by Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Join Room Card */}
                        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl mb-4 shadow-lg">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Room</h2>
                                <p className="text-gray-600">Enter an existing room to collaborate</p>
                            </div>

                            <form onSubmit={handleJoinSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="joinRoomName" className="block text-sm font-semibold text-gray-700 mb-3">
                                        Room Name
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="joinRoomName"
                                            value={joinRoomName}
                                            onChange={(e) => setJoinRoomName(e.target.value)}
                                            placeholder="Enter room name to join"
                                            className="w-full px-4 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-500 text-lg"
                                            disabled={isLoading}
                                        />
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-blue-500/10 opacity-0 transition-opacity duration-200 pointer-events-none focus-within:opacity-100"></div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!joinRoomName.trim() || isLoading}
                                    onMouseEnter={() => setIsJoinHovered(true)}
                                    onMouseLeave={() => setIsJoinHovered(false)}
                                    className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg ${joinRoomName.trim() && !isLoading
                                            ? 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:shadow-xl transform hover:-translate-y-0.5'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <span className="flex items-center justify-center space-x-2">
                                        <span>{joinRoomName.trim() ? 'Join Room' : 'Enter Room Name'}</span>
                                        {joinRoomName.trim() && !isLoading && (
                                            <ArrowRight
                                                className={`w-5 h-5 transition-transform duration-300 ${isJoinHovered ? 'translate-x-1' : ''
                                                    }`}
                                            />
                                        )}
                                    </span>
                                </button>
                            </form>
                        </div>

                        {/* Create Room Card */}
                        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mb-4 shadow-lg">
                                    <Plus className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Room</h2>
                                <p className="text-gray-600">Start a new room and invite others</p>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="createRoomName" className="block text-sm font-semibold text-gray-700 mb-3">
                                        Room Name
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="createRoomName"
                                            value={createRoomName}
                                            onChange={(e) => setCreateRoomName(e.target.value)}
                                            placeholder="Enter new room name"
                                            className="w-full px-4 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-0 focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-500 text-lg"
                                            disabled={isLoading}
                                        />
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-200 pointer-events-none focus-within:opacity-100"></div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!createRoomName.trim() || isLoading}
                                    onMouseEnter={() => setIsCreateHovered(true)}
                                    onMouseLeave={() => setIsCreateHovered(false)}
                                    className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg ${createRoomName.trim() && !isLoading
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-purple-500/30 hover:shadow-purple-500/40 hover:shadow-xl transform hover:-translate-y-0.5'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <span className="flex items-center justify-center space-x-2">
                                        <span>{createRoomName.trim() ? 'Create Room' : 'Enter Room Name'}</span>
                                        {createRoomName.trim() && !isLoading && (
                                            <Plus
                                                className={`w-5 h-5 transition-transform duration-300 ${isCreateHovered ? 'scale-110' : ''
                                                    }`}
                                            />
                                        )}
                                    </span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-4">
                            No account needed. Start drawing instantly.
                        </p>
                        <p className="text-sm text-gray-500">
                            Built for creators, designers, and teams who love to collaborate.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;