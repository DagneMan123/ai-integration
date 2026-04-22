import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  // Admin sidebars
  supportTicketsOpen: boolean;
  setSupportTicketsOpen: (open: boolean) => void;
  // Help center
  helpCenterOpen: boolean;
  setHelpCenterOpen: (open: boolean) => void;
  // Employer sidebar
  employerSidebarOpen: boolean;
  setEmployerSidebarOpen: (open: boolean) => void;
  // Admin sidebar
  adminSidebarOpen: boolean;
  setAdminSidebarOpen: (open: boolean) => void;
  // Candidate sidebar
  candidateSidebarOpen: boolean;
  setCandidateSidebarOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [supportTicketsOpen, setSupportTicketsOpen] = useState(false);
  const [helpCenterOpen, setHelpCenterOpen] = useState(false);
  const [employerSidebarOpen, setEmployerSidebarOpen] = useState(false);
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(false);
  const [candidateSidebarOpen, setCandidateSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        supportTicketsOpen,
        setSupportTicketsOpen,
        helpCenterOpen,
        setHelpCenterOpen,
        employerSidebarOpen,
        setEmployerSidebarOpen,
        adminSidebarOpen,
        setAdminSidebarOpen,
        candidateSidebarOpen,
        setCandidateSidebarOpen,
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
