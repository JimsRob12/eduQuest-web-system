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
import { joinRoom } from "@/services/api/apiRoom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import toast from "react-hot-toast";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

interface GameFormProps {
  classId: string;
  user: {
    id: string;
    name?: string;
    email: string;
    avatar: string;
    role: string;
  } | null;
  setJoined: (joined: boolean) => void;
  setDisplayNameRequired: (required: boolean) => void;
  setDisplayName: (name: string) => void;
}

export default function GameForm({
  classId,
  user,
  setJoined,
  setDisplayNameRequired,
  setDisplayName,
}: GameFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (classId && user) {
      const success = await joinRoom(
        classId,
        user.id ?? "",
        user,
        values.username,
      );

      if (success) {
        setJoined(true);
        setDisplayNameRequired(false);
        setDisplayName(values.username);
        localStorage.setItem("displayName", values.username);
      } else {
        toast.error("Failed to join the room");
      }
    }
  };

  return (
    <div className="flex h-[calc(100%-5rem)] items-center justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 rounded-lg bg-zinc-200 p-4 dark:bg-zinc-800 md:p-6"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your display name"
                    className="dark:border-zinc-950"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This name will be visible to your teachers and classmates and
                  will be used for recording your quiz scores.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full rounded-md shadow-[0px_4px_0px_#3b1b55] transition-all duration-300 hover:translate-y-1 hover:shadow-none dark:shadow-[0px_4px_0px_#aaa4b1] dark:hover:shadow-none"
          >
            Join Game
          </Button>
        </form>
      </Form>
    </div>
  );
}
