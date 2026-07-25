import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  AlertCircle,
  Building2,
  Camera,
  CheckCircle2,
  ClipboardList,
  FileText,
  Images,
  KeyRound,
  Link2,
  Loader2,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  UserPlus,
  Users,
  WalletCards,
} from 'lucide-react';
import {
  addHouseExternalDocument,
  deleteHouseDocument,
  deleteHouseLedgerEntry,
  deleteHousePhoto,
  provisionHouseUser,
  saveHouseLease,
  saveHouseLedgerEntry,
  saveOwnerFinancials,
  setHouseUserPassword,
  updateHouseDocument,
  updateHouseMembership,
  updateHousePerson,
  updateHousePhoto,
  updateHouseProperty,
  updateHouseWorkOrder,
  updateHousehold,
  uploadHouseDocument,
  uploadHousePhoto,
} from './data';
import type {
  HouseFileVisibility,
  HouseRole,
  HouseWorkspaceData,
} from './types';

export type HouseAdminPanel =
  | 'property'
  | 'people'
  | 'money'
  | 'work'
  | 'files';

interface HouseAdminProps {
  data: HouseWorkspaceData;
  embedded?: boolean;
  initialPanel?: HouseAdminPanel;
  onRefresh: () => Promise<void>;
  peopleMode?: 'all' | 'contacts' | 'access';
}

const panelItems = [
  {
    key: 'property' as const,
    label: 'Property',
    description: 'Address, facts, and household',
    icon: Building2,
  },
  {
    key: 'people' as const,
    label: 'People & access',
    description: 'Contacts, roles, and passwords',
    icon: Users,
  },
  {
    key: 'money' as const,
    label: 'Lease & money',
    description: 'Rent, mortgage, and ledger',
    icon: WalletCards,
  },
  {
    key: 'work' as const,
    label: 'Work',
    description: 'Status, priority, and details',
    icon: ClipboardList,
  },
  {
    key: 'files' as const,
    label: 'Photos & files',
    description: 'Uploads, links, and captions',
    icon: Images,
  },
];

const fieldClass =
  'mt-1.5 min-h-11 w-full rounded-xl border border-[#d8d2c5] bg-white px-3.5 py-2.5 text-sm text-[#1d2b25] outline-none transition-all duration-200 focus:border-[#2f5c49] focus:ring-4 focus:ring-[#2f5c49]/10 disabled:cursor-not-allowed disabled:bg-[#f0ece4]';
const labelClass =
  'block text-[11px] font-bold uppercase tracking-[0.07em] text-[#687168]';
const cardClass =
  'rounded-2xl border border-[#e1dbcf] bg-[#fffdf7] p-5 shadow-sm md:p-6';
const primaryButtonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2f5c49] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#234838] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#2f5c49]/20 disabled:cursor-wait disabled:opacity-60';
const secondaryButtonClass =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#c9c1b3] bg-white px-3.5 py-2 text-sm font-bold text-[#28483b] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2f5c49] hover:bg-[#f6f4ed] focus:outline-none focus:ring-4 focus:ring-[#2f5c49]/10 disabled:cursor-wait disabled:opacity-60';
const dangerButtonClass =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#dfb8ad] bg-[#fff8f5] px-3.5 py-2 text-sm font-bold text-[#8c3f30] transition-all duration-200 hover:border-[#b76753] hover:bg-[#f8e4de] focus:outline-none focus:ring-4 focus:ring-[#a6533d]/10 disabled:cursor-wait disabled:opacity-60';

function stringValue(form: FormData, name: string) {
  return String(form.get(name) ?? '').trim();
}

