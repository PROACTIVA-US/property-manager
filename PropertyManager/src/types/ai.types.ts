/**
 * Phase 4: AI Generation Type Definitions
 *
 * This file defines all TypeScript interfaces for AI-powered project generation.
 */

import type { ProjectCategory, ProjectPriority, ProjectStatus } from '../lib/projects';
import type { BillOfMaterials } from './bom.types';

// ============================================================================
// AI Project Generation Request
// ============================================================================

export interface ProjectGenerationRequest {
  description: string; // Natural language description
  propertyContext?: PropertyContext;
  constraints?: ProjectConstraints;
  preferences?: ProjectPreferences;
}

export interface PropertyContext {
  address?: string;
  squareFootage?: number;
  propertyType?: 'single_family' | 'townhouse' | 'condo' | 'apartment';
  yearBuilt?: number;
  existingFeatures?: string[];
  climate?: string; // For seasonal considerations
  zipCode?: string; // For local code requirements
}

export interface ProjectConstraints {
  maxBudget?: number;
  preferredTimeline?: string;
  diyLevel?: 'none' | 'basic' | 'intermediate' | 'advanced';
  vendorPreference?: string; // Specific vendor to use
  permitRequired?: boolean;
  seasonalRestrictions?: string[];
}

export interface ProjectPreferences {
  materialQuality?: 'budget' | 'standard' | 'premium';
  sustainabilityFocus?: boolean;
  aestheticStyle?: string;
  futureProofing?: boolean;
}

// ============================================================================
// AI Generated Project
// ============================================================================

export interface GeneratedProject {
  title: string;
  description: string;
  category: ProjectCategory;
  priority: ProjectPriority;
  status: ProjectStatus;

  // Phases/Milestones
  phases: GeneratedPhase[];

  // Bill of Materials
  bom: BillOfMaterials;

  // Cost estimation
  estimatedCost: CostBreakdown;
  estimatedDuration: string; // e.g., "2-3 weeks"

  // Requirements
  requiredPermits: string[];
  requiredSkills: SkillRequirement[];
  requiredTools: string[];

  // Warnings and notes
  warnings: string[];
  aiNotes: string[];
  safetyConsiderations: string[];

  // Impact analysis
  impactAnalysis: ImpactAnalysis;

  // Metadata
  generatedAt: string;
  aiModel: string;
  confidence: number; // 0-1 confidence score
}

// ============================================================================
// Generated Phase (Milestone)
// ============================================================================

export interface GeneratedPhase {
  name: string;
  description: string;
  estimatedDays: number;
  tasks: string[];
  requiredMaterials: string[]; // References to BOM item IDs
  requiredSkills: string[];
  requiredTools: string[];
  inspectionRequired: boolean;
  dependencies?: string[]; // IDs of phases that must complete first
  weatherDependent?: boolean;
}

// ============================================================================
// Cost Breakdown
// ============================================================================

export interface CostBreakdown {
  materialsCost: number;
  laborCost?: number;
  permitsCost?: number;
  equipmentRentalCost?: number;
  contingency: number;
  totalCost: number;
  costRange: {
    low: number;
    high: number;
  };
}

// ============================================================================
// Skill Requirements
// ============================================================================

export interface SkillRequirement {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  criticality: 'nice_to_have' | 'recommended' | 'required';
  alternatives?: string[]; // Alternative ways to achieve the same result
}

// ============================================================================
// Impact Analysis
// ============================================================================

export interface ImpactAnalysis {
  tenantImpact: TenantImpact;
  ownerImpact: OwnerImpact;
  environmentalImpact?: EnvironmentalImpact;
  suggestedNotifications: NotificationSuggestion[];
}

export interface TenantImpact {
  severity: 'none' | 'minimal' | 'moderate' | 'significant';
  description: string;
  accessRestrictions?: string[];
  noiseLevel?: 'quiet' | 'moderate' | 'loud';
  duration?: string;
  mitigationSteps?: string[];
}

export interface OwnerImpact {
  financialImpact: string;
  propertyValueChange?: 'increase' | 'decrease' | 'neutral';
  estimatedROI?: number; // percentage
  maintenanceImpact?: string;
  insuranceImpact?: string;
}

export interface EnvironmentalImpact {
  energyEfficiency?: 'improved' | 'neutral' | 'decreased';
  sustainabilityScore?: number; // 0-100
  recyclingOpportunities?: string[];
  carbonFootprint?: string;
}

export interface NotificationSuggestion {
  recipient: 'tenant' | 'owner' | 'vendor' | 'all';
  timing: 'immediate' | '1_week' | '1_month' | 'before_start';
  message: string;
  priority: 'low' | 'medium' | 'high';
}

// ============================================================================
// AI Service Configuration
// ============================================================================

export interface AIServiceConfig {
  provider: 'anthropic' | 'openai' | 'local';
  apiKey?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  enableCaching?: boolean;
}

export interface AIGenerationOptions {
  includeDetailedBOM?: boolean;
  includeImpactAnalysis?: boolean;
  includeAlternatives?: boolean;
  detailLevel?: 'basic' | 'standard' | 'detailed';
  locale?: string;
}

// ============================================================================
// AI Response Types
// ============================================================================

export interface AIGenerationResponse {
  success: boolean;
  project?: GeneratedProject;
  error?: AIGenerationError;
  tokensUsed?: number;
  processingTime?: number;
}

export interface AIGenerationError {
  code: string;
  message: string;
  details?: string;
  suggestions?: string[];
}

// ============================================================================
// Prompt Templates
// ============================================================================

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
  variables: string[];
  examples?: Array<{
    input: ProjectGenerationRequest;
    output: GeneratedProject;
  }>;
}

// ============================================================================
// AI Service State
// ============================================================================

export interface AIGenerationState {
  isGenerating: boolean;
  progress: number; // 0-100
  currentStep?: string;
  error?: string;
  result?: GeneratedProject;
}

// ============================================================================
// Learning and Feedback
// ============================================================================

export interface UserFeedback {
  projectId: string;
  generatedProjectId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  accuracyScore?: number; // How accurate was the BOM?
  completenessScore?: number; // How complete was the project plan?
  usefulnessScore?: number; // How useful were the AI suggestions?
  comments?: string;
  corrections?: ProjectCorrection[];
  submittedAt: string;
  submittedBy: string;
}

export interface ProjectCorrection {
  field: string;
  aiValue: string | number;
  actualValue: string | number;
  notes?: string;
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CachedGeneration {
  id: string;
  request: ProjectGenerationRequest;
  response: GeneratedProject;
  generatedAt: string;
  expiresAt: string;
  hitCount: number;
}
