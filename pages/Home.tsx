import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Database, Zap } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <div className="text-center space-y-8 py-12">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-6xl">
          Secure User Management <br/>
          <span className="text-primary">Simplified.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Xplorixa provides a robust platform for user registration, real-time analytics, and secure API access. 
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register" className="px-8 py-3 rounded-md bg-primary text-white font-medium hover:bg-blue-600 shadow-lg transition-all transform hover:-translate-y-1">
            Get Started
          </Link>
          <Link to="/docs" className="px-8 py-3 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            View API
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
            <Shield className="text-blue-600 dark:text-blue-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Enterprise Security</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Built on Firebase Authentication with role-based access control and strict security rules.
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
            <Zap className="text-green-600 dark:text-green-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Real-time Updates</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Live dashboards showing user registration counters and system status via Firebase Realtime DB.
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
            <Database className="text-purple-600 dark:text-purple-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">API Management</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Generate secure API keys with granular scopes and expiration handling.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;