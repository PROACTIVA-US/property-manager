import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  WorkspaceCustomFields,
  WorkspaceNavigation,
  WorkspacePageControls,
} from './HouseWorkspaceEditor';
import {
  createWorkspaceField,
  updateWorkspacePage,
} from './data';
import type { HouseWorkspaceData, HouseWorkspacePage } from './types';

vi.mock('./data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./data')>();
  return {
    ...actual,
    archiveWorkspaceField: vi.fn().mockResolvedValue(undefined),
    archiveWorkspacePage: vi.fn().mockResolvedValue(undefined),
    createWorkspaceField: vi.fn().mockResolvedValue(undefined),
    createWorkspacePage: vi.fn().mockResolvedValue({ id: 'new-page' }),
    reorderWorkspaceFields: vi.fn().mockResolvedValue(undefined),
    reorderWorkspacePages: vi.fn().mockResolvedValue(undefined),
    updateWorkspaceField: vi.fn().mockResolvedValue(undefined),
    updateWorkspacePage: vi.fn().mockResolvedValue(undefined),
  };
});

const page: HouseWorkspacePage = {
  id: 'page-property',
  systemKey: 'property',
  slug: 'property',
  label: 'Property',
  icon: 'building-2',
  sortOrder: 0,
  visibleRoles: ['admin', 'manager', 'owner', 'tenant'],
  isVisible: true,
  hiddenCoreFields: [],
};

const data = {
  membership: { id: 'membership', propertyId: 'property-1', role: 'admin' },
  profile: {
    id: 'profile-admin',
    displayName: 'Daniel Connolly',
    email: 'daniel@example.com',
    phone: null,
  },
  property: {
    id: 'property-1',
    nickname: 'The House',
    address: '14102 129th Ave NE',
  },
  workspacePages: [
    page,
    {
      ...page,
      id: 'page-notes',
      systemKey: null,
      slug: 'notes',
      label: 'Notes',
      icon: 'notebook-tabs',
      sortOrder: 1,
      isVisible: false,
    },
  ],
  customFields: [
    {
      id: 'field-shared',
      pageId: page.id,
      label: 'Zillow',
      fieldType: 'link',
      value: 'https://www.zillow.com/',
      sortOrder: 0,
      visibleRoles: ['admin', 'manager', 'owner', 'tenant'],
      isVisible: true,
    },
    {
      id: 'field-owner',
      pageId: page.id,
      label: 'Owner note',
      fieldType: 'text',
      value: 'Private',
      sortOrder: 1,
      visibleRoles: ['admin', 'owner'],
      isVisible: true,
    },
  ],
} as HouseWorkspaceData;

describe('HouseWorkspaceEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps hidden pages available while editing and exposes direct structure controls', () => {
    render(
      <WorkspaceNavigation
        activeWorkCount={0}
        data={data}
        editMode
        onRefresh={vi.fn()}
        onSelect={vi.fn()}
        pages={data.workspacePages}
        previewRole="admin"
        section="property"
      />,
    );

    expect(screen.getByRole('button', { name: 'Property' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Notes/ })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add workspace item' }),
    ).toBeInTheDocument();
  });

  it('previews custom fields using the selected role', () => {
    const { rerender } = render(
      <WorkspaceCustomFields
        data={data}
        editMode={false}
        onRefresh={vi.fn()}
        page={page}
        previewRole="tenant"
      />,
    );

    expect(screen.getByText('Zillow')).toBeInTheDocument();
    expect(screen.queryByText('Owner note')).not.toBeInTheDocument();

    rerender(
      <WorkspaceCustomFields
        data={data}
        editMode={false}
        onRefresh={vi.fn()}
        page={page}
        previewRole="owner"
      />,
    );
    expect(screen.getByText('Owner note')).toBeInTheDocument();
  });

  it('saves page display settings and can add a custom field in place', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const controls = render(
      <WorkspacePageControls
        coreFields={[{ key: 'photos', label: 'Property photos' }]}
        onRefresh={onRefresh}
        onRemoved={vi.fn()}
        page={page}
      />,
    );

    fireEvent.change(screen.getByLabelText('Sidebar name'), {
      target: { value: 'House details' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save page' }));

    await waitFor(() => {
      expect(updateWorkspacePage).toHaveBeenCalledWith(
        expect.objectContaining({
          id: page.id,
          label: 'House details',
        }),
      );
    });
    controls.rerender(
      <WorkspacePageControls
        onRefresh={onRefresh}
        onRemoved={vi.fn()}
        page={{
          ...page,
          id: 'page-notes',
          systemKey: null,
          label: 'Notes',
          icon: 'notebook-tabs',
        }}
      />,
    );
    expect(screen.getByLabelText('Sidebar name')).toHaveValue('Notes');
    expect(screen.getByLabelText('Icon')).toHaveValue('notebook-tabs');
    controls.unmount();

    render(
      <WorkspaceCustomFields
        data={{ ...data, customFields: [] }}
        editMode
        onRefresh={onRefresh}
        page={page}
        previewRole="admin"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add field' }));
    fireEvent.change(screen.getByLabelText('Field name'), {
      target: { value: 'Gate code instructions' },
    });
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Add field',
      }),
    );

    await waitFor(() => {
      expect(createWorkspaceField).toHaveBeenCalledWith(
        expect.objectContaining({
          pageId: page.id,
          label: 'Gate code instructions',
        }),
      );
    });
  });
});
