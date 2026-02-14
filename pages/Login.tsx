import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserStatus } from '../types';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit } = useForm();

  // Redirect after login
  const from = (location.state as any)?.from?.pathname || "/";

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
        <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Welcome Back</h2>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-3 text-red-600 dark:text-red-300 text-sm flex items-center">
              <AlertCircle size={16} className="mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                {...register("email", { required: true })}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                placeholder="admin@xplorixa.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                {...register("password", { required: true })}
                type="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Sign In"}
            </button>
          </form>

          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-xs text-yellow-800 dark:text-yellow-200">
             <p className="font-bold">Demo Admin Credentials:</p>
             <p>Email: rowboxsiw@gmail.com</p>
             <p>Pass: ABC13792588@MRK</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;