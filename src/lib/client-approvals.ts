import { supabase } from './supabase';

const APPROVAL_IMAGE_BUCKET = 'approval-images';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type ApprovalStatus = 'pending' | 'approved' | 'declined';
export type ApprovalDecision = 'approve' | 'decline';

export interface ApprovalRequest {
  id: string;
  description: string;
  actionQuestion: string;
  compositeImageUrl: string;
  status: ApprovalStatus;
  projectId: string | null;
  expiresAt: string;
  decidedAt: string | null;
  createdAt?: string;
}

export interface CreatedApprovalRequest extends ApprovalRequest {
  publicUrl: string;
}

interface ApprovalRow {
  id: string;
  description: string;
  action_question: string;
  composite_image_url: string;
  status: string;
  project_id?: string | null;
  expires_at: string;
  decided_at: string | null;
  created_at?: string;
}

function createToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function imageExtension(mimeType: string): string {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  return 'jpg';
}

function validateImage(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Use a JPG, PNG, or WebP image.');
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('The composite image must be 8 MB or smaller.');
  }
}

function normalizeApproval(row: ApprovalRow): ApprovalRequest {
  if (!['pending', 'approved', 'declined'].includes(row.status)) {
    throw new Error('The approval request has an invalid status.');
  }

  return {
    id: row.id,
    description: row.description,
    actionQuestion: row.action_question,
    compositeImageUrl: row.composite_image_url,
    status: row.status as ApprovalStatus,
    projectId: row.project_id ?? null,
    expiresAt: row.expires_at,
    decidedAt: row.decided_at,
    createdAt: row.created_at,
  };
}

function approvalPortalUrl(token: string): string {
  const url = new URL(`${import.meta.env.BASE_URL}client-approval`, window.location.origin);
  url.searchParams.set('token', token);
  return url.toString();
}

export async function createApprovalRequest(input: {
  description: string;
  actionQuestion: string;
  compositeImage: File;
  userId: string;
}): Promise<CreatedApprovalRequest> {
  const description = input.description.trim();
  const actionQuestion = input.actionQuestion.trim();

  if (!description || description.length > 5000) {
    throw new Error('Enter a description of up to 5,000 characters.');
  }

  if (!actionQuestion || actionQuestion.length > 500) {
    throw new Error('Enter a decision question of up to 500 characters.');
  }

  validateImage(input.compositeImage);

  const requestId = crypto.randomUUID();
  const token = createToken();
  const tokenHash = await sha256(token);
  const storagePath = `${input.userId}/${requestId}/composite.${imageExtension(input.compositeImage.type)}`;

  const { error: uploadError } = await supabase.storage
    .from(APPROVAL_IMAGE_BUCKET)
    .upload(storagePath, input.compositeImage, {
      cacheControl: '3600',
      contentType: input.compositeImage.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Could not upload the composite image: ${uploadError.message}`);
  }

  const { data: publicImage } = supabase.storage
    .from(APPROVAL_IMAGE_BUCKET)
    .getPublicUrl(storagePath);

  const { data, error } = await supabase
    .rpc('create_client_approval', {
      request_id: requestId,
      request_description: description,
      request_action_question: actionQuestion,
      request_image_url: publicImage.publicUrl,
      request_storage_path: storagePath,
      request_token_hash: tokenHash,
    })
    .single();

  if (error || !data) {
    await supabase.storage.from(APPROVAL_IMAGE_BUCKET).remove([storagePath]);
    throw new Error(error?.message || 'Could not create the approval request.');
  }

  return {
    ...normalizeApproval(data),
    publicUrl: approvalPortalUrl(token),
  };
}

export async function listApprovalRequests(): Promise<ApprovalRequest[]> {
  const { data, error } = await supabase.rpc('list_client_approvals');

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(normalizeApproval);
}

export async function getApprovalRequest(token: string): Promise<ApprovalRequest | null> {
  if (!/^[0-9a-f]{64}$/.test(token)) return null;

  const { data, error } = await supabase
    .rpc('get_client_approval', { request_token: token })
    .maybeSingle();

  if (error) {
    throw new Error('We could not load this approval request. Please try again.');
  }

  return data ? normalizeApproval(data) : null;
}

export async function submitApprovalDecision(
  token: string,
  decision: ApprovalDecision,
): Promise<{ status: ApprovalStatus; projectId: string | null }> {
  if (!/^[0-9a-f]{64}$/.test(token)) {
    throw new Error('This approval link is invalid.');
  }

  const { data, error } = await supabase
    .rpc('decide_client_approval', {
      request_token: token,
      request_decision: decision,
    })
    .single();

  if (error || !data) {
    if (error?.message.includes('already been processed')) {
      throw new Error('This request has already been processed.');
    }
    if (error?.message.includes('expired')) {
      throw new Error('This approval link has expired.');
    }
    throw new Error('We could not record your decision. Please refresh and try again.');
  }

  return {
    status: data.final_status as ApprovalStatus,
    projectId: data.created_project_id,
  };
}
