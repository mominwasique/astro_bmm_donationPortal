import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import useSessionId from "../hooks/useSessionId";
import { loginUser } from "../api/authApi";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const sessionId = useSessionId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Handle login using API and sync context state
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await loginUser({
        email: data.email,
        password: data.password,
        session_id: sessionId || "",
      });

      if (!response?.success || !response?.donor) {
        throw new Error(response?.message || "Only registered users can log in");
      }

      // Update context with authenticated user
      login(response.donor);

      toast.success("Login successful!");
      window.location.href = "/profile";
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-grey">
              Log In
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">You can use your email address to log in</p>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{" "}
              <a
                href="/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                create a new account
              </a>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  {...register("email")}
                  type="email"
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 bg-[#F5F8FA] border border-gray-300 placeholder-gray-500 text-grey focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              {/* </div> */}
              <div className="relative ">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password *</label>
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 bg-[#F5F8FA] border border-gray-300 placeholder-gray-500 text-grey focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Password"
                  />
                </div>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center top-5"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-grey cursor-pointer">
                  Remember me
                </label>
                <div className="text-sm ml-[220px]">
                  <a
                    href="/forgot-password"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Forget Password?
                  </a>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
