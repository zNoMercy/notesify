import { CircleCheck } from "lucide-react";

export const Banner = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="rounded-lg border border-emerald-500/50 px-4 py-3 text-emerald-600 w-full lg:w-fit mx-auto">
      <p className="text-sm">
        <CircleCheck
          className="-mt-0.5 me-3 inline-flex opacity-60"
          size={16}
          strokeWidth={2}
          aria-hidden="true"
        />
        {children}
      </p>
    </div>
  );
};
