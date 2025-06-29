import React from 'react';
import { 
  PenTool, 
  Square, 
  Circle, 
  Triangle,
  Palette,
  Users,
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="relative z-10">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <PenTool className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              DrawSpace
            </span>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-8 pb-16">
          <div className="text-center space-y-8">
            {/* Floating Design Elements */}
            <div className="relative">
              <div className="absolute -top-8 left-1/4 w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl rotate-12 opacity-20 animate-pulse"></div>
              <div className="absolute -top-4 right-1/3 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-30 animate-bounce"></div>
              <div className="absolute top-8 left-1/6 w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg rotate-45 opacity-25"></div>
            </div>

            {/* Hero Content */}
            <div className="space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-100 shadow-sm">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-indigo-700">Your Creative Canvas Awaits</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight ">
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Draw & Design
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                The ultimate collaborative whiteboard where ideas come to life. 
                Sketch, brainstorm, and collaborate in real-time with powerful drawing tools.
              </p>
            </div>

            {/* Design Tools Showcase */}
            <div className="flex justify-center items-center gap-6 py-8">
              <div className="group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <PenTool className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600 mt-2">Draw</p>
              </div>
              
              <div className="group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Square className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600 mt-2">Shapes</p>
              </div>
              
              <div className="group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Circle className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600 mt-2">Objects</p>
              </div>
              
              <div className="group">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Triangle className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600 mt-2">Geometry</p>
              </div>
              
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4 pt-8">
              <Link href={"/signup"}>
              <button className="group px-12 py-4 mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-3 mx-auto">
                Sign Up
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              </Link>
              
              
              <Link href={"/signin"}>
              <button className="group px-12 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-3 mx-auto">
                Sign In
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              </Link>
              
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-gradient-to-r from-purple-300/20 to-pink-300/20 rounded-full blur-3xl"></div>
        </div>
      </main>
    </div>
  );
}

