/**
 * Mock AI Generator for Development/Testing
 *
 * Provides realistic mock responses when no API key is configured.
 */

import type { ProjectGenerationRequest, GeneratedProject } from '../types/ai.types';
import type { BillOfMaterials } from '../types/bom.types';

/**
 * Generate a mock project based on the request
 */
export function generateMockProject(request: ProjectGenerationRequest): GeneratedProject {
  const description = request.description.toLowerCase();

  // Detect project type from description
  if (description.includes('deck')) {
    return generateDeckProject(request);
  } else if (description.includes('paint')) {
    return generatePaintProject(request);
  } else if (description.includes('fence')) {
    return generateFenceProject(request);
  } else if (description.includes('hvac') || description.includes('air')) {
    return generateHVACProject(request);
  } else {
    return generateGenericProject(request);
  }
}

function generateDeckProject(request: ProjectGenerationRequest): GeneratedProject {
  const bom: BillOfMaterials = {
    id: `bom_${Date.now()}`,
    projectId: '',
    items: [
      {
        id: `bom_item_${Date.now()}_1`,
        name: '2x8x12 PT Lumber',
        description: 'Pressure-treated lumber for joists',
        category: 'lumber',
        quantity: 12,
        unit: 'each',
        unitPrice: 18.50,
        totalPrice: 12 * 18.50 * 1.10,
        wasteFactor: 1.10,
      },
      {
        id: `bom_item_${Date.now()}_2`,
        name: 'Composite Decking Boards',
        description: 'Composite decking boards 16ft',
        category: 'decking',
        quantity: 40,
        unit: 'each',
        unitPrice: 32.99,
        totalPrice: 40 * 32.99 * 1.05,
        wasteFactor: 1.05,
      },
      {
        id: `bom_item_${Date.now()}_3`,
        name: 'Deck Screws 3"',
        description: 'Coated deck screws',
        category: 'hardware',
        quantity: 2,
        unit: 'box',
        unitPrice: 44.99,
        totalPrice: 2 * 44.99,
        wasteFactor: 1.0,
      },
      {
        id: `bom_item_${Date.now()}_4`,
        name: '4x4x10 PT Posts',
        description: 'Pressure-treated posts',
        category: 'lumber',
        quantity: 6,
        unit: 'each',
        unitPrice: 22.00,
        totalPrice: 6 * 22.00 * 1.10,
        wasteFactor: 1.10,
      },
      {
        id: `bom_item_${Date.now()}_5`,
        name: 'Concrete Mix 80lb',
        description: 'Concrete for footings',
        category: 'concrete',
        quantity: 8,
        unit: 'bag',
        unitPrice: 6.50,
        totalPrice: 8 * 6.50,
        wasteFactor: 1.0,
      },
    ],
    categories: [],
    subtotal: 0,
    taxRate: 0.08,
    taxAmount: 0,
    contingency: 500,
    grandTotal: 0,
    generatedAt: new Date().toISOString(),
    generatedBy: 'mock_ai',
    priceSource: 'ai_estimate',
  };

  // Calculate totals
  bom.subtotal = bom.items.reduce((sum, item) => sum + item.totalPrice, 0);
  bom.taxAmount = bom.subtotal * bom.taxRate;
  bom.grandTotal = bom.subtotal + bom.taxAmount + bom.contingency;

  // Group by category
  const categoryMap = new Map<string, typeof bom.items>();
  bom.items.forEach((item) => {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, []);
    }
    categoryMap.get(item.category)!.push(item);
  });

  bom.categories = Array.from(categoryMap.entries()).map(([category, items]) => ({
    name: getCategoryLabel(category),
    category: category as typeof items[0]['category'],
    items,
    subtotal: items.reduce((sum, item) => sum + item.totalPrice, 0),
    itemCount: items.length,
  }));

  return {
    title: 'Build Composite Deck',
    description: 'Construction of a 12x16 composite deck with railings and stairs.',
    category: 'renovation',
    priority: 'medium',
    status: 'draft',
    phases: [
      {
        name: 'Permits & Site Prep',
        description: 'Obtain permits and prepare the site',
        estimatedDays: 3,
        tasks: [
          'Apply for building permit',
          'Call 811 to mark utilities',
          'Clear and level the site',
          'Mark post locations',
        ],
        requiredMaterials: ['Stakes', 'String line'],
        requiredSkills: ['Basic carpentry'],
        requiredTools: ['Tape measure', 'Level', 'Shovel'],
        inspectionRequired: false,
      },
      {
        name: 'Foundation & Framing',
        description: 'Install footings and build the deck frame',
        estimatedDays: 2,
        tasks: [
          'Dig footing holes',
          'Pour concrete footings',
          'Install posts',
          'Attach beams',
          'Install joists',
        ],
        requiredMaterials: ['Concrete', 'Posts', 'Beams', 'Joists'],
        requiredSkills: ['Intermediate carpentry'],
        requiredTools: ['Post hole digger', 'Level', 'Circular saw', 'Drill'],
        inspectionRequired: true,
      },
      {
        name: 'Decking Installation',
        description: 'Install composite decking boards',
        estimatedDays: 2,
        tasks: [
          'Install starter board',
          'Install remaining boards with proper spacing',
          'Trim edges',
          'Install fascia boards',
        ],
        requiredMaterials: ['Composite boards', 'Hidden fasteners'],
        requiredSkills: ['Intermediate carpentry'],
        requiredTools: ['Miter saw', 'Drill', 'Spacers'],
        inspectionRequired: false,
      },
    ],
    bom,
    estimatedCost: {
      materialsCost: bom.subtotal,
      laborCost: 2000,
      permitsCost: 150,
      contingency: 500,
      totalCost: bom.grandTotal + 2000 + 150,
      costRange: {
        low: 4000,
        high: 6000,
      },
    },
    estimatedDuration: '1-2 weeks',
    requiredPermits: ['Building permit'],
    requiredSkills: [
      {
        skill: 'Carpentry',
        level: 'intermediate',
        criticality: 'required',
      },
    ],
    requiredTools: ['Circular saw', 'Drill', 'Level', 'Tape measure', 'Post hole digger'],
    warnings: ['Project is weather-dependent', 'Permit required for decks over 200 sq ft'],
    aiNotes: [
      'Consider frost depth when setting footings',
      'Use proper spacing for composite boards to allow expansion',
      'Composite decking requires special cutting techniques',
    ],
    safetyConsiderations: [
      'Wear safety glasses',
      'Use proper ladder safety',
      'Follow tool manufacturer safety guidelines',
    ],
    impactAnalysis: {
      tenantImpact: {
        severity: 'moderate',
        description: 'Back yard will be inaccessible during construction',
        accessRestrictions: ['Back yard closed for 1 week'],
        noiseLevel: 'moderate',
        duration: '1 week',
        mitigationSteps: ['Work during business hours (9am-5pm)'],
      },
      ownerImpact: {
        financialImpact: 'Medium one-time investment of $5,000-6,000',
        propertyValueChange: 'increase',
        estimatedROI: 75,
        maintenanceImpact: 'Low maintenance required - annual cleaning',
      },
      suggestedNotifications: [
        {
          recipient: 'tenant',
          timing: '1_week',
          message: 'Back yard deck construction will begin next week. Yard access will be restricted.',
          priority: 'high',
        },
      ],
    },
    generatedAt: new Date().toISOString(),
    aiModel: 'mock',
    confidence: 0.85,
  };
}

