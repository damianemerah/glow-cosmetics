// app/dashboard/TabsClient.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import { Tabs } from "@/constants/ui/index";

interface TabsClientProps {
  defaultValue: string;
  children: ReactNode;
}

export default function TabsClient({
  defaultValue,
  children,
}: TabsClientProps) {
  const [value, setValue] = useState<string>(defaultValue);

  // on mount, read hash
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setValue(hash);
    }
  }, []);

  // whenever tab changes, update URL hash
  const handleChange = (newValue: string) => {
    setValue(newValue);
    history.replaceState(null, "", `#${newValue}`);
  };

  return (
    <Tabs value={value} onValueChange={handleChange} className="w-full">
      {children}
    </Tabs>
  );
}
