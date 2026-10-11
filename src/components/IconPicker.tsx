import React, { useState, useRef, useEffect } from 'react';
import {
  Trophy,
  Award,
  BarChart3,
  TrendingUp,
  Gem,
  Rocket,
  Target,
  Star,
  Sparkles,
  Briefcase,
  Globe,
  Zap,
  Shield,
  Check,
  ChevronDown
} from 'lucide-react';
import { AchievementIconType } from '../types/resume';

export const ICON_OPTIONS: { id: AchievementIconType; label: string }[] = [
  { id: 'trophy', label: 'Trophy' },
  { id: 'award', label: 'Award' },
  { id: 'barchart', label: 'Bar Chart' },
  { id: 'trending', label: 'Growth / Metric' },
  { id: 'gem', label: 'Gem / Value' },
  { id: 'rocket', label: 'Launch / Scale' },
  { id: 'target', label: 'Goal / Target' },
  { id: 'star', label: 'Star / Top' },
  { id: 'sparkles', label: 'Innovation' },
  { id: 'briefcase', label: 'Corporate' },
  { id: 'globe', label: 'Global / Market' },
  { id: 'zap', label: 'Velocity / Impact' },
  { id: 'shield', label: 'Security / Risk' },
  { id: 'check', label: 'Milestone' }
];

export function renderAchievementIcon(
  iconType?: AchievementIconType,
  className = "w-4 h-4 text-amber-600 shrink-0"
): React.ReactNode {
  switch (iconType) {
    case 'trophy': return <Trophy className={className} />;
    case 'award': return <Award className={className} />;
    case 'barchart': return <BarChart3 className={className.replace('text-amber-600', 'text-blue-600')} />;
    case 'trending': return <TrendingUp className={className.replace('text-amber-600', 'text-emerald-600')} />;
    case 'gem': return <Gem className={className.replace('text-amber-600', 'text-purple-600')} />;
    case 'rocket': return <Rocket className={className.replace('text-amber-600', 'text-rose-600')} />;
    case 'target': return <Target className={className.replace('text-amber-600', 'text-red-600')} />;
    case 'star': return <Star className={className.replace('text-amber-600', 'text-yellow-500')} />;
    case 'sparkles': return <Sparkles className={className.replace('text-amber-600', 'text-indigo-600')} />;
    case 'briefcase': return <Briefcase className={className.replace('text-amber-600', 'text-slate-700')} />;
    case 'globe': return <Globe className={className.replace('text-amber-600', 'text-cyan-600')} />;
    case 'zap': return <Zap className={className.replace('text-amber-600', 'text-amber-500')} />;
    case 'shield': return <Shield className={className.replace('text-amber-600', 'text-blue-700')} />;
    case 'check': return <Check className={className.replace('text-amber-600', 'text-emerald-600')} />;
    default: return <Trophy className={className} />;
  }
}

interface IconPickerProps {
  value?: AchievementIconType;
  onChange: (icon: AchievementIconType) => void;
  title?: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  value = 'trophy',
  onChange,
  title = 'Select Icon'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOpt = ICON_OPTIONS.find(o => o.id === value) || ICON_OPTIONS[0];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
        title={title}
      >
        <span className="shrink-0">{renderAchievementIcon(value, "w-3.5 h-3.5 text-amber-600 shrink-0")}</span>
        <span className="text-[11px] font-medium text-slate-600 hidden sm:inline">{selectedOpt.label}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 z-50 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-2 animate-in fade-in zoom-in-95 duration-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1.5 pb-1 border-b border-slate-100 mb-1">
            Choose Icon
          </div>
          <div className="grid grid-cols-2 gap-1 max-h-56 overflow-y-auto">
            {ICON_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium text-left transition-colors cursor-pointer ${
                  value === opt.id
                    ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {renderAchievementIcon(opt.id, "w-3.5 h-3.5 shrink-0")}
                <span className="truncate">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