function generatePaintProject(_request: ProjectGenerationRequest): GeneratedProject {
  return {
    title: 'Interior Room Painting',
    description: 'Professional painting of interior room with prep work',
    category: 'painting',
    priority: 'low',
    status: 'draft',
    phases: [],
    bom: {
      id: `bom_${Date.now()}`,
      projectId: '',
      items: [],
      categories: [],
      subtotal: 300,
      taxRate: 0.08,
      taxAmount: 24,
      contingency: 50,
      grandTotal: 374,
      generatedAt: new Date().toISOString(),
      generatedBy: 'mock_ai',
      priceSource: 'ai_estimate',
    },
    estimatedCost: {
      materialsCost: 300,
      laborCost: 400,
      contingency: 50,
      totalCost: 750,
      costRange: { low: 600, high: 900 },
    },
    estimatedDuration: '2-3 days',
    requiredPermits: [],
    requiredSkills: [
      { skill: 'Painting', level: 'beginner', criticality: 'required' },
    ],
    requiredTools: ['Paint roller', 'Brushes', 'Drop cloths', 'Painters tape'],
    warnings: [],
    aiNotes: ['Allow proper drying time between coats'],
    safetyConsiderations: ['Ensure proper ventilation'],
    impactAnalysis: {
      tenantImpact: {
        severity: 'minimal',
        description: 'Room will be temporarily unavailable',
        noiseLevel: 'quiet',
        duration: '2 days',
      },
      ownerImpact: {
        financialImpact: 'Low investment',
        propertyValueChange: 'neutral',
      },
      suggestedNotifications: [],
    },
    generatedAt: new Date().toISOString(),
    aiModel: 'mock',
    confidence: 0.90,
  };
}

function generateFenceProject(_request: ProjectGenerationRequest): GeneratedProject {
  return {
    title: 'Install Privacy Fence',
    description: '6ft privacy fence installation around property perimeter',
    category: 'landscaping',
    priority: 'medium',
    status: 'draft',
    phases: [],
    bom: {
      id: `bom_${Date.now()}`,
      projectId: '',
      items: [],
      categories: [],
      subtotal: 2500,
      taxRate: 0.08,
      taxAmount: 200,
      contingency: 300,
      grandTotal: 3000,
      generatedAt: new Date().toISOString(),
      generatedBy: 'mock_ai',
      priceSource: 'ai_estimate',
    },
    estimatedCost: {
      materialsCost: 2500,
      laborCost: 1500,
      contingency: 300,
      totalCost: 4300,
      costRange: { low: 4000, high: 5000 },
    },
    estimatedDuration: '3-5 days',
    requiredPermits: ['Fence permit (check local requirements)'],
    requiredSkills: [
      { skill: 'Fence installation', level: 'intermediate', criticality: 'required' },
    ],
    requiredTools: ['Post hole digger', 'Level', 'Circular saw'],
    warnings: ['Check property lines before installation'],
    aiNotes: ['Verify HOA requirements'],
    safetyConsiderations: ['Call 811 before digging'],
    impactAnalysis: {
      tenantImpact: {
        severity: 'minimal',
        description: 'Temporary yard disruption',
        noiseLevel: 'moderate',
        duration: '3-5 days',
      },
      ownerImpact: {
        financialImpact: 'Medium investment',
        propertyValueChange: 'increase',
        estimatedROI: 50,
      },
      suggestedNotifications: [],
    },
    generatedAt: new Date().toISOString(),
    aiModel: 'mock',
    confidence: 0.80,
  };
}

