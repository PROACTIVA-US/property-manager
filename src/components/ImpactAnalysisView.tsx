import { AlertTriangle, Info, DollarSign, Clock, Users, Sparkles } from 'lucide-react';
import type { ImpactAnalysis } from '../lib/projects';

interface ImpactAnalysisViewProps {
  analysis: ImpactAnalysis;
}

export default function ImpactAnalysisView({ analysis }: ImpactAnalysisViewProps) {
  const getImpactLevelColor = (level: ImpactAnalysis['tenantImpact']['level']) => {
    const colors = {
      none: 'bg-green-500/20 text-green-400 border-green-500/30',
      minimal: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      moderate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      significant: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[level];
  };

  const getImpactLevelLabel = (level: ImpactAnalysis['tenantImpact']['level']) => {
    const labels = {
      none: 'No Impact',
      minimal: 'Minimal Impact',
      moderate: 'Moderate Impact',
      significant: 'Significant Impact',
    };
    return labels[level];
  };

  const getRecipientColor = (recipient: string) => {
    const colors = {
      tenant: 'text-green-400 bg-green-500/20',
      owner: 'text-orange-400 bg-orange-500/20',
      pm: 'text-blue-400 bg-blue-500/20',
      vendor: 'text-purple-400 bg-purple-500/20',
    };
    return colors[recipient as keyof typeof colors] || 'text-slate-400 bg-slate-500/20';
  };

  return (
    <div className="space-y-6">
      {/* AI Badge */}
      <div className="flex items-center gap-2 text-purple-400">
        <Sparkles size={20} />
        <h3 className="text-lg font-semibold">AI-Generated Impact Analysis</h3>
      </div>

      {/* Tenant Impact */}
      <div className="bg-brand-dark rounded-lg p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Users size={18} className="text-brand-muted" />
          <h4 className="font-semibold text-brand-light">Tenant Impact</h4>
          <span className={`ml-auto px-3 py-1 rounded border ${getImpactLevelColor(analysis.tenantImpact.level)}`}>
            {getImpactLevelLabel(analysis.tenantImpact.level)}
          </span>
        </div>

        <p className="text-sm text-brand-muted mb-3">{analysis.tenantImpact.description}</p>

        {analysis.tenantImpact.estimatedDuration && (
          <div className="flex items-center gap-2 text-sm text-brand-muted mb-2">
            <Clock size={14} />
            <span>Estimated Duration: {analysis.tenantImpact.estimatedDuration}</span>
          </div>
        )}

        {analysis.tenantImpact.accessRestrictions && analysis.tenantImpact.accessRestrictions.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-brand-muted mb-1 flex items-center gap-1">
              <AlertTriangle size={12} />
              Access Restrictions:
            </p>
            <ul className="list-disc list-inside text-sm text-brand-muted space-y-1">
              {analysis.tenantImpact.accessRestrictions.map((restriction, idx) => (
                <li key={idx}>{restriction}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.tenantImpact.recommendations.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-brand-muted mb-1 flex items-center gap-1">
              <Info size={12} />
              Recommendations:
            </p>
            <ul className="list-disc list-inside text-sm text-brand-muted space-y-1">
              {analysis.tenantImpact.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Owner Impact */}
      <div className="bg-brand-dark rounded-lg p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign size={18} className="text-brand-muted" />
          <h4 className="font-semibold text-brand-light">Owner Impact</h4>
          <span className={`ml-auto px-3 py-1 rounded border ${getImpactLevelColor(analysis.ownerImpact.level)}`}>
            {getImpactLevelLabel(analysis.ownerImpact.level)}
          </span>
        </div>

        <p className="text-sm text-brand-muted mb-3">{analysis.ownerImpact.description}</p>

        {analysis.ownerImpact.financialNotes && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-3">
            <p className="text-xs font-semibold text-orange-400 mb-1">Financial Notes:</p>
            <p className="text-sm text-orange-300">{analysis.ownerImpact.financialNotes}</p>
          </div>
        )}

        {analysis.ownerImpact.recommendations.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-brand-muted mb-1 flex items-center gap-1">
              <Info size={12} />
              Recommendations:
            </p>
            <ul className="list-disc list-inside text-sm text-brand-muted space-y-1">
              {analysis.ownerImpact.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Suggested Notifications */}
      {analysis.suggestedNotifications.length > 0 && (
        <div className="bg-brand-dark rounded-lg p-4 border border-white/10">
          <h4 className="font-semibold text-brand-light mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-yellow-400" />
            Suggested Notifications
          </h4>
          <div className="space-y-2">
            {analysis.suggestedNotifications.map((notification, idx) => (
              <div
                key={idx}
                className="bg-brand-darker rounded-lg p-3 border border-white/10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRecipientColor(notification.recipient)}`}>
                    {notification.recipient.toUpperCase()}
                  </span>
                  <span className="text-xs text-brand-muted">
                    {notification.timing === 'immediate' && '📢 Immediate'}
                    {notification.timing === 'before_start' && '⏰ Before Start'}
                    {notification.timing === 'on_completion' && '✅ On Completion'}
                  </span>
                </div>
                <p className="text-sm text-brand-light">{notification.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Metadata */}
      <div className="text-xs text-brand-muted text-center pt-4 border-t border-white/10">
        Generated on {new Date(analysis.generatedAt).toLocaleString()}
      </div>
    </div>
  );
}
