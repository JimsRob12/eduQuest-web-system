import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SectionProps = {
  children: ReactNode;
  className?: string;
};

type ListItem = {
  title?: string;
  image?: string;
  content: React.ReactNode;
};

type ListProps = {
  items: ListItem[];
};

type SubjectSectionProps = {
  title: string;
  items: ListItem[];
};

const Section: React.FC<SectionProps> = ({ children, className = "" }) => (
  <Card className="my-4 border-none dark:bg-neutral-800">
    <CardContent className={cn("space-y-4 p-8", className)}>
      {children}
    </CardContent>
  </Card>
);

const BulletList: React.FC<ListProps> = ({ items }) => (
  <ul className="space-y-4">
    {items.map((item, index) => (
      <li key={index} className="ml-8 list-disc space-y-4">
        <p>
          {item.title && <span className="font-bold">{item.title}: </span>}
          {item.content}
        </p>
        {item.image && <img src={item.image} />}
      </li>
    ))}
  </ul>
);

const NumberedList: React.FC<ListProps> = ({ items }) => (
  <ul className="space-y-4">
    {items.map((item, index) => (
      <li key={index} className="ml-8 list-decimal space-y-4">
        <p>
          {item.title && <span className="font-bold">{item.title}: </span>}
          {item.content}
        </p>
        {item.image && <img src={item.image} className="w-full object-cover" />}
      </li>
    ))}
  </ul>
);

const SubjectSection: React.FC<SubjectSectionProps> = ({ title, items }) => (
  <li className="ml-8 list-decimal">
    <h3 className="font-bold">{title}</h3>
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="ml-8 list-disc">
          <span className="font-bold">{item.title}: </span>
          {item.content}
        </li>
      ))}
    </ul>
  </li>
);

export { BulletList, NumberedList, SubjectSection, Section };