function generateHVACProject(_request: ProjectGenerationRequest): GeneratedProject {
  return {
    title: 'HVAC System Upgrade',
    description: 'Replace aging HVAC system with high-efficiency unit',
    category: 'hvac',
    priority: 'high',
    status: 'draft',
    phases: [],
    bom: {
      id: `bom_${Date.now()}`,
      projectId: '',
      items: [],
      categories: [],
      subtotal: 6000,
      taxRate: 0.08,
      taxAmount: 480,
      contingency: 500,
      grandTotal: 6980,
      generatedAt: new Date().toISOString(),
      generatedBy: 'mock_ai',
      priceSource: 'ai_estimate',
    },
    estimatedCost: {
      materialsCost: 6000,
      laborCost: 2500,
      permitsCost: 100,
      contingency: 500,
      totalCost: 9100,
      costRange: { low: 8500, high: 10000 },
    },
    estimatedDuration: '2-3 days',
    requiredPermits: ['HVAC permit'],
    requiredSkills: [
      { skill: 'HVAC installation', level: 'professional', criticality: 'required' },
    ],
    requiredTools: [],
    warnings: ['Requires licensed HVAC contractor'],
    aiNotes: ['Consider energy-efficient models for long-term savings'],
    safetyConsiderations: ['Licensed professional required'],
    impactAnalysis: {
      tenantImpact: {
        severity: 'significant',
        description: 'No heating/cooling during installation',
        duration: '2 days',
        noiseLevel: 'loud',
      },
      ownerImpact: {
        financialImpact: 'Major investment',
        propertyValueChange: 'increase',
        estimatedROI: 60,
      },
      suggestedNotifications: [],
    },
    generatedAt: new Date().toISOString(),
    aiModel: 'mock',
    confidence: 0.85,
  };
}

function generateGenericProject(request: ProjectGenerationRequest): GeneratedProject {
  return {
    title: 'Custom Project',
    description: request.description,
    category: 'other',
    priority: 'medium',
    status: 'draft',
    phases: [
      {
        name: 'Planning & Preparation',
        description: 'Initial planning and material gathering',
        estimatedDays: 2,
        tasks: ['Research requirements', 'Gather materials', 'Prepare work area'],
        requiredMaterials: ['To be determined'],
        requiredSkills: ['General DIY'],
        requiredTools: ['Basic tools'],
        inspectionRequired: false,
      },
    ],
    bom: {
      id: `bom_${Date.now()}`,
      projectId: '',
      items: [],
      categories: [],
      subtotal: 500,
      taxRate: 0.08,
      taxAmount: 40,
      contingency: 100,
      grandTotal: 640,
      generatedAt: new Date().toISOString(),
      generatedBy: 'mock_ai',
      priceSource: 'ai_estimate',
    },
    estimatedCost: {
      materialsCost: 500,
      laborCost: 300,
      contingency: 100,
      totalCost: 900,
      costRange: { low: 700, high: 1100 },
    },
    estimatedDuration: '3-5 days',
    requiredPermits: [],
    requiredSkills: [
      { skill: 'General DIY', level: 'beginner', criticality: 'recommended' },
    ],
    requiredTools: ['Basic tool kit'],
    warnings: ['Project details need refinement'],
    aiNotes: ['This is a generic estimate - please provide more details for accurate planning'],
    safetyConsiderations: ['Follow standard safety practices'],
    impactAnalysis: {
      tenantImpact: {
        severity: 'minimal',
        description: 'Minor disruption expected',
        noiseLevel: 'moderate',
        duration: '3-5 days',
      },
      ownerImpact: {
        financialImpact: 'Low to medium investment',
        propertyValueChange: 'neutral',
      },
      suggestedNotifications: [],
    },
    generatedAt: new Date().toISOString(),
    aiModel: 'mock',
    confidence: 0.60,
  };
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    lumber: 'Lumber & Framing',
    hardware: 'Hardware & Fasteners',
    electrical: 'Electrical',
    plumbing: 'Plumbing',
    finishing: 'Finishing Materials',
    concrete: 'Concrete & Masonry',
    decking: 'Decking Materials',
    roofing: 'Roofing',
    landscaping: 'Landscaping',
    other: 'Other Materials',
  };
  return labels[category] || category;
}
