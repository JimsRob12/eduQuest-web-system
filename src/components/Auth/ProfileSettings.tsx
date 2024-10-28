/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "react-hot-toast";
import { updateUser } from "@/services/api/apiAuth";

const profileFormSchema = z
  .object({
    fullname: z.string().optional(),
    //   .min(2, {
    //     message: "Name must be at least 2 characters.",
    //   })
    school: z.string().optional(),
    //   .min(2, {
    //     message: "School name must be at least 2 characters.",
    //   })
    email: z.string().email().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword || data.currentPassword || data.confirmPassword) {
      if (!data.currentPassword || data.currentPassword.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Current password is required and must be at least 8 characters",
          path: ["currentPassword"],
        });
      }

      if (!data.newPassword || data.newPassword.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "New password must be at least 8 characters",
          path: ["newPassword"],
        });
      }

      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords don't match",
          path: ["confirmPassword"],
        });
      }
    }
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPasswordDirty, setIsPasswordDirty] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullname: user?.name || "",
      school: user?.school || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { isDirty } = form.formState;

  const passwordFields = form.watch([
    "currentPassword",
    "newPassword",
    "confirmPassword",
  ]);
  useEffect(() => {
    const isAnyPasswordFieldFilled = passwordFields.some(
      (field) => field !== "",
    );
    setIsPasswordDirty(isAnyPasswordFieldFilled);
  }, [passwordFields]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setSelectedFile(file);
    }
  };

  async function onSubmit(values: ProfileFormValues) {
    const updateData: any = {};

    if (values.fullname && values.fullname !== user?.name) {
      updateData.fullname = values.fullname;
    }

    if (values.school && values.school !== user?.school) {
      updateData.school = values.school;
    }

    if (isPasswordDirty && values.newPassword) {
      updateData.password = values.newPassword;
    }

    if (selectedFile) {
      updateData.avatar = selectedFile;
    }

    // Only submit if there are changes
    if (Object.keys(updateData).length > 0) {
      updateUserMutation.mutate(updateData);
    }
  }

  const PasswordToggle = ({
    show,
    onToggle,
  }: {
    show: boolean;
    onToggle: () => void;
  }) => (
    <button
      type="button"
      className="absolute right-4 top-1/2 -translate-y-1/2"
      onClick={onToggle}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-medium">Profile Settings</h3>
          <p className="text-muted-foreground text-sm">
            Update your profile information and manage your account settings
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Avatar Field */}
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={imagePreview || user?.avatar}
                    alt="Profile"
                  />
                  <AvatarFallback>
                    {user?.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full max-w-xs"
                  />
                </FormControl>
              </div>
              <FormDescription>
                Choose a profile picture. PNG, JPG up to 2MB.
              </FormDescription>
              <FormMessage />
            </FormItem>

            {/* Name Field */}
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your full name" />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* School Field */}
            <FormField
              control={form.control}
              name="school"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your school" />
                  </FormControl>
                  <FormDescription>
                    The school you are currently attending.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" disabled />
                  </FormControl>
                  <FormDescription>
                    Your email address cannot be changed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Change Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium">Change Password</h4>
                {isPasswordDirty && (
                  <p className="text-sm text-yellow-600">
                    All password fields are required when changing password
                  </p>
                )}
              </div>

              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter current password"
                        />
                      </FormControl>
                      <PasswordToggle
                        show={showCurrentPassword}
                        onToggle={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                        />
                      </FormControl>
                      <PasswordToggle
                        show={showNewPassword}
                        onToggle={() => setShowNewPassword(!showNewPassword)}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                        />
                      </FormControl>
                      <PasswordToggle
                        show={showConfirmPassword}
                        onToggle={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={!isDirty || updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
