import { useState } from 'react';
import { CheckCircle2, Circle, Calendar } from 'lucide-react';

interface Task {
  id: string;
  category: string;
  frequency: string;
  description: string;
  completed: boolean;
  dueDate?: string;
}

const INITIAL_TASKS: Task[] = [
  // Monthly
  { id: 'm1', category: 'Monthly Routine', frequency: 'Monthly', description: 'Test all smoke/CO detectors', completed: false },
  { id: 'm2', category: 'Monthly Routine', frequency: 'Monthly', description: 'Check for leaks/moisture', completed: false },
  { id: 'm3', category: 'Monthly Routine', frequency: 'Monthly', description: 'Clean range hood filter', completed: false },
  { id: 'm4', category: 'Monthly Routine', frequency: 'Monthly', description: 'Check water softener salt', completed: false },
  
  // Quarterly
  { id: 'q1', category: 'Quarterly Routine', frequency: 'Quarterly', description: 'Check and/or change HVAC filters', completed: false, dueDate: '2025-04-01' },
  
  // Bi-Annual
  { id: 'b1', category: 'Seasonal', frequency: 'Bi-Annual', description: 'Winter Prep: Clean gutters & inspect roof', completed: false, dueDate: '2025-10-01' },
  { id: 'b2', category: 'Seasonal', frequency: 'Bi-Annual', description: 'Deep Cleaning: Vacuum fridge coils', completed: false, dueDate: '2025-12-01' },
  
  // Annual
  { id: 'a1', category: 'Annual Routine', frequency: 'Annually', description: 'Flush water heater', completed: false, dueDate: '2026-01-01' },
  { id: 'a2', category: 'Annual Routine', frequency: 'Annually', description: 'Exterior: Vacuum dryer vent', completed: false, dueDate: '2025-06-01' },
];

export default function MaintenanceChecklist() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const categories = Array.from(new Set(tasks.map(t => t.category)));

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-brand-orange">Maintenance Checklist</h2>
        <span className="text-sm text-brand-muted bg-brand-dark/50 px-3 py-1 rounded-full">
          {tasks.filter(t => t.completed).length}/{tasks.length} Completed
        </span>
      </div>

      <div className="space-y-6">
        {categories.map(category => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-brand-light/70 uppercase tracking-wider mb-3 pl-1 border-l-2 border-brand-orange/50">
              {category}
            </h3>
            <div className="space-y-2">
              {tasks.filter(t => t.category === category).map(task => (
                <div 
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-start p-3 rounded-lg cursor-pointer transition-all border ${
                    task.completed 
                      ? 'bg-green-900/10 border-green-900/30 opacity-60' 
                      : 'bg-brand-dark/30 border-slate-700/50 hover:bg-brand-dark/50 hover:border-brand-orange/50'
                  }`}
                >
                  <div className={`mt-0.5 mr-3 ${task.completed ? 'text-green-500' : 'text-brand-muted'}`}>
                    {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${task.completed ? 'line-through text-brand-muted' : 'text-brand-light'}`}>
                      {task.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-brand-muted bg-brand-dark px-1.5 py-0.5 rounded">
                        {task.frequency}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs flex items-center text-brand-orange/80">
                          <Calendar size={10} className="mr-1" />
                          Due: {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
