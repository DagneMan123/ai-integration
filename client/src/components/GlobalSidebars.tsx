import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useSidebar } from '../context/SidebarContext';
import SettingsSidebar from './SettingsSidebar';
import AdminSessionMonitoring from './AdminSessionMonitoring';
import AdminGlobalSettings from './AdminGlobalSettings';
import SupportTickets from './SupportTickets';
import HelpCenterSidebar from './HelpCenterSidebar';

const GlobalSidebars: React.FC = () => {
  const { user } = useAuthStore();
  const {
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
  } = useSidebar();

  return (
    <>
      {/* General Settings Sidebar - For all users */}
      <SettingsSidebar isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Help Center Sidebar - For all users */}
      <HelpCenterSidebar isOpen={helpCenterOpen} onClose={() => setHelpCenterOpen(false)} />

      {/* Admin Sidebars - Only for admin users */}
      {user?.role === 'admin' && (
        <>
          <AdminSessionMonitoring isOpen={sessionMonitoringOpen} onClose={() => setSessionMonitoringOpen(false)} />
          <AdminGlobalSettings isOpen={globalSettingsOpen} onClose={() => setGlobalSettingsOpen(false)} />
          <SupportTickets isOpen={supportTicketsOpen} onClose={() => setSupportTicketsOpen(false)} />
        </>
      )}
    </>
  );
};

export default GlobalSidebars;
