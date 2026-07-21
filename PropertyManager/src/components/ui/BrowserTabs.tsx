import { useState, useRef, type ReactNode } from 'react';

export interface Tab {
  id: string;
  label: string;
  subtitle?: string;
  icon: ReactNode;
  summary: ReactNode;
  color: string; // Hex color like '#3b82f6'
  content: ReactNode;
}

interface BrowserTabsProps {
  tabs: Tab[];
  onTabOrderChange?: (newOrder: string[]) => void;
}

export default function BrowserTabs({ tabs: initialTabs, onTabOrderChange }: BrowserTabsProps) {
  const [tabs, setTabs] = useState(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const dragStartX = useRef<number>(0);

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId);
    dragStartX.current = e.clientX;
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, e.currentTarget.offsetWidth / 2, 20);
    }
  };

  const handleDragOver = (e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    if (draggedTabId && draggedTabId !== tabId) {
      setDragOverTabId(tabId);
    }
  };

  const handleDragLeave = () => {
    setDragOverTabId(null);
  };

  const handleDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    if (!draggedTabId || draggedTabId === targetTabId) return;
    const newTabs = [...tabs];
    const draggedIndex = newTabs.findIndex(t => t.id === draggedTabId);
    const targetIndex = newTabs.findIndex(t => t.id === targetTabId);
    const [draggedTab] = newTabs.splice(draggedIndex, 1);
    newTabs.splice(targetIndex, 0, draggedTab);
    setTabs(newTabs);
    setDraggedTabId(null);
    setDragOverTabId(null);
    if (onTabOrderChange) {
      onTabOrderChange(newTabs.map(t => t.id));
    }
  };

  const handleDragEnd = () => {
    setDraggedTabId(null);
    setDragOverTabId(null);
  };

  const handleTabClick = (tabId: string) => {
    setActiveTabId(activeTabId === tabId ? null : tabId);
  };

  const activeTab = tabs.find(t => t.id === activeTabId);
  const borderColor = '#3f4451';
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <div className="relative">
      {/* Tab bar area */}
      <div className="relative">
        {/* Border line segments - only under inactive tabs */}
        {activeTab && tabs.map((tab, index) => {
          if (activeTabId === tab.id) return null;
          return (
            <div
              key={tab.id + '-line'}
              className="absolute bottom-0"
              style={{
                height: '1px',
                backgroundColor: activeTab.color,
                zIndex: 0,
                left: `${(index / tabs.length) * 100}%`,
                width: `${(1 / tabs.length) * 100}%`,
              }}
            />
          );
        })}

        {/* Tab row */}
        <div className="flex gap-0 relative">
          {tabs.map((tab, index) => {
            const isActive = activeTabId === tab.id;
            const isDragging = draggedTabId === tab.id;
            const isDragOver = dragOverTabId === tab.id;

            return (
              <div key={tab.id} className="relative flex-1" style={{ zIndex: isActive ? 10 : 1, overflow: 'visible' }}>
                <button
                  ref={(el) => { tabRefs.current[index] = el; }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, tab.id)}
                  onDragOver={(e) => handleDragOver(e, tab.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, tab.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleTabClick(tab.id)}
                  className={`
                    w-full px-4 py-3 cursor-pointer select-none relative
                    transition-all duration-200 ease-out
                    ${isDragging ? 'opacity-50 scale-95' : ''}
                    ${isDragOver ? 'ring-2 ring-white/30 ring-inset' : ''}
                  `}
                  style={{
                    borderTop: `1px solid ${isActive ? tab.color : borderColor}`,
                    borderLeft: `1px solid ${isActive ? tab.color : borderColor}`,
                    borderRight: `1px solid ${isActive ? tab.color : borderColor}`,
                    borderBottom: isActive ? 'none' : `1px solid ${borderColor}`,
                    borderRadius: '0.75rem 0.75rem 0 0',
                    backgroundColor: isActive ? `${tab.color}15` : `${tab.color}08`,
                    marginBottom: isActive ? '-1px' : '0',
                    paddingBottom: isActive ? 'calc(0.75rem + 1px)' : '0.75rem',
                  }}
                >
                  <div className="flex items-center gap-3 min-h-[52px]">
                    <div
                      className="p-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: isActive ? `${tab.color}25` : `${tab.color}15`,
                        color: isActive ? tab.color : 'var(--color-cc-muted)',
                      }}
                    >
                      {tab.icon}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm ${isActive ? 'text-cc-text' : 'text-cc-muted'}`}>
                        {tab.label}
                      </h3>
                      {tab.subtitle && (
                        <p className="text-xs text-cc-muted truncate">{tab.subtitle}</p>
                      )}
                      <div className="text-xs mt-1">
                        {tab.summary}
                      </div>
                    </div>
                  </div>
                {isActive && (
                  <div className="absolute left-0 right-0" style={{
                    bottom: '-2px',
                    height: '4px',
                    zIndex: 20,
                    background: 'var(--color-cc-bg, #0a0b0d)',
                  }}>
                    <div className="w-full h-full" style={{
                      backgroundColor: `${tab.color}15`,
                    }} />
                  </div>
                )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content panel */}
      {activeTab && (
        <div
          className="relative"
          style={{
            backgroundColor: `${activeTab.color}15`,
            border: `1px solid ${activeTab.color}`,
            borderTop: 'none',
            borderRadius: '0 0 0.75rem 0.75rem',
            zIndex: 1,
          }}
        >
          <div className="p-6 animate-in fade-in slide-in-from-top-1 duration-200">
            {activeTab.content}
          </div>
        </div>
      )}
    </div>
  );
}
