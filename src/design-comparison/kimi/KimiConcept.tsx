import {
  Home,
  Wrench,
  Users,
  Wallet,
  Building2,
  Inbox as InboxIcon,
  Settings,
  Plus,
  Clock,
  ArrowRight,
  FileText,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import './KimiConcept.css';

const navItems = [
  { label: 'Today', icon: Home, active: true },
  { label: 'Work', icon: Wrench, active: false },
  { label: 'People', icon: Users, active: false },
  { label: 'Money', icon: Wallet, active: false },
  { label: 'Property', icon: Building2, active: false },
  { label: 'Inbox', icon: InboxIcon, active: false },
];

const attentionItems = [
  {
    id: 'deck',
    title: 'Deck repair estimate',
    status: 'Waiting on owner approval',
    meta: '$1,850 · sent 2h ago',
    tone: 'attention',
  },
  {
    id: 'faucet',
    title: 'Kitchen faucet leak',
    status: 'Schedule with tenant',
    meta: 'availability received 34m ago',
    tone: 'attention',
  },
  {
    id: 'rent',
    title: 'July rent',
    status: 'Record bank transfer',
    meta: '$2,650 expected Jul 1',
    tone: 'neutral',
  },
];

const activityItems = [
  {
    id: 'a1',
    text: 'Tenant added availability to Kitchen faucet leak',
    time: '34m ago',
  },
  {
    id: 'a2',
    text: 'Alder & Pine uploaded Deck estimate.pdf',
    time: '2h ago',
  },
  {
    id: 'a3',
    text: 'Spring roof inspection marked complete',
    time: 'Yesterday',
  },
];

export default function KimiConcept() {
  return (
    <div className="km-app">
      <a className="km-skip" href="#km-main">
        Skip to main content
      </a>

      <aside className="km-sidebar" aria-label="Primary">
        <div className="km-brand">
          <span className="km-brand-mark" aria-hidden="true">
            <Building2 size={18} strokeWidth={1.8} />
          </span>
          <span className="km-brand-name">House</span>
        </div>

        <nav className="km-nav" aria-label="Workspace">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <a
                    href="#"
                    className={`km-nav-link${item.active ? ' km-nav-link--active' : ''}`}
                    aria-current={item.active ? 'page' : undefined}
                  >
                    <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="km-sidebar-foot">
          <a href="#" className="km-manager">
            <span className="km-avatar" aria-hidden="true">
              MK
            </span>
            <span className="km-manager-text">
              <span className="km-manager-name">Mara Kessler</span>
              <span className="km-manager-role">Property manager</span>
            </span>
          </a>
          <a href="#" className="km-icon-btn" aria-label="Admin and settings">
            <Settings size={18} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </div>
      </aside>

      <div className="km-body">
        <header className="km-topbar">
          <div className="km-topbar-property">
            <span className="km-topbar-label">Cedar House</span>
            <span className="km-health">
              <span className="km-health-dot" aria-hidden="true" />
              Healthy
            </span>
          </div>
          <div className="km-topbar-actions">
            <a href="#" className="km-icon-btn km-topbar-settings" aria-label="Admin and settings">
              <Settings size={18} strokeWidth={1.8} aria-hidden="true" />
            </a>
            <button type="button" className="km-btn-primary">
              <Plus size={17} strokeWidth={2} aria-hidden="true" />
              New work order
            </button>
          </div>
        </header>

        <main className="km-main" id="km-main">
          <section className="km-hero" aria-label="Property summary">
            <figure className="km-hero-photo">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85"
                alt="Cedar House exterior"
              />
            </figure>
            <div className="km-hero-text">
              <p className="km-eyebrow">Today · Thursday, July 2</p>
              <h1 className="km-title">Cedar House</h1>
              <p className="km-subtitle">North Seattle · Single-family home</p>
              <div className="km-hero-meta">
                <span className="km-pill km-pill--healthy">
                  <CheckCircle2 size={14} strokeWidth={2} aria-hidden="true" />
                  Healthy
                </span>
                <span className="km-lease">Lease through Aug 2027</span>
              </div>
            </div>
          </section>

          <div className="km-grid">
            <section className="km-panel km-panel--attention" aria-labelledby="km-attention-h">
              <div className="km-panel-head">
                <h2 id="km-attention-h">Needs attention</h2>
                <span className="km-count" aria-label="3 items need attention">
                  3
                </span>
              </div>
              <ol className="km-attention-list">
                {attentionItems.map((item) => (
                  <li key={item.id}>
                    <a href="#" className="km-attention-item">
                      <span
                        className={`km-marker${
                          item.tone === 'attention' ? ' km-marker--attention' : ''
                        }`}
                        aria-hidden="true"
                      />
                      <span className="km-attention-body">
                        <span className="km-attention-title">{item.title}</span>
                        <span className="km-attention-status">{item.status}</span>
                        <span className="km-attention-meta">{item.meta}</span>
                      </span>
                      <ChevronRight
                        size={17}
                        strokeWidth={1.8}
                        className="km-chevron"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ol>
            </section>

            <aside className="km-side" aria-label="Property status">
              <section className="km-panel" aria-labelledby="km-money-h">
                <div className="km-panel-head">
                  <h2 id="km-money-h">Financial snapshot</h2>
                </div>
                <dl className="km-ledger">
                  <div className="km-ledger-row">
                    <dt>July rent</dt>
                    <dd>$2,650 expected</dd>
                  </div>
                  <div className="km-ledger-row">
                    <dt>Open work estimates</dt>
                    <dd>$1,850</dd>
                  </div>
                  <div className="km-ledger-row">
                    <dt>2026 maintenance</dt>
                    <dd>$3,240</dd>
                  </div>
                </dl>
                <a href="#" className="km-text-link">
                  View money record
                  <ArrowRight size={15} strokeWidth={1.8} aria-hidden="true" />
                </a>
              </section>

              <section className="km-panel" aria-labelledby="km-event-h">
                <div className="km-panel-head">
                  <h2 id="km-event-h">Next scheduled</h2>
                </div>
                <div className="km-event">
                  <span className="km-event-icon" aria-hidden="true">
                    <CalendarDays size={18} strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="km-event-title">HVAC service</p>
                    <p className="km-event-when">Thu, Jul 23 · 10:00–12:00</p>
                    <p className="km-event-who">North Sound Heating</p>
                  </div>
                </div>
              </section>
            </aside>

            <section className="km-panel km-panel--activity" aria-labelledby="km-activity-h">
              <div className="km-panel-head">
                <h2 id="km-activity-h">Recent activity</h2>
              </div>
              <ol className="km-activity-list">
                {activityItems.map((item) => (
                  <li key={item.id} className="km-activity-item">
                    <span className="km-activity-icon" aria-hidden="true">
                      {item.id === 'a2' ? (
                        <FileText size={15} strokeWidth={1.8} />
                      ) : item.id === 'a3' ? (
                        <CheckCircle2 size={15} strokeWidth={1.8} />
                      ) : (
                        <Clock size={15} strokeWidth={1.8} />
                      )}
                    </span>
                    <span className="km-activity-text">{item.text}</span>
                    <time className="km-activity-time">{item.time}</time>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </main>

        <nav className="km-bottomnav" aria-label="Primary">
          <ul>
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <a
                    href="#"
                    className={`km-bottomnav-link${
                      item.active ? ' km-bottomnav-link--active' : ''
                    }`}
                    aria-current={item.active ? 'page' : undefined}
                  >
                    <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
