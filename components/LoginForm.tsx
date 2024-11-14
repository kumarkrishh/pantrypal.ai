"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Mail } from "lucide-react";
import { FcGoogle } from 'react-icons/fc';  // Import for Google icon
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const navigateToRegister = () => {
    router.push('/register'); // Change to your register path as needed
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.target as HTMLFormElement);
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });
    } catch (error) {
      // Handle errors if necessary, silently or logging
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-indigo-100">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Welcome back</CardTitle>
        <CardDescription>
          Choose your preferred sign in method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <Button 
            variant="outline" 
            className="w-full border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200" 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <FcGoogle className="mr-2 h-4 w-4" aria-hidden="true" />
            Continue with Google
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-indigo-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              disabled={isLoading}
              className="border-indigo-100 focus-visible:ring-indigo-600"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isLoading}
              className="border-indigo-100 focus-visible:ring-indigo-600"
            />
          </div>
          <Button 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
              <Mail className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          <span className="mr-1">Don't have an account?</span>
          <Button variant="link" onClick={navigateToRegister} className="p-0 text-indigo-600 hover:text-indigo-700">Sign up</Button>
        </div>
        <Button variant="link" className="text-sm text-muted-foreground hover:text-indigo-600 p-0">
          Forgot password?
        </Button>
      </CardFooter>
    </Card>
  );
}
