import type React from "react";
import { createContext, useContext, useState } from "react";

interface DemoUser {
  name: string;
  role: string;
}

interface DemoContextType {
  isDemoMode: boolean;
  demoUser: DemoUser;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  demoUser: { name: "Demo Patient", role: "patient" },
  enterDemoMode: () => {},
  exitDemoMode: () => {},
});

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const demoUser: DemoUser = { name: "Demo Patient", role: "patient" };
  const enterDemoMode = () => setIsDemoMode(true);
  const exitDemoMode = () => setIsDemoMode(false);

  return (
    <DemoContext.Provider
      value={{ isDemoMode, demoUser, enterDemoMode, exitDemoMode }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}
