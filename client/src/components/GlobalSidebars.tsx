import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useSidebar } from '../context/SidebarContext';
import SupportTickets from './SupportTickets';
import AdminSidebar from './AdminSidebar';
import CandidateSidebar from './CandidateSidebar';
import EmployerSidebar from './EmployerSidebar';

const GlobalSidebars: React.FC = () => {
  const { user } = useAuthStore();
  const {
    supportTicketsOpen,
    setSupportTicketsOpen,
    adminSidebarOpen,
    setAdminSidebarOpen,
    candidateSidebarOpen,
    setCandidateSidebarOpen,
    employerSidebarOpen,
    setEmployerSidebarOpen,
  } = useSidebar();

  return (
    <>
      {/* Admin Sidebars - Only for admin users */}
      {user?.role === 'admin' && (
        <>
          <SupportTickets isOpen={supportTicketsOpen} onClose={() => setSupportTicketsOpen(false)} />
          <AdminSidebar isOpen={adminSidebarOpen} onClose={() => setAdminSidebarOpen(false)} />
        </>
      )}

      {/* Employer Sidebar - Only for employer users */}
      {user?.role === 'employer' && (
        <EmployerSidebar isOpen={employerSidebarOpen} onClose={() => setEmployerSidebarOpen(false)} />
      )}

      {/* Candidate Sidebar - Only for candidate users */}
      {user?.role === 'candidate' && (
        <CandidateSidebar isOpen={candidateSidebarOpen} onClose={() => setCandidateSidebarOpen(false)} />
      )}
    </>
  );
};

export default GlobalSidebars;
