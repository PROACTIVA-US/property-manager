import { Clock } from 'lucide-react';
import type { ScheduleSlot } from '../../lib/teacherProfile';

interface ScheduleSectionProps {
  schedule: ScheduleSlot[];
}

export default function ScheduleSection({ schedule }: ScheduleSectionProps) {
  if (schedule.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-cc-surface/50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="h-6 w-6 text-cc-accent" />
          <h2 className="text-2xl font-bold text-cc-text">Schedule</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedule.map((slot) => (
            <div
              key={slot.id}
              className="p-4 bg-cc-surface rounded-xl border border-cc-border"
            >
              <div className="font-semibold text-cc-text mb-1">{slot.day}</div>
              <div className="text-sm text-cc-muted">
                {slot.startTime} – {slot.endTime}
              </div>
              {slot.label && (
                <div className="text-xs text-cc-accent mt-2">{slot.label}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
