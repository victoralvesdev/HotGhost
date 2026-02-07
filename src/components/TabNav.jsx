function TabNav({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="tab-nav">
      <div className="container">
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {'>'} {tab.label}
            </button>
          ))}
        </div>
      </div>
      <style>{`
        .tab-nav {
          border-bottom: var(--border-width) solid var(--color-border);
        }
        .tabs {
          display: flex;
          gap: var(--space-1);
          padding: var(--space-2) 0;
        }
        .tab {
          padding: var(--space-1) var(--space-3);
          border: var(--border-width) solid transparent;
          background: transparent;
          color: var(--color-text-dim);
          font-size: var(--font-size-sm);
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.2s ease;
        }
        .tab:hover {
          color: var(--color-text);
          border-color: transparent;
          box-shadow: none;
        }
        .tab.active {
          color: var(--color-text);
          border-color: var(--color-border);
          background: var(--color-secondary);
        }
        .tab.active:hover {
          border-color: var(--color-border);
        }
      `}</style>
    </nav>
  )
}

export default TabNav
