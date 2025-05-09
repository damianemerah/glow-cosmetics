"use client";

import { useState, useEffect, ReactNode, useCallback } from "react";
import { Tabs } from "@/constants/ui/index"; // Assuming this is your Shadcn/ui Tabs import

interface TabsClientProps {
  defaultValue: string;
  children: ReactNode;
}

export default function DashboardTabs({
  defaultValue,
  children,
}: TabsClientProps) {
  const [value, setValue] = useState<string>(defaultValue);

  const handleHashChange = useCallback(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && hash !== value) {
      setValue(hash);
    } else if (!hash && defaultValue !== value) {
      setValue(defaultValue);
    }
  }, [value, defaultValue]);

  useEffect(() => {
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [handleHashChange]);

  const handleChange = (newValue: string) => {
    if (newValue !== value) {
      setValue(newValue);
    }
    if (`#${newValue}` !== window.location.hash) {
      history.replaceState(null, "", `#${newValue}`);
    }
  };

  return (
    <Tabs value={value} onValueChange={handleChange} className="w-full">
      {children}
    </Tabs>
  );
}
