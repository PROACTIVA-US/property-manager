/**
 * Phase 4: AI Project Generator Service
 *
 * This service uses the Anthropic Claude API to generate detailed project plans,
 * including phases, Bill of Materials, and impact analysis.
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  ProjectGenerationRequest,
  GeneratedProject,
  AIGenerationResponse,
  AIGenerationOptions,
} from '../types/ai.types';
import { generateMockProject } from './ai-mock';

// ============================================================================
// Configuration
// ============================================================================

const USE_MOCK_MODE = !import.meta.env.VITE_ANTHROPIC_API_KEY;
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
const MODEL = 'claude-3-7-sonnet-20250219'; // Latest Claude model

// ============================================================================
// AI Client Initialization
// ============================================================================

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient && API_KEY) {
    anthropicClient = new Anthropic({
      apiKey: API_KEY,
      dangerouslyAllowBrowser: true, // For frontend use (consider using backend proxy in production)
    });
  }
  return anthropicClient!;
}

// ============================================================================
// Main Generation Function
// ============================================================================

/**
 * Generate a complete project plan from natural language description
 */
export async function generateProject(
  request: ProjectGenerationRequest,
  options: AIGenerationOptions = {} // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<AIGenerationResponse> {
  const startTime = Date.now();

  try {
    // Use mock mode if no API key is configured
    if (USE_MOCK_MODE) {
      console.log('Using mock AI generation (no API key configured)');
      const mockProject = generateMockProject(request);
      return {
        success: true,
        project: mockProject,
        processingTime: Date.now() - startTime,
      };
    }

    const client = getAnthropicClient();

    // Build the prompt
    const prompt = buildProjectGenerationPrompt(request, options);

    // Call Claude API
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: options.detailLevel === 'detailed' ? 8000 : 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse the response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const project = parseAIResponse(content.text, request);

    return {
      success: true,
      project,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('AI generation error:', error);
    return {
      success: false,
      error: {
        code: 'GENERATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        suggestions: [
          'Check your API key configuration',
          'Try simplifying your project description',
          'Enable mock mode for development',
        ],
      },
      processingTime: Date.now() - startTime,
    };
  }
}

// ============================================================================
// Prompt Building
// ============================================================================

function buildProjectGenerationPrompt(
  request: ProjectGenerationRequest,
  _options: AIGenerationOptions
): string {
  const { description, propertyContext, constraints } = request;

  const prompt = `You are an expert construction project planner and estimator. Generate a detailed, professional project plan based on the following requirements.

**Project Description:**
${description}

${propertyContext ? `
**Property Context:**
- Type: ${propertyContext.propertyType || 'Not specified'}
- Square Footage: ${propertyContext.squareFootage || 'Not specified'}
- Year Built: ${propertyContext.yearBuilt || 'Not specified'}
- Climate: ${propertyContext.climate || 'Not specified'}
- Existing Features: ${propertyContext.existingFeatures?.join(', ') || 'None specified'}
` : ''}

${constraints ? `
**Constraints:**
- Maximum Budget: ${constraints.maxBudget ? `$${constraints.maxBudget.toLocaleString()}` : 'No limit'}
- Timeline: ${constraints.preferredTimeline || 'Flexible'}
- DIY Level: ${constraints.diyLevel || 'Hire professionals'}
- Permits Required: ${constraints.permitRequired ? 'Yes' : 'Check local requirements'}
` : ''}

**Your Task:**
Generate a comprehensive project plan in the following JSON format. Be specific, realistic, and thorough.

\`\`\`json
{
  "title": "Clear, descriptive project title",
  "description": "Detailed 2-3 sentence description",
  "category": "one of: plumbing, electrical, hvac, roofing, painting, landscaping, flooring, structural, renovation, upgrade, repair, maintenance, other",
  "priority": "low | medium | high",
  "phases": [
    {
      "name": "Phase name",
      "description": "What happens in this phase",
      "estimatedDays": 3,
      "tasks": ["Task 1", "Task 2"],
      "requiredMaterials": ["Material 1", "Material 2"],
      "requiredSkills": ["Skill 1"],
      "requiredTools": ["Tool 1"],
      "inspectionRequired": true/false
    }
  ],
  "bom": {
    "items": [
      {
        "name": "Item name",
        "description": "Brief description",
        "category": "lumber | hardware | electrical | plumbing | finishing | concrete | decking | roofing | landscaping | other",
        "quantity": 10,
        "unit": "each | linear_ft | sq_ft | box | bag | gallon | lb | roll | sheet",
        "unitPrice": 25.99,
        "wasteFactor": 1.10,
        "notes": "Optional notes"
      }
    ]
  },
  "estimatedCost": {
    "materialsCost": 5000,
    "laborCost": 3000,
    "permitsCost": 200,
    "contingency": 800,
    "totalCost": 9000,
    "costRange": {"low": 8000, "high": 10000}
  },
  "estimatedDuration": "2-3 weeks",
  "requiredPermits": ["Building permit", "Electrical permit"],
  "requiredSkills": [
    {"skill": "Carpentry", "level": "intermediate", "criticality": "required"}
  ],
  "requiredTools": ["Circular saw", "Drill", "Level"],
  "warnings": ["Work may be weather-dependent", "Requires licensed electrician"],
  "aiNotes": ["Consider frost depth in your area", "LED lighting requires GFCI circuit"],
  "safetyConsiderations": ["Wear safety glasses", "Use proper ladder safety"],
  "impactAnalysis": {
    "tenantImpact": {
      "severity": "moderate",
      "description": "Brief access restrictions",
      "accessRestrictions": ["Back yard inaccessible for 1 week"],
      "noiseLevel": "moderate",
      "duration": "1 week",
      "mitigationSteps": ["Schedule during business hours"]
    },
    "ownerImpact": {
      "financialImpact": "Medium one-time investment",
      "propertyValueChange": "increase",
      "estimatedROI": 15,
      "maintenanceImpact": "Minimal annual maintenance required"
    }
  }
}
\`\`\`

**Important Guidelines:**
1. Be realistic with costs - use current market prices
2. Include all materials needed - down to screws and nails for major projects
3. Add 10-15% waste factor for materials
4. Consider local building codes and permit requirements
5. Break complex projects into logical phases
6. Include safety considerations
7. Provide accurate time estimates
8. Suggest professional help when needed

Return ONLY the JSON object, no additional text.`;

  return prompt;
}