function nullableNumber(form: FormData, name: string) {
  const value = stringValue(form, name);
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${name} must be a number.`);
  return parsed;
}

function requiredNumber(form: FormData, name: string) {
  const value = nullableNumber(form, name);
  if (value === null) throw new Error(`${name} is required.`);
  return value;
}

function isChecked(form: FormData, name: string) {
  return form.get(name) === 'on';
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function verifiedCopy(verified: boolean) {
  return verified ? 'Verified record' : 'Recovered · needs verification';
}

function EditorCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className={cardClass}>
      <header className="mb-5 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#dfe9df] text-[#2f5c49] [&>svg]:size-5">
          {icon}
        </span>
        <div>
          <h3 className="font-['Newsreader'] text-2xl leading-tight text-[#1d2b25]">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#687168]">{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function SaveButton({
  busy,
  disabled = false,
  label = 'Save changes',
}: {
  busy: boolean;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      className={primaryButtonClass}
      disabled={busy || disabled}
      type="submit"
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Save className="size-4" aria-hidden="true" />
      )}
      {label}
    </button>
  );
}

function VerifiedField({
  name = 'verified',
  defaultChecked,
}: {
  name?: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-[#ded8cb] bg-[#f8f5ee] px-3.5 text-sm font-semibold text-[#34473f]">
      <input
        className="size-4 accent-[#2f5c49]"
        defaultChecked={defaultChecked}
        name={name}
        type="checkbox"
      />
      Mark this record as verified
    </label>
  );
}

function VisibilitySelect({
  defaultValue,
  name = 'visibility',
}: {
  defaultValue: HouseFileVisibility;
  name?: string;
}) {
  return (
    <select className={fieldClass} defaultValue={defaultValue} name={name}>
      <option value="shared">Everyone with House access</option>
      <option value="manager_owner">Manager and owner</option>
      <option value="owner">Owner only</option>
      <option value="tenant">Manager and tenant</option>
    </select>
  );
}

export default function HouseAdmin({
  data,
  embedded = false,
  initialPanel = 'property',
  onRefresh,
  peopleMode = 'all',
}: HouseAdminProps) {
  const [panel, setPanel] = useState<HouseAdminPanel>(initialPanel);
  const [busyKey, setBusyKey] = useState('');
  const [notice, setNotice] = useState<{
    tone: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => setPanel(initialPanel), [initialPanel]);

  const run = async (
    key: string,
    successMessage: string,
    action: () => Promise<unknown>,
  ) => {
    setBusyKey(key);
    setNotice(null);
    try {
      await action();
      await onRefresh();
      setNotice({ tone: 'success', message: successMessage });
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'That change could not be saved.',
      });
    } finally {
      setBusyKey('');
    }
  };

  const handleProperty = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run('property', 'Property details saved.', () =>
      updateHouseProperty({
        id: data.property.id,
        nickname: stringValue(form, 'nickname'),
        address: stringValue(form, 'address'),
        unitNumber: stringValue(form, 'unitNumber'),
        propertyType: stringValue(form, 'propertyType') as
          | 'single_family'
          | 'condo'
          | 'townhouse'
          | 'multi_family'
          | 'other'
          | '',
        yearBuilt: nullableNumber(form, 'yearBuilt'),
        squareFootage: nullableNumber(form, 'squareFootage'),
        bedrooms: nullableNumber(form, 'bedrooms'),
        bathrooms: nullableNumber(form, 'bathrooms'),
        purchasePrice: nullableNumber(form, 'purchasePrice'),
        purchaseDate: stringValue(form, 'purchaseDate'),
        currentMarketValue: nullableNumber(form, 'currentMarketValue'),
        landValue: nullableNumber(form, 'landValue'),
        verified: isChecked(form, 'verified'),
      }),
    );
  };

  const handleHousehold = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data.household) return;
    const form = new FormData(event.currentTarget);
    void run('household', 'Household details saved.', () =>
      updateHousehold({
        id: data.household!.id,
        name: stringValue(form, 'name'),
        status: stringValue(form, 'status'),
        verified: isChecked(form, 'verified'),
      }),
    );
  };

  const handlePerson = (
    event: FormEvent<HTMLFormElement>,
    personId: string,
  ) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run(`person-${personId}`, 'Contact saved.', () =>
      updateHousePerson({
        id: personId,
        displayName: stringValue(form, 'displayName'),
        email: stringValue(form, 'email'),
        phone: stringValue(form, 'phone'),
        notes: stringValue(form, 'notes'),
        verified: isChecked(form, 'verified'),
      }),
    );
  };

  const handleMembership = (
    event: FormEvent<HTMLFormElement>,
    membershipId: string,
  ) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run(`membership-${membershipId}`, 'Access updated.', () =>
      updateHouseMembership({
        membershipId,
        role: stringValue(form, 'role') as HouseRole,
        status: stringValue(form, 'status') as
          | 'invited'
          | 'active'
          | 'suspended'
          | 'revoked',
      }),
    );
  };

  const handlePassword = (
    event: FormEvent<HTMLFormElement>,
    profileId: string,
  ) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const temporaryPassword = stringValue(form, 'temporaryPassword');
    if (temporaryPassword.length < 6) {
      setNotice({
        tone: 'error',
        message: 'Temporary passwords must have at least 6 characters.',
      });
      return;
    }
    void run(`password-${profileId}`, 'Temporary password set.', async () => {
      await setHouseUserPassword({
        propertyId: data.property.id,
        profileId,
        temporaryPassword,
      });
      formElement.reset();
    });
  };

  const handleProvisionUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const temporaryPassword = stringValue(form, 'temporaryPassword');
    if (temporaryPassword.length < 6) {
      setNotice({
        tone: 'error',
        message: 'Temporary passwords must have at least 6 characters.',
      });
      return;
    }
    void run('provision-user', 'Login created and connected to House.', async () => {
      await provisionHouseUser({
        propertyId: data.property.id,
        householdId: data.household?.id ?? null,
        email: stringValue(form, 'email'),
        displayName: stringValue(form, 'displayName'),
        role: stringValue(form, 'role') as HouseRole,
        temporaryPassword,
      });
      formElement.reset();
    });
  };

  const handleLease = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data.household) {
      setNotice({
        tone: 'error',
        message: 'Create a household before creating a lease.',
      });
      return;
    }
    const form = new FormData(event.currentTarget);
    void run('lease', 'Lease saved.', () =>
      saveHouseLease({
        id: data.lease?.id ?? null,
        propertyId: data.property.id,
        householdId: data.household!.id,
        status: stringValue(form, 'status') as
          | 'draft'
          | 'active'
          | 'expired'
          | 'terminated',
        startsOn: stringValue(form, 'startsOn'),
        endsOn: stringValue(form, 'endsOn'),
        monthlyRent: requiredNumber(form, 'monthlyRent'),
        monthlyUtilities: requiredNumber(form, 'monthlyUtilities'),
        securityDeposit: nullableNumber(form, 'securityDeposit'),
        notes: stringValue(form, 'notes'),
        verified: isChecked(form, 'verified'),
      }),
    );
  };

  const handleFinancials = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run('financials', 'Owner financial inputs saved.', () =>
      saveOwnerFinancials({
        propertyId: data.property.id,
        mortgagePrincipal: nullableNumber(form, 'mortgagePrincipal'),
        mortgageInterestRate: nullableNumber(form, 'mortgageInterestRate'),
        mortgagePrincipalInterest: nullableNumber(
          form,
          'mortgagePrincipalInterest',
        ),
        mortgageEscrow: nullableNumber(form, 'mortgageEscrow'),
        mortgagePayment: nullableNumber(form, 'mortgagePayment'),
        originalLoanAmount: nullableNumber(form, 'originalLoanAmount'),
        loanStartedOn: stringValue(form, 'loanStartedOn'),
        loanTermYears: nullableNumber(form, 'loanTermYears'),
        lenderLabel: stringValue(form, 'lenderLabel'),
        annualIncome: nullableNumber(form, 'annualIncome'),
        stateIncomeTaxRate: nullableNumber(form, 'stateIncomeTaxRate'),
        capitalImprovementsCost: nullableNumber(
          form,
          'capitalImprovementsCost',
        ),
        depreciableValue: nullableNumber(form, 'depreciableValue'),
        estimatedSellingCosts: nullableNumber(form, 'estimatedSellingCosts'),
        verified: isChecked(form, 'verified'),
      }),
    );
  };

  const handleLedger = (
    event: FormEvent<HTMLFormElement>,
    entryId: string | null,
  ) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    void run(
      `ledger-${entryId ?? 'new'}`,
      entryId ? 'Ledger entry saved.' : 'Ledger entry added.',
      async () => {
        await saveHouseLedgerEntry({
          id: entryId,
          propertyId: data.property.id,
          householdId: data.household?.id ?? null,
          userId: data.profile.id,
          kind: stringValue(form, 'kind') as
            | 'rent_charge'
            | 'payment'
            | 'expense'
            | 'adjustment'
            | 'refund'
            | 'deposit',
          amount: requiredNumber(form, 'amount'),
          effectiveOn: stringValue(form, 'effectiveOn'),
          description: stringValue(form, 'description'),
          status: stringValue(form, 'status') as 'draft' | 'posted' | 'void',
        });
        if (!entryId) formElement.reset();
      },
    );
  };

  const handleWork = (
    event: FormEvent<HTMLFormElement>,
    workOrderId: string,
  ) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run(`work-${workOrderId}`, 'Work order saved.', () =>
      updateHouseWorkOrder({
        id: workOrderId,
        title: stringValue(form, 'title'),
        description: stringValue(form, 'description'),
        category: stringValue(form, 'category'),
        status: stringValue(form, 'status') as
          | 'reported'
          | 'triage'
          | 'waiting_approval'
          | 'approved'
          | 'scheduled'
          | 'in_progress'
          | 'completed'
          | 'cancelled',
        priority: stringValue(form, 'priority') as
          | 'low'
          | 'normal'
          | 'high'
          | 'urgent',
        responsibility: stringValue(form, 'responsibility'),
        dueOn: stringValue(form, 'dueOn'),
        verified: isChecked(form, 'verified'),
      }),
    );
  };

  const handlePhotoUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const file = form.get('file');
    if (!(file instanceof File) || file.size === 0) {
      setNotice({ tone: 'error', message: 'Choose an image to upload.' });
      return;
    }
    void run('photo-upload', 'Photo uploaded.', async () => {
      await uploadHousePhoto({
        propertyId: data.property.id,
        userId: data.profile.id,
        file,
        caption: stringValue(form, 'caption'),
        visibility: stringValue(form, 'visibility') as HouseFileVisibility,
        sortOrder: data.photos.length,
      });
      formElement.reset();
    });
  };

  const handlePhoto = (
    event: FormEvent<HTMLFormElement>,
    photoId: string,
  ) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run(`photo-${photoId}`, 'Photo details saved.', () =>
      updateHousePhoto({
        id: photoId,
        caption: stringValue(form, 'caption'),
        category: stringValue(form, 'category'),
        visibility: stringValue(form, 'visibility') as HouseFileVisibility,
        sortOrder: requiredNumber(form, 'sortOrder'),
        verified: isChecked(form, 'verified'),
      }),
    );
  };

  const handleDocumentUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const file = form.get('file');
    if (!(file instanceof File) || file.size === 0) {
      setNotice({ tone: 'error', message: 'Choose a document to upload.' });
      return;
    }
    void run('document-upload', 'Document uploaded.', async () => {
      await uploadHouseDocument({
        propertyId: data.property.id,
        leaseId: data.lease?.id ?? null,
        userId: data.profile.id,
        file,
        category: stringValue(form, 'category'),
        visibility: stringValue(form, 'visibility') as HouseFileVisibility,
      });
      formElement.reset();
    });
  };

  const handleExternalDocument = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    void run('external-document', 'Document link added.', async () => {
      await addHouseExternalDocument({
        propertyId: data.property.id,
        leaseId: data.lease?.id ?? null,
        userId: data.profile.id,
        fileName: stringValue(form, 'fileName'),
        category: stringValue(form, 'category'),
        externalUrl: stringValue(form, 'externalUrl'),
        visibility: stringValue(form, 'visibility') as HouseFileVisibility,
      });
      formElement.reset();
    });
  };

  const handleDocument = (
    event: FormEvent<HTMLFormElement>,
    documentId: string,
  ) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run(`document-${documentId}`, 'Document details saved.', () =>
      updateHouseDocument({
        id: documentId,
        fileName: stringValue(form, 'fileName'),
        category: stringValue(form, 'category'),
        externalUrl: stringValue(form, 'externalUrl'),
        visibility: stringValue(form, 'visibility') as HouseFileVisibility,
        verified: isChecked(form, 'verified'),
      }),
    );
  };

  return (
    <section
      className={`mx-auto w-full [color-scheme:light]${embedded ? '' : ' max-w-[1120px]'}`}
      aria-label={embedded ? 'Edit House records' : undefined}
      aria-labelledby={embedded ? undefined : 'house-manage-title'}
    >
      {!embedded && (
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-[#d7d0c3] bg-[#fffdf7] p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="cx-kicker">Administrator editing</p>
          <h2
            className="mt-1 font-['Newsreader'] text-3xl leading-tight text-[#1d2b25] md:text-4xl"
            id="house-manage-title"
          >
            Manage House
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687168]">
            Change the live property record here. Saves go directly to the
            private database and appear immediately in every permitted view.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#dfe9df] px-3 py-2 text-xs font-bold text-[#285440]">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Only administrators see this
        </span>
        </div>
      )}

      {notice && (
        <div
          className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            notice.tone === 'success'
              ? 'border-[#bdd4c5] bg-[#edf6ef] text-[#285440]'
              : 'border-[#e1b8ad] bg-[#fff3ef] text-[#8c3f30]'
          }`}
          role={notice.tone === 'error' ? 'alert' : 'status'}
        >
          {notice.tone === 'success' ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {!embedded && (
        <nav
          className="mb-5 grid grid-cols-2 gap-2 lg:grid-cols-5"
          aria-label="Manage House sections"
        >
        {panelItems.map(({ key, label, description, icon: Icon }) => (
          <button
            className={`group min-h-24 rounded-2xl border p-3.5 text-left transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#2f5c49]/15 ${
              panel === key
                ? 'border-[#2f5c49] bg-[#2f5c49] text-white shadow-md'
                : 'border-[#ddd6c9] bg-[#fffdf7] text-[#1d2b25] hover:-translate-y-0.5 hover:border-[#8da697] hover:shadow-sm'
            }`}
            key={key}
            onClick={() => setPanel(key)}
            type="button"
          >
            <Icon
              className={`mb-2 size-5 ${
                panel === key ? 'text-[#d7e9dc]' : 'text-[#537463]'
              }`}
              aria-hidden="true"
            />
            <strong className="block text-sm">{label}</strong>
            <small
              className={`mt-1 hidden text-[10px] leading-4 sm:block ${
                panel === key ? 'text-[#cbded2]' : 'text-[#7a817b]'
              }`}
            >
              {description}
            </small>
          </button>
        ))}
        </nav>
      )}

      <div className="grid gap-5">
        {panel === 'property' && (
          <>
            <EditorCard
              icon={<Building2 aria-hidden="true" />}
              title="Property details"
              description="These fields power the House cover, property page, and financial summary."
            >
              <form className="grid gap-4" onSubmit={handleProperty}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className={labelClass}>
                    Property name
                    <input
                      className={fieldClass}
                      defaultValue={data.property.nickname}
                      maxLength={120}
                      name="nickname"
                    />
                  </label>
                  <label className={labelClass}>
                    Property type
                    <select
                      className={fieldClass}
                      defaultValue={data.property.propertyType ?? ''}
                      name="propertyType"
                    >
                      <option value="">Not recorded</option>
                      <option value="single_family">Single family</option>
                      <option value="condo">Condo</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="multi_family">Multi-family</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                  <label className={labelClass}>
                    Street address
                    <input
                      className={fieldClass}
                      defaultValue={data.property.address}
                      name="address"
                      required
                    />
                  </label>
                  <label className={labelClass}>
                    Unit
                    <input
                      className={fieldClass}
                      defaultValue={data.property.unitNumber ?? ''}
                      name="unitNumber"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                  <label className={labelClass}>
                    Year built
                    <input
                      className={fieldClass}
                      defaultValue={data.property.yearBuilt ?? ''}
                      min="1600"
                      name="yearBuilt"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    Square feet
                    <input
                      className={fieldClass}
                      defaultValue={data.property.squareFootage ?? ''}
                      min="0"
                      name="squareFootage"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    Bedrooms
                    <input
                      className={fieldClass}
                      defaultValue={data.property.bedrooms ?? ''}
                      min="0"
                      name="bedrooms"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    Bathrooms
                    <input
                      className={fieldClass}
                      defaultValue={data.property.bathrooms ?? ''}
                      min="0"
                      name="bathrooms"
                      step="0.5"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    Purchase date
                    <input
                      className={fieldClass}
                      defaultValue={data.property.purchaseDate ?? ''}
                      name="purchaseDate"
                      type="date"
                    />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className={labelClass}>
                    Purchase price
                    <input
                      className={fieldClass}
                      defaultValue={data.property.purchasePrice ?? ''}
                      min="0"
                      name="purchasePrice"
                      step="0.01"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    Current market value
                    <input
                      className={fieldClass}
                      defaultValue={data.property.currentMarketValue ?? ''}
                      min="0"
                      name="currentMarketValue"
                      step="0.01"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    Land value
                    <input
                      className={fieldClass}
                      defaultValue={data.property.landValue ?? ''}
                      min="0"
                      name="landValue"
                      step="0.01"
                      type="number"
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-3 border-t border-[#e8e2d7] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <VerifiedField defaultChecked={data.property.verified} />
                  <SaveButton busy={busyKey === 'property'} />
                </div>
              </form>
            </EditorCard>

            {data.household && (
              <EditorCard
                icon={<Users aria-hidden="true" />}
                title="Household"
                description="The tenant household label appears in lease and access records."
              >
                <form className="grid gap-4" onSubmit={handleHousehold}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className={labelClass}>
                      Household name
                      <input
                        className={fieldClass}
                        defaultValue={data.household.name}
                        name="name"
                        required
                      />
                    </label>
                    <label className={labelClass}>
                      Status
                      <select
                        className={fieldClass}
                        defaultValue={data.household.status}
                        name="status"
                      >
                        <option value="active">Active</option>
                        <option value="former">Former</option>
                        <option value="prospective">Prospective</option>
                      </select>
                    </label>
                  </div>
                  <div className="flex flex-col gap-3 border-t border-[#e8e2d7] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <VerifiedField defaultChecked={data.household.verified} />
                    <SaveButton busy={busyKey === 'household'} />
                  </div>
                </form>
              </EditorCard>
            )}
          </>
        )}

        {panel === 'people' && (
          <>
            {peopleMode !== 'access' && (
              <EditorCard
              icon={<Users aria-hidden="true" />}
              title="People"
              description="Edit the names and contact details shown throughout House."
            >
              <div className="grid gap-3 lg:grid-cols-2">
                {data.people.map((person) => (
                  <details
                    className="group rounded-xl border border-[#ded8cc] bg-white"
                    key={person.id}
                  >
                    <summary className="cursor-pointer list-none p-4 focus:outline-none focus:ring-4 focus:ring-[#2f5c49]/10">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#eadbbd] text-xs font-extrabold text-[#29483b]">
                          {person.displayName
                            .split(' ')
                            .map((part) => part[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <strong className="block truncate text-sm text-[#1d2b25]">
                            {person.displayName}
                          </strong>
                          <small className="block truncate text-xs text-[#747b75]">
                            {person.email || 'No email'} ·{' '}
                            {verifiedCopy(person.verified)}
                          </small>
                        </span>
                      </div>
                    </summary>
                    <form
                      className="grid gap-3 border-t border-[#e7e1d6] p-4"
                      onSubmit={(event) => handlePerson(event, person.id)}
                    >
                      <label className={labelClass}>
                        Name
                        <input
                          className={fieldClass}
                          defaultValue={person.displayName}
                          name="displayName"
                          required
                        />
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className={labelClass}>
                          Contact email
                          <input
                            className={fieldClass}
                            defaultValue={person.email ?? ''}
                            name="email"
                            type="email"
                          />
                        </label>
                        <label className={labelClass}>
                          Phone
                          <input
                            className={fieldClass}
                            defaultValue={person.phone ?? ''}
                            name="phone"
                            type="tel"
                          />
                        </label>
                      </div>
                      <label className={labelClass}>
                        Notes
                        <textarea
                          className={fieldClass}
                          defaultValue={person.notes ?? ''}
                          name="notes"
                          rows={3}
                        />
                      </label>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <VerifiedField defaultChecked={person.verified} />
                        <SaveButton busy={busyKey === `person-${person.id}`} />
                      </div>
                    </form>
                  </details>
                ))}
              </div>
              </EditorCard>
            )}

            {peopleMode !== 'contacts' && (
              <>
                <EditorCard
              icon={<KeyRound aria-hidden="true" />}
              title="Logins and roles"
              description="Control who can sign in, what they can see, and issue a temporary password."
            >
              <div className="grid gap-3">
                {data.accessMembers.map((member) => (
                  <details
                    className="group rounded-xl border border-[#ded8cc] bg-white"
                    key={member.membershipId}
                  >
                    <summary className="cursor-pointer list-none p-4 focus:outline-none focus:ring-4 focus:ring-[#2f5c49]/10">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span>
                          <strong className="block text-sm text-[#1d2b25]">
                            {member.displayName}
                          </strong>
                          <small className="text-xs text-[#747b75]">
                            {member.email}
                          </small>
                        </span>
                        <span className="w-fit rounded-full bg-[#edf2ed] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#466153]">
                          {member.role} · {member.status}
                        </span>
                      </div>
                    </summary>
                    <div className="grid gap-4 border-t border-[#e7e1d6] p-4 lg:grid-cols-2">
                      <form
                        className="grid content-start gap-3"
                        onSubmit={(event) =>
                          handleMembership(event, member.membershipId)
                        }
                      >
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className={labelClass}>
                            Property role
                            <select
                              className={fieldClass}
                              defaultValue={member.role}
                              disabled={member.profileId === data.profile.id}
                              name="role"
                            >
                              <option value="admin">Administrator</option>
                              <option value="manager">Property manager</option>
                              <option value="owner">Owner</option>
                              <option value="tenant">Tenant</option>
                            </select>
                          </label>
                          <label className={labelClass}>
                            Access status
                            <select
                              className={fieldClass}
                              defaultValue={member.status}
                              disabled={member.profileId === data.profile.id}
                              name="status"
                            >
                              <option value="active">Active</option>
                              <option value="suspended">Suspended</option>
                              <option value="revoked">Revoked</option>
                            </select>
                          </label>
                        </div>
                        <SaveButton
                          busy={busyKey === `membership-${member.membershipId}`}
                          disabled={member.profileId === data.profile.id}
                          label="Save access"
                        />
                        {member.profileId === data.profile.id && (
                          <p className="text-xs leading-5 text-[#747b75]">
                            Your own administrator role is locked here to prevent
                            an accidental lockout.
                          </p>
                        )}
                      </form>
                      <form
                        className="grid content-start gap-3 rounded-xl bg-[#f7f4ed] p-4"
                        onSubmit={(event) =>
                          handlePassword(event, member.profileId)
                        }
                      >
                        <div>
                          <strong className="text-sm text-[#1d2b25]">
                            Set temporary password
                          </strong>
                          <p className="mt-1 text-xs leading-5 text-[#727a73]">
                            Share it privately. The user can change it after
                            signing in.
                          </p>
                        </div>
                        <label className={labelClass}>
                          Temporary password
                          <input
                            className={fieldClass}
                            minLength={6}
                            name="temporaryPassword"
                            required
                            type="password"
                          />
                        </label>
                        <button
                          className={secondaryButtonClass}
                          disabled={busyKey === `password-${member.profileId}`}
                          type="submit"
                        >
                          {busyKey === `password-${member.profileId}` ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <KeyRound className="size-4" />
                          )}
                          Set password
                        </button>
                      </form>
                    </div>
                  </details>
                ))}
              </div>
                </EditorCard>

                <EditorCard
              icon={<UserPlus aria-hidden="true" />}
              title="Add a login"
              description="Create a new account, assign its property role, and connect tenants to the active household."
            >
              <form className="grid gap-4" onSubmit={handleProvisionUser}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className={labelClass}>
                    Full name
                    <input
                      className={fieldClass}
                      name="displayName"
                      required
                    />
                  </label>
                  <label className={labelClass}>
                    Email
                    <input
                      className={fieldClass}
                      name="email"
                      required
                      type="email"
                    />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className={labelClass}>
                    Property role
                    <select
                      className={fieldClass}
                      defaultValue="tenant"
                      name="role"
                    >
                      <option value="tenant">Tenant</option>
                      <option value="owner">Owner</option>
                      <option value="manager">Property manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </label>
                  <label className={labelClass}>
                    Temporary password
                    <input
                      className={fieldClass}
                      minLength={6}
                      name="temporaryPassword"
                      required
                      type="password"
                    />
                  </label>
                </div>
                <div className="flex justify-end border-t border-[#e8e2d7] pt-4">
                  <button
                    className={primaryButtonClass}
                    disabled={busyKey === 'provision-user'}
                    type="submit"
                  >
                    {busyKey === 'provision-user' ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    Create login
                  </button>
                </div>
              </form>
                </EditorCard>
              </>
            )}
          </>
        )}

        {panel === 'money' && (
          <>
            <EditorCard
              icon={<FileText aria-hidden="true" />}
              title="Lease"
              description="Edit the active household lease shown to the owner and tenants."
            >
              <form className="grid gap-4" onSubmit={handleLease}>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <label className={labelClass}>
                    Status
                    <select
                      className={fieldClass}
                      defaultValue={data.lease?.status ?? 'draft'}
                      name="status"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </label>
                  <label className={labelClass}>
                    Starts
                    <input
                      className={fieldClass}
                      defaultValue={data.lease?.startsOn ?? today()}
                      name="startsOn"
                      required
                      type="date"
                    />
                  </label>
                  <label className={labelClass}>
                    Ends
                    <input
                      className={fieldClass}
                      defaultValue={data.lease?.endsOn ?? ''}
                      name="endsOn"
                      type="date"
                    />
                  </label>
                  <label className={labelClass}>
                    Security deposit
                    <input
                      className={fieldClass}
                      defaultValue={data.lease?.securityDeposit ?? ''}
                      min="0"
                      name="securityDeposit"
                      step="0.01"
                      type="number"
                    />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className={labelClass}>
                    Monthly rent
                    <input
                      className={fieldClass}
                      defaultValue={data.lease?.monthlyRent ?? ''}
                      min="0"
                      name="monthlyRent"
                      required
                      step="0.01"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    Monthly utilities
                    <input
                      className={fieldClass}
                      defaultValue={data.lease?.monthlyUtilities ?? 0}
                      min="0"
                      name="monthlyUtilities"
                      required
                      step="0.01"
                      type="number"
                    />
                  </label>
                </div>
                <label className={labelClass}>
                  Lease notes
                  <textarea
                    className={fieldClass}
                    defaultValue={data.lease?.notes ?? ''}
                    name="notes"
                    rows={3}
                  />
                </label>
                <div className="flex flex-col gap-3 border-t border-[#e8e2d7] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <VerifiedField defaultChecked={data.lease?.verified ?? false} />
                  <SaveButton busy={busyKey === 'lease'} label="Save lease" />
                </div>
              </form>
            </EditorCard>

            <EditorCard
              icon={<WalletCards aria-hidden="true" />}
              title="Owner financial inputs"
              description="Private mortgage and planning values. Tenants never receive these fields."
            >
              <form className="grid gap-4" onSubmit={handleFinancials}>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className={labelClass}>
                    Lender
                    <input
                      className={fieldClass}
                      defaultValue={data.ownerFinancials?.lenderLabel ?? ''}
                      name="lenderLabel"
                    />
                  </label>
                  <label className={labelClass}>
                    Loan started
                    <input
                      className={fieldClass}
                      defaultValue={data.ownerFinancials?.loanStartedOn ?? ''}
                      name="loanStartedOn"
                      type="date"
                    />
                  </label>
                  <label className={labelClass}>
                    Term in years
                    <input
                      className={fieldClass}
                      defaultValue={data.ownerFinancials?.loanTermYears ?? ''}
                      min="0"
                      name="loanTermYears"
                      type="number"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <label className={labelClass}>
                    Current principal
                    <input
                      className={fieldClass}
                      defaultValue={
                        data.ownerFinancials?.mortgagePrincipal ?? ''
                      }
                      name="mortgagePrincipal"
                      step="0.01"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    Original loan
                    <input
                      className={fieldClass}
                      defaultValue={
                        data.ownerFinancials?.originalLoanAmount ?? ''
                      }
                      name="originalLoanAmount"
                      step="0.01"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    Interest rate %
                    <input
                      className={fieldClass}
                      defaultValue={
                        data.ownerFinancials?.mortgageInterestRate ?? ''
                      }
                      name="mortgageInterestRate"
                      step="0.0001"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    Total monthly payment
                    <input
                      className={fieldClass}
                      defaultValue={
                        data.ownerFinancials?.mortgagePayment ?? ''
                      }
                      name="mortgagePayment"
                      step="0.01"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    Principal + interest
                    <input
                      className={fieldClass}
                      defaultValue={
                        data.ownerFinancials?.mortgagePrincipalInterest ?? ''
                      }
                      name="mortgagePrincipalInterest"
                      step="0.01"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    Monthly escrow
                    <input
                      className={fieldClass}
                      defaultValue={data.ownerFinancials?.mortgageEscrow ?? ''}
                      name="mortgageEscrow"
                      step="0.01"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    Annual income
                    <input
                      className={fieldClass}
                      defaultValue={data.ownerFinancials?.annualIncome ?? ''}
                      name="annualIncome"
                      step="0.01"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    State tax rate %
                    <input
                      className={fieldClass}
                      defaultValue={
                        data.ownerFinancials?.stateIncomeTaxRate ?? ''
                      }
                      name="stateIncomeTaxRate"
                      step="0.0001"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    Capital improvements
                    <input
                      className={fieldClass}
                      defaultValue={
                        data.ownerFinancials?.capitalImprovementsCost ?? ''
                      }
                      name="capitalImprovementsCost"
                      step="0.01"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    Depreciable value
                    <input
                      className={fieldClass}
                      defaultValue={
                        data.ownerFinancials?.depreciableValue ?? ''
                      }
                      name="depreciableValue"
                      step="0.01"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    Estimated selling costs
                    <input
                      className={fieldClass}
                      defaultValue={
                        data.ownerFinancials?.estimatedSellingCosts ?? ''
                      }
                      name="estimatedSellingCosts"
                      step="0.01"
                      type="number"
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-3 border-t border-[#e8e2d7] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <VerifiedField
                    defaultChecked={data.ownerFinancials?.verified ?? false}
                  />
                  <SaveButton
                    busy={busyKey === 'financials'}
                    label="Save financials"
                  />
                </div>
              </form>
            </EditorCard>

            <EditorCard
              icon={<WalletCards aria-hidden="true" />}
              title="Payment ledger"
              description="Add authoritative charges, payments, expenses, adjustments, and deposits."
            >
              <form
                className="mb-5 grid gap-3 rounded-xl bg-[#f4f1e9] p-4"
                onSubmit={(event) => handleLedger(event, null)}
              >
                <div className="flex items-center gap-2 text-sm font-bold text-[#1d2b25]">
                  <Plus className="size-4" aria-hidden="true" /> Add ledger entry
                </div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                  <label className={labelClass}>
                    Kind
                    <select
                      className={fieldClass}
                      defaultValue="payment"
                      name="kind"
                    >
                      <option value="rent_charge">Rent charge</option>
                      <option value="payment">Payment</option>
                      <option value="expense">Expense</option>
                      <option value="adjustment">Adjustment</option>
                      <option value="refund">Refund</option>
                      <option value="deposit">Deposit</option>
                    </select>
                  </label>
                  <label className={labelClass}>
                    Amount
                    <input
                      className={fieldClass}
                      name="amount"
                      required
                      step="0.01"
                      type="number"
                    />
                  </label>
                  <label className={labelClass}>
                    Date
                    <input
                      className={fieldClass}
                      defaultValue={today()}
                      name="effectiveOn"
                      required
                      type="date"
                    />
                  </label>
                  <label className={labelClass}>
                    Status
                    <select
                      className={fieldClass}
                      defaultValue="posted"
                      name="status"
                    >
                      <option value="posted">Posted</option>
                      <option value="draft">Draft</option>
                      <option value="void">Void</option>
                    </select>
                  </label>
                  <label className={`${labelClass} col-span-2 lg:col-span-1`}>
                    Description
                    <input className={fieldClass} name="description" required />
                  </label>
                </div>
                <div className="flex justify-end">
                  <button
                    className={primaryButtonClass}
                    disabled={busyKey === 'ledger-new'}
                    type="submit"
                  >
                    {busyKey === 'ledger-new' ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    Add entry
                  </button>
                </div>
              </form>

              <div className="grid gap-2">
                {data.ledgerEntries.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-[#cdc5b7] p-5 text-sm text-[#707770]">
                    No ledger entries yet.
                  </p>
                ) : (
                  data.ledgerEntries.map((entry) => (
                    <details
                      className="rounded-xl border border-[#ded8cc] bg-white"
                      key={entry.id}
                    >
                      <summary className="cursor-pointer list-none p-4">
                        <div className="flex items-center justify-between gap-4">
                          <span>
                            <strong className="block text-sm capitalize text-[#1d2b25]">
                              {entry.kind.replaceAll('_', ' ')}
                            </strong>
                            <small className="text-xs text-[#747b75]">
                              {entry.effectiveOn} · {entry.description}
                            </small>
                          </span>
                          <strong className="text-sm text-[#1d2b25]">
                            ${entry.amount.toLocaleString()}
                          </strong>
                        </div>
                      </summary>
                      <form
                        className="grid gap-3 border-t border-[#e7e1d6] p-4"
                        onSubmit={(event) => handleLedger(event, entry.id)}
                      >
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                          <label className={labelClass}>
                            Kind
                            <select
                              className={fieldClass}
                              defaultValue={entry.kind}
                              name="kind"
                            >
                              <option value="rent_charge">Rent charge</option>
                              <option value="payment">Payment</option>
                              <option value="expense">Expense</option>
                              <option value="adjustment">Adjustment</option>
                              <option value="refund">Refund</option>
                              <option value="deposit">Deposit</option>
                            </select>
                          </label>
                          <label className={labelClass}>
                            Amount
                            <input
                              className={fieldClass}
                              defaultValue={entry.amount}
                              name="amount"
                              required
                              step="0.01"
                              type="number"
                            />
                          </label>
                          <label className={labelClass}>
                            Date
                            <input
                              className={fieldClass}
                              defaultValue={entry.effectiveOn}
                              name="effectiveOn"
                              required
                              type="date"
                            />
                          </label>
                          <label className={labelClass}>
                            Status
                            <select
                              className={fieldClass}
                              defaultValue={entry.status}
                              name="status"
                            >
                              <option value="posted">Posted</option>
                              <option value="draft">Draft</option>
                              <option value="void">Void</option>
                            </select>
                          </label>
                          <label
                            className={`${labelClass} col-span-2 lg:col-span-1`}
                          >
                            Description
                            <input
                              className={fieldClass}
                              defaultValue={entry.description}
                              name="description"
                              required
                            />
                          </label>
                        </div>
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                          <button
                            className={dangerButtonClass}
                            disabled={busyKey === `delete-ledger-${entry.id}`}
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Delete the ${entry.description} ledger entry?`,
                                )
                              ) {
                                void run(
                                  `delete-ledger-${entry.id}`,
                                  'Ledger entry deleted.',
                                  () => deleteHouseLedgerEntry(entry.id),
                                );
                              }
                            }}
                            type="button"
                          >
                            <Trash2 className="size-4" /> Delete
                          </button>
                          <SaveButton
                            busy={busyKey === `ledger-${entry.id}`}
                          />
                        </div>
                      </form>
                    </details>
                  ))
                )}
              </div>
            </EditorCard>
          </>
        )}

        {panel === 'work' && (
          <EditorCard
            icon={<ClipboardList aria-hidden="true" />}
            title="Work orders"
            description="Open any item to change its details, responsibility, priority, or workflow status."
          >
            <div className="grid gap-3">
              {data.workOrders.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#cdc5b7] p-6 text-sm text-[#707770]">
                  No work orders yet. Use “New work order” in the top bar to add
                  one.
                </p>
              ) : (
                data.workOrders.map((workOrder) => (
                  <details
                    className="rounded-xl border border-[#ded8cc] bg-white"
                    key={workOrder.id}
                  >
                    <summary className="cursor-pointer list-none p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span>
                          <strong className="block text-sm text-[#1d2b25]">
                            {workOrder.title}
                          </strong>
                          <small className="text-xs capitalize text-[#747b75]">
                            {workOrder.category.replaceAll('_', ' ')} ·{' '}
                            {workOrder.priority} priority
                          </small>
                        </span>
                        <span className="w-fit rounded-full bg-[#edf2ed] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#466153]">
                          {workOrder.status.replaceAll('_', ' ')}
                        </span>
                      </div>
                    </summary>
                    <form
                      className="grid gap-4 border-t border-[#e7e1d6] p-4"
                      onSubmit={(event) => handleWork(event, workOrder.id)}
                    >
                      <label className={labelClass}>
                        Title
                        <input
                          className={fieldClass}
                          defaultValue={workOrder.title}
                          maxLength={140}
                          name="title"
                          required
                        />
                      </label>
                      <label className={labelClass}>
                        Description
                        <textarea
                          className={fieldClass}
                          defaultValue={workOrder.description ?? ''}
                          maxLength={2000}
                          name="description"
                          rows={4}
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                        <label className={labelClass}>
                          Category
                          <input
                            className={fieldClass}
                            defaultValue={workOrder.category}
                            name="category"
                            required
                          />
                        </label>
                        <label className={labelClass}>
                          Status
                          <select
                            className={fieldClass}
                            defaultValue={workOrder.status}
                            name="status"
                          >
                            <option value="reported">Reported</option>
                            <option value="triage">Triage</option>
                            <option value="waiting_approval">
                              Waiting approval
                            </option>
                            <option value="approved">Approved</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="in_progress">In progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </label>
                        <label className={labelClass}>
                          Priority
                          <select
                            className={fieldClass}
                            defaultValue={workOrder.priority}
                            name="priority"
                          >
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </label>
                        <label className={labelClass}>
                          Responsibility
                          <select
                            className={fieldClass}
                            defaultValue={workOrder.responsibility ?? ''}
                            name="responsibility"
                          >
                            <option value="">Not assigned</option>
                            <option value="owner">Owner</option>
                            <option value="tenant">Tenant</option>
                            <option value="shared">Shared</option>
                            <option value="unknown">Unknown</option>
                          </select>
                        </label>
                        <label className={labelClass}>
                          Due date
                          <input
                            className={fieldClass}
                            defaultValue={workOrder.dueOn ?? ''}
                            name="dueOn"
                            type="date"
                          />
                        </label>
                      </div>
                      <div className="flex flex-col gap-3 border-t border-[#e8e2d7] pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <VerifiedField defaultChecked={workOrder.verified} />
                        <SaveButton
                          busy={busyKey === `work-${workOrder.id}`}
                        />
                      </div>
                    </form>
                  </details>
                ))
              )}
            </div>
          </EditorCard>
        )}

        {panel === 'files' && (
          <>
            <EditorCard
              icon={<Camera aria-hidden="true" />}
              title="Property photos"
              description="Upload new images and edit the caption, order, audience, and verification status."
            >
              <form
                className="mb-5 grid gap-3 rounded-xl bg-[#f4f1e9] p-4"
                onSubmit={handlePhotoUpload}
              >
                <div className="flex items-center gap-2 text-sm font-bold text-[#1d2b25]">
                  <Upload className="size-4" aria-hidden="true" /> Upload photo
                </div>
                <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
                  <label className={labelClass}>
                    Image
                    <input
                      accept="image/jpeg,image/png,image/webp"
                      className={fieldClass}
                      name="file"
                      required
                      type="file"
                    />
                  </label>
                  <label className={labelClass}>
                    Caption
                    <input className={fieldClass} name="caption" />
                  </label>
                  <label className={labelClass}>
                    Visible to
                    <VisibilitySelect defaultValue="shared" />
                  </label>
                  <button
                    className={primaryButtonClass}
                    disabled={busyKey === 'photo-upload'}
                    type="submit"
                  >
                    {busyKey === 'photo-upload' ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    Upload
                  </button>
                </div>
              </form>

              <div className="grid gap-4 md:grid-cols-2">
                {data.photos.map((photo) => (
                  <form
                    className="overflow-hidden rounded-xl border border-[#ded8cc] bg-white"
                    key={photo.id}
                    onSubmit={(event) => handlePhoto(event, photo.id)}
                  >
                    <img
                      alt={photo.caption ?? 'Property'}
                      className="aspect-[16/10] w-full object-cover"
                      src={photo.signedUrl}
                    />
                    <div className="grid gap-3 p-4">
                      <label className={labelClass}>
                        Caption
                        <input
                          className={fieldClass}
                          defaultValue={photo.caption ?? ''}
                          name="caption"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className={labelClass}>
                          Category
                          <select
                            className={fieldClass}
                            defaultValue={photo.category}
                            name="category"
                          >
                            <option value="property">Property</option>
                            <option value="work_evidence">Work evidence</option>
                            <option value="inspection">Inspection</option>
                            <option value="receipt">Receipt</option>
                            <option value="other">Other</option>
                          </select>
                        </label>
                        <label className={labelClass}>
                          Display order
                          <input
                            className={fieldClass}
                            defaultValue={photo.sortOrder}
                            min="0"
                            name="sortOrder"
                            required
                            type="number"
                          />
                        </label>
                      </div>
                      <label className={labelClass}>
                        Visible to
                        <VisibilitySelect defaultValue={photo.visibility} />
                      </label>
                      <VerifiedField defaultChecked={photo.verified} />
                      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                        <button
                          className={dangerButtonClass}
                          disabled={busyKey === `delete-photo-${photo.id}`}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete ${photo.caption || 'this property photo'}?`,
                              )
                            ) {
                              void run(
                                `delete-photo-${photo.id}`,
                                'Photo deleted.',
                                () =>
                                  deleteHousePhoto({
                                    id: photo.id,
                                    storagePath: photo.storagePath,
                                  }),
                              );
                            }
                          }}
                          type="button"
                        >
                          <Trash2 className="size-4" /> Delete
                        </button>
                        <SaveButton busy={busyKey === `photo-${photo.id}`} />
                      </div>
                    </div>
                  </form>
                ))}
              </div>
            </EditorCard>

            <EditorCard
              icon={<FileText aria-hidden="true" />}
              title="Documents"
              description="Upload a private file or add a link to a document stored elsewhere."
            >
              <div className="mb-5 grid gap-4 lg:grid-cols-2">
                <form
                  className="grid content-start gap-3 rounded-xl bg-[#f4f1e9] p-4"
                  onSubmit={handleDocumentUpload}
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-[#1d2b25]">
                    <Upload className="size-4" /> Upload a file
                  </div>
                  <label className={labelClass}>
                    File
                    <input
                      accept=".pdf,.docx,image/jpeg,image/png,image/webp"
                      className={fieldClass}
                      name="file"
                      required
                      type="file"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={labelClass}>
                      Category
                      <select
                        className={fieldClass}
                        defaultValue="general"
                        name="category"
                      >
                        <option value="lease">Lease</option>
                        <option value="receipt">Receipt</option>
                        <option value="inspection">Inspection</option>
                        <option value="statement">Statement</option>
                        <option value="general">General</option>
                      </select>
                    </label>
                    <label className={labelClass}>
                      Visible to
                      <VisibilitySelect defaultValue="shared" />
                    </label>
                  </div>
                  <button
                    className={primaryButtonClass}
                    disabled={busyKey === 'document-upload'}
                    type="submit"
                  >
                    {busyKey === 'document-upload' ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    Upload document
                  </button>
                </form>

                <form
                  className="grid content-start gap-3 rounded-xl bg-[#f4f1e9] p-4"
                  onSubmit={handleExternalDocument}
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-[#1d2b25]">
                    <Link2 className="size-4" /> Add a document link
                  </div>
                  <label className={labelClass}>
                    Display name
                    <input
                      className={fieldClass}
                      name="fileName"
                      required
                    />
                  </label>
                  <label className={labelClass}>
                    Full URL
                    <input
                      className={fieldClass}
                      name="externalUrl"
                      placeholder="https://"
                      required
                      type="url"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={labelClass}>
                      Category
                      <select
                        className={fieldClass}
                        defaultValue="general"
                        name="category"
                      >
                        <option value="lease">Lease</option>
                        <option value="receipt">Receipt</option>
                        <option value="inspection">Inspection</option>
                        <option value="statement">Statement</option>
                        <option value="general">General</option>
                      </select>
                    </label>
                    <label className={labelClass}>
                      Visible to
                      <VisibilitySelect defaultValue="shared" />
                    </label>
                  </div>
                  <button
                    className={primaryButtonClass}
                    disabled={busyKey === 'external-document'}
                    type="submit"
                  >
                    {busyKey === 'external-document' ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    Add link
                  </button>
                </form>
              </div>

              <div className="grid gap-3">
                {data.documents.map((document) => (
                  <details
                    className="rounded-xl border border-[#ded8cc] bg-white"
                    key={document.id}
                  >
                    <summary className="cursor-pointer list-none p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="min-w-0">
                          <strong className="block truncate text-sm text-[#1d2b25]">
                            {document.fileName}
                          </strong>
                          <small className="text-xs capitalize text-[#747b75]">
                            {document.category} · {document.visibility.replace(
                              '_',
                              ' ',
                            )}
                          </small>
                        </span>
                        {document.externalUrl || document.signedUrl ? (
                          <a
                            className="shrink-0 text-xs font-bold text-[#2f5c49] hover:underline"
                            href={document.externalUrl ?? document.signedUrl ?? '#'}
                            onClick={(event) => event.stopPropagation()}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Open
                          </a>
                        ) : null}
                      </div>
                    </summary>
                    <form
                      className="grid gap-3 border-t border-[#e7e1d6] p-4"
                      onSubmit={(event) => handleDocument(event, document.id)}
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className={labelClass}>
                          Display name
                          <input
                            className={fieldClass}
                            defaultValue={document.fileName}
                            name="fileName"
                            required
                          />
                        </label>
                        <label className={labelClass}>
                          External URL
                          <input
                            className={fieldClass}
                            defaultValue={document.externalUrl ?? ''}
                            name="externalUrl"
                            type="url"
                          />
                        </label>
                        <label className={labelClass}>
                          Category
                          <select
                            className={fieldClass}
                            defaultValue={document.category}
                            name="category"
                          >
                            <option value="lease">Lease</option>
                            <option value="receipt">Receipt</option>
                            <option value="inspection">Inspection</option>
                            <option value="statement">Statement</option>
                            <option value="general">General</option>
                          </select>
                        </label>
                        <label className={labelClass}>
                          Visible to
                          <VisibilitySelect defaultValue={document.visibility} />
                        </label>
                      </div>
                      <VerifiedField defaultChecked={document.verified} />
                      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                        <button
                          className={dangerButtonClass}
                          disabled={busyKey === `delete-document-${document.id}`}
                          onClick={() => {
                            if (
                              window.confirm(`Delete ${document.fileName}?`)
                            ) {
                              void run(
                                `delete-document-${document.id}`,
                                'Document deleted.',
                                () =>
                                  deleteHouseDocument({
                                    id: document.id,
                                    storagePath: document.storagePath,
                                  }),
                              );
                            }
                          }}
                          type="button"
                        >
                          <Trash2 className="size-4" /> Delete
                        </button>
                        <SaveButton
                          busy={busyKey === `document-${document.id}`}
                        />
                      </div>
                    </form>
                  </details>
                ))}
              </div>
            </EditorCard>
          </>
        )}
      </div>
    </section>
  );
}
