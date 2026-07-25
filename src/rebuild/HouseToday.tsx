import { useMemo, useState, type FormEvent } from 'react';
import {
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Home,
  Inbox,
  KeyRound,
  Loader2,
  LogOut,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createHouseWorkOrder, updateHouseProfile } from './data';
import HouseAdmin, { type HouseAdminPanel } from './HouseAdmin';
import type {
  HouseSection,
  HouseWorkspaceData,
  HouseWorkOrder,
} from './types';
import '../design-comparison/codex/CodexConcept.css';

interface HouseTodayProps {
  data: HouseWorkspaceData;
  onRefresh: () => Promise<void>;
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number | null) {
  return value === null ? 'Not recorded' : currency.format(value);
}

function humanStatus(status: string) {
  return status.replaceAll('_', ' ');
}

function openWorkOrders(workOrders: HouseWorkOrder[]) {
  return workOrders.filter(
    ({ status }) => status !== 'completed' && status !== 'cancelled',
  );
}

function ProvenanceBadge({ verified }: { verified: boolean }) {
  return (
    <span className={verified ? 'house-provenance-verified' : 'house-provenance-recovered'}>
      {verified ? 'Verified' : 'Recovered · verify'}
    </span>
  );
}

export default function HouseToday({ data, onRefresh }: HouseTodayProps) {
  const [section, setSection] = useState<HouseSection>('today');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workOrderOpen, setWorkOrderOpen] = useState(false);
  const [workOrderBusy, setWorkOrderBusy] = useState(false);
  const [workOrderError, setWorkOrderError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [managePanel, setManagePanel] = useState<HouseAdminPanel>('property');

  const role = data.membership.role;
  const canManage = role === 'admin' || role === 'manager';
  const canReportWork = true;
  const firstName = data.profile.displayName.split(' ')[0] || 'there';
  const activeWork = useMemo(
    () => openWorkOrders(data.workOrders),
    [data.workOrders],
  );
  const heroPhoto =
    data.photos.find((photo) => /completed deck photo 1/i.test(photo.caption ?? '')) ??
    data.photos[0] ??
    null;

  const allNavItems = [
    { key: 'today' as const, label: 'Today', icon: Home },
    { key: 'work' as const, label: role === 'owner' ? 'Work & approvals' : 'Work', icon: ClipboardList },
    { key: 'people' as const, label: 'People', icon: Users, roles: ['admin', 'manager', 'owner'] },
    { key: 'money' as const, label: role === 'tenant' ? 'Payments' : 'Money', icon: CircleDollarSign },
    { key: 'property' as const, label: role === 'tenant' ? 'Lease' : 'Property', icon: Building2 },
    { key: 'inbox' as const, label: 'Inbox', icon: Inbox },
    { key: 'manage' as const, label: 'Manage House', icon: SlidersHorizontal, roles: ['admin'] },
  ];
  const navItems = allNavItems.filter(
    (item) => !item.roles || item.roles.includes(role),
  );

  const selectSection = (nextSection: HouseSection) => {
    setSection(nextSection);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openManage = (nextPanel: HouseAdminPanel) => {
    setManagePanel(nextPanel);
    selectSection('manage');
  };

  const handleWorkOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWorkOrderBusy(true);
    setWorkOrderError('');
    const form = new FormData(event.currentTarget);
    try {
      await createHouseWorkOrder({
        propertyId: data.property.id,
        userId: data.profile.id,
        title: String(form.get('title') ?? '').trim(),
        description: String(form.get('description') ?? '').trim(),
        category: String(form.get('category') ?? 'other'),
        priority: String(form.get('priority') ?? 'normal') as
          | 'low'
          | 'normal'
          | 'high'
          | 'urgent',
      });
      setWorkOrderOpen(false);
      await onRefresh();
      selectSection('work');
    } catch (error) {
      setWorkOrderError(
        error instanceof Error ? error.message : 'The work order could not be created.',
      );
    } finally {
      setWorkOrderBusy(false);
    }
  };

  const handlePasswordUpdate = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordMessage('');
    if (password.length < 6) {
      setPasswordMessage('Use at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordMessage('The two password entries do not match.');
      return;
    }
    setPasswordBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPasswordBusy(false);
    if (error) {
      setPasswordMessage(error.message);
      return;
    }
    setPassword('');
    setConfirmPassword('');
    setPasswordMessage('Password updated.');
  };

  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileBusy(true);
    setProfileMessage('');
    const form = new FormData(event.currentTarget);
    try {
      await updateHouseProfile({
        id: data.profile.id,
        displayName: String(form.get('displayName') ?? '').trim(),
        phone: String(form.get('phone') ?? '').trim(),
      });
      await onRefresh();
      setProfileMessage('Account details updated.');
    } catch (error) {
      setProfileMessage(
        error instanceof Error ? error.message : 'Account details could not be saved.',
      );
    } finally {
      setProfileBusy(false);
    }
  };

  return (
    <div className="house-app">
      <div className="house-live-status">
        <span><ShieldCheck aria-hidden="true" /> Live private workspace</span>
        {data.recovery && (
          <span className="house-live-recovery">
            Recovered records are labeled until verified
          </span>
        )}
      </div>

      <div className="cx-shell house-workspace-shell">
        <aside className="cx-rail" aria-label="Primary navigation">
          <button
            className="cx-brand house-brand-button"
            type="button"
            onClick={() => selectSection('today')}
          >
            <span className="cx-brand-mark"><Home aria-hidden="true" /></span>
            <span>House</span>
          </button>

          <nav className="cx-nav">
            <p className="cx-nav-label">Workspace</p>
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                className={`cx-nav-item house-nav-button${section === key ? ' cx-nav-item-active' : ''}`}
                type="button"
                onClick={() => selectSection(key)}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
                {key === 'work' && activeWork.length > 0 && (
                  <span className="cx-nav-count" aria-label={`${activeWork.length} open work items`}>
                    {activeWork.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="cx-rail-bottom">
            <button
              className="cx-settings"
              type="button"
              onClick={() => selectSection('admin')}
            >
              <Settings aria-hidden="true" />
              <span>Account & settings</span>
            </button>
            <div className="cx-manager">
              <span className="cx-avatar">
                {data.profile.displayName
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              <span className="cx-manager-copy">
                <strong>{firstName}</strong>
                <small>{humanStatus(role)}</small>
              </span>
              <MoreHorizontal aria-hidden="true" />
            </div>
          </div>
        </aside>

        <main className="cx-main house-main">
          <header className="cx-topbar">
            <button
              className="cx-mobile-menu"
              aria-label="Open navigation"
              type="button"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu aria-hidden="true" />
            </button>
            <div>
              <p className="cx-date">
                {new Intl.DateTimeFormat('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                }).format(new Date())}
              </p>
              <h1>
                {section === 'today'
                  ? `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${firstName}.`
                  : navItems.find((item) => item.key === section)?.label ??
                    'Account & settings'}
              </h1>
            </div>
            <div className="cx-top-actions">
              <button
                className="cx-icon-button"
                aria-label="Open inbox"
                type="button"
                onClick={() => selectSection('inbox')}
              >
                <Bell aria-hidden="true" />
              </button>
              {role === 'admin' && (
                <button
                  className="house-secondary-button"
                  type="button"
                  onClick={() =>
                    section === 'manage'
                      ? selectSection('today')
                      : openManage('property')
                  }
                >
                  <SlidersHorizontal aria-hidden="true" />
                  <span>{section === 'manage' ? 'View site' : 'Edit site'}</span>
                </button>
              )}
              {canReportWork && (
                <button
                  className="cx-primary-button"
                  type="button"
                  onClick={() => setWorkOrderOpen(true)}
                >
                  <Plus aria-hidden="true" />
                  <span>{canManage ? 'New work order' : 'Report an issue'}</span>
                </button>
              )}
            </div>
          </header>

          {section === 'today' && (
            <>
              <section className="cx-house-record" aria-labelledby="house-property-name">
                {heroPhoto ? (
                  <img src={heroPhoto.signedUrl} alt={heroPhoto.caption ?? 'Property photograph'} />
                ) : (
                  <div className="house-photo-placeholder" aria-hidden="true" />
                )}
                <div className="cx-house-overlay" />
                <div className="cx-house-copy">
                  <div className="cx-house-eyebrow">
                    <span className="cx-health-dot" />
                    Private property record
                  </div>
                  <h2 id="house-property-name">{data.property.nickname}</h2>
                  <p>{data.property.address}</p>
                  <div className="cx-house-meta">
                    <span><Check aria-hidden="true" /> Active workspace</span>
                    {data.lease?.endsOn && (
                      <span>
                        <CalendarDays aria-hidden="true" />
                        Lease through{' '}
                        {new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          year: 'numeric',
                        }).format(new Date(`${data.lease.endsOn}T00:00:00`))}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="cx-house-link"
                  type="button"
                  onClick={() => selectSection('property')}
                >
                  Open property <ChevronRight aria-hidden="true" />
                </button>
              </section>

              <div className="cx-content-grid">
                <section className="cx-ledger-section" aria-labelledby="house-attention-title">
                  <div className="cx-section-heading">
                    <div>
                      <p className="cx-kicker">Your queue</p>
                      <h2 id="house-attention-title">Needs attention</h2>
                    </div>
                    <span className="cx-section-count">
                      {activeWork.length} {activeWork.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {activeWork.length === 0 ? (
                    <div className="house-empty-ledger">
                      <span><Check aria-hidden="true" /></span>
                      <div>
                        <strong>No open work is recorded.</strong>
                        <p>
                          The old sample issues were intentionally excluded. Add a
                          real work order when something needs attention.
                        </p>
                      </div>
                      {canReportWork && (
                        <button type="button" onClick={() => setWorkOrderOpen(true)}>
                          {canManage ? 'Add work' : 'Report an issue'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="cx-attention-list">
                      {activeWork.slice(0, 5).map((workOrder) => (
                        <button
                          className="cx-attention-row"
                          type="button"
                          key={workOrder.id}
                          onClick={() => selectSection('work')}
                        >
                          <span className="cx-row-icon cx-tone-clay">
                            <Wrench aria-hidden="true" />
                          </span>
                          <span className="cx-row-main">
                            <small>{humanStatus(workOrder.category)}</small>
                            <strong>{workOrder.title}</strong>
                          </span>
                          <span className="cx-row-status">
                            <strong>{humanStatus(workOrder.status)}</strong>
                            <small>{humanStatus(workOrder.priority)} priority</small>
                          </span>
                          <ChevronRight className="cx-row-chevron" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="cx-section-heading cx-activity-heading">
                    <div>
                      <p className="cx-kicker">House ledger</p>
                      <h2>Recent activity</h2>
                    </div>
                    <button
                      className="cx-text-button"
                      type="button"
                      onClick={() => selectSection('property')}
                    >
                      View property record
                    </button>
                  </div>

                  <ol className="cx-activity-list">
                    {data.recovery && (
                      <li>
                        <span className="cx-activity-icon"><ReceiptText aria-hidden="true" /></span>
                        <span className="cx-activity-copy">
                          <strong>Recovered property record imported</strong>
                          <small>{data.recovery.sourceLabel}</small>
                        </span>
                        <time>
                          {new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: 'numeric',
                          }).format(new Date(data.recovery.importedAt))}
                        </time>
                      </li>
                    )}
                    {data.photos.length > 0 && (
                      <li>
                        <span className="cx-activity-icon"><FileText aria-hidden="true" /></span>
                        <span className="cx-activity-copy">
                          <strong>{data.photos.length} property photos secured</strong>
                          <small>Private property-files storage</small>
                        </span>
                        <time>Recovered</time>
                      </li>
                    )}
                    {data.documents[0] && (
                      <li>
                        <span className="cx-activity-icon"><FileText aria-hidden="true" /></span>
                        <span className="cx-activity-copy">
                          <strong>Lease document located</strong>
                          <small>{data.documents[0].fileName}</small>
                        </span>
                        <time>Drive</time>
                      </li>
                    )}
                  </ol>
                </section>

                <aside className="cx-side-stack" aria-label="Property summary">
                  <section className="cx-summary-panel">
                    <div className="cx-panel-heading">
                      <div>
                        <p className="cx-kicker">Current record</p>
                        <h2>Money at a glance</h2>
                      </div>
                      <CircleDollarSign aria-hidden="true" />
                    </div>
                    <dl className="cx-money-list">
                      <div>
                        <dt>Monthly rent</dt>
                        <dd>{formatCurrency(data.lease?.monthlyRent ?? null)}</dd>
                      </div>
                      <div>
                        <dt>Monthly utilities</dt>
                        <dd>{formatCurrency(data.lease?.monthlyUtilities ?? null)}</dd>
                      </div>
                      {role !== 'tenant' && (
                        <div>
                          <dt>Recovered property value</dt>
                          <dd>{formatCurrency(data.property.currentMarketValue)}</dd>
                        </div>
                      )}
                    </dl>
                    <button
                      className="cx-panel-link"
                      type="button"
                      onClick={() => selectSection('money')}
                    >
                      Open ledger <ChevronRight aria-hidden="true" />
                    </button>
                  </section>

                  <section className="house-record-note">
                    <ShieldCheck aria-hidden="true" />
                    <div>
                      <p className="cx-kicker">Data confidence</p>
                      <h2>Recovered, not assumed</h2>
                      <p>
                        Confirmed identities are kept. Demo payments, alerts,
                        projects, and credentials were not imported.
                      </p>
                    </div>
                  </section>
                </aside>
              </div>
            </>
          )}

          {section === 'work' && (
            <section className="house-section" aria-labelledby="house-work-title">
              <div className="house-section-header">
                <div>
                  <p className="cx-kicker">Authoritative workflow</p>
                  <h2 id="house-work-title">Work orders</h2>
                  <p>Only real work created in House appears here.</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {role === 'admin' && (
                    <button
                      className="house-secondary-button"
                      type="button"
                      onClick={() => openManage('work')}
                    >
                      <SlidersHorizontal aria-hidden="true" /> Edit work
                    </button>
                  )}
                  {canReportWork && (
                    <button className="cx-primary-button" type="button" onClick={() => setWorkOrderOpen(true)}>
                      <Plus aria-hidden="true" /> <span>{canManage ? 'New work order' : 'Report an issue'}</span>
                    </button>
                  )}
                </div>
              </div>
              {data.workOrders.length === 0 ? (
                <div className="house-empty-state">
                  <Wrench aria-hidden="true" />
                  <h3>No work orders yet</h3>
                  <p>The recovered sample issues were excluded because they could not be verified.</p>
                </div>
              ) : (
                <div className="house-record-list">
                  {data.workOrders.map((workOrder) => (
                    <article key={workOrder.id}>
                      <span className="cx-row-icon cx-tone-clay"><Wrench aria-hidden="true" /></span>
                      <div>
                        <p className="cx-kicker">{humanStatus(workOrder.category)}</p>
                        <h3>{workOrder.title}</h3>
                        <p>{workOrder.description || 'No description recorded.'}</p>
                      </div>
                      <div className="house-record-meta">
                        <strong>{humanStatus(workOrder.status)}</strong>
                        <small>{humanStatus(workOrder.priority)} priority</small>
                        <ProvenanceBadge verified={workOrder.verified} />
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {section === 'people' && (
            <section className="house-section" aria-labelledby="house-people-title">
              <div className="house-section-header">
                <div>
                  <p className="cx-kicker">Property relationships</p>
                  <h2 id="house-people-title">People</h2>
                  <p>Owner, manager, and current tenant household.</p>
                </div>
                {role === 'admin' && (
                  <button
                    className="house-secondary-button"
                    type="button"
                    onClick={() => openManage('people')}
                  >
                    <SlidersHorizontal aria-hidden="true" /> Edit people
                  </button>
                )}
              </div>
              <div className="house-people-grid">
                {data.people.map((person) => (
                  <article key={person.id}>
                    <span className="house-person-avatar">
                      {person.displayName
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                    <h3>{person.displayName}</h3>
                    <p>{person.email || 'No verified email recorded'}</p>
                    <p>{person.phone || 'No verified phone recorded'}</p>
                    <ProvenanceBadge verified={person.verified} />
                  </article>
                ))}
              </div>
            </section>
          )}

          {section === 'money' && (
            <section className="house-section" aria-labelledby="house-money-title">
              <div className="house-section-header">
                <div>
                  <p className="cx-kicker">Recorded values</p>
                  <h2 id="house-money-title">{role === 'tenant' ? 'Payments' : 'Money'}</h2>
                  <p>
                    Recovered financial inputs stay visibly unverified until
                    checked against statements.
                  </p>
                </div>
                {role === 'admin' && (
                  <button
                    className="house-secondary-button"
                    type="button"
                    onClick={() => openManage('money')}
                  >
                    <SlidersHorizontal aria-hidden="true" /> Edit money
                  </button>
                )}
              </div>
              <div className="house-financial-grid">
                <article>
                  <p className="cx-kicker">Lease</p>
                  <h3>{formatCurrency(data.lease?.monthlyRent ?? null)} / month</h3>
                  <dl>
                    <div><dt>Utilities</dt><dd>{formatCurrency(data.lease?.monthlyUtilities ?? null)}</dd></div>
                    <div><dt>Ledger entries</dt><dd>{data.ledgerEntries.length}</dd></div>
                  </dl>
                  <ProvenanceBadge verified={data.lease?.verified ?? false} />
                </article>
                {data.ownerFinancials && (
                  <article>
                    <p className="cx-kicker">Owner-private mortgage inputs</p>
                    <h3>{formatCurrency(data.ownerFinancials.mortgagePrincipal)}</h3>
                    <dl>
                      <div><dt>Monthly payment</dt><dd>{formatCurrency(data.ownerFinancials.mortgagePayment)}</dd></div>
                      <div><dt>Interest rate</dt><dd>{data.ownerFinancials.mortgageInterestRate ?? '—'}%</dd></div>
                      <div><dt>Lender</dt><dd>{data.ownerFinancials.lenderLabel || '—'}</dd></div>
                    </dl>
                    <ProvenanceBadge verified={data.ownerFinancials.verified} />
                  </article>
                )}
              </div>
              {data.ledgerEntries.length === 0 && (
                <div className="house-empty-state house-empty-inline">
                  <ReceiptText aria-hidden="true" />
                  <h3>No authoritative payment ledger yet</h3>
                  <p>Seeded payment history was deliberately excluded.</p>
                </div>
              )}
            </section>
          )}

          {section === 'property' && (
            <section className="house-section" aria-labelledby="house-property-title">
              <div className="house-section-header">
                <div>
                  <p className="cx-kicker">Private house record</p>
                  <h2 id="house-property-title">{data.property.nickname}</h2>
                  <p>{data.property.address}</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <ProvenanceBadge verified={data.property.verified} />
                  {role === 'admin' && (
                    <button
                      className="house-secondary-button"
                      type="button"
                      onClick={() => openManage('property')}
                    >
                      <SlidersHorizontal aria-hidden="true" /> Edit property
                    </button>
                  )}
                </div>
              </div>

              <dl className="house-property-facts">
                <div><dt>Type</dt><dd>{humanStatus(data.property.propertyType ?? 'not recorded')}</dd></div>
                <div><dt>Built</dt><dd>{data.property.yearBuilt ?? '—'}</dd></div>
                <div><dt>Bedrooms</dt><dd>{data.property.bedrooms ?? '—'}</dd></div>
                <div><dt>Bathrooms</dt><dd>{data.property.bathrooms ?? '—'}</dd></div>
                <div><dt>Interior</dt><dd>{data.property.squareFootage ? `${data.property.squareFootage.toLocaleString()} sq ft` : '—'}</dd></div>
              </dl>

              <div className="house-section-subhead">
                <div>
                  <p className="cx-kicker">Recovered evidence</p>
                  <h3>Property photos</h3>
                </div>
                <span>{data.photos.length} private files</span>
              </div>
              <div className="house-photo-grid">
                {data.photos.map((photo) => (
                  <figure key={photo.id}>
                    <img src={photo.signedUrl} alt={photo.caption ?? 'Recovered property photograph'} />
                    <figcaption>
                      <span>{photo.caption ?? 'Property photo'}</span>
                      <ProvenanceBadge verified={photo.verified} />
                    </figcaption>
                  </figure>
                ))}
              </div>

              <div className="house-section-subhead">
                <div>
                  <p className="cx-kicker">Lease and files</p>
                  <h3>Documents</h3>
                </div>
              </div>
              <div className="house-document-list">
                {data.documents.map((document) => (
                  <article key={document.id}>
                    <FileText aria-hidden="true" />
                    <div>
                      <h4>{document.fileName}</h4>
                      <p>{humanStatus(document.category)}</p>
                    </div>
                    <ProvenanceBadge verified={document.verified} />
                    {document.externalUrl || document.signedUrl ? (
                      <a href={document.externalUrl ?? document.signedUrl ?? '#'} target="_blank" rel="noreferrer">
                        Open document <ChevronRight aria-hidden="true" />
                      </a>
                    ) : (
                      <span>File unavailable</span>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {section === 'inbox' && (
            <section className="house-section" aria-labelledby="house-inbox-title">
              <div className="house-section-header">
                <div>
                  <p className="cx-kicker">Property conversations</p>
                  <h2 id="house-inbox-title">Inbox</h2>
                  <p>Messages will appear only after they are sent through the new workspace.</p>
                </div>
              </div>
              <div className="house-empty-state">
                <MessageSquareText aria-hidden="true" />
                <h3>No conversations yet</h3>
                <p>Old seeded threads were excluded because they were not authoritative.</p>
              </div>
            </section>
          )}

          {section === 'manage' && role === 'admin' && (
            <HouseAdmin
              data={data}
              initialPanel={managePanel}
              onRefresh={onRefresh}
            />
          )}

          {section === 'admin' && (
            <section className="house-section" aria-labelledby="house-account-title">
              <div className="house-section-header">
                <div>
                  <p className="cx-kicker">Private account</p>
                  <h2 id="house-account-title">Account & settings</h2>
                  <p>{data.profile.email} · {humanStatus(role)}</p>
                </div>
                <button className="house-secondary-button" type="button" onClick={() => supabase.auth.signOut()}>
                  <LogOut aria-hidden="true" /> Sign out
                </button>
              </div>
              <div className="grid gap-4">
                <form className="house-password-card" onSubmit={handleProfileUpdate}>
                  <UserRound aria-hidden="true" />
                  <div>
                    <h3>Your profile</h3>
                    <p>Your name appears in the workspace. The login email is shown for reference.</p>
                    <label>
                      Display name
                      <input
                        defaultValue={data.profile.displayName}
                        name="displayName"
                        required
                      />
                    </label>
                    <label>
                      Login email
                      <input
                        disabled
                        type="email"
                        value={data.profile.email}
                      />
                    </label>
                    <label>
                      Phone
                      <input
                        defaultValue={data.profile.phone ?? ''}
                        name="phone"
                        type="tel"
                      />
                    </label>
                    <button className="cx-primary-button" disabled={profileBusy} type="submit">
                      {profileBusy && <Loader2 className="house-spin" aria-hidden="true" />}
                      <span>Save profile</span>
                    </button>
                    {profileMessage && <p role="status">{profileMessage}</p>}
                  </div>
                </form>

                <form className="house-password-card" onSubmit={handlePasswordUpdate}>
                  <KeyRound aria-hidden="true" />
                  <div>
                    <h3>Change password</h3>
                    <p>Use at least 6 characters. Property staff cannot view it.</p>
                    <label>
                      New password
                      <input
                        autoComplete="new-password"
                        type="password"
                        minLength={6}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                    </label>
                    <label>
                      Confirm password
                      <input
                        autoComplete="new-password"
                        type="password"
                        minLength={6}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                      />
                    </label>
                    <button className="cx-primary-button" disabled={passwordBusy} type="submit">
                      {passwordBusy && <Loader2 className="house-spin" aria-hidden="true" />}
                      <span>Update password</span>
                    </button>
                    {passwordMessage && <p role="status">{passwordMessage}</p>}
                  </div>
                </form>
              </div>
            </section>
          )}
        </main>

        <nav className="cx-mobile-nav" aria-label="Mobile navigation">
          {navItems.slice(0, 5).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={section === key ? 'cx-mobile-active' : ''}
              type="button"
              onClick={() => selectSection(key)}
            >
              <Icon aria-hidden="true" />
              <span>{label.replace(' & approvals', '')}</span>
            </button>
          ))}
        </nav>
      </div>

      {mobileMenuOpen && (
        <div className="house-mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation">
          <button className="house-mobile-menu-close" type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)}>
            <X aria-hidden="true" />
          </button>
          <div className="house-mobile-menu-brand"><Home aria-hidden="true" /> House</div>
          <nav>
            {navItems.map(({ key, label, icon: Icon }) => (
              <button key={key} type="button" onClick={() => selectSection(key)}>
                <Icon aria-hidden="true" /> {label}
              </button>
            ))}
            <button type="button" onClick={() => selectSection('admin')}>
              <Settings aria-hidden="true" /> Account & settings
            </button>
          </nav>
        </div>
      )}

      {workOrderOpen && (
        <div className="house-dialog-backdrop" role="presentation">
          <section className="house-dialog" role="dialog" aria-modal="true" aria-labelledby="new-work-title">
            <header>
              <div>
                <p className="cx-kicker">New authoritative record</p>
                <h2 id="new-work-title">Create work order</h2>
              </div>
              <button type="button" aria-label="Close work order form" onClick={() => setWorkOrderOpen(false)}>
                <X aria-hidden="true" />
              </button>
            </header>
            <form onSubmit={handleWorkOrder}>
              <label>
                Title
                <input name="title" required maxLength={140} />
              </label>
              <label>
                Description
                <textarea name="description" rows={4} maxLength={2000} />
              </label>
              <div className="house-form-grid">
                <label>
                  Category
                  <select name="category" defaultValue="maintenance">
                    <option value="maintenance">Maintenance</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="hvac">HVAC</option>
                    <option value="exterior">Exterior</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label>
                  Priority
                  <select name="priority" defaultValue="normal">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </label>
              </div>
              {workOrderError && <p className="house-form-error" role="alert">{workOrderError}</p>}
              <div className="house-dialog-actions">
                <button className="house-secondary-button" type="button" onClick={() => setWorkOrderOpen(false)}>
                  Cancel
                </button>
                <button className="cx-primary-button" disabled={workOrderBusy} type="submit">
                  {workOrderBusy && <Loader2 className="house-spin" aria-hidden="true" />}
                  <span>Create work order</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
