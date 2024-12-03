import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const formSchema = z.object({
  role: z.enum(["professor", "student"]),
});

export default function RoleAssignment() {
  const { setUserRole, loading, refreshUser } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: undefined,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      await setUserRole(data.role);
      toast.success(`User role set to: ${data.role}`);
      refreshUser();
      navigate(
        data.role === "professor"
          ? "/professor/dashboard"
          : "/student/dashboard",
      );
    } catch (error) {
      toast.error(`Error setting user role: ${String(error)}`);
    }
  }

  function handleRoleSelect(role: "professor" | "student") {
    form.setValue("role", role);
    form.handleSubmit(onSubmit)();
  }

  return (
    <div className="flex h-[calc(100%-5rem)] w-full flex-col items-center justify-center space-y-8">
      <div className="flex w-full flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Choose your role</h1>
        <p className="text-gray-500">Please select your role to continue</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Role</FormLabel>
                <FormControl>
                  <div className="flex items-end gap-8 md:gap-16">
                    <button
                      type="button"
                      onClick={() => handleRoleSelect("student")}
                      className={`flex flex-col items-center justify-center ${
                        field.value === "student" ? "ring-2 ring-blue-500" : ""
                      }`}
                      disabled={loading}
                    >
                      <img
                        src="/role-student.gif"
                        className="mb-4 w-32 md:w-36"
                      />
                      <label className="text-lg font-semibold">Student</label>
                      <p className="w-44 text-xs text-gray-500 md:text-sm">
                        Join quizzes and track your progress.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleSelect("professor")}
                      className={`flex flex-col items-center justify-center ${
                        field.value === "professor"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                      disabled={loading}
                    >
                      <img
                        src="/role-teacher.gif"
                        className="mb-4 w-32 md:w-44"
                      />
                      <label className="text-lg font-semibold">Teacher</label>
                      <p className="w-44 text-xs text-gray-500 md:text-sm">
                        Create quizzes and monitor student performance.
                      </p>
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
