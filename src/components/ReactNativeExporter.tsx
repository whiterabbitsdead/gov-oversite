/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Copy, Check, Smartphone, FileCode } from 'lucide-react';

const REACT_NATIVE_EXPO_CODE = `import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';

// Normalized Congressional JSON Feed with Factual Transparency Metrics
const CONGRESSIONAL_DATA = [
  {
    "legislator_id": "M000355",
    "name": "Mitch McConnell",
    "state": "KY",
    "party": "Republican",
    "role": "Senator",
    "aipac_funding_total": 456200,
    "society_affiliations": ["Alfalfa Club", "Freemasonry"],
    "late_night_votes_count": 6,
    "avg_review_hours_major_bills": 18,
    "transparency_bill_sponsorships": 0,
    "sponsored_transparency_bills": []
  },
  {
    "legislator_id": "S000033",
    "name": "Bernie Sanders",
    "state": "VT",
    "party": "Independent",
    "role": "Senator",
    "aipac_funding_total": 0,
    "society_affiliations": [],
    "late_night_votes_count": 1,
    "avg_review_hours_major_bills": 74,
    "transparency_bill_sponsorships": 3,
    "sponsored_transparency_bills": ["S. 141 - Congressional Openness Act", "S. 209 - Open Government Act", "S. 850 - Read the Bills Act"]
  },
  {
    "legislator_id": "P000197",
    "name": "Nancy Pelosi",
    "state": "CA",
    "party": "Democrat",
    "role": "Representative",
    "aipac_funding_total": 125400,
    "society_affiliations": ["Gridiron Club"],
    "late_night_votes_count": 5,
    "avg_review_hours_major_bills": 24,
    "transparency_bill_sponsorships": 1,
    "sponsored_transparency_bills": ["H.R. 402 - Public Access to Hearings Act"]
  },
  {
    "legislator_id": "S001191",
    "name": "Kyrsten Sinema",
    "state": "AZ",
    "party": "Independent",
    "role": "Senator",
    "aipac_funding_total": 259000,
    "society_affiliations": ["Alfalfa Club"],
    "late_night_votes_count": 4,
    "avg_review_hours_major_bills": 36,
    "transparency_bill_sponsorships": 1,
    "sponsored_transparency_bills": ["S. 902 - Bi-partisan Transparency Act"]
  },
  {
    "legislator_id": "W000817",
    "name": "Elizabeth Warren",
    "state": "MA",
    "party": "Democrat",
    "role": "Senator",
    "aipac_funding_total": 0,
    "society_affiliations": ["Phi Beta Kappa"],
    "late_night_votes_count": 1,
    "avg_review_hours_major_bills": 78,
    "transparency_bill_sponsorships": 4,
    "sponsored_transparency_bills": ["S. 331 - Anti-Corruption and Public Integrity Act", "S. 850 - Read the Bills Act", "S. 1104 - Financial Disclosure Act", "S. 141 - Congressional Openness Act"]
  },
  {
    "legislator_id": "S001217",
    "name": "Rick Scott",
    "state": "FL",
    "party": "Republican",
    "role": "Senator",
    "aipac_funding_total": 98500,
    "society_affiliations": ["Freemasonry"],
    "late_night_votes_count": 5,
    "avg_review_hours_major_bills": 16,
    "transparency_bill_sponsorships": 1,
    "sponsored_transparency_bills": ["S. 1202 - Federal Spending Accountability Act"]
  }
];

// RepresentativeCard Component
function RepresentativeCard({ legislator }) {
  const { name, state, party, role, aipac_funding_total, society_affiliations } = legislator;
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Party Styling Helpers
  const isDemocrat = party === 'Democrat';
  const isRepublican = party === 'Republican';
  
  const partyBadgeStyle = [
    styles.partyBadge,
    isDemocrat && styles.partyBadgeDem,
    isRepublican && styles.partyBadgeRep,
    party === 'Independent' && styles.partyBadgeInd
  ];

  const partyTextStyle = [
    styles.partyText,
    isDemocrat && styles.partyTextDem,
    isRepublican && styles.partyTextRep,
    party === 'Independent' && styles.partyTextInd
  ];

  const partyDotStyle = [
    styles.partyDot,
    isDemocrat && styles.partyDotDem,
    isRepublican && styles.partyDotRep,
    party === 'Independent' && styles.partyDotInd
  ];

  // Calculate Factual Transparency Index
  const f1 = Math.max(0, 100 - (legislator.late_night_votes_count * 15));
  const f2 = Math.min(100, Math.round((legislator.avg_review_hours_major_bills / 72) * 100));
  const f3 = Math.min(100, legislator.transparency_bill_sponsorships * 25);
  const transparency_index = Math.round((f1 * 0.4) + (f2 * 0.4) + (f3 * 0.2));

  const getIndexColor = (index) => {
    if (index >= 80) return '#34d399'; // High - Emerald Green
    if (index >= 50) return '#fbbf24'; // Moderate - Amber Gold
    return '#fb7185'; // Low - Rose Red
  };

  const getIndexLabel = (index) => {
    if (index >= 80) return 'Highly Transparent';
    if (index >= 50) return 'Moderately Transparent';
    return 'Opaque / Low Transparency';
  };

  // Currency formatter
  const formatCurrency = (amount) => {
    return '$' + amount.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
  };

  return (
    <View style={styles.card}>
      {/* Header Info */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View>
          <Text style={styles.legislatorName}>{name}</Text>
          <Text style={styles.legislatorMeta}>{role} • {state}</Text>
        </View>
        <View style={partyBadgeStyle}>
          <View style={partyDotStyle} />
          <Text style={partyTextStyle}>{party}</Text>
        </View>
      </View>

      {/* Progress index bar */}
      <View style={styles.metricContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressBarTitle}>LEGISLATIVE TRANSPARENCY INDEX</Text>
          <Text style={[styles.progressScore, { color: getIndexColor(transparency_index) }]}>{transparency_index} / 100</Text>
        </View>
        
        {/* Progress bar container */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: \`\${transparency_index}%\`, backgroundColor: getIndexColor(transparency_index) }]} />
        </View>

        <View style={styles.progressFooter}>
          <Text style={[styles.footerRating, { color: getIndexColor(transparency_index) }]}>
            {getIndexLabel(transparency_index)}
          </Text>
          <TouchableOpacity onPress={() => setShowBreakdown(!showBreakdown)}>
            <Text style={styles.detailsToggleText}>{showBreakdown ? 'Hide Details ▲' : 'Show Details ▼'}</Text>
          </TouchableOpacity>
        </View>

        {showBreakdown && (
          <View style={styles.breakdownContainer}>
            <Text style={styles.breakdownItem}>• Voting Timing (40%): Score {f1}/100 ({legislator.late_night_votes_count} late-night votes)</Text>
            <Text style={styles.breakdownItem}>• Review Opportunity (40%): Score {f2}/100 ({legislator.avg_review_hours_major_bills} hrs avg review)</Text>
            <Text style={styles.breakdownItem}>• Access Sponsorships (20%): Score {f3}/100 ({legislator.transparency_bill_sponsorships} bills)</Text>
          </View>
        )}
      </View>

      {/* Campaign Finance */}
      <View style={styles.pacContainer}>
        <Text style={styles.sectionTitle}>AIPAC PAC CONTRIBUTIONS</Text>
        <View style={styles.pacRow}>
          <Text style={styles.pacId}>PAC ID: C00797670</Text>
          <Text style={[styles.pacAmount, aipac_funding_total > 0 ? styles.pacAmountActive : styles.pacAmountNone]}>
            {formatCurrency(aipac_funding_total)}
          </Text>
        </View>
      </View>

      {/* Secret Societies */}
      <View style={styles.societiesContainer}>
        <Text style={styles.sectionTitle}>SOCIETY MEMBERSHIPS</Text>
        {society_affiliations.length > 0 ? (
          <View style={styles.badgesWrapper}>
            {society_affiliations.map((society, idx) => (
              <View key={idx} style={styles.societyBadge}>
                <Text style={styles.societyBadgeText}>👁️ {society}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noSocietiesText}>No known secret affiliations identified</Text>
        )}
      </View>
    </View>
  );
}

// App Entry Component
export default function App() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('highest_pac'); // 'highest_pac', 'society_members', 'highest_transparency', 'lowest_transparency'
  const [selectedParty, setSelectedParty] = useState('All');

  const filteredLegislators = useMemo(() => {
    let result = [...CONGRESSIONAL_DATA];

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.state.toLowerCase().includes(q)
      );
    }

    // Filter by party
    if (selectedParty !== 'All') {
      result = result.filter(item => item.party === selectedParty);
    }

    // Calculate index helper
    const calcIndex = (leg) => {
      const f1 = Math.max(0, 100 - (leg.late_night_votes_count * 15));
      const f2 = Math.min(100, Math.round((leg.avg_review_hours_major_bills / 72) * 100));
      const f3 = Math.min(100, leg.transparency_bill_sponsorships * 25);
      return Math.round((f1 * 0.4) + (f2 * 0.4) + (f3 * 0.2));
    };

    // Sort
    if (sortBy === 'highest_pac') {
      result.sort((a, b) => b.aipac_funding_total - a.aipac_funding_total);
    } else if (sortBy === 'society_members') {
      result.sort((a, b) => b.society_affiliations.length - a.society_affiliations.length);
    } else if (sortBy === 'highest_transparency') {
      result.sort((a, b) => calcIndex(b) - calcIndex(a));
    } else if (sortBy === 'lowest_transparency') {
      result.sort((a, b) => calcIndex(a) - calcIndex(b));
    }

    return result;
  }, [search, sortBy, selectedParty]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CIVIC TRANSPARENCY</Text>
        <Text style={styles.headerSubtitle}>U.S. Congress Legislative Tracker</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or state..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Sorting / Filter Segment Controls */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.controlsRowScroll}
        contentContainerStyle={styles.controlsRowContent}
      >
        <TouchableOpacity 
          style={[styles.controlBtn, sortBy === 'highest_pac' && styles.controlBtnActive]}
          onPress={() => setSortBy('highest_pac')}
        >
          <Text style={[styles.controlBtnText, sortBy === 'highest_pac' && styles.controlBtnTextActive]}>
            💰 Highest PAC
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlBtn, sortBy === 'highest_transparency' && styles.controlBtnActive]}
          onPress={() => setSortBy('highest_transparency')}
        >
          <Text style={[styles.controlBtnText, sortBy === 'highest_transparency' && styles.controlBtnTextActive]}>
            🟢 High Transparency
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlBtn, sortBy === 'lowest_transparency' && styles.controlBtnActive]}
          onPress={() => setSortBy('lowest_transparency')}
        >
          <Text style={[styles.controlBtnText, sortBy === 'lowest_transparency' && styles.controlBtnTextActive]}>
            🔴 Low Transparency
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlBtn, sortBy === 'society_members' && styles.controlBtnActive]}
          onPress={() => setSortBy('society_members')}
        >
          <Text style={[styles.controlBtnText, sortBy === 'society_members' && styles.controlBtnTextActive]}>
            👁️ Society Members
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Party Filter Row */}
      <View style={styles.partyFilters}>
        {['All', 'Democrat', 'Republican', 'Independent'].map(party => (
          <TouchableOpacity
            key={party}
            style={[styles.partyFilterBtn, selectedParty === party && styles.partyFilterBtnActive]}
            onPress={() => setSelectedParty(party)}
          >
            <Text style={[styles.partyFilterBtnText, selectedParty === party && styles.partyFilterBtnTextActive]}>
              {party}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Scrollable list */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {filteredLegislators.map((legislator) => (
          <RepresentativeCard key={legislator.legislator_id} legislator={legislator} />
        ))}
        {filteredLegislators.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No results match your filters.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// React Native CSS-in-JS Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Dark slate background
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '500',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  searchInput: {
    height: 48,
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#f1f5f9',
    fontSize: 14,
  },
  controlsRowScroll: {
    paddingLeft: 20,
    marginBottom: 10,
    maxHeight: 45,
  },
  controlsRowContent: {
    gap: 10,
    paddingRight: 40,
  },
  controlBtn: {
    paddingHorizontal: 14,
    height: 38,
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  controlBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  controlBtnTextActive: {
    color: '#ffffff',
  },
  partyFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  partyFilterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  partyFilterBtnActive: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  partyFilterBtnText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  partyFilterBtnTextActive: {
    color: '#f1f5f9',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  legislatorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  legislatorMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  partyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  partyBadgeDem: { backgroundColor: '#172554', borderColor: '#1e3a8a' },
  partyBadgeRep: { backgroundColor: '#450a0a', borderColor: '#7f1d1d' },
  partyBadgeInd: { backgroundColor: '#064e3b', borderColor: '#064e3b' },
  partyText: { fontSize: 10, fontWeight: '700' },
  partyTextDem: { color: '#60a5fa' },
  partyTextRep: { color: '#f87171' },
  partyTextInd: { color: '#34d399' },
  partyDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  partyDotDem: { backgroundColor: '#60a5fa' },
  partyDotRep: { backgroundColor: '#f87171' },
  partyDotInd: { backgroundColor: '#34d399' },
  metricContainer: {
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarTitle: {
    fontSize: 8,
    color: '#475569',
    fontWeight: 'bold',
  },
  progressScore: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '105%',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  footerRating: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailsToggleText: {
    fontSize: 10,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  breakdownContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    gap: 4,
  },
  breakdownItem: {
    fontSize: 9,
    color: '#94a3b8',
    lineHeight: 12,
  },
  pacContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    letterSpacing: 1,
    marginBottom: 6,
  },
  pacRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(2,6,23,0.4)',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pacId: {
    fontSize: 10,
    color: '#475569',
  },
  pacAmount: {
    fontSize: 14,
    fontWeight: '900',
  },
  pacAmountActive: {
    color: '#fbbf24', // Gold
  },
  pacAmountNone: {
    color: '#475569',
  },
  societiesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 10,
  },
  badgesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  societyBadge: {
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#312e81',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  societyBadgeText: {
    color: '#a5b4fc',
    fontSize: 10,
    fontWeight: '500',
  },
  noSocietiesText: {
    fontSize: 10,
    color: '#334155',
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  }
});
`;

