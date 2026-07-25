import { useEffect, useState, type FormEvent } from 'react';
import {
  Archive,
  Check,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Settings2,
  X,
} from 'lucide-react';
import {
  archiveWorkspaceField,
  archiveWorkspacePage,
  createWorkspaceField,
  createWorkspacePage,
  reorderWorkspaceFields,
  reorderWorkspacePages,
  updateWorkspaceField,
  updateWorkspacePage,
} from './data';
import type {
  HouseCustomField,
  HouseFieldType,
  HousePageIcon,
  HouseRole,
  HouseSection,
  HouseWorkspaceData,
  HouseWorkspacePage,
} from './types';
import { workspaceIcon, workspacePageRoute } from './workspace-pages';

const roles: HouseRole[] = ['admin', 'manager', 'owner', 'tenant'];

const iconLabels: Record<HousePageIcon, string> = {
  home: 'Home',
  'clipboard-list': 'Checklist',
  users: 'People',
  'circle-dollar-sign': 'Money',
  'building-2': 'Building',
  inbox: 'Inbox',
  'file-text': 'Document',
  'notebook-tabs': 'Notebook',
  'calendar-days': 'Calendar',
  wrench: 'Tools',
};

const fieldLabels: Record<HouseFieldType, string> = {
  text: 'Short text',
  long_text: 'Long text',
  number: 'Number',
  currency: 'Currency',
  date: 'Date',
  link: 'Link',
  checkbox: 'Checkbox',
};

