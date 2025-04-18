import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useRef } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const Input02 = () => {
  return (
    <div className="space-y-2">
      <Label htmlFor="input-02">
        Required input <span className="text-destructive">*</span>
      </Label>
      <Input id="input-02" placeholder="Email" type="email" required />
    </div>
  );
};

const Textarea19 = ({
  placeholder,
  defaultRows = 1,
  maxRows,
  className,
  value,
  ...rest
}: {
  placeholder?: string;
  defaultRows?: number;
  maxRows?: number;
  className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";

    const style = window.getComputedStyle(textarea);
    const borderHeight =
      parseInt(style.borderTopWidth) + parseInt(style.borderBottomWidth);
    const paddingHeight =
      parseInt(style.paddingTop) + parseInt(style.paddingBottom);

    const lineHeight = parseInt(style.lineHeight);
    const maxHeight = maxRows
      ? lineHeight * maxRows + borderHeight + paddingHeight
      : Infinity;

    const newHeight = Math.min(textarea.scrollHeight + borderHeight, maxHeight);

    textarea.style.height = `${newHeight}px`;
  }, [value, maxRows, defaultRows]);

  return (
    <Textarea
      id="textarea-19"
      placeholder={placeholder}
      ref={textareaRef}
      value={value}
      rows={defaultRows}
      className={cn("min-h-[none] resize-none", className)}
      {...rest}
    />
  );
};

const Input23 = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <div className="relative w-full">
      <Input
        id="input-23"
        className="pe-9"
        type={isVisible ? "text" : "password"}
        {...props}
      />
      <button
        className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 ring-offset-background transition-shadow hover:text-foreground focus-visible:border focus-visible:border-ring focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        onClick={toggleVisibility}
        aria-label={isVisible ? "Hide" : "Show"}
        aria-pressed={isVisible}
        aria-controls="password"
      >
        {isVisible ? (
          <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
        ) : (
          <Eye size={16} strokeWidth={2} aria-hidden="true" />
        )}
      </button>
    </div>
  );
};

export {
  Textarea19 as AutogrowingTextarea,
  Input23 as PasswordInput,
  Input02 as RequiredInput,
};
