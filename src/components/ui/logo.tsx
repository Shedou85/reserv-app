import Link from "next/link";

interface LogoProps {
  href?: string;
  className?: string;
}

export function Logo({ href = "/", className = "" }: LogoProps) {
  const content = (
    <>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        Rz
      </span>
      <span className="text-lg font-bold tracking-tight">
        Rezervk<span className="text-primary">.lt</span>
      </span>
    </>
  );

  return (
    <Link href={href} className={`flex items-center gap-2 ${className}`}>
      {content}
    </Link>
  );
}