function RoleChoices({
  selected,
  onChange,
}: {
  selected: HouseRole[];
  onChange: (roles: HouseRole[]) => void;
}) {
  return (
    <fieldset className="house-role-choices">
      <legend>Who can see this?</legend>
      {roles.map((role) => (
        <label key={role}>
          <input
            checked={selected.includes(role)}
            onChange={(event) => {
              const next = event.target.checked
                ? [...selected, role]
                : selected.filter((candidate) => candidate !== role);
              onChange(next.length > 0 ? next : selected);
            }}
            type="checkbox"
          />
          <span>{role}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function WorkspaceNavigation({
  data,
  pages,
  section,
  editMode,
  previewRole,
  activeWorkCount,
  onSelect,
  onRefresh,
}: {
  data: HouseWorkspaceData;
  pages: HouseWorkspacePage[];
  section: HouseSection;
  editMode: boolean;
  previewRole: HouseRole;
  activeWorkCount: number;
  onSelect: (section: HouseSection) => void;
  onRefresh: () => Promise<void>;
}) {
  const [draggedId, setDraggedId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const reorder = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const from = pages.findIndex((page) => page.id === draggedId);
    const to = pages.findIndex((page) => page.id === targetId);
    if (from < 0 || to < 0) return;
    const reordered = [...pages];
    const [dragged] = reordered.splice(from, 1);
    reordered.splice(to, 0, dragged);
    setBusy(true);
    setMessage('');
    try {
      await reorderWorkspacePages(reordered.map((page) => page.id));
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Order could not be saved.');
    } finally {
      setDraggedId('');
      setBusy(false);
    }
  };

  return (
    <>
      {pages.map((page) => {
        const route = workspacePageRoute(page);
        const Icon = workspaceIcon(page.icon);
        const hiddenFromPreview =
          !page.isVisible || !page.visibleRoles.includes(previewRole);
        return (
          <div
            className={`house-nav-row${editMode ? ' house-nav-row-editing' : ''}${hiddenFromPreview ? ' house-nav-row-hidden' : ''}`}
            draggable={editMode && !busy}
            key={page.id}
            onDragEnd={() => setDraggedId('')}
            onDragOver={(event) => {
              if (editMode) event.preventDefault();
            }}
            onDragStart={() => setDraggedId(page.id)}
            onDrop={() => void reorder(page.id)}
          >
            {editMode && (
              <span className="house-nav-grip" title="Drag to reorder">
                <GripVertical aria-hidden="true" />
              </span>
            )}
            <button
              className={`cx-nav-item house-nav-button${section === route ? ' cx-nav-item-active' : ''}`}
              type="button"
              onClick={() => onSelect(route)}
            >
              <Icon aria-hidden="true" />
              <span>{page.label}</span>
              {page.systemKey === 'work' && activeWorkCount > 0 && (
                <span
                  className="cx-nav-count"
                  aria-label={`${activeWorkCount} open work items`}
                >
                  {activeWorkCount}
                </span>
              )}
              {editMode && hiddenFromPreview && (
                <EyeOff className="house-nav-hidden-icon" aria-label={`Hidden from ${previewRole}`} />
              )}
            </button>
          </div>
        );
      })}
      {editMode && (
        <>
          <AddWorkspacePageButton data={data} pages={pages} onRefresh={onRefresh} onSelect={onSelect} />
          {message && <p className="house-nav-error" role="alert">{message}</p>}
        </>
      )}
    </>
  );
}

function AddWorkspacePageButton({
  data,
  pages,
  onRefresh,
  onSelect,
}: {
  data: HouseWorkspaceData;
  pages: HouseWorkspacePage[];
  onRefresh: () => Promise<void>;
  onSelect: (section: HouseSection) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [visibleRoles, setVisibleRoles] = useState<HouseRole[]>(roles);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      const page = await createWorkspacePage({
        propertyId: data.property.id,
        userId: data.profile.id,
        label: String(form.get('label')),
        icon: String(form.get('icon')) as HousePageIcon,
        visibleRoles,
        sortOrder: pages.length,
      });
      await onRefresh();
      setOpen(false);
      onSelect(`page:${page.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Page could not be added.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button className="house-add-nav-button" type="button" onClick={() => setOpen(true)}>
        <Plus aria-hidden="true" /> Add workspace item
      </button>
      {open && (
        <div className="house-dialog-backdrop" role="presentation">
          <section className="house-dialog" role="dialog" aria-modal="true" aria-labelledby="add-page-title">
            <header>
              <div>
                <p className="cx-kicker">Site structure</p>
                <h2 id="add-page-title">Add workspace page</h2>
              </div>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)}>
                <X aria-hidden="true" />
              </button>
            </header>
            <form onSubmit={submit}>
              <p className="house-form-error">
                This page will be part of the same private property workspace.
              </p>
              <label>
                Page name
                <input autoFocus maxLength={60} name="label" required />
              </label>
              <label>
                Icon
                <select defaultValue="file-text" name="icon">
                  {(Object.keys(iconLabels) as HousePageIcon[]).map((icon) => (
                    <option key={icon} value={icon}>{iconLabels[icon]}</option>
                  ))}
                </select>
              </label>
              <RoleChoices selected={visibleRoles} onChange={setVisibleRoles} />
              {message && <p className="house-form-error" role="alert">{message}</p>}
              <div className="house-dialog-actions">
                <button className="house-secondary-button" type="button" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button className="cx-primary-button" disabled={busy} type="submit">
                  {busy ? <Loader2 className="house-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
                  <span>Add page</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

export function WorkspacePageControls({
  page,
  coreFields,
  onRefresh,
  onRemoved,
}: {
  page: HouseWorkspacePage;
  coreFields?: Array<{ key: string; label: string }>;
  onRefresh: () => Promise<void>;
  onRemoved: () => void;
}) {
  const [label, setLabel] = useState(page.label);
  const [icon, setIcon] = useState(page.icon);
  const [visibleRoles, setVisibleRoles] = useState(page.visibleRoles);
  const [isVisible, setIsVisible] = useState(page.isVisible);
  const [hiddenCoreFields, setHiddenCoreFields] = useState(page.hiddenCoreFields);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLabel(page.label);
    setIcon(page.icon);
    setVisibleRoles(page.visibleRoles);
    setIsVisible(page.isVisible);
    setHiddenCoreFields(page.hiddenCoreFields);
    setMessage('');
  }, [page]);

  const save = async () => {
    setBusy(true);
    setMessage('');
    try {
      await updateWorkspacePage({
        id: page.id,
        label,
        icon,
        visibleRoles,
        isVisible,
        hiddenCoreFields,
      });
      await onRefresh();
      setMessage('Page settings saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Page settings could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (page.systemKey || !window.confirm(`Remove “${page.label}” from this workspace?`)) {
      return;
    }
    setBusy(true);
    try {
      await archiveWorkspacePage(page.id);
      await onRefresh();
      onRemoved();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Page could not be removed.');
      setBusy(false);
    }
  };

  return (
    <section className="house-page-controls" aria-label={`Edit ${page.label} page`}>
      <div className="house-page-controls-heading">
        <span><Settings2 aria-hidden="true" /> Page settings</span>
        <small>Changes apply to this live workspace.</small>
      </div>
      <div className="house-page-controls-grid">
        <label>
          Sidebar name
          <input maxLength={60} value={label} onChange={(event) => setLabel(event.target.value)} />
        </label>
        <label>
          Icon
          <select value={icon} onChange={(event) => setIcon(event.target.value as HousePageIcon)}>
            {(Object.keys(iconLabels) as HousePageIcon[]).map((candidate) => (
              <option key={candidate} value={candidate}>{iconLabels[candidate]}</option>
            ))}
          </select>
        </label>
        <RoleChoices selected={visibleRoles} onChange={setVisibleRoles} />
        <label className="house-visibility-toggle">
          <input checked={isVisible} onChange={(event) => setIsVisible(event.target.checked)} type="checkbox" />
          {isVisible ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
          Shown in navigation
        </label>
      </div>
      {coreFields && coreFields.length > 0 && (
        <fieldset className="house-core-field-controls">
          <legend>Details shown on this page</legend>
          {coreFields.map((field) => {
            const shown = !hiddenCoreFields.includes(field.key);
            return (
              <label key={field.key}>
                <input
                  checked={shown}
                  onChange={(event) =>
                    setHiddenCoreFields((current) =>
                      event.target.checked
                        ? current.filter((key) => key !== field.key)
                        : [...current, field.key],
                    )
                  }
                  type="checkbox"
                />
                <span>{field.label}</span>
              </label>
            );
          })}
        </fieldset>
      )}
      <div className="house-page-controls-actions">
        {!page.systemKey && (
          <button className="house-remove-button" disabled={busy} type="button" onClick={() => void remove()}>
            <Archive aria-hidden="true" /> Remove page
          </button>
        )}
        <span className="house-editor-message" role="status">{message}</span>
        <button className="cx-primary-button" disabled={busy || !label.trim()} type="button" onClick={() => void save()}>
          {busy ? <Loader2 className="house-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
          <span>Save page</span>
        </button>
      </div>
    </section>
  );
}

function formattedFieldValue(field: HouseCustomField) {
  if (field.fieldType === 'currency') {
    const number = Number(field.value);
    return Number.isFinite(number)
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number)
      : field.value;
  }
  if (field.fieldType === 'number') {
    const number = Number(field.value);
    return Number.isFinite(number) ? number.toLocaleString() : field.value;
  }
  if (field.fieldType === 'date' && field.value) {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(
      new Date(`${field.value}T00:00:00`),
    );
  }
  if (field.fieldType === 'checkbox') {
    return ['true', 'yes', '1', 'on'].includes(field.value.toLowerCase()) ? 'Yes' : 'No';
  }
  return field.value || 'Not recorded';
}

export function WorkspaceCustomFields({
  data,
  page,
  editMode,
  previewRole,
  onRefresh,
}: {
  data: HouseWorkspaceData;
  page: HouseWorkspacePage;
  editMode: boolean;
  previewRole: HouseRole;
  onRefresh: () => Promise<void>;
}) {
  const allFields = data.customFields
    .filter((field) => field.pageId === page.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const fields = editMode
    ? allFields
    : allFields.filter(
        (field) => field.isVisible && field.visibleRoles.includes(previewRole),
      );
  const [adding, setAdding] = useState(false);
  const [draggedId, setDraggedId] = useState('');

  const reorder = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const from = allFields.findIndex((field) => field.id === draggedId);
    const to = allFields.findIndex((field) => field.id === targetId);
    const reordered = [...allFields];
    const [dragged] = reordered.splice(from, 1);
    reordered.splice(to, 0, dragged);
    await reorderWorkspaceFields(reordered.map((field) => field.id));
    setDraggedId('');
    await onRefresh();
  };

  if (!editMode && fields.length === 0) return null;

  return (
    <section className="house-custom-fields" aria-labelledby={`custom-fields-${page.id}`}>
      <div className="house-section-subhead">
        <div>
          <p className="cx-kicker">{editMode ? 'Flexible content' : 'Additional details'}</p>
          <h3 id={`custom-fields-${page.id}`}>{editMode ? 'Custom fields' : 'More information'}</h3>
        </div>
        {editMode && (
          <button className="house-secondary-button" type="button" onClick={() => setAdding(true)}>
            <Plus aria-hidden="true" /> Add field
          </button>
        )}
      </div>
      <div className={`house-custom-field-grid${editMode ? ' house-custom-field-grid-editing' : ''}`}>
        {fields.map((field) =>
          editMode ? (
            <CustomFieldEditor
              field={field}
              key={field.id}
              onDragStart={() => setDraggedId(field.id)}
              onDrop={() => void reorder(field.id)}
              onRefresh={onRefresh}
            />
          ) : (
            <article className="house-custom-field" key={field.id}>
              <p>{field.label}</p>
              {field.fieldType === 'link' && field.value ? (
                <a href={field.value} target="_blank" rel="noreferrer">{field.value}</a>
              ) : (
                <strong>{formattedFieldValue(field)}</strong>
              )}
            </article>
          ),
        )}
        {editMode && fields.length === 0 && (
          <button className="house-add-field-empty" type="button" onClick={() => setAdding(true)}>
            <Plus aria-hidden="true" />
            <strong>Add the first field</strong>
            <span>Text, numbers, dates, links, and more.</span>
          </button>
        )}
      </div>
      {adding && (
        <AddCustomFieldDialog
          data={data}
          page={page}
          sortOrder={allFields.length}
          onClose={() => setAdding(false)}
          onRefresh={onRefresh}
        />
      )}
    </section>
  );
}

function CustomFieldEditor({
  field,
  onRefresh,
  onDragStart,
  onDrop,
}: {
  field: HouseCustomField;
  onRefresh: () => Promise<void>;
  onDragStart: () => void;
  onDrop: () => void;
}) {
  const [label, setLabel] = useState(field.label);
  const [fieldType, setFieldType] = useState(field.fieldType);
  const [value, setValue] = useState(field.value);
  const [visibleRoles, setVisibleRoles] = useState(field.visibleRoles);
  const [isVisible, setIsVisible] = useState(field.isVisible);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const save = async () => {
    setBusy(true);
    setMessage('');
    try {
      await updateWorkspaceField({
        id: field.id,
        label,
        fieldType,
        value,
        visibleRoles,
        isVisible,
      });
      await onRefresh();
      setMessage('Saved');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Remove “${field.label}”?`)) return;
    setBusy(true);
    try {
      await archiveWorkspaceField(field.id);
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not remove.');
      setBusy(false);
    }
  };

  return (
    <article
      className={`house-custom-field-editor${field.isVisible ? '' : ' house-custom-field-editor-hidden'}`}
      draggable
      onDragEnd={() => undefined}
      onDragOver={(event) => event.preventDefault()}
      onDragStart={onDragStart}
      onDrop={onDrop}
    >
      <div className="house-custom-field-editor-head">
        <span><GripVertical aria-hidden="true" /> Drag to reorder</span>
        <button aria-label={`Remove ${field.label}`} disabled={busy} type="button" onClick={() => void remove()}>
          <Archive aria-hidden="true" />
        </button>
      </div>
      <label>
        Field name
        <input value={label} onChange={(event) => setLabel(event.target.value)} />
      </label>
      <label>
        Type
        <select value={fieldType} onChange={(event) => setFieldType(event.target.value as HouseFieldType)}>
          {(Object.keys(fieldLabels) as HouseFieldType[]).map((type) => (
            <option key={type} value={type}>{fieldLabels[type]}</option>
          ))}
        </select>
      </label>
      <label>
        Value
        {fieldType === 'long_text' ? (
          <textarea rows={4} value={value} onChange={(event) => setValue(event.target.value)} />
        ) : fieldType === 'checkbox' ? (
          <select value={value} onChange={(event) => setValue(event.target.value)}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        ) : (
          <input
            type={fieldType === 'date' ? 'date' : fieldType === 'number' || fieldType === 'currency' ? 'number' : fieldType === 'link' ? 'url' : 'text'}
            step={fieldType === 'currency' ? '0.01' : undefined}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        )}
      </label>
      <RoleChoices selected={visibleRoles} onChange={setVisibleRoles} />
      <div className="house-custom-field-editor-actions">
        <label>
          <input checked={isVisible} onChange={(event) => setIsVisible(event.target.checked)} type="checkbox" />
          Visible
        </label>
        <span role="status">{message}</span>
        <button className="house-field-save" disabled={busy || !label.trim()} type="button" onClick={() => void save()}>
          {busy ? <Loader2 className="house-spin" aria-hidden="true" /> : <Check aria-hidden="true" />}
          Save
        </button>
      </div>
    </article>
  );
}

function AddCustomFieldDialog({
  data,
  page,
  sortOrder,
  onClose,
  onRefresh,
}: {
  data: HouseWorkspaceData;
  page: HouseWorkspacePage;
  sortOrder: number;
  onClose: () => void;
  onRefresh: () => Promise<void>;
}) {
  const [visibleRoles, setVisibleRoles] = useState<HouseRole[]>(roles);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setMessage('');
    try {
      await createWorkspaceField({
        propertyId: data.property.id,
        pageId: page.id,
        userId: data.profile.id,
        label: String(form.get('label')),
        fieldType: String(form.get('fieldType')) as HouseFieldType,
        value: String(form.get('value') ?? ''),
        visibleRoles,
        sortOrder,
      });
      await onRefresh();
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Field could not be added.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="house-dialog-backdrop" role="presentation">
      <section className="house-dialog" role="dialog" aria-modal="true" aria-labelledby="add-field-title">
        <header>
          <div>
            <p className="cx-kicker">{page.label}</p>
            <h2 id="add-field-title">Add a field</h2>
          </div>
          <button type="button" aria-label="Close" onClick={onClose}><X aria-hidden="true" /></button>
        </header>
        <form onSubmit={submit}>
          <label>
            Field name
            <input autoFocus maxLength={80} name="label" required />
          </label>
          <label>
            Type
            <select defaultValue="text" name="fieldType">
              {(Object.keys(fieldLabels) as HouseFieldType[]).map((type) => (
                <option key={type} value={type}>{fieldLabels[type]}</option>
              ))}
            </select>
          </label>
          <label>
            Starting value
            <textarea name="value" rows={3} />
          </label>
          <RoleChoices selected={visibleRoles} onChange={setVisibleRoles} />
          {message && <p className="house-form-error" role="alert">{message}</p>}
          <div className="house-dialog-actions">
            <button className="house-secondary-button" type="button" onClick={onClose}>Cancel</button>
            <button className="cx-primary-button" disabled={busy} type="submit">
              {busy ? <Loader2 className="house-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
              <span>Add field</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
