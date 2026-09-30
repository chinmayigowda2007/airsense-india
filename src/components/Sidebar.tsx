import React from 'react';
import { 
  LayoutDashboard, 
  Camera, 
  SearchCode, 
  Wind, 
  ShieldAlert, 
  Settings, 
  Radio,
  Cpu,
  Satellite,
  X
} from 'lucide-react';

export type NavigationTab = 
  | 'dashboard' 
  | 'report' 
  | 'investigation' 
  | 'forecast' 
  | 'action_center' 
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  pendingAlertsCount: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingAlertsCount,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'National Radar',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Hyperlocal Map & Queue',
    },
    {
      id: 'report' as NavigationTab,
      label: 'Report Pollution',
      icon: Camera,
      badge: null,
      desc: 'Citizen Geotagged Capture',
    },
    {
      id: 'investigation' as NavigationTab,
      label: 'AI Investigation',
      icon: SearchCode,
      badge: null,
      desc: 'Gemini Plume Attribution',
    },
    {
      id: 'forecast' as NavigationTab,
      label: 'Dispersion Forecast',
      icon: Wind,
      badge: null,
      desc: 'Downwind Exposure Trajectory',
    },
    {
      id: 'action_center' as NavigationTab,
      label: 'Action Center',
      icon: ShieldAlert,
      badge: pendingAlertsCount > 0 ? `${pendingAlertsCount}` : null,
      badgeColor: 'text-red-400 font-bold font-mono',
      desc: 'Authority Dispatch SOP',
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings & Models',
      icon: Settings,
      badge: null,
      desc: 'Data Feeds & Governance',
    },
  ];

  const handleItemClick = (id: NavigationTab) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Top Navigation Items */}
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between px-3 py-2 text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
          <span>OPERATIONAL WORKSPACES</span>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-500/30 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3 text-left min-w-0">
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-slate-400 group-hover:text-cyan-400 group-hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className={`font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate font-mono">
                    {item.desc}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-mono tabular-nums ${item.badgeColor || 'text-cyan-300'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Telemetry Status Strip at bottom */}
      <div className="p-3 m-3 rounded-xl bg-[#09101c] border border-slate-800/90 text-xs font-mono space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
          <span className="text-slate-400 font-bold flex items-center gap-1.5 text-[10px]">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            TELEMETRY FEEDS
          </span>
          <span className="text-[9px] text-emerald-400 font-bold">
            ONLINE
          </span>
        </div>

        <div className="space-y-1.5 text-slate-400 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Satellite className="w-2.5 h-2.5 text-cyan-400" />
              Sentinel-5P NO2:
            </span>
            <span className="text-slate-200">ORBIT OK</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-cyan-400" />
              CPCB CAAQMS Grid:
            </span>
            <span className="text-slate-200">462 Nodes</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Cpu className="w-2.5 h-2.5 text-teal-400" />
              Gemini 3.8 Flash:
            </span>
            <span className="text-teal-300 font-bold">READY</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-60 flex-shrink-0 bg-[#070b13] border-r border-cyan-950/50 flex-col justify-between">
        {navContent}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={onCloseMobile}
        >
          <aside 
            className="w-72 max-w-[80vw] h-full bg-[#070b13] border-r border-cyan-950/70 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
