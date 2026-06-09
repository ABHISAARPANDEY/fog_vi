import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6 shadow-card transition-colors",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
