"use client";

import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { handleApiError } from "@/hooks";
import z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import FormCard from "@/components/ui/FormCard";
import {
  updateAdminProfile,
  uploadImage,
} from "@/utils/services/auth.services";
import { toast } from "sonner";
import { fallbackMessages } from "@/constants/fallbackMessages";
import { updateUser } from "@/store/slices/userSlice";

const formValues = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const UpdateProfile = () => {
  const dispatch = useDispatch();
  const userDetails = useSelector((state: RootState) => state.user.user);
  const [name, setName] = useState({ firstName: "", lastName: "" });
  const [loading, setLoading] = useState(false);

  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userDetails) {
      setName({
        firstName: userDetails.firstName || "",
        lastName: userDetails.lastName || "",
      });
      setAvatar(userDetails.avatar || null);
    }
  }, [userDetails]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(fallbackMessages.imageSizeError);
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (imgURL: string) => {
    try {
      setLoading(true);
      const payload = {
        firstName: name.firstName,
        lastName: name.lastName,
        avatar: imgURL || userDetails.avatar,
      };

      const response = await updateAdminProfile(payload);
      if (response.status === 200) {
        const { firstName, lastName, avatar } = response.data.data;
        console.log(avatar);

        dispatch(
          updateUser({
            firstName,
            lastName,
            avatar,
          })
        );
        toast.success(fallbackMessages.updateProfileSuccess);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const file = fileInputRef.current?.files?.[0];

      if (!userDetails.avatar && !file) {
        toast.error("Please upload an image first");
        setLoading(false);
        return;
      }

      const validationResult = formValues.safeParse(name);
      if (!validationResult.success) {
        const error =
          validationResult.error.errors[0]?.message || "Invalid input";
        toast.error(error);
        setLoading(false);
        return;
      }

      const formData = new FormData();
      if (file) {
        formData.append("files", file);
      }

      let imageUrl = userDetails.avatar;
      if (file) {
        const response = await uploadImage(formData);
        if (response.status === 200) {
          const uploadedFile = response.data?.data?.[0];
          if (uploadedFile?.url) {
            imageUrl = uploadedFile.url;
          } else {
            toast.error(fallbackMessages.genericError);
            return;
          }
        }
      }

      await handleUpdateProfile(imageUrl);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeInput =
    (field: "firstName" | "lastName") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName((prev) => ({ ...prev, [field]: e.target.value.trim() }));
    };

  return (
    <FormCard>
      <div className="space-y-6 my-2 flex flex-col h-full">
        <div className="flex items-center justify-center h-full">
          {/* Clickable Avatar */}
          <div
            className="relative cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar className="h-40 w-40 flex items-center justify-center border-2 border-dashed border-gray-300 group-hover:border-primary transition">
              <AvatarImage
                src={
                  avatar ||
                  "https://storage.googleapis.com/fenado-ai-farm-public/generated/9d46f050-dca1-455e-8cac-a5a29aa63331.webp"
                }
                alt="Profile Avatar"
              />
              <AvatarFallback>
                {userDetails?.firstName?.[0]?.toUpperCase() || "-"}
              </AvatarFallback>
            </Avatar>

            {/* Small overlay edit icon */}
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition">
              Change
            </div>
          </div>

          {/* Hidden File Input */}
          <Input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="mt-auto">
            <div className="space-y-2 my-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                value={name.firstName}
                onChange={handleChangeInput("firstName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                value={name.lastName}
                onChange={handleChangeInput("lastName")}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-p1 text-tertiary-p3 hover:bg-primary-p2 mt-4"
            >
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </div>
    </FormCard>
  );
};

export default UpdateProfile;
