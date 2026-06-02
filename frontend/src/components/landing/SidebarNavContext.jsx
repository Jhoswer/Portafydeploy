import { createContext, useContext, useState } from "react";

const SidebarNavContext = createContext(null);

export function SidebarNavProvider({ children }) {
  const [navItems, setNavItems] = useState(null);

  return (
    <SidebarNavContext.Provider value={{ navItems, setNavItems }}>
      {children}
    </SidebarNavContext.Provider>
  );
}

export const useSidebarNav = () => useContext(SidebarNavContext);