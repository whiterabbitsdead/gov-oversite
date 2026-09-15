/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ShieldAlert, 
  Coins, 
  TrendingUp, 
  Moon, 
  Activity, 
  AlertTriangle,
  Play,
  CheckCircle2,
  Lock,
  ChevronDown,
  Sparkles,
  Info
} from 'lucide-react';
import { Legislator } from '../types';

export interface CustomFlag {
  id: string;
  name: string;
  metric: 'aipac_funding' | 'corporate_index' | 'transparency_index' | 'late_night_votes';
  operator: 'greater_than' | 'less_than';
  value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  triggeredCount?: number;
}

interface CustomFlagsPanelProps {
  customFlags: CustomFlag[];
  onAddFlag: (flag: CustomFlag) => void;
  onRemoveFlag: (id: string) => void;
  onRunScan: (flag: CustomFlag) => void;
  legislators: Legislator[];
}

export function CustomFlagsPanel({ 
  customFlags, 
  onAddFlag, 
  onRemoveFlag, 
  onRunScan,
  legislators 
}: CustomFlagsPanelProps) {
  // Form State
  const [name, setName] = useState('');
  const [metric, setMetric] = useState<'aipac_funding' | 'corporate_index' | 'transparency_index' | 'late_night_votes'>('aipac_funding');
  const [operator, setOperator] = useState<'greater_than' | 'less_than'>('greater_than');
  const [value, setValue] = useState<string>('50000');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [description, setDescription] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(true);

  // Auto-filled Description Helper when inputs change
  const handleMetricChange = (newMetric: typeof metric) => {
    setMetric(newMetric);
    // Suggest standard threshold and placeholder descriptions
    if (newMetric === 'aipac_funding') {
      setValue('100000');
      setDescription('Exceeds user-defined acceptable PAC lobbying funding from C00797670.');
    } else if (newMetric === 'corporate_index') {
      setValue('75');
      setDescription('Corporate Vote alignment index exceeds threshold, suggesting industry-leaning record.');
    } else if (newMetric === 'transparency_index') {
      setValue('45');
      setOperator('less_than');
      setDescription('Factual Legislative Transparency Index score is dangerously low, indicating opaque voting patterns.');
    } else if (newMetric === 'late_night_votes') {
      setValue('5');
      setOperator('greater_than');
      setDescription('Excessive midnight votes cast in non-standard legislative hours with minimal review.');
    }
  };

  const calculateTransparencyIndex = (leg: Legislator): number => {
    const f1 = Math.max(0, 100 - (leg.late_night_votes_count * 15));
    const f2 = Math.min(100, Math.round((leg.avg_review_hours_major_bills / 72) * 100));
    const f3 = Math.min(100, leg.transparency_bill_sponsorships * 25);
    return Math.round((f1 * 0.4) + (f2 * 0.4) + (f3 * 0.2));
  };

  // Check how many legislators would be triggered by a specific flag
  const checkTriggeredCount = (flag: Omit<CustomFlag, 'id'>) => {
    return legislators.filter(leg => {
      let valToTest = 0;
      if (flag.metric === 'aipac_funding') {
        valToTest = leg.aipac_funding_total;
      } else if (flag.metric === 'corporate_index') {
        valToTest = leg.corporate_vote_index;
      } else if (flag.metric === 'transparency_index') {
        valToTest = calculateTransparencyIndex(leg);
      } else if (flag.metric === 'late_night_votes') {
        valToTest = leg.late_night_votes_count;
      }

      if (flag.operator === 'greater_than') {
        return valToTest > flag.value;
      } else {
        return valToTest < flag.value;
      }
    }).length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const valNum = Number(value) || 0;
    const finalDesc = description.trim() || `Custom watchdog flag triggered: ${name}`;

    const newFlag: CustomFlag = {
      id: `custom-flag-${Date.now()}`,
      name: name.trim(),
      metric,
      operator,
      value: valNum,
      severity,
      description: finalDesc
    };

    onAddFlag(newFlag);

    // Reset Form
    setName('');
    setDescription('');
  };

  const getMetricLabel = (m: string) => {
    switch (m) {
      case 'aipac_funding': return 'AIPAC PAC Funding';
      case 'corporate_index': return 'Corporate Alignment';
      case 'transparency_index': return 'Transparency Index';
      case 'late_night_votes': return 'Midnight Votes';
      default: return m;
    }
  };

  const getMetricIcon = (m: string) => {
    switch (m) {
      case 'aipac_funding': return <Coins size={14} className="text-amber-400" />;
      case 'corporate_index': return <TrendingUp size={14} className="text-indigo-400" />;
      case 'transparency_index': return <Activity size={14} className="text-emerald-400" />;
      case 'late_night_votes': return <Moon size={14} className="text-rose-400" />;
      default: return <ShieldAlert size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Introduction Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-indigo-950/50 border border-indigo-900/60 text-indigo-400 rounded-xl">
            <ShieldAlert size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-wider text-white uppercase">WATCHDOG CUSTOM RULES ENGINE</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Design custom transparency metrics thresholds. The system cross-examines active legislators against your custom rules in real-time. Once created, run a live scan to dispatch mock cloud notifications and append persistent visual alert indicators onto matching legislator cards.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Flag Creator Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4 self-start">
          <div className="flex items-center justify-between border-b border-slate-800/50 pb-2.5">
            <span className="text-xs font-black tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
              <Plus size={14} className="text-indigo-400" />
              Build Custom Rule
            </span>
            <span className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-900/40 px-1.5 py-0.5 rounded font-bold uppercase font-mono">
              USER CONFIG
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rule Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Rule Label / Title
              </label>
              <input type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Extreme PAC Funding Threshold"
                required
                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
              />
            </div>

            {/* Metric Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Metric Target
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'aipac_funding', label: 'AIPAC PAC Total' },
                  { id: 'corporate_index', label: 'Corporate Index' },
                  { id: 'transparency_index', label: 'Transparency score' },
                  { id: 'late_night_votes', label: 'Midnight Votes count' },
                ].map((item) => (
                  <button aria-label="handleMetricChange(item.id as any)} className=`} >"
                    key={item.id}
                    type="button"
                    onClick={() => handleMetricChange(item.id as any)}
                    className={`h-9 px-2 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      metric === item.id 
                        ? 'bg-indigo-950/50 border-indigo-500/50 text-white' 
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {getMetricIcon(item.id)}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Operator and Value */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Operator
                </label>
                <select value={operator}
                  onChange={(e: any) => setOperator(e.target.value)}
                  className="w-full h-10 px-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="greater_than">Is Greater Than (&gt;)</option>
                  <option value="less_than">Is Less Than (&lt;)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Threshold Value
                </label>
                <input type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                  min="0"
                  className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 font-mono focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Severity */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Assign Severity Level
              </label>
              <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-850">
                {(['low', 'medium', 'high', 'critical'] as const).map((sev) => {
                  let activeStyle = "";
                  if (sev === 'low') activeStyle = "bg-slate-800 text-amber-400";
                  else if (sev === 'medium') activeStyle = "bg-slate-800 text-orange-400";
                  else if (sev === 'high') activeStyle = "bg-rose-950 text-rose-300";
                  else activeStyle = "bg-red-950 text-red-400";

                  return (
                    <button key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`flex-1 py-1.5 rounded text-[9px] font-black uppercase transition-all ${
                        severity === sev 
                          ? `${activeStyle} shadow-sm border border-slate-700/35` 
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {sev}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Flag Warning Description
              </label>
              <textarea value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Lawmaker is funded heavily by foreign PAC interests contrary to public disclosures."
                rows={2}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Submit */}
            <button type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <Plus size={14} />
              <span>Register Transparency Rule</span>
            </button>
          </form>

          {/* Quick Simulation Help Card */}
          <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-3 flex gap-2.5 items-start">
            <Info size={14} className="text-slate-500 shrink-0 mt-0.5" />
            <div className="text-[10px] text-slate-400 leading-normal">
              <span className="font-bold text-slate-300 block mb-0.5">Real-time Simulation:</span>
              Once registered, click <strong className="text-indigo-400">Run Watchdog Scan</strong> on your rule to cross-reference every active lawmaker and update the live dashboard!
            </div>
          </div>
        </div>

        {/* Custom Flags List */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/50 pb-2.5">
              <span className="text-xs font-black tracking-wider text-slate-300 uppercase flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-400" />
                Active Custom Rules ({customFlags.length})
              </span>
              <span className="text-[9px] text-slate-500 italic">User Defined Criteria</span>
            </div>

            {customFlags.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-800/60 rounded-xl px-4 bg-slate-950/20">
                <ShieldAlert size={34} className="text-slate-700 mb-3" />
                <span className="text-xs font-bold text-slate-400">No Custom Rules Configured</span>
                <p className="text-[10px] text-slate-500 max-w-xs mt-1 leading-normal">
                  Create custom rules using the sidebar form to monitor lobbyist activity or transparency indicators.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin">
                {customFlags.map((flag) => {
                  const projectedMatches = checkTriggeredCount(flag);
                  
                  let cardBorder = "border-slate-850 hover:border-slate-800 bg-slate-950/60";
                  let badgeStyle = "bg-slate-900 border-slate-800 text-slate-400";
                  let dotStyle = "bg-slate-400";
                  
                  if (flag.severity === 'critical') {
                    cardBorder = "border-red-950/50 hover:border-red-900 bg-red-950/5";
                    badgeStyle = "bg-red-950/50 text-red-400 border-red-900/60";
                    dotStyle = "bg-red-500 animate-pulse";
                  } else if (flag.severity === 'high') {
                    cardBorder = "border-rose-950/50 hover:border-rose-900 bg-rose-950/5";
                    badgeStyle = "bg-rose-950/50 text-rose-300 border-rose-900/60";
                    dotStyle = "bg-rose-400";
                  } else if (flag.severity === 'medium') {
                    cardBorder = "border-amber-950/50 hover:border-amber-900 bg-amber-950/5";
                    badgeStyle = "bg-amber-950/50 text-amber-300 border-amber-900/60";
                    dotStyle = "bg-amber-400";
                  }

                  return (
                    <div 
                      key={flag.id} 
                      className={`border p-3.5 rounded-xl transition-all space-y-2.5 relative group ${cardBorder}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1 flex-1">
                          <span className="font-extrabold text-white text-xs leading-snug flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${dotStyle}`}></span>
                            {flag.name}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                            <span className="flex items-center gap-1">
                              {getMetricIcon(flag.metric)}
                              {getMetricLabel(flag.metric)}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-indigo-400">
                              {flag.operator === 'greater_than' ? '>' : '<'} {flag.metric === 'aipac_funding' ? `$${flag.value.toLocaleString()}` : flag.value}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${badgeStyle}`}>
                            {flag.severity}
                          </span>
                          <button onClick={() => onRemoveFlag(flag.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                            title="Delete rule"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-normal bg-slate-950/30 p-2 rounded-lg border border-slate-900/40">
                        {flag.description}
                      </p>

                      <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-900/50">
                        <span className="text-[10px] text-slate-400 font-medium">
                          Estimated matching legislators: <strong className={projectedMatches > 0 ? "text-amber-400 font-mono" : "text-slate-500 font-mono"}>{projectedMatches}</strong>
                        </span>

                        <button onClick={() => onRunScan(flag)}
                          className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-900/60 hover:border-indigo-700/80 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Play size={10} className="fill-indigo-300" />
                          <span>Run Watchdog Scan</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <span className="text-[10px] text-slate-500 leading-relaxed max-w-sm">
              Custom rules reside purely in active client state. You can scan repeatedly to test the alert pipelines.
            </span>
            {customFlags.length > 0 && (
              <button onClick={() => {
                  customFlags.forEach(f => onRunScan(f));
                }}
                className="py-1.5 px-3 bg-gradient-to-r from-emerald-950 to-indigo-950 hover:from-emerald-900 hover:to-indigo-900 text-white text-[10px] font-bold rounded-lg border border-indigo-900/60 transition-all flex items-center gap-1.5 cursor-pointer self-end md:self-auto"
              >
                <Sparkles size={11} className="text-amber-400" />
                <span>Run Batch Audit Scanner ({customFlags.length} Rules)</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
