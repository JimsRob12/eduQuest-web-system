/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronDown, Loader2, Settings, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { subjectData } from "@/lib/data";
import { Quiz, Subject } from "@/lib/types";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { transformSubjectData } from "@/lib/helpers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateQuizSettings } from "@/services/api/apiQuiz";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  subject: z.string().min(1, "Subject must be selected"),
  cover_image: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .png, and .webp formats are supported.",
    )
    .optional(),
  open_time: z.string().datetime(),
  close_time: z.string().datetime(),
});

type QuizSettingsFormProps = {
  quiz: Quiz;
};

export default function QuizSettingsForm({ quiz }: QuizSettingsFormProps) {
  const queryClient = useQueryClient();

  const transformedSubjectData = transformSubjectData(subjectData);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    quiz?.cover_image || null,
  );

  const { mutate: mutateUpdateQuiz, isPending } = useMutation({
    mutationFn: (data: any) => updateQuizSettings(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", quiz.quiz_id] });
    },
    onSuccess: () => {
      toast.success("Quiz settings updated");
    },
    onError: () => {
      toast.error("Failed to update quiz settings");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: quiz?.title || "Untitled Quiz",
      description: quiz?.description || "",
      subject: quiz?.subject as Subject,
      cover_image: undefined,
    },
  });

  useEffect(() => {
    return () => {
      if (coverImagePreview) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [coverImagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("cover_image", file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    form.setValue("cover_image", undefined);
    if (coverImagePreview) {
      URL.revokeObjectURL(coverImagePreview);
    }
    setCoverImagePreview(null);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const submittedValues = {
      quizId: quiz.quiz_id,
      ...values,
    };

    mutateUpdateQuiz(submittedValues);
  }

  return (
    <>
      <DialogHeader className="flex flex-row items-center gap-2">
        <Settings className="hidden size-8 rounded-full bg-purple-100 fill-purple-700 p-1 md:block" />
        <div className="p-0">
          <DialogTitle>Quiz Settings</DialogTitle>
          <DialogDescription>
            Customize your quiz settings below to suit your preferences.
          </DialogDescription>
        </div>
      </DialogHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter quiz title"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the description"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Subject</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between border border-zinc-200 dark:border-zinc-800",
                            !field.value && "text-muted-foreground",
                          )}
                          disabled={isPending}
                        >
                          {field.value
                            ? transformedSubjectData.find(
                                (subject) => subject.value === field.value,
                              )?.label
                            : "Select relevant subject"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="max-h-[--radix-popover-content-available-height] w-[--radix-popover-trigger-width]">
                      <Command>
                        <CommandInput placeholder="Search subject..." />
                        <CommandList>
                          <CommandEmpty>No subject found.</CommandEmpty>
                          <CommandGroup>
                            {transformedSubjectData.map((subject) => (
                              <CommandItem
                                value={subject.label}
                                key={subject.value}
                                onSelect={() => {
                                  form.setValue(
                                    "subject",
                                    subject.value as Subject,
                                  );
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    subject.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {subject.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-4 justify-self-end">
            <Controller
              name="cover_image"
              control={form.control}
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Cover Image</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-4">
                      {coverImagePreview ? (
                        <div className="relative">
                          <img
                            src={coverImagePreview}
                            alt="Cover preview"
                            className="h-40 w-40 rounded object-cover"
                          />
                          <button
                            type="button"
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1"
                            onClick={handleRemoveImage}
                            disabled={isPending}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="cover-image-upload"
                          className={cn(
                            "flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed",
                            isPending && "cursor-not-allowed opacity-50",
                          )}
                        >
                          <Upload className="h-6 w-6 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">
                            Upload image
                          </p>
                        </label>
                      )}
                      <Input
                        id="cover-image-upload"
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                        onChange={(e) => {
                          handleImageChange(e);
                          onChange(e.target.files?.[0] || null);
                        }}
                        className="hidden"
                        disabled={isPending}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            className="col-start-2 w-fit justify-self-end"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving..
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}
