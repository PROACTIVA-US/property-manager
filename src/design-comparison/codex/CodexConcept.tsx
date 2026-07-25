import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Home,
  Inbox,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Settings,
  Users,
  Wrench,
} from 'lucide-react';
import './CodexConcept.css';

const attentionItems = [
  {
    kind: 'Approval',
    title: 'Deck repair estimate',
    detail: 'Waiting on owner approval',
    meta: '$1,850 · sent 2h ago',
    icon: FileText,
    tone: 'amber',
  },
  {
    kind: 'Schedule',
    title: 'Kitchen faucet leak',
    detail: 'Schedule with tenant',
    meta: 'Availability received 34m ago',
    icon: Wrench,
    tone: 'clay',
  },
  {
    kind: 'Ledger',
    title: 'July rent',
    detail: 'Record bank transfer',
    meta: '$2,650 expected Jul 1',
    icon: ReceiptText,
    tone: 'green',
  },
] as const;

const activity = [
  {
    title: 'Tenant added availability',
    detail: 'Kitchen faucet leak',
    time: '34m ago',
    icon: MessageSquareText,
  },
  {
    title: 'Alder & Pine uploaded',
    detail: 'Deck estimate.pdf',
    time: '2h ago',
    icon: FileText,
  },
  {
    title: 'Roof inspection completed',
    detail: 'Spring roof inspection',
    time: 'Yesterday',
    icon: Check,
  },
] as const;

const navItems = [
  { label: 'Today', icon: Home, active: true },
  { label: 'Work', icon: ClipboardList, active: false },
  { label: 'People', icon: Users, active: false },
  { label: 'Money', icon: CircleDollarSign, active: false },
  { label: 'Property', icon: Building2, active: false },
  { label: 'Inbox', icon: Inbox, active: false },
] as const;

export default function CodexConcept() {
  return (
    <div className="cx-shell">
      <aside className="cx-rail" aria-label="Primary navigation">
        <a className="cx-brand" href="#today" aria-label="House home">
          <span className="cx-brand-mark"><Home aria-hidden="true" /></span>
          <span>House</span>
        </a>

        <nav className="cx-nav">
          <p className="cx-nav-label">Workspace</p>
          {navItems.map(({ label, icon: Icon, active }) => (
            <a key={label} className={`cx-nav-item${active ? ' cx-nav-item-active' : ''}`} href={`#${label.toLowerCase()}`}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
              {label === 'Work' && <span className="cx-nav-count" aria-label="3 work items">3</span>}
            </a>
          ))}
        </nav>

        <div className="cx-rail-bottom">
          <button className="cx-settings" type="button">
            <Settings aria-hidden="true" />
            <span>Admin & settings</span>
          </button>
          <div className="cx-manager">
            <span className="cx-avatar">DC</span>
            <span className="cx-manager-copy">
              <strong>Daniel</strong>
              <small>Property manager</small>
            </span>
            <MoreHorizontal aria-hidden="true" />
          </div>
        </div>
      </aside>

      <main className="cx-main">
        <header className="cx-topbar">
          <button className="cx-mobile-menu" aria-label="Open navigation" type="button">
            <Menu aria-hidden="true" />
          </button>
          <div>
            <p className="cx-date">Tuesday, July 21</p>
            <h1>Good morning, Daniel.</h1>
          </div>
          <div className="cx-top-actions">
            <button className="cx-icon-button" aria-label="Open notifications" type="button">
              <Bell aria-hidden="true" />
            </button>
            <button className="cx-primary-button" type="button">
              <Plus aria-hidden="true" />
              <span>New work order</span>
            </button>
          </div>
        </header>

        <section className="cx-house-record" aria-labelledby="cx-property-name">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85"
            alt="Cedar House exterior"
          />
          <div className="cx-house-overlay" />
          <div className="cx-house-copy">
            <div className="cx-house-eyebrow">
              <span className="cx-health-dot" />
              Property record
            </div>
            <h2 id="cx-property-name">Cedar House</h2>
            <p>North Seattle · Single-family home</p>
            <div className="cx-house-meta">
              <span><Check aria-hidden="true" /> Healthy</span>
              <span><CalendarDays aria-hidden="true" /> Lease through Aug 2027</span>
            </div>
          </div>
          <button className="cx-house-link" type="button">
            Open property <ChevronRight aria-hidden="true" />
          </button>
        </section>

        <div className="cx-content-grid">
          <section className="cx-ledger-section" aria-labelledby="cx-attention-title">
            <div className="cx-section-heading">
              <div>
                <p className="cx-kicker">Your queue</p>
                <h2 id="cx-attention-title">Needs attention</h2>
              </div>
              <span className="cx-section-count">3 items</span>
            </div>

            <div className="cx-attention-list">
              {attentionItems.map(({ kind, title, detail, meta, icon: Icon, tone }) => (
                <button className="cx-attention-row" type="button" key={title}>
                  <span className={`cx-row-icon cx-tone-${tone}`}><Icon aria-hidden="true" /></span>
                  <span className="cx-row-main">
                    <small>{kind}</small>
                    <strong>{title}</strong>
                  </span>
                  <span className="cx-row-status">
                    <strong>{detail}</strong>
                    <small>{meta}</small>
                  </span>
                  <ChevronRight className="cx-row-chevron" aria-hidden="true" />
                </button>
              ))}
            </div>

            <div className="cx-section-heading cx-activity-heading">
              <div>
                <p className="cx-kicker">House ledger</p>
                <h2>Recent activity</h2>
              </div>
              <button className="cx-text-button" type="button">View full history</button>
            </div>

            <ol className="cx-activity-list">
              {activity.map(({ title, detail, time, icon: Icon }) => (
                <li key={title}>
                  <span className="cx-activity-icon"><Icon aria-hidden="true" /></span>
                  <span className="cx-activity-copy"><strong>{title}</strong><small>{detail}</small></span>
                  <time>{time}</time>
                </li>
              ))}
            </ol>
          </section>

          <aside className="cx-side-stack" aria-label="Property summary">
            <section className="cx-summary-panel">
              <div className="cx-panel-heading">
                <div>
                  <p className="cx-kicker">July</p>
                  <h2>Money at a glance</h2>
                </div>
                <CircleDollarSign aria-hidden="true" />
              </div>
              <dl className="cx-money-list">
                <div><dt>Rent expected</dt><dd>$2,650</dd></div>
                <div><dt>Open work estimates</dt><dd>$1,850</dd></div>
                <div><dt>2026 maintenance</dt><dd>$3,240</dd></div>
              </dl>
              <button className="cx-panel-link" type="button">Open ledger <ChevronRight aria-hidden="true" /></button>
            </section>

            <section className="cx-event-panel">
              <div className="cx-event-date"><span>Jul</span><strong>23</strong></div>
              <div className="cx-event-copy">
                <p className="cx-kicker">Next scheduled</p>
                <h2>HVAC service</h2>
                <p>Thu · 10:00–12:00</p>
                <small>North Sound Heating</small>
              </div>
              <BriefcaseBusiness aria-hidden="true" />
            </section>
          </aside>
        </div>
      </main>

      <nav className="cx-mobile-nav" aria-label="Mobile navigation">
        {navItems.slice(0, 5).map(({ label, icon: Icon, active }) => (
          <a key={label} className={active ? 'cx-mobile-active' : ''} href={`#${label.toLowerCase()}`}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
