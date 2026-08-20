import { FormEvent, useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSigninMutation,
  useSignupMutation,
  useVerifyOtpMutation,
} from "../queries/auth.query";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { Label } from "./ui/label";

export type AuthView = "login" | "register" | "forgot" | "verify" | "reset";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: AuthView;
}

export function AuthDialog({
  open,
  onOpenChange,
  initialView = "register",
}: AuthDialogProps) {
  const [view, setView] = useState<AuthView>(initialView);
  const [otp, setOtp] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const prevOpenRef = useRef(false);

  const signupMutation = useSignupMutation();
  const signinMutation = useSigninMutation();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const verifyOtpMutation = useVerifyOtpMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  const getErrorMessage = (error: unknown) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    return (
      axiosError?.response?.data?.message ??
      axiosError?.message ??
      "Something went wrong. Please try again."
    );
  };

  useEffect(() => {
    if (!open) {
      setView(initialView);
      setOtp("");
      setErrorMessage("");
      setResetToken("");
      setVerifiedEmail("");
      prevOpenRef.current = false;
    } else if (!prevOpenRef.current) {
      setView(initialView);
      prevOpenRef.current = true;
    }
  }, [initialView, open]);

  const closeAndReset = () => {
    onOpenChange(false);
    setView(initialView);
    setOtp("");
    setLoginEmail("");
    setLoginPassword("");
    setRegisterEmail("");
    setRegisterPassword("");
    setForgotEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setVerifiedEmail("");
    setResetToken("");
    setErrorMessage("");
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      await signinMutation.mutateAsync({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      });
      closeAndReset();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      await signupMutation.mutateAsync({
        email: registerEmail.trim().toLowerCase(),
        password: registerPassword,
      });
      closeAndReset();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      const email = forgotEmail.trim().toLowerCase();
      await forgotPasswordMutation.mutateAsync({ email });
      setVerifiedEmail(email);
      setOtp("");
      setView("verify");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (otp.length !== 6) {
      return;
    }

    try {
      const response = await verifyOtpMutation.mutateAsync({
        email: verifiedEmail,
        otp,
      });

      const tokenFromResponse =
        response?.resetToken ??
        (response?.data as { resetToken?: string } | undefined)?.resetToken;

      if (!tokenFromResponse) {
        setErrorMessage("Reset token not found. Please request OTP again.");
        return;
      }

      setResetToken(tokenFromResponse);
      setView("reset");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!resetToken) {
      setErrorMessage("Session expired. Please verify OTP again.");
      setView("forgot");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        resetToken,
        newPassword,
      });
      setView("login");
      setOtp("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const isSubmitting =
    signupMutation.isPending ||
    signinMutation.isPending ||
    forgotPasswordMutation.isPending ||
    verifyOtpMutation.isPending ||
    resetPasswordMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-[#3FA9F5]/30">
        <DialogHeader>
          <DialogTitle className="text-[#1F6FEB]">
            {view === "login" && "Login"}
            {view === "register" && "Create account"}
            {view === "forgot" && "Forgot password"}
            {view === "verify" && "Verify OTP"}
            {view === "reset" && "Reset password"}
          </DialogTitle>
          <DialogDescription>
            {view === "login" && "Sign in to continue using the app."}
            {view === "register" && "Create your account with your basic info."}
            {view === "forgot" &&
              "Enter your email to receive a one-time verification code."}
            {view === "verify" && "Enter the 6-digit code sent to your email."}
            {view === "reset" && "Choose a new password for your account."}
          </DialogDescription>
        </DialogHeader>
        {errorMessage && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {view === "login" && (
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                required
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="********"
                required
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
              />
            </div>
            <Button
              className="w-full bg-[#3FA9F5] text-white hover:bg-[#1F6FEB]"
              type="submit"
              disabled={isSubmitting}
            >
              Login
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button
                className="text-[#1F6FEB] hover:underline"
                onClick={() => setView("forgot")}
                type="button"
              >
                Forgot password?
              </button>
              <button
                className="text-[#1F6FEB] hover:underline"
                onClick={() => setView("register")}
                type="button"
              >
                Create account
              </button>
            </div>
          </form>
        )}

        {view === "register" && (
          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                required
                value={registerEmail}
                onChange={(event) => setRegisterEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                type="password"
                placeholder="At least 8 characters"
                required
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
              />
            </div>
            <Button
              className="w-full bg-[#3FA9F5] text-white hover:bg-[#1F6FEB]"
              type="submit"
              disabled={isSubmitting}
            >
              Register
            </Button>
            <p className="text-center text-sm">
              Already have an account?{" "}
              <button
                className="text-[#1F6FEB] hover:underline"
                onClick={() => setView("login")}
                type="button"
              >
                Login
              </button>
            </p>
          </form>
        )}

        {view === "forgot" && (
          <form className="space-y-4" onSubmit={handleForgotPassword}>
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                required
                value={forgotEmail}
                onChange={(event) => setForgotEmail(event.target.value)}
              />
            </div>
            <Button
              className="w-full bg-[#3FA9F5] text-white hover:bg-[#1F6FEB]"
              type="submit"
              disabled={isSubmitting}
            >
              Send OTP
            </Button>
            <p className="text-center text-sm">
              Back to{" "}
              <button
                className="text-[#1F6FEB] hover:underline"
                onClick={() => setView("login")}
                type="button"
              >
                Login
              </button>
            </p>
          </form>
        )}

        {view === "verify" && (
          <form className="space-y-4" onSubmit={handleVerifyOtp}>
            <div className="space-y-2">
              <Label htmlFor="otp-input">One-time password</Label>
              <InputOTP
                id="otp-input"
                maxLength={6}
                value={otp}
                onChange={setOtp}
                containerClassName="justify-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              className="w-full bg-[#3FA9F5] text-white hover:bg-[#1F6FEB] disabled:opacity-60"
              disabled={otp.length !== 6 || isSubmitting}
              type="submit"
            >
              Verify OTP
            </Button>
            <p className="text-center text-sm">
              Wrong email?{" "}
              <button
                className="text-[#1F6FEB] hover:underline"
                onClick={() => setView("forgot")}
                type="button"
              >
                Try again
              </button>
            </p>
          </form>
        )}

        {view === "reset" && (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Re-enter password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
            <Button
              className="w-full bg-[#3FA9F5] text-white hover:bg-[#1F6FEB]"
              type="submit"
              disabled={isSubmitting}
            >
              Reset Password
            </Button>
            <p className="text-center text-sm">
              <button
                className="text-[#1F6FEB] hover:underline"
                onClick={() => setView("login")}
                type="button"
              >
                Back to Login
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