// ============================================================================
// Response Parsing
// ============================================================================

function parseAIResponse(
  responseText: string,
  _request: ProjectGenerationRequest
): GeneratedProject {
  try {
    // Extract JSON from response (Claude sometimes wraps it in markdown)
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
                     responseText.match(/```\n([\s\S]*?)\n```/) ||
                     [null, responseText];

    const jsonText = jsonMatch[1] || responseText;
    const parsedData = JSON.parse(jsonText);

    // Process BOM items to add IDs and calculate totals
    if (parsedData.bom && parsedData.bom.items) {
      parsedData.bom.items = parsedData.bom.items.map((item: unknown, index: number) => {
        const bomItem = item as {
          quantity: number;
          unitPrice: number;
          wasteFactor: number;
          name: string;
          description: string;
          category: string;
          unit: string;
          notes?: string;
        };

        return {
          id: `bom_${Date.now()}_${index}`,
          ...bomItem,
          totalPrice: bomItem.quantity * bomItem.unitPrice * (bomItem.wasteFactor || 1),
        };
      });

      // Group by category
      const categoryMap = new Map<string, unknown[]>();
      parsedData.bom.items.forEach((item: { category: string }) => {
        if (!categoryMap.has(item.category)) {
          categoryMap.set(item.category, []);
        }
        categoryMap.get(item.category)!.push(item);
      });

      parsedData.bom.categories = Array.from(categoryMap.entries()).map(([category, items]) => {
        const categoryItems = items as Array<{ totalPrice: number }>;
        return {
          name: getCategoryLabel(category),
          category,
          items,
          subtotal: categoryItems.reduce((sum: number, item: { totalPrice: number }) => sum + item.totalPrice, 0),
          itemCount: items.length,
        };
      });

      // Add BOM metadata
      parsedData.bom.id = `bom_${Date.now()}`;
      parsedData.bom.projectId = '';
      parsedData.bom.subtotal = parsedData.estimatedCost?.materialsCost || 0;
      parsedData.bom.taxRate = 0.08;
      parsedData.bom.taxAmount = parsedData.bom.subtotal * 0.08;
      parsedData.bom.contingency = parsedData.estimatedCost?.contingency || 0;
      parsedData.bom.grandTotal = parsedData.estimatedCost?.totalCost || 0;
      parsedData.bom.generatedAt = new Date().toISOString();
      parsedData.bom.generatedBy = 'ai';
      parsedData.bom.priceSource = 'ai_estimate';
    }

    // Add metadata
    const project: GeneratedProject = {
      ...parsedData,
      status: 'draft',
      generatedAt: new Date().toISOString(),
      aiModel: USE_MOCK_MODE ? 'mock' : MODEL,
      confidence: 0.85,
    };

    return project;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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

// ============================================================================
// Export
// ============================================================================

export { USE_MOCK_MODE };
