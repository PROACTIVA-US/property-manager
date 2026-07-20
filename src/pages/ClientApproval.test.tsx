import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getApprovalRequest, submitApprovalDecision } from '../lib/client-approvals';
import ClientApproval from './ClientApproval';

vi.mock('../lib/client-approvals', () => ({
  getApprovalRequest: vi.fn(),
  submitApprovalDecision: vi.fn(),
}));

const TOKEN = 'a'.repeat(64);
const pendingRequest = {
  id: 'request-1',
  description: 'The roof flashing is damaged and should be repaired before the next storm.',
  actionQuestion: 'Approve the proposed roof repair?',
  compositeImageUrl: 'https://example.com/composite.jpg',
  status: 'pending' as const,
  projectId: null,
  expiresAt: '2026-08-19T12:00:00.000Z',
  decidedAt: null,
};

describe('ClientApproval', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads a tokenized request and records a confirmed approval', async () => {
    vi.mocked(getApprovalRequest).mockResolvedValue(pendingRequest);
    vi.mocked(submitApprovalDecision).mockResolvedValue({
      status: 'approved',
      projectId: 'project-1',
    });

    render(
      <MemoryRouter initialEntries={[`/client-approval?token=${TOKEN}`]}>
        <ClientApproval />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Approve the proposed roof repair?' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    expect(screen.getByText('Confirm you want to approve this work.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm approve' }));

    await waitFor(() => {
      expect(submitApprovalDecision).toHaveBeenCalledWith(TOKEN, 'approve');
    });
    expect(await screen.findByText('Request approved')).toBeInTheDocument();
    expect(screen.getByText(/added to the property team’s project board/i)).toBeInTheDocument();
  });

  it('shows a safe error state for an invalid or expired token', async () => {
    vi.mocked(getApprovalRequest).mockResolvedValue(null);

    render(
      <MemoryRouter initialEntries={['/client-approval?token=invalid']}>
        <ClientApproval />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'This link is invalid or expired' })).toBeInTheDocument();
    expect(screen.getByText(/ask the property manager/i)).toBeInTheDocument();
  });
});
