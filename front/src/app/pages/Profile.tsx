import { AxiosError } from "axios";
import { CircleUserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useMeQuery, useUpdateMeMutation } from "../queries/user.query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function Profile() {
  const navigate = useNavigate();
  const hasToken = !!localStorage.getItem("accessToken");
  const { data: meResponse, isLoading } = useMeQuery(hasToken);
  const updateMeMutation = useUpdateMeMutation();

  const user = meResponse?.user ?? meResponse?.data;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!hasToken) {
      navigate("/");
    }
  }, [hasToken, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setMessage("");

    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }

    if (password && password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    const payload: { name?: string; email?: string; password?: string } = {
      name: name.trim() || undefined,
      email: email.trim().toLowerCase(),
    };

    if (password) {
      payload.password = password;
    }

    try {
      await updateMeMutation.mutateAsync(payload);
      setPassword("");
      setConfirmPassword("");
      setMessage("Profile updated successfully.");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setErrorMessage(
        axiosError?.response?.data?.message ??
          axiosError?.message ??
          "Failed to update profile.",
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
  };

  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#3FA9F5]/30 bg-white/90 p-8 shadow-sm lg:col-span-1 flex flex-col items-center justify-center text-center min-h-[420px]">
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[#3FA9F5]/20 to-[#1F6FEB]/25 flex items-center justify-center mb-6">
              <CircleUserRound className="w-24 h-24 text-[#1F6FEB]" />
            </div>
            <h1 className="text-3xl font-bold text-[#1F6FEB] mb-2">Profile</h1>
            <p className="text-gray-600">
              Manage your personal information and account credentials.
            </p>
          </div>

          <div className="rounded-2xl border border-[#3FA9F5]/30 bg-white/90 p-6 shadow-sm lg:col-span-2">
            {isLoading ? (
              <p className="text-gray-600">Loading profile...</p>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                {errorMessage && (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {errorMessage}
                  </p>
                )}
                {message && (
                  <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                    {message}
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="profile-name">Name</Label>
                  <Input
                    id="profile-name"
                    placeholder="Your name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-password">New Password</Label>
                  <Input
                    id="profile-password"
                    type="password"
                    placeholder="Leave empty if unchanged"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-confirm-password">
                    Confirm New Password
                  </Label>
                  <Input
                    id="profile-confirm-password"
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    type="submit"
                    className="bg-[#3FA9F5] text-white hover:bg-[#1F6FEB]"
                    disabled={updateMeMutation.isPending}
                  >
                    {updateMeMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
