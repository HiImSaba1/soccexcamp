"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function EditorialButton({ href, label, tone = "light", className = "" }: { href: string; label: string; tone?: "light" | "dark"; className?: string }) {
  return <Link href={href} className={`editorial-button editorial-button--${tone} ${className}`.trim()}>
    <span className="editorial-button__fill" aria-hidden="true" />
    <span className="editorial-button__label"><span>{label}</span><span aria-hidden="true">{label}</span></span>
    <span className="editorial-button__arrow" aria-hidden="true"><ArrowRight /></span>
  </Link>;
}
