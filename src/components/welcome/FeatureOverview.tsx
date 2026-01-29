import {
  Building2,
  Wrench,
  FileText,
  TrendingUp,
  Users,
  Sparkles,
} from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
}

export default function FeatureOverview() {
  const features: Feature[] = [
    {
      id: 'property-management',
      title: 'Property Management',
      description:
        'Organize and track all your properties in one place. Store details, documents, and photos for easy access.',
      icon: Building2,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      id: 'ai-projects',
      title: 'AI-Powered Projects',
      description:
        'Describe your maintenance project and get instant plans with material lists, cost estimates, and timelines.',
      icon: Sparkles,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      id: 'maintenance-tracking',
      title: 'Maintenance Tracking',
      description:
        'Track repairs, improvements, and routine maintenance. Never miss a scheduled task or warranty expiration.',
      icon: Wrench,
      iconColor: 'text-indigo-300',
      bgColor: 'bg-indigo-400/10',
    },
    {
      id: 'financial-reports',
      title: 'Financial Reports',
      description:
        'Monitor income, expenses, and profitability. Generate reports for tax time or investor presentations.',
      icon: TrendingUp,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      id: 'tenant-portal',
      title: 'Tenant Portal',
      description:
        'Give tenants a modern portal to submit maintenance requests, pay rent, and communicate with you.',
      icon: Users,
      iconColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      id: 'document-storage',
      title: 'Document Storage',
      description:
        'Securely store leases, invoices, contracts, and receipts. Everything organized and searchable.',
      icon: FileText,
      iconColor: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
    },
  ];

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">
          Everything You Need in One Platform
        </h2>
        <p className="text-gray-400">
          Powerful features designed to simplify property management
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.id}
              className={`${feature.bgColor} border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors`}
            >
              <div className={`inline-flex p-3 ${feature.bgColor} rounded-lg mb-4`}>
                <Icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
