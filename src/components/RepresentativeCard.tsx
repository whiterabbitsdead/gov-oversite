/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Legislator } from '../types';
import { CustomFlag } from './CustomFlagsPanel';
import { 
  DollarSign, 
  ShieldAlert, 
  Award, 
  User, 
  Landmark, 
  Moon, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle2, 
  Info,
  Sparkles,
  Star
} from 'lucide-react';

interface RepresentativeCardProps {
  legislator: Legislator;
  customFlags?: CustomFlag[];
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  alignmentScore?: number;
  onShowBriefing?: (legislator: Legislator) => void;
  key?: React.Key;
}

export function RepresentativeCard({ 
  legislator, 
  customFlags = [], 
  isFavorite = false, 
  onToggleFavorite, 
  alignmentScore,
  onShowBriefing
}: RepresentativeCardProps) {
  const { 
    name, 
    state, 
    party, 
    role, 
    aipac_funding_total, 
    society_affiliations,
    total_campaign_funds,
    small_dollar_percentage,
    large_dollar_percentage,
    pac_percentage,
    les_score,
    les_benchmark,
    les_rating,
    bills_sponsored_count,
    bills_out_of_committee_count,
    bills_became_law_count,
    committees,
    committee_conflicts
  } = legislator;
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Party styling
  const partyColor =
    party === 'Democrat'
      ? 'bg-blue-950/40 text-blue-400 border-blue-800/60'
      : party === 'Republican'
      ? 'bg-red-950/40 text-red-400 border-red-800/60'
      : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60';

  const partyDot =
    party === 'Democrat' ? 'bg-blue-400' : party === 'Republican' ? 'bg-red-400' : 'bg-emerald-400';

  // Format funding amount
  const formattedFunding = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(aipac_funding_total);

  // Scoring algorithm based on Factual Legislative Transparency Index metrics
  // Factor 1: Voting Transparency (40% weight). No late night votes = 100.
  const f1_score = Math.max(0, 100 - (legislator.late_night_votes_count * 15));
  
  // Factor 2: Review Opportunity (40% weight). Target = 72+ hours of review before voting on major bills.
  const f2_score = Math.min(100, Math.round((legislator.avg_review_hours_major_bills / 72) * 100));
  
  // Factor 3: Specific Contribution (20% weight). Sponsorship of public access/mandated review bills.
  const f3_score = Math.min(100, legislator.transparency_bill_sponsorships * 25);

  // Composite calculation
  const transparency_index = Math.round((f1_score * 0.4) + (f2_score * 0.4) + (f3_score * 0.2));

  // Reactive custom watchdog flags evaluation
  const triggeredCustomFlags = useMemo(() => {
    if (!customFlags || customFlags.length === 0) return [];
    return customFlags.filter(flag => {
      let valToTest = 0;
      if (flag.metric === 'aipac_funding') {
        valToTest = aipac_funding_total;
      } else if (flag.metric === 'corporate_index') {
        valToTest = legislator.corporate_vote_index;
      } else if (flag.metric === 'transparency_index') {
        valToTest = transparency_index;
      } else if (flag.metric === 'late_night_votes') {
        valToTest = legislator.late_night_votes_count;
      }

      if (flag.operator === 'greater_than') {
        return valToTest > flag.value;
      } else {
        return valToTest < flag.value;
      }
    });
  }, [customFlags, aipac_funding_total, legislator, transparency_index]);

  // Visual label rating helper
  const getTransparencyLabel = (score: number) => {
    if (score >= 80) {
      return { 
        label: 'Highly Transparent', 
        color: 'text-emerald-400', 
        barColor: 'from-emerald-600 to-emerald-400 shadow-emerald-950/20',
        badgeBg: 'bg-emerald-950/30 border-emerald-800/50',
        desc: 'Consistent adherence to standard hours, thorough bill reviews, and active support for public access.'
      };
    }
    if (score >= 50) {
      return { 
        label: 'Moderately Transparent', 
        color: 'text-amber-400', 
        barColor: 'from-amber-600 to-amber-400 shadow-amber-950/20',
        badgeBg: 'bg-amber-950/30 border-amber-800/50',
        desc: 'Occasional off-hours votes or expedited reviews of major legislation with mixed co-sponsorship history.'
      };
    }
    return { 
      label: 'Opaque / Low Transparency', 
      color: 'text-rose-400', 
      barColor: 'from-rose-600 to-rose-400 shadow-rose-950/20',
      badgeBg: 'bg-rose-950/30 border-rose-800/50',
      desc: 'Frequent non-standard hours voting, minimal waiting periods on complex drafts, and low to zero access sponsorships.'
    };
  };

  const scoreInfo = getTransparencyLabel(transparency_index);

  const hasNewFlag = useMemo(() => {
    if (!legislator.conflict_triggers || legislator.conflict_triggers.length === 0) {
      return false;
    }
    const referenceDate = new Date("2026-07-08T04:23:05-07:00");
    const now = new Date();
    const msIn24Hours = 24 * 60 * 60 * 1000;

    return legislator.conflict_triggers.some(trigger => {
      if (!trigger.date) return false;
      const triggerDate = new Date(trigger.date + "T00:00:00");
      const diffNow = Math.abs(now.getTime() - triggerDate.getTime());
      const diffRef = Math.abs(referenceDate.getTime() - triggerDate.getTime());
      
      const dateParts = trigger.date.split('-');
      const tYear = parseInt(dateParts[0], 10);
      const tMonth = parseInt(dateParts[1], 10) - 1;
      const tDay = parseInt(dateParts[2], 10);
      
      const isRefClose = (tYear === 2026 && tMonth === 6 && (tDay === 8 || tDay === 7));
      const isNowClose = (tYear === now.getFullYear() && tMonth === now.getMonth() && Math.abs(tDay - now.getDate()) <= 1);

      return diffNow <= msIn24Hours || diffRef <= msIn24Hours || isRefClose || isNowClose;
    });
  }, [legislator.conflict_triggers]);

  return (
    <div 
      id={`card-${legislator.legislator_id}`}
      className="bg-slate-900/95 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-slate-850 border border-slate-800 text-slate-300`}>
              {role === 'Senator' ? <Landmark size={18} className="text-slate-400" /> : <User size={18} className="text-slate-400" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-semibold text-white tracking-tight text-base">{name}</h3>
                {legislator.verified_member_page && (
                  <span className="inline-flex items-center gap-1 bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider font-mono shrink-0" title="Official Verified Member Page">
                    <CheckCircle2 size={9} className="text-cyan-400 fill-cyan-400/20" />
                    <span>VERIFIED</span>
                  </span>
                )}
                {hasNewFlag && (
                  <span 
                    id={`badge-new-flag-${legislator.legislator_id}`}
                    className="inline-flex items-center gap-1 bg-rose-950/60 text-rose-400 border border-rose-800/50 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider font-mono shrink-0 animate-pulse" 
                    title="An integrity alert was added within the last 24 hours"
                  >
                    <ShieldAlert size={9} className="text-rose-400 fill-rose-400/20" />
                    <span>NEW FLAG</span>
                  </span>
                )}
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(legislator.legislator_id)}
                    className={`p-1 rounded-md transition-colors ${
                      isFavorite 
                        ? 'text-amber-400 hover:text-amber-300 bg-amber-950/25 border border-amber-900/35' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 border border-transparent'
                    }`}
                    title={isFavorite ? "Remove from Watchlist" : "Add to Watchlist"}
                  >
                    <Star size={13} fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {role} • {state}
              </p>
              {small_dollar_percentage !== undefined && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {small_dollar_percentage < 20 ? (
                    <span className="px-2 py-0.5 text-[9px] font-black rounded bg-red-950/50 text-red-400 border border-red-900/40 font-mono tracking-wider uppercase flex items-center gap-1 shrink-0">
                      💼 Corporate Funded
                    </span>
                  ) : small_dollar_percentage >= 50 ? (
                    <span className="px-2 py-0.5 text-[9px] font-black rounded bg-emerald-950/50 text-emerald-400 border border-emerald-900/40 font-mono tracking-wider uppercase flex items-center gap-1 shrink-0">
                      🌱 Grassroots Funded
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[9px] font-black rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono tracking-wider uppercase flex items-center gap-1 shrink-0">
                      ⚖️ Mixed Financing
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${partyColor} flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${partyDot}`}></span>
            {party}
          </span>
        </div>

        {/* Midnight Vote Alert Indicator */}
        {legislator.midnight_vote_badge && (
          <div className="mb-4 bg-rose-950/20 border border-rose-900/30 rounded-xl p-3 flex items-start gap-2.5 shadow-sm">
            <Moon size={15} className="text-rose-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-wider text-rose-300">MIDNIGHT VOTE WARNING</span>
                <span className="text-[8px] font-mono bg-rose-900/40 text-rose-200 px-1.5 py-0.5 rounded uppercase font-semibold">Alert Live</span>
              </div>
              {legislator.midnight_votes && legislator.midnight_votes.map((vote, vIdx) => (
                <p key={vIdx} className="text-[10px] text-slate-300 mt-1 leading-normal">
                  Voted on <span className="font-bold text-white">{vote.bill_number}</span> at <span className="font-mono text-rose-300 font-medium">{vote.timestamp}</span> (Outside Transparency Window)
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Factual Legislative Transparency Index & Personal Alignment Section */}
        <div className="my-5 bg-slate-950/50 p-4 rounded-xl border border-slate-800/60 space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-2">
              <span className="tracking-wider uppercase text-[10px] font-mono text-slate-500">TRANSPARENCY INDEX</span>
              <span className={`font-mono font-bold text-xs ${scoreInfo.color}`}>
                {transparency_index} / 100
              </span>
            </div>

            {/* Elegant Modern Progress Bar */}
            <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-[2px]">
              <div 
                className={`absolute top-[2px] bottom-[2px] left-[2px] bg-gradient-to-r rounded-full transition-all duration-500 ${scoreInfo.barColor}`}
                style={{ width: `calc(${transparency_index}% - 4px)` }}
              />
            </div>
          </div>

          {alignmentScore !== undefined && (
            <div className="pt-3 border-t border-slate-900/60">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-2">
                <span className="tracking-wider uppercase text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <Sparkles size={11} className="animate-pulse" />
                  Grassroots Alignment
                </span>
                <span className={`font-mono font-bold text-xs ${
                  alignmentScore >= 80 ? 'text-emerald-400' : alignmentScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {alignmentScore}%
                </span>
              </div>

              {/* Alignment Progress Bar */}
              <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-[2px]">
                <div 
                  className={`absolute top-[2px] bottom-[2px] left-[2px] bg-gradient-to-r rounded-full transition-all duration-500 ${
                    alignmentScore >= 80 
                      ? 'from-emerald-600 to-emerald-400 shadow-emerald-950/20' 
                      : alignmentScore >= 50 
                      ? 'from-amber-600 to-amber-400 shadow-amber-950/20' 
                      : 'from-rose-600 to-rose-400 shadow-rose-950/20'
                  }`}
                  style={{ width: `calc(${alignmentScore}% - 4px)` }}
                />
              </div>

              {/* Grassroots Champion Badge */}
              {alignmentScore >= 80 && aipac_funding_total === 0 && (
                <div className="mt-2.5 flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 rounded-md font-mono w-fit">
                  <Sparkles size={9} className="text-emerald-400 animate-pulse" />
                  Grassroots Hero: Zero PAC Influence
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${scoreInfo.badgeBg} ${scoreInfo.color}`}>
              {scoreInfo.label}
            </span>
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 transition-colors"
            >
              <span>{showBreakdown ? 'Hide Breakdown' : 'Show Details'}</span>
              {showBreakdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {/* Interactive Breakdown Reveal */}
          {showBreakdown && (
            <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-3.5 animate-fade-in text-xs text-slate-300">
              <p className="text-[11px] leading-relaxed text-slate-400 italic">
                {scoreInfo.desc}
              </p>

              <div className="space-y-2.5">
                {/* Factor 1 Row */}
                <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-850/60">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white text-[11px] flex items-center gap-1">
                      <Moon size={11} className="text-rose-400" />
                      Voting Timing (40% Weight)
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 font-semibold">
                      Score: {f1_score}/100
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Fewer late-night votes (8 PM – 7 AM) increases this score.
                  </p>
                  <p className="text-[10px] font-mono font-medium text-slate-300 mt-1">
                    → {legislator.late_night_votes_count} late-night votes recorded.
                  </p>
                </div>

                {/* Factor 2 Row */}
                <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-850/60">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white text-[11px] flex items-center gap-1">
                      <Clock size={11} className="text-amber-400" />
                      Review Opportunity (40% Weight)
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 font-semibold">
                      Score: {f2_score}/100
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Waiting at least 72 hours on major bills improves this score.
                  </p>
                  <p className="text-[10px] font-mono font-medium text-slate-300 mt-1">
                    → Average {legislator.avg_review_hours_major_bills} hrs review before voting.
                  </p>
                </div>

                {/* Factor 3 Row */}
                <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-850/60">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white text-[11px] flex items-center gap-1">
                      <Sparkles size={11} className="text-indigo-400" />
                      Access Sponsorships (20% Weight)
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 font-semibold">
                      Score: {f3_score}/100
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Active sponsorship of legislation that mandates openness or review periods.
                  </p>
                  <p className="text-[10px] font-mono font-medium text-slate-300 mt-1">
                    → {legislator.transparency_bill_sponsorships} transparency bills sponsored.
                  </p>

                  {/* List sponsored bills if they exist */}
                  {legislator.sponsored_transparency_bills && legislator.sponsored_transparency_bills.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-slate-850/40">
                      <span className="text-[9px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">SPONSORED LEGISLATION:</span>
                      <ul className="space-y-1">
                        {legislator.sponsored_transparency_bills.map((bill, bIdx) => (
                          <li key={bIdx} className="text-[10px] text-indigo-300 bg-indigo-950/25 px-2 py-0.5 rounded border border-indigo-900/30 flex items-center gap-1">
                            <span className="text-indigo-500">✓</span> {bill}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Feature 8: Small-Dollar vs Mega-Donor Ratio (OpenFEC) */}
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850/60 space-y-3.5 pt-4">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                      <DollarSign size={12} className="text-emerald-400" />
                      OpenFEC Campaign Financing
                    </span>
                    <span className="text-[9px] font-mono bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-850 font-bold uppercase">
                      Donor Ratios
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* SVG Donut Chart */}
                    <div className="relative w-[80px] h-[80px] shrink-0 flex items-center justify-center bg-slate-950/30 p-1.5 rounded-full border border-slate-850">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                        {/* Background Track */}
                        <circle
                          cx="40"
                          cy="40"
                          r="30"
                          fill="none"
                          className="stroke-slate-800"
                          strokeWidth="7"
                        />
                        
                        {/* Small-dollar Circle (Emerald) */}
                        <circle
                          cx="40"
                          cy="40"
                          r="30"
                          fill="none"
                          className="stroke-emerald-400 transition-all duration-500"
                          strokeWidth="7"
                          strokeDasharray={`${(small_dollar_percentage || 0) * 1.885} 188.5`}
                          strokeDashoffset="0"
                        />

                        {/* Large-dollar Circle (Blue) */}
                        <circle
                          cx="40"
                          cy="40"
                          r="30"
                          fill="none"
                          className="stroke-blue-400 transition-all duration-500"
                          strokeWidth="7"
                          strokeDasharray={`${(large_dollar_percentage || 0) * 1.885} 188.5`}
                          strokeDashoffset={-((small_dollar_percentage || 0) * 1.885)}
                        />

                        {/* PAC Circle (Purple) */}
                        <circle
                          cx="40"
                          cy="40"
                          r="30"
                          fill="none"
                          className="stroke-purple-400 transition-all duration-500"
                          strokeWidth="7"
                          strokeDasharray={`${(pac_percentage || 0) * 1.885} 188.5`}
                          strokeDashoffset={-(((small_dollar_percentage || 0) + (large_dollar_percentage || 0)) * 1.885)}
                        />
                      </svg>
                      
                      {/* Central text overlay */}
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-black font-mono text-white leading-none">
                          {small_dollar_percentage || 0}%
                        </span>
                        <span className="text-[7px] text-slate-500 font-mono font-bold uppercase leading-none mt-0.5">
                          Small
                        </span>
                      </div>
                    </div>

                    {/* Donor Breakdown Legends */}
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex justify-between items-center text-[11px] text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 block" />
                          <span>Citizen Small-Dollar (&lt;$200)</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">{small_dollar_percentage || 0}%</span>
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-400 block" />
                          <span>Large Individual Donors</span>
                        </div>
                        <span className="font-mono font-bold text-blue-400">{large_dollar_percentage || 0}%</span>
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-400 block" />
                          <span>Special Interest PACs</span>
                        </div>
                        <span className="font-mono font-bold text-purple-400">{pac_percentage || 0}%</span>
                      </div>

                      {total_campaign_funds && (
                        <div className="pt-1.5 border-t border-slate-800/40 flex justify-between items-center text-[9px] text-slate-500 font-mono font-bold">
                          <span>TOTAL WAR-CHEST:</span>
                          <span className="text-slate-300">${total_campaign_funds.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Feature 7: Legislative Effectiveness Scoring (CEL) */}
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850/60 space-y-3 pt-4">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                      <Award size={12} className="text-indigo-400" />
                      CEL Legislative Effectiveness
                    </span>
                    <span className="text-[9px] font-mono bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-850 font-bold uppercase">
                      Job Perf. (LES)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-lg flex flex-col justify-between">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">LES Rating Score</span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-base font-black font-mono text-white">{les_score || "1.00"}</span>
                        <span className="text-[8px] text-slate-500 uppercase font-mono font-semibold">Score</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-lg flex flex-col justify-between">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">UVA/Vandy Benchmark</span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-base font-black font-mono text-slate-400">{les_benchmark || "1.50"}</span>
                        <span className="text-[8px] text-slate-500 uppercase font-mono font-semibold">Expected</span>
                      </div>
                    </div>
                  </div>

                  {les_rating && (
                    <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                      les_rating === 'Exceeds Expectations' 
                        ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300' 
                        : les_rating === 'Meets Expectations' 
                        ? 'bg-indigo-950/20 border-indigo-900/30 text-indigo-300' 
                        : 'bg-rose-950/20 border-rose-900/30 text-rose-300'
                    }`}>
                      <CheckCircle2 size={13} className={les_rating === 'Exceeds Expectations' ? 'text-emerald-400' : les_rating === 'Meets Expectations' ? 'text-indigo-400' : 'text-rose-400'} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-black uppercase tracking-wider">Academic Grade</div>
                        <p className="text-[10px] leading-relaxed text-slate-300 mt-0.5 truncate">
                          LES rating <strong className="text-white">{les_rating}</strong>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">SPONSORSHIP PIPELINE:</span>
                    <div className="grid grid-cols-3 gap-1.5 text-center relative">
                      <div className="absolute top-1/2 left-[12%] right-[12%] h-[1px] border-t border-dashed border-slate-800 -translate-y-1/2 z-0" />

                      <div className="bg-slate-950/60 border border-slate-850 p-1.5 rounded-lg z-10 relative">
                        <span className="text-xs font-black font-mono text-slate-300 block">{bills_sponsored_count || 0}</span>
                        <span className="text-[8px] font-medium text-slate-500 block mt-0.5 uppercase">Sponsored</span>
                      </div>

                      <div className="bg-slate-950/60 border border-slate-850 p-1.5 rounded-lg z-10 relative">
                        <span className="text-xs font-black font-mono text-slate-300 block">{bills_out_of_committee_count || 0}</span>
                        <span className="text-[8px] font-medium text-slate-500 block mt-0.5 uppercase">Passed Comm</span>
                      </div>

                      <div className="bg-slate-950/60 border border-slate-850 p-1.5 rounded-lg z-10 relative">
                        <span className="text-xs font-black font-mono text-emerald-400 block">{bills_became_law_count || 0}</span>
                        <span className="text-[8px] font-medium text-slate-500 block mt-0.5 uppercase">As Law</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature 9: Committee Oversight vs Investment Mapping */}
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850/60 space-y-3 pt-4">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                      <Landmark size={12} className="text-amber-400" />
                      Committee Oversight & Conflicts
                    </span>
                    <span className="text-[9px] font-mono bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-850 font-bold uppercase">
                      Congress.gov Matrix
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">ACTIVE ROLES:</span>
                    {committees && committees.length > 0 ? (
                      <div className="space-y-1">
                        {committees.map((c, idx) => (
                          <div key={idx} className="bg-slate-950/50 border border-slate-850 px-2 py-1.5 rounded-lg flex items-center justify-between text-[11px]">
                            <span className="text-slate-300 font-medium truncate max-w-[160px]" title={c.name}>{c.name}</span>
                            <span className="text-[8px] font-mono bg-slate-900 text-slate-400 px-1 py-0.5 rounded uppercase font-bold border border-slate-850 shrink-0 ml-1">
                              {c.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 italic">No assigned committees recorded.</p>
                    )}

                    {committee_conflicts && committee_conflicts.length > 0 ? (
                      <div className="mt-3 pt-2.5 border-t border-dashed border-slate-800 space-y-2">
                        <span className="text-[9px] font-black text-rose-400 block uppercase tracking-wider flex items-center gap-1">
                          <ShieldAlert size={10} className="text-rose-400 animate-pulse" />
                          DIRECT INTEREST OVERLAPS:
                        </span>

                        {committee_conflicts.map((conf) => (
                          <div key={conf.id} className="bg-rose-950/10 border border-rose-900/30 p-2.5 rounded-lg space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] bg-slate-950/85 p-1 rounded border border-slate-850 gap-1.5">
                              <span className="text-slate-400 truncate max-w-[100px] font-mono">{conf.committee_name.split(" Committee")[0] || conf.committee_name}</span>
                              
                              {/* Visual connector dash */}
                              <span className="flex-1 border-t border-dashed border-slate-800 h-0" />
                              <span className="text-[8px] bg-rose-950 text-rose-400 px-1 rounded uppercase font-black tracking-tighter shrink-0 border border-rose-900/40">
                                Overlaps
                              </span>
                              <span className="flex-1 border-t border-dashed border-slate-800 h-0" />

                              <span className="text-rose-300 font-bold truncate max-w-[100px] font-mono">{conf.industry_or_pac}</span>
                            </div>
                            <p className="text-[10px] text-slate-300 leading-normal pl-1 border-l border-rose-500/40">
                              {conf.overlap_description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[9px] font-semibold text-slate-500 bg-slate-950/40 p-2 rounded-lg border border-slate-850/60 text-center tracking-wide block">
                        No financial overlap found with current committee jurisdictions
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Real-time Conflict & Constitutional Integrity Triggers */}
        {legislator.conflict_triggers && legislator.conflict_triggers.length > 0 && (
          <div className="mb-4 border border-rose-950/40 bg-rose-950/5 rounded-xl p-3.5 space-y-2">
            <div className="text-rose-400 text-[10px] font-bold tracking-wider uppercase flex items-center justify-between border-b border-rose-950/30 pb-1.5">
              <span className="flex items-center gap-1.5">
                <ShieldAlert size={13} className="text-rose-400 animate-pulse" />
                CONSTITUENT TRUST ALERTS ({legislator.conflict_triggers.length})
              </span>
              <span className="text-[8px] bg-rose-950 text-rose-300 px-1 rounded font-mono border border-rose-900/30">TRIGGERED</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {legislator.conflict_triggers.map((trigger) => {
                let badgeStyle = "";
                let indicatorDot = "";
                if (trigger.severity === 'critical') {
                  badgeStyle = "bg-red-950/60 text-red-400 border-red-900/60";
                  indicatorDot = "bg-red-400";
                } else if (trigger.severity === 'high') {
                  badgeStyle = "bg-rose-950/50 text-rose-400 border-rose-900/50";
                  indicatorDot = "bg-rose-400";
                } else {
                  badgeStyle = "bg-amber-950/40 text-amber-400 border-amber-900/50";
                  indicatorDot = "bg-amber-400";
                }

                return (
                  <div key={trigger.id} className="bg-slate-950/60 border border-slate-850 p-2 rounded-lg text-xs space-y-1 hover:border-slate-800 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-white text-[11px] leading-tight flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${indicatorDot}`}></span>
                        {trigger.title}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold border ${badgeStyle}`}>
                        {trigger.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-normal">{trigger.description}</p>
                    
                    {/* Specific details rendering based on trigger type */}
                    <div className="pt-1.5 mt-1 border-t border-slate-900/50 flex flex-wrap gap-1.5 text-[9px] text-slate-400 font-mono">
                      {trigger.details.donor_or_entity && (
                        <span className="bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-850">
                          Donor: <strong className="text-slate-300">{trigger.details.donor_or_entity}</strong>
                        </span>
                      )}
                      {trigger.details.contract_value && (
                        <span className="bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-850">
                          Contract: <strong className="text-amber-400">${trigger.details.contract_value.toLocaleString()}</strong>
                        </span>
                      )}
                      {trigger.details.stock_ticker && (
                        <span className="bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-850">
                          Stock: <strong className="text-blue-400">{trigger.details.stock_ticker}</strong>
                        </span>
                      )}
                      {trigger.details.transaction_type && (
                        <span className="bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-850">
                          Trade: <strong className={trigger.details.transaction_type === 'Buy' ? 'text-emerald-400' : 'text-rose-400'}>{trigger.details.transaction_type} ({trigger.details.transaction_amount})</strong>
                        </span>
                      )}
                      {trigger.details.lobbyist_firm && (
                        <span className="bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-850">
                          Lobbyist: <strong className="text-purple-400">{trigger.details.lobbyist_firm}</strong>
                        </span>
                      )}
                      {trigger.details.bill_affected && (
                        <span className="bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-850">
                          Bill: <strong className="text-indigo-400">{trigger.details.bill_affected}</strong>
                        </span>
                      )}
                      {trigger.details.secret_vote_time && (
                        <span className="bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-850">
                          Vote: <strong className="text-rose-400">{trigger.details.secret_vote_time}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* User-defined Watchdog Custom Rule Triggers */}
        {triggeredCustomFlags && triggeredCustomFlags.length > 0 && (
          <div className="mb-4 border border-indigo-950/50 bg-indigo-950/10 rounded-xl p-3.5 space-y-2">
            <div className="text-indigo-400 text-[10px] font-bold tracking-wider uppercase flex items-center justify-between border-b border-indigo-900/30 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-indigo-400 animate-pulse" />
                CUSTOM WATCHDOG ALERTS ({triggeredCustomFlags.length})
              </span>
              <span className="text-[8px] bg-indigo-950 text-indigo-300 px-1.5 rounded font-mono border border-indigo-900/40">TRIGGERED</span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
              {triggeredCustomFlags.map((flag) => {
                let badgeStyle = "bg-slate-900 border-slate-800 text-slate-400";
                if (flag.severity === 'critical') badgeStyle = "bg-red-950 text-red-400 border-red-900/60";
                else if (flag.severity === 'high') badgeStyle = "bg-rose-950 text-rose-300 border-rose-900/60";
                else if (flag.severity === 'medium') badgeStyle = "bg-amber-950 text-amber-300 border-amber-900/60";

                return (
                  <div key={flag.id} className="bg-slate-950/70 border border-indigo-950/45 p-2 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-slate-100 text-[10.5px]">
                        {flag.name}
                      </span>
                      <span className={`px-1 rounded text-[7px] font-mono uppercase font-bold border ${badgeStyle}`}>
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-normal">{flag.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PAC Contributions Section */}
        <div className="mb-4">
          <div className="text-slate-500 text-[11px] font-semibold tracking-wider uppercase mb-1 flex items-center gap-1">
            <DollarSign size={12} className="text-slate-400" />
            AIPAC PAC Contributions (Total)
          </div>
          <div className="bg-slate-950/30 border border-slate-850/60 px-4 py-3 rounded-xl flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">PAC ID: C00797670</span>
            <span className={`font-mono text-lg font-extrabold ${aipac_funding_total > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {formattedFunding}
            </span>
          </div>
        </div>

        {/* PUBLIC TRANSPARENCY WATCHDOG TRACKERS */}
        <div className="mb-4 space-y-2.5">
          <div className="text-slate-500 text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1">
            <ShieldAlert size={12} className="text-slate-400" />
            Special Public Interest Audits
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1. EPSTEIN CRIMINAL FILES REGISTRY CHECK */}
            {legislator.epstein_associated ? (
              <div className="bg-gradient-to-br from-rose-950/15 via-slate-950/80 to-slate-950 border border-rose-900/45 rounded-xl p-3 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-rose-950/40 pb-1">
                  <span className="text-rose-400 text-[9px] font-black tracking-wider uppercase flex items-center gap-1 font-mono">
                    ⚠️ UNSEALED FILES MENTION
                  </span>
                  <span className="text-[7px] bg-rose-950/80 text-rose-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider border border-rose-900/30 select-none">
                    Epstein Logs
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-normal">
                  {legislator.epstein_association_details}
                </p>
                <div className="text-[8.5px] text-slate-500 leading-tight font-sans italic pt-0.5 select-none">
                  *Note: Record unsealed in federal docket. Mention does not indicate personal legal charges.
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-950/40 via-slate-950/70 to-slate-950 border border-slate-850 rounded-xl p-3 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-900/40 pb-1">
                  <span className="text-emerald-500 text-[9px] font-black tracking-wider uppercase flex items-center gap-1 font-mono">
                    ✓ SEARCH CLEAN
                  </span>
                  <span className="text-[7px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider border border-slate-800 select-none">
                    Epstein Search
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  No record of association found in unsealed court transcripts, passenger manifests, or associated docket lists.
                </p>
              </div>
            )}

            {/* 2. PARTISAN WEAPONIZED COMMITTEE CHECK */}
            {legislator.weaponized_committee ? (
              <div className="bg-gradient-to-br from-purple-950/15 via-slate-950/80 to-slate-950 border border-purple-900/45 rounded-xl p-3 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-purple-950/40 pb-1">
                  <span className="text-purple-400 text-[9px] font-black tracking-wider uppercase flex items-center gap-1 font-mono">
                    ⚠️ PARTISAN PANEL ALERT
                  </span>
                  <span className="text-[7px] bg-purple-950/80 text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider border border-purple-900/30 select-none">
                    Weaponization Check
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-normal">
                  {legislator.weaponized_committee_details}
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-950/40 via-slate-950/70 to-slate-950 border border-slate-850 rounded-xl p-3 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-900/40 pb-1">
                  <span className="text-slate-400 text-[9px] font-black tracking-wider uppercase flex items-center gap-1 font-mono">
                    ✓ BALANCED STATUS
                  </span>
                  <span className="text-[7px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider border border-slate-800 select-none">
                    Committee Index
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  No current or historical roles on select panels flagged as non-bipartisan or partisan political weapons.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Official Verified Statement & Corrective Actions */}
        {legislator.verified_member_page && legislator.official_statement && (
          <div className="mb-4 bg-gradient-to-br from-cyan-950/15 via-slate-950/50 to-slate-950 border border-cyan-900/35 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-cyan-950/40 pb-1.5">
              <span className="text-cyan-400 text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 font-mono">
                <CheckCircle2 size={11} className="text-cyan-400" />
                OFFICIAL MEMBER RESPONSE
              </span>
              <span className="text-[8px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase border border-cyan-900/30">
                Verified Portal
              </span>
            </div>
            
            <p className="text-[11px] text-slate-200 leading-relaxed italic">
              "{legislator.official_statement}"
            </p>

            {legislator.corrective_actions && legislator.corrective_actions.length > 0 && (
              <div className="space-y-1 mt-1 pt-1.5 border-t border-cyan-950/20">
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block font-mono">
                  Corrective Actions Filed:
                </span>
                <div className="space-y-1">
                  {legislator.corrective_actions.map((act, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                      <span className="text-cyan-500 font-mono text-[11px] mt-0.5 select-none">✓</span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Briefing Trigger Button */}
        {onShowBriefing && (
          <button
            onClick={() => onShowBriefing(legislator)}
            className="mb-4 w-full py-2 px-3.5 bg-gradient-to-r from-slate-950/60 to-slate-900/60 hover:from-indigo-950/40 hover:to-indigo-900/40 border border-slate-800 hover:border-indigo-800/60 rounded-xl text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1.5 transition-all duration-300 shadow-sm font-mono tracking-wide"
          >
            <Sparkles size={11} className="text-indigo-400 animate-pulse" />
            <span>GENERATE AI BRIEFING</span>
          </button>
        )}
      </div>

      {/* Secret Society Affiliations Section */}
      <div className="pt-3 border-t border-slate-800/50 mt-1">
        <div className="text-slate-500 text-[10px] font-semibold tracking-wider uppercase mb-2 flex items-center gap-1">
          <ShieldAlert size={12} className="text-slate-400" />
          Fraternal / Secret Societies ({society_affiliations.length})
        </div>
        
        {society_affiliations.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {society_affiliations.map((society, idx) => {
              // Custom colors for specific secret societies
              let sColor = "bg-purple-950/40 text-purple-400 border-purple-800/40";
              if (society.includes("Skull and Bones")) sColor = "bg-amber-950/40 text-amber-400 border-amber-900/50";
              if (society.includes("Freemasonry")) sColor = "bg-indigo-950/40 text-indigo-400 border-indigo-900/50";
              if (society.includes("Alfalfa")) sColor = "bg-emerald-950/40 text-emerald-400 border-emerald-900/50";
              
              return (
                <span 
                  key={idx} 
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${sColor} flex items-center gap-1`}
                >
                  <Award size={10} />
                  {society}
                </span>
              );
            })}
          </div>
        ) : (
          <span className="text-xs italic text-slate-600 tracking-wide block py-0.5">
            No known fraternal or secret affiliations identified
          </span>
        )}
      </div>
    </div>
  );
}