export function ReactNativeExporter() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(REACT_NATIVE_EXPO_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-900/40 border border-blue-700/50 flex items-center justify-center">
            <Smartphone size={16} className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">App.tsx (Expo Native App)</h3>
            <p className="text-[11px] text-slate-400">React Native Entry Point • Pure Mobile Styles</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Native Code</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80">
        <div className="lg:col-span-4 p-6 bg-slate-950/30 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Smartphone size={14} />
              How to Run on Mobile
            </h4>

            <ol className="space-y-4 text-xs text-slate-300">
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center font-mono font-bold text-blue-400 shrink-0">1</span>
                <div>
                  <p className="font-semibold text-white">Create Expo Project</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Initialize a blank Expo TypeScript project on your local computer:</p>
                  <pre className="bg-slate-950/80 p-1.5 rounded border border-slate-850 font-mono text-[10px] text-blue-300 mt-1 overflow-x-auto">
                    npx create-expo-app MyTracker
                  </pre>
                </div>
              </li>

              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center font-mono font-bold text-blue-400 shrink-0">2</span>
                <div>
                  <p className="font-semibold text-white">Paste this Code</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Overwrite <code className="text-slate-200">App.tsx</code> or your main screen file in your editor with this code.</p>
                </div>
              </li>

              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center font-mono font-bold text-blue-400 shrink-0">3</span>
                <div>
                  <p className="font-semibold text-white">Boot Expo Go</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Run the Expo start command and scan the QR code with your iOS or Android device:</p>
                  <pre className="bg-slate-950/80 p-1.5 rounded border border-slate-850 font-mono text-[10px] text-blue-300 mt-1 overflow-x-auto">
                    npm run start
                  </pre>
                </div>
              </li>
            </ol>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-850/60 text-xs">
            <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
              <FileCode size={14} className="text-indigo-400" />
              Responsive Layouts
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              This code uses React Native's <span className="text-slate-300">StyleSheet</span> API. It maps seamlessly to native components and scales automatically on all device screens.
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 bg-slate-950/10 p-4 max-h-[480px] overflow-y-auto font-mono text-xs text-slate-300">
          <pre className="whitespace-pre overflow-x-auto text-[11px] leading-relaxed text-blue-200">
            {REACT_NATIVE_EXPO_CODE}
          </pre>
        </div>
      </div>
    </div>
  );
}
