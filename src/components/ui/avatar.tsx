import type { JSX } from "preact";

export function Avatar({ children, className = "" }: { children: any; className?: string }) {
  return (
    <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
      {children}
    </div>
  );
}

export function AvatarImage({ src, className = "" }: { src?: string; className?: string }) {
  return <img src={src} className={`aspect-square h-full w-full ${className}`} />;
}

export function AvatarFallback({ children, className = "" }: { children: any; className?: string }) {
  return (
    <div className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}>
      {children}
    </div>
  );
}
