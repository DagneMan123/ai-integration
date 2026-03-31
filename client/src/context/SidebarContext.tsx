import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  // Admin sidebars
  sessionMonitoringOpen: boolean;
  setSessionMonitoringOpen: (open: boolean) => void;
  globalSettingsOpen: boolean;
  setGlobalSettingsOpen: (open: boolean) => void;
  supportTicketsOpen: boolean;
  setSupportTicketsOpen: (open: boolean) => void;
  // General settings
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  // Help center
  helpCenterOpen: boolean;
  setHelpCenterOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionMonitoringOpen, setSessionMonitoringOpen] = useState(false);
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(false);
  const [supportTicketsOpen, setSupportTicketsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpCenterOpen, setHelpCenterOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        sessionMonitoringOpen,
        setSessionMonitoringOpen,
        globalSettingsOpen,
        setGlobalSettingsOpen,
        supportTicketsOpen,
        setSupportTicketsOpen,
        settingsOpen,
        setSettingsOpen,
        helpCenterOpen,
        setHelpCenterOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};
