import { useEffect } from "react";

export const useMouseWheel = (onWheel: (e: WheelEvent) => void, deps?: any) => {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      onWheel?.(e);
    };

    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => document.removeEventListener("wheel", handleWheel);
  }, [onWheel, ...deps]);
};
