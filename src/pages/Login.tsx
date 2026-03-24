import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { logo } from "@/assets";
import { z } from "zod";
import { handleApiError } from "@/hooks";
import { fallbackMessages } from "@/constants/fallbackMessages";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { setUser } from "@/store/slices/userSlice";
import { userSignIn } from "@/utils/services/auth.services";

const formValues = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Enter a valid password"),
});

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);

      const validationResult = formValues.safeParse({
        email: loginData.email,
        password: loginData.password,
      });

      if (!validationResult.success) {
        const error =
          validationResult.error.errors[0]?.message || "Invalid input";
        toast.error("Login Failed", {
          description: error,
        });
        return;
      }

      const response = await userSignIn(
        loginData.email.toLocaleLowerCase(),
        loginData.password,
      );

      if (response.status === 200) {
        const {
          accessToken,
          refreshToken,
          firstName,
          lastName,
          email,
          avatar,
        } = response.data.data;
        const user = { firstName, lastName, email, avatar };
        dispatch(setUser({ user, accessToken, refreshToken }));
        toast.success("Login successful", {
          description: fallbackMessages.loginSuccess,
        });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleChangeInput =
    (field: "email" | "password") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLoginData((prev) => ({ ...prev, [field]: e.target.value.trim() }));
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <img src={logo} className="h-16 auto" />
          </div>
          <CardTitle className="text-2xl font-semibold">Admin Login</CardTitle>
          <CardDescription>Log in to manage the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={handleChangeInput("email")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={handleChangeInput("password")}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 bg-transparent hover:bg-transparent"
                  onClick={togglePasswordVisibility}
                >
                  {!showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-p1 text-tertiary-p3 hover:bg-primary-p2"
            >
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Spare Space. All rights reserved.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
