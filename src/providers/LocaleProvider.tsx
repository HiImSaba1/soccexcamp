"use client";
import { createContext,useContext,type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
const Context=createContext<{locale:Locale;dictionary:Dictionary}|null>(null);
export function LocaleProvider({locale,dictionary,children}:{locale:Locale;dictionary:Dictionary;children:ReactNode}){return <Context.Provider value={{locale,dictionary}}>{children}</Context.Provider>}
export function useLocale(){const value=useContext(Context);if(!value)throw new Error("useLocale must be used inside LocaleProvider");return value}
