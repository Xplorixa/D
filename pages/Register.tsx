import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, runTransaction } from 'firebase/database';
import { auth, db, storage, rtdb } from '../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { UserStatus } from '../types';
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dob: z.string().refine((date) => new Date(date) < new Date(), "Date of birth must be in the past"),
  password: z.string().min(6, "Password must be at least 6 characters").regex(/[A-Z]/, "Must contain an uppercase letter").regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, "You must accept the terms"),
  profileImage: z
    .any()
    .refine((files) => files?.length == 1, "Profile picture is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // 2. Upload Image
      const file = data.profileImage[0];
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      // 3. Update Auth Profile
      await updateProfile(user, {
        displayName: data.fullName,
        photoURL: photoURL
      });

      // 4. Create Firestore Document
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: data.email,
        fullName: data.fullName,
        phoneNumber: data.phone,
        dob: data.dob,
        photoURL: photoURL,
        role: 'user',
        status: UserStatus.ACTIVE,
        createdAt: new Date().toISOString()
      });

      // 5. Update Realtime Counter (Atomically)
      const countRef = dbRef(rtdb, 'stats/userCount');
      await runTransaction(countRef, (currentCount) => {
        return (currentCount || 0) + 1;
      });

      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="bg-green-100 dark:bg-green-900 p-6 rounded-full mb-4">
          <CheckCircle size={64} className="text-green-600 dark:text-green-300" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Registration Successful!</h2>
        <p className="text-gray-600 dark:text-gray-300">Redirecting you to the home page...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
      <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Join Xplorixa today to access our premium APIs.</p>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 flex items-center">
            <AlertCircle className="text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                {...register("fullName")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                placeholder="John Doe"
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName.message as string}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message as string}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input
                {...register("phone")}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message as string}</p>}
            </div>

            {/* DOB */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
              <input
                {...register("dob")}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
              {errors.dob && <p className="mt-1 text-sm text-red-500">{errors.dob.message as string}</p>}
            </div>
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Picture</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-primary transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      {...register("profileImage")}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
             {errors.profileImage && <p className="mt-1 text-sm text-red-500">{errors.profileImage.message as string}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                {...register("password")}
                type="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message as string}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <input
                {...register("confirmPassword")}
                type="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message as string}</p>}
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register("terms")}
                type="checkbox"
                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-gray-700 dark:text-gray-300">I agree to the Terms and Conditions</label>
              {errors.terms && <p className="mt-1 text-sm text-red-500">{errors.terms.message as string}</p>}
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Register"}
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
             <Link to="/login" className="text-sm text-primary hover:underline">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;