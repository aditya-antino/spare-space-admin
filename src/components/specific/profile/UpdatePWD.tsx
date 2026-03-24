import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { handleApiError } from "@/hooks";
import z from "zod";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Eye, EyeOff } from "lucide-react";
import FormCard from "@/components/ui/FormCard";
import { updatePassword } from "@/assets";
import { updateAdminProfile } from "@/utils/services/auth.services";
import { toast } from "sonner";
import { fallbackMessages } from "@/constants/fallbackMessages";

const passwordSchema = z
  .object({
    oldPassword: z.string().min(6, "Old password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: "New password cannot be the same as old password",
    path: ["newPassword"],
  });

const UpdatePWD = () => {
  const [password, setPassword] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const userDetails = useSelector((state: RootState) => state.user.user);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange =
    (field: "oldPassword" | "newPassword" | "confirmPassword") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword((prev) => ({ ...prev, [field]: e.target.value.trim() }));
    };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const validationResult = passwordSchema.safeParse(password);
      if (!validationResult.success) {
        const error =
          validationResult.error.errors[0]?.message || "Invalid input";
        toast.error(error);
        return;
      }

      const payload = {
        password: password.newPassword,
      };
      const response = await updateAdminProfile(payload);
      if (response.status === 200) {
        toast.success(fallbackMessages.updatePWDSuccess);
      }

      console.log("Submitting:", password, "for user:", userDetails?.email);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title="Update Password">
      <div className="flex items-center justify-center">
        <img src={updatePassword} alt="Profile Avatar" className="h-24 w-26" />
      </div>

      <form onSubmit={handleUpdatePassword} className="flex flex-col h-full">
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Old Password</Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter old password"
                value={password.oldPassword}
                onChange={handleChange("oldPassword")}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 bg-transparent hover:bg-transparent"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password.newPassword}
              onChange={handleChange("newPassword")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={password.confirmPassword}
              onChange={handleChange("confirmPassword")}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-p1 text-tertiary-p3 hover:bg-primary-p2"
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
    </FormCard>
  );
};

export default UpdatePWD;
