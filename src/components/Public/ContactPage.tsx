import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LucideIcon, Mail, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

// Validation Schema using Zod
const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Contacts Data
const contacts = {
  phones: [
    "+(63) 915 622 9124",
    "+(63) 961 579 5355",
    "+(63) 915 623 6693",
    "+(63) 939 957 4833",
  ],
  emails: [
    "shaikhafarrahmamental@gmail.com",
    "olmedojamesrob@gmail.com",
    "seanaaron11602@gmail.com",
    "jhoncharlodejan@gmail.com",
  ],
  hours: "Monday to Friday, 9 AM - 6 PM (GMT+8)",
};

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70 } },
};

export default function ContactPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mt-8 grid h-[calc(100vh-7.2rem)] grid-cols-1 gap-8 overflow-hidden md:grid-cols-2"
    >
      {/* Left Section */}
      <motion.div className="space-y-16" variants={itemVariants}>
        <motion.h1
          className="text-5xl font-bold md:text-7xl"
          variants={itemVariants}
        >
          Let's get in touch
        </motion.h1>
        <motion.div className="space-y-8" variants={containerVariants}>
          <motion.h2
            className="text-base font-semibold md:text-lg"
            variants={itemVariants}
          >
            Don't be afraid to say hello with us!
          </motion.h2>

          <ContactSection title="Phone" items={contacts.phones} icon={Phone} />
          <ContactSection title="Email" items={contacts.emails} icon={Mail} />

          <motion.div className="text-sm" variants={itemVariants}>
            <p className="opacity-60">Supported Hours</p>
            <p>{contacts.hours}</p>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div className="relative self-end" variants={itemVariants}>
        <div className="-bottom-[20vh] md:absolute">
          <motion.div
            className="flex items-center gap-4"
            variants={itemVariants}
          >
            <ArrowRight className="size-28 rotate-45" />
            <p className="text-sm opacity-60">
              Great! We're excited to hear from you. Let's start something
              special together. Fill out our form for any inquiries or reach out
              to us via the provided emails and phone numbers.
            </p>
          </motion.div>
          <Form {...form}>
            <motion.form
              onSubmit={form.handleSubmit(onSubmit)}
              className="relative space-y-4 rounded-xl bg-zinc-900 px-6 py-4 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 md:h-[66vh] xl:h-[80vh]"
              variants={containerVariants}
            >
              <motion.h2
                className="text-lg font-semibold"
                variants={itemVariants}
              >
                Contact
              </motion.h2>

              <div className="grid grid-cols-2 gap-4">
                {(["name", "email"] as const).map((field) => (
                  <FormField
                    key={field}
                    control={form.control}
                    name={field}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder={capitalize(field)}
                            {...formField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(["phone", "subject"] as const).map((field) => (
                  <FormField
                    key={field}
                    control={form.control}
                    name={field}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder={capitalize(field)}
                            {...formField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field: formField }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Tell us about your interest"
                        {...formField}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-purple-50 text-purple-900 shadow hover:bg-purple-50/90 dark:bg-purple-900 dark:text-purple-50 dark:hover:bg-purple-900/90"
              >
                Send to us
              </Button>
            </motion.form>
          </Form>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ContactSection({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon: LucideIcon;
}) {
  return (
    <motion.div className="text-sm" variants={itemVariants}>
      <p className="opacity-60">{title}</p>
      <ul>
        {items.map((item, index) => (
          <motion.li
            key={index}
            className="flex items-center"
            variants={itemVariants}
          >
            <Icon className="mr-2" size={12} /> {item}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
