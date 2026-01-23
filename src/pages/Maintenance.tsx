import { Wrench } from 'lucide-react';
import MaintenanceChecklist from '../components/MaintenanceChecklist';

export default function Maintenance() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand-orange/20 rounded-lg">
          <Wrench className="text-brand-orange" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-brand-light">Maintenance</h1>
          <p className="text-brand-muted mt-1">
            Track property maintenance tasks and schedules
          </p>
        </div>
      </div>

      {/* Maintenance Checklist */}
      <MaintenanceChecklist />
    </div>
  );
}
