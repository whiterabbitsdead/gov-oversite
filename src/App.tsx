/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  Terminal, 
  FileJson, 
  Smartphone, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity, 
  Coins, 
  ShieldAlert, 
  BookOpen,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown,
  Moon,
  Clock,
  Sparkles,
  AlertTriangle,
  Code2,
  BellRing,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Lock,
  Star,
  Flame,
  Megaphone,
  User,
  Landmark,
  Calendar,
  Send,
  Building2,
  Users,
  Bot
} from 'lucide-react';
import { CONGRESSIONAL_DATA } from './data';
import { RepresentativeCard } from './components/RepresentativeCard';
import { LocalAuditHub } from './components/LocalAuditHub';
import { ScriptViewer } from './components/ScriptViewer';
import { JsonViewer } from './components/JsonViewer';
import { ReactNativeExporter } from './components/ReactNativeExporter';
import { Legislator, WatchdogBill, WatchdogAnalysis, UserValuePreferences, UserProfile, DebatePost, DebateChallenge, LawmakerBroadcast, LegislativeMilestone } from './types';
import { CustomFlagsPanel, CustomFlag } from './components/CustomFlagsPanel';
import { AccountPanel } from './components/AccountPanel';
import { CivicArena } from './components/CivicArena';
import { PressRoom } from './components/PressRoom';
import { PRELOADED_DEBATES, PRELOADED_BROADCASTS } from './debateData';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

// Stable deterministic 5-term PAC trend generator for selected legislator
const getPacFundingTrendData = (legislator: Legislator) => {
  const seed = legislator.legislator_id.charCodeAt(0) + (legislator.legislator_id.charCodeAt(1) || 0);
  const basePAC = legislator.aipac_funding_total || 50000;
  const baseVoteIndex = legislator.corporate_vote_index || 50;

  const terms = [
    { name: "115th Congress (2017-18)", short: "115th" },
    { name: "116th Congress (2019-20)", short: "116th" },
    { name: "117th Congress (2021-22)", short: "117th" },
    { name: "118th Congress (2023-24)", short: "118th" },
    { name: "119th Congress (2025-26)", short: "119th" },
  ];

  return terms.map((term, index) => {
    // Growth of PAC Donations over past 5 terms, ending at our database value in the 119th term
    let stepMultiplier = 0.4 + (index * 0.15) + ((seed % 10) / 100);
    
    // Add some deliberate spikes based on seed for testing spike highlights
    if (index === 2 && seed % 2 === 0) stepMultiplier += 0.4;
    if (index === 1 && seed % 3 === 0) stepMultiplier -= 0.2;
    if (index === 3 && seed % 4 === 0) stepMultiplier += 0.5;

    const pacFunding = Math.round(basePAC * stepMultiplier);

    // Corporate votes cast (out of max 30 key votes)
    const maxVotes = 30;
    const baseAlignedCount = Math.round((baseVoteIndex / 100) * maxVotes);
    const voteOffset = Math.round(Math.sin(index + seed) * 2);
    const alignedVotes = Math.max(0, Math.min(maxVotes, baseAlignedCount + voteOffset));

    return {
      term: term.short,
      fullTerm: term.name,
      pacFunding,
      alignedVotes,
      corporatePercentage: Math.round((alignedVotes / maxVotes) * 100),
    };
  });
};

// Pre-loaded famous complex bills matching Watchdog guidelines
const PRELOADED_BILLS: WatchdogBill[] = [
  {
    id: "bill-1",
    billNumber: "HR 2670",
    title: "National Defense Authorization Act (NDAA) for Fiscal Year 2024",
    pageCount: 1208,
    textReleaseTime: "2023-12-12T10:00:00Z",
    scheduledVoteTime: "2023-12-13T14:00:00Z", // 28 hours elapsed
    summaryText: "Comprehensive authorization for the Department of Defense. It spans over 1,200 pages containing specialized procurement guidelines, defense contractor priorities, and national security directives."
  },
  {
    id: "bill-2",
    billNumber: "HR 1",
    title: "Tax Cuts and Jobs Act",
    pageCount: 503,
    textReleaseTime: "2017-12-18T22:00:00Z",
    scheduledVoteTime: "2017-12-19T13:00:00Z", // 15 hours elapsed
    summaryText: "Overhauls corporate and individual income tax regulations. Pushed to a final vote less than 15 hours after the consolidated draft text was finalized at midnight."
  },
  {
    id: "bill-3",
    billNumber: "S 3746",
    title: "Fiscal Responsibility Act of 2023",
    pageCount: 99,
    textReleaseTime: "2023-05-28T18:00:00Z",
    scheduledVoteTime: "2023-05-31T20:30:00Z", // 74.5 hours elapsed
    summaryText: "Suspends the federal public debt limit. Fast-tracked through standard procedures to avert a sovereign credit default event."
  }
];

interface NotificationAlert {
  id: string;
  politicianName: string;
  billNumber: string;
  timestamp: string;
  fullMessage: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'watchdog' | 'flags' | 'script' | 'functions' | 'expo' | 'json' | 'debate' | 'press' | 'credentials'>('dashboard');
  const [dashboardTab, setDashboardTab] = useState<'directory' | 'scorecard' | 'metrics' | 'pac' | 'events' | 'advisor'>('directory');
  
  // Custom Watchdog Transparency Flags (User Configurable)
  const [customFlags, setCustomFlags] = useState<CustomFlag[]>(() => {
    try {
      const saved = localStorage.getItem('watchdog_custom_flags');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading custom flags", e);
    }
    return [
      {
        id: "preloaded-flag-1",
        name: "Extreme PAC Funding Threshold",
        metric: "aipac_funding",
        operator: "greater_than",
        value: 300000,
        severity: "high",
        description: "Lawmaker has received over $300,000 in lobbyist PAC funds, indicating high special interest alignment."
      },
      {
        id: "preloaded-flag-2",
        name: "Substandard Transparency Index",
        metric: "transparency_index",
        operator: "less_than",
        value: 50,
        severity: "critical",
        description: "Lawmaker score fell below 50, indicating serious voting opacity or minimal bill review periods."
      }
    ];
  });

  // Interactive mutable legislators list to demonstrate state updates
  const [legislators, setLegislators] = useState<Legislator[]>(() => {
    try {
      const saved = localStorage.getItem('watchdog_legislators');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading legislators", e);
    }
    // Let's pre-load John Smith with a midnight vote warning to showcase it initially
    const mapped = CONGRESSIONAL_DATA.map(item => {
      let finalItem = { ...item };
      if (item.legislator_id === "M001111") {
        finalItem = {
          ...finalItem,
          midnight_vote_badge: true,
          midnight_votes: [
            {
              bill_number: "HR 2670",
              bill_name: "National Defense Authorization Act",
              timestamp: "02:45 AM"
            }
          ]
        };
      }

      // Feature 8: Campaign funding defaults
      const totalFunds = finalItem.total_campaign_funds || (finalItem.aipac_funding_total > 0 ? Math.round(finalItem.aipac_funding_total * 4.5) : 350000 + (Math.floor(Math.random() * 200000)));
      let smallPct = finalItem.small_dollar_percentage;
      let pacPct = finalItem.pac_percentage;

      if (smallPct === undefined) {
        if (finalItem.corporate_vote_index < 20) {
          smallPct = 55 + Math.floor(Math.random() * 15); // 55% - 70%
        } else if (finalItem.corporate_vote_index > 75) {
          smallPct = 5 + Math.floor(Math.random() * 12); // 5% - 17%
        } else {
          smallPct = 18 + Math.floor(Math.random() * 20); // 18% - 38%
        }
      }

      if (pacPct === undefined) {
        if (finalItem.aipac_funding_total > 200000) {
          pacPct = 40 + Math.floor(Math.random() * 20); // 40% - 60%
        } else if (finalItem.aipac_funding_total === 0) {
          pacPct = 0 + Math.floor(Math.random() * 5); // 0% - 5%
        } else {
          pacPct = 15 + Math.floor(Math.random() * 20); // 15% - 35%
        }
      }

      const largePct = 100 - smallPct - pacPct;

      // Feature 7: Legislative Effectiveness defaults
      let lesScore = finalItem.les_score;
      let lesBenchmark = finalItem.les_benchmark || 1.5;
      let lesRating = finalItem.les_rating;

      if (lesScore === undefined) {
        // Active/transparency bills and reviews correlate with effectiveness
        const effectivenessSeed = (finalItem.transparency_bill_sponsorships * 0.5) + (finalItem.avg_review_hours_major_bills / 30);
        lesScore = Math.max(0.1, Math.round((effectivenessSeed + (Math.random() * 0.6)) * 100) / 100);
        if (lesScore > lesBenchmark * 1.2) {
          lesRating = 'Exceeds Expectations';
        } else if (lesScore < lesBenchmark * 0.8) {
          lesRating = 'Below Expectations';
        } else {
          lesRating = 'Meets Expectations';
        }
      }

      const billsSponsored = finalItem.bills_sponsored_count || (10 + Math.floor(lesScore * 12));
      const billsOutOfComm = finalItem.bills_out_of_committee_count || Math.max(0, Math.floor(billsSponsored * (lesScore > 1.5 ? 0.25 : 0.1)));
      const billsBecameLaw = finalItem.bills_became_law_count || Math.max(0, Math.floor(billsOutOfComm * 0.4));

      // Feature 9: Committees defaults
      let committees = finalItem.committees;
      if (!committees) {
        if (finalItem.role === 'Senator') {
          committees = [
            { name: "Senate Committee on Foreign Relations", role: "Member" },
            { name: "Senate Committee on Commerce, Science, and Transportation", role: "Member" }
          ];
        } else {
          committees = [
            { name: "House Committee on Financial Services", role: "Member" },
            { name: "House Committee on Energy and Commerce", role: "Member" }
          ];
        }
      }

      let committeeConflicts = finalItem.committee_conflicts || [];
      if (committeeConflicts.length === 0) {
        // Dynamically flag a conflict if they sit on Commerce/Financial Services and have high corporate indexes
        if (finalItem.corporate_vote_index > 70) {
          committeeConflicts = [
            {
              id: `conflict-${finalItem.legislator_id}-1`,
              committee_name: finalItem.role === 'Senator' ? "Senate Committee on Commerce, Science, and Transportation" : "House Committee on Financial Services",
              industry_or_pac: "Corporate PAC Group",
              overlap_description: `Receives substantial funding from PACs within the industries regulated by this committee (Over ${finalItem.aipac_funding_total > 0 ? `$${finalItem.aipac_funding_total.toLocaleString()}` : "$50,000"} in related sector support).`,
              source: 'PAC Donation'
            }
          ];
        }
      }

      return {
        ...finalItem,
        total_campaign_funds: totalFunds,
        small_dollar_percentage: smallPct,
        large_dollar_percentage: largePct,
        pac_percentage: pacPct,
        les_score: lesScore,
        les_benchmark: lesBenchmark,
        les_rating: lesRating,
        bills_sponsored_count: billsSponsored,
        bills_out_of_committee_count: billsOutOfComm,
        bills_became_law_count: billsBecameLaw,
        committees,
        committee_conflicts: committeeConflicts
      };
    });
    return mapped;
  });

  // Simulated Push Notifications state
  const [alerts, setAlerts] = useState<NotificationAlert[]>(() => {
    try {
      const saved = localStorage.getItem('watchdog_alerts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading alerts", e);
    }
    return [
      {
        id: "initial-alert",
        politicianName: "John Smith (Demo Skull)",
        billNumber: "HR 2670",
        timestamp: "02:45 AM EST",
        fullMessage: "John Smith (Demo Skull) cast a vote on HR 2670 at 02:45 AM, which is outside of standard transparency hours."
      }
    ];
  });

  // Auto-Save sync hooks to persist modifications automatically
  useEffect(() => {
    try {
      localStorage.setItem('watchdog_custom_flags', JSON.stringify(customFlags));
    } catch (e) {
      console.error("Error saving custom flags", e);
    }
  }, [customFlags]);

  useEffect(() => {
    try {
      localStorage.setItem('watchdog_legislators', JSON.stringify(legislators));
    } catch (e) {
      console.error("Error saving legislators", e);
    }
  }, [legislators]);

  useEffect(() => {
    try {
      localStorage.setItem('watchdog_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.error("Error saving alerts", e);
    }
  }, [alerts]);

  // Saved Favorites Watchlist
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('watchdog_watchlist');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading watchlist", e);
    }
    return [];
  });

  // AI Civic Advisor States
  const [advisorInput, setAdvisorInput] = useState('');
  const [advisorHistory, setAdvisorHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([
    {
      role: 'model',
      text: "Welcome to the Congressional Transparency Watchdog! 🏛️ I am your AI Civic Advisor.\n\nI can help you:\n- **Understand the app**: Ask me what you can do on each tab!\n- **Analyze any lawmaker**: Ask me about Mitch McConnell, Bernie Sanders, or Nancy Pelosi.\n- **Learn about metrics**: Ask me how the custom 'Legislative Transparency Index' or 'CEL Performance Rating' works.\n\nWhat would you like to investigate today?"
    }
  ]);
  const [advisorLoading, setAdvisorLoading] = useState(false);

  // AI Legislator Briefing States
  const [activeBriefingLegislator, setActiveBriefingLegislator] = useState<any | null>(null);
  const [briefingText, setBriefingText] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  // Committee Findings Agent States
  const [activeFindingsLegislator, setActiveFindingsLegislator] = useState<any | null>(null);
  const [findingsText, setFindingsText] = useState<string | null>(null);
  const [findingsLoading, setFindingsLoading] = useState(false);

  const handleScanFindings = async (legislator: any) => {
    setActiveFindingsLegislator(legislator);
    setFindingsText(null);
    setFindingsLoading(true);

    try {
      const res = await fetch("/api/gemini/committee-findings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legislatorName: legislator.name,
          party: legislator.party,
          state: legislator.state,
          role: legislator.role,
          bio: legislator.bio_summary
        }),
      });
      const data = await res.json();
      setFindingsText(data.findings || "No findings generated.");
    } catch (error) {
      console.error(error);
      setFindingsText("Failed to retrieve committee findings. Please try again later.");
    } finally {
      setFindingsLoading(false);
    }
  };

  // Send message to AI Advisor
  const handleSendAdvisorMessage = async (customMsg?: string) => {
    const textToSend = customMsg || advisorInput;
    if (!textToSend.trim() || advisorLoading) return;

    if (!customMsg) {
      setAdvisorInput('');
    }

    const updatedHistory = [...advisorHistory, { role: 'user' as const, text: textToSend }];
    setAdvisorHistory(updatedHistory);
    setAdvisorLoading(true);

    try {
      const response = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: updatedHistory.slice(0, -1)
        })
      });

      if (!response.ok) {
        throw new Error('Advisor API error');
      }

      const data = await response.json();
      setAdvisorHistory(prev => [...prev, { role: 'model', text: data.reply || 'No reply generated.' }]);
    } catch (err: any) {
      console.error(err);
      setAdvisorHistory(prev => [...prev, { role: 'model', text: '⚠️ Unable to connect to the Civic Advisor. Please verify the backend is running and your network connection is stable.' }]);
    } finally {
      setAdvisorLoading(false);
    }
  };

  // Generate Legislator Briefing
  const handleGenerateBriefing = async (legislator: any) => {
    setActiveBriefingLegislator(legislator);
    setBriefingText(null);
    setBriefingLoading(true);

    try {
      const response = await fetch('/api/gemini/legislator-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ legislator })
      });

      if (!response.ok) {
        throw new Error('Briefing API error');
      }

      const data = await response.json();
      setBriefingText(data.briefing || 'No briefing generated.');
    } catch (err: any) {
      console.error(err);
      setBriefingText('⚠️ An error occurred while generating the AI Integrity Briefing. Please verify your settings or retry.');
    } finally {
      setBriefingLoading(false);
    }
  };

  // Upcoming Major Legislative Milestones (Current Congressional Session)
  const legislativeMilestones: LegislativeMilestone[] = [
    {
      id: 'milestone-1',
      date: 'May 15, 2026',
      title: 'Spring Appropriations Initial Markup',
      status: 'passed',
      riskLevel: 'medium',
      riskLabel: 'Moderate Lobbying',
      iconType: 'calendar',
      description: 'Initial drafts for sub-committee appropriations bills on agricultural and interior budgets were filed.',
      citizenAction: 'Audit completed. AIPAC and pesticide manufacturer lobby contributions spiked by 18% during this markup period.'
    },
    {
      id: 'milestone-2',
      date: 'July 31, 2026',
      title: 'Summer Recess Adjournment & PAC Push',
      status: 'current',
      riskLevel: 'high',
      riskLabel: 'High Fundraising Risk',
      iconType: 'money',
      description: 'Members adjourn for August recess. Historical records show 35% of annual dark money & corporate PAC fundraiser events occur during this period.',
      citizenAction: 'Constituent Task: Monitor local district town halls. Ask representatives to sign the voluntary 72-Hour Bill Review Pledge before the fall session.'
    },
    {
      id: 'milestone-3',
      date: 'September 15, 2026',
      title: 'FY 2027 Budget Reconciliation Deadline',
      status: 'upcoming',
      riskLevel: 'high',
      riskLabel: 'Severe Late-Night Votes',
      iconType: 'alert',
      description: 'Oversight committees must finalize reconciliation language. Highly vulnerable to 1,000+ page omnibus dumps with zero-review clauses.',
      citizenAction: 'Watchdog Alert: Scraper script will run 24/7 scanning for fast-track lobbyist copy-paste exemptions inside tax subclauses.'
    },
    {
      id: 'milestone-4',
      date: 'October 1, 2026',
      title: 'Fiscal Year 2027 Budget Enactment',
      status: 'upcoming',
      riskLevel: 'medium',
      riskLabel: 'Shutdown/Fast-Track Risk',
      iconType: 'vote',
      description: 'Deadline to pass full budget or continuing resolution. High probability of pre-midnight fast-tracked emergency floor votes.',
      citizenAction: 'Action Plan: Demand public live-streaming of all emergency rules committee adjustments convened with under 4 hours notice.'
    },
    {
      id: 'milestone-5',
      date: 'November 3, 2026',
      title: 'Midterm Congressional Elections',
      status: 'upcoming',
      riskLevel: 'high',
      riskLabel: 'Voter Accountability Freeze',
      iconType: 'flag',
      description: 'General election polls close. Watchdog scorecard indices are frozen for public voter reference at polling places.',
      citizenAction: 'Voter Action: Compare your candidates on our Lobbying Alignment and Bill Diligence scorecards before casting your ballot.'
    }
  ];

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('milestone-2');
  const [isGeneratingMilestonePlan, setIsGeneratingMilestonePlan] = useState<boolean>(false);
  const [customMilestonePlan, setCustomMilestonePlan] = useState<string>('');

  const activeMilestoneRef = useRef<HTMLDivElement | null>(null);

  const scrollToCurrentMilestone = (behavior: ScrollBehavior = 'smooth') => {
    if (activeMilestoneRef.current) {
      activeMilestoneRef.current.scrollIntoView({
        behavior,
        block: 'nearest',
        inline: 'nearest'
      });
    }
  };

  useEffect(() => {
    const hasCurrent = legislativeMilestones.some(m => m.status === 'current');
    if (hasCurrent) {
      const timer = setTimeout(() => {
        scrollToCurrentMilestone('smooth');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Breaking News & Alert Feed State
  interface WatchdogEvent {
    id: string;
    title: string;
    category: 'BILL' | 'PAC_SPIKE' | 'INSIDER_TRADE' | 'MIDNIGHT_VOTE' | 'OUTREACH';
    summary: string;
    impactText: string;
    severity: 'info' | 'warning' | 'critical';
    timestamp: string;
    targetLegislatorId?: string;
    targetBillId?: string;
    actionLabel?: string;
  }

  const [currentEvents, setCurrentEvents] = useState<WatchdogEvent[]>([
    {
      id: "event-1",
      title: "Late-Night Defense Vote Scheduled",
      category: "MIDNIGHT_VOTE",
      summary: "A vote on critical military contractor appropriations was suddenly scheduled for 02:30 AM tonight with under 10 hours' notice.",
      impactText: "Diligence score metric penalties triggered automatically across 12 co-sponsoring representatives.",
      severity: "critical",
      timestamp: "Just Now",
      targetLegislatorId: "M001111",
      actionLabel: "Analyze on Watchdog"
    },
    {
      id: "event-2",
      title: "Omnibus Fast-Track Subclause Detected",
      category: "BILL",
      summary: "Lobbyist-drafted liability shield clause identified on Page 1,024 of the Fast-Track Commerce Accord (SB 493).",
      impactText: "Bypassed standard 72-hour review committee markup. Page count exceeds normal human review capacity.",
      severity: "warning",
      timestamp: "12 mins ago",
      targetBillId: "sb-493",
      actionLabel: "Run AI Watchdog Audit"
    },
    {
      id: "event-3",
      title: "AIPAC PAC Contribution Surge",
      category: "PAC_SPIKE",
      summary: "$145,000 in PAC funds (PAC ID: C00797670) dispatched to House Agricultural Oversight Committee co-chairs.",
      impactText: "Drives corporate alignment index spikes for members voting on upcoming fertilizer regulatory bills.",
      severity: "warning",
      timestamp: "45 mins ago",
      targetLegislatorId: "P000197",
      actionLabel: "Filter Directory"
    },
    {
      id: "event-4",
      title: "Suspected Energy Sector Stock Acquisition",
      category: "INSIDER_TRADE",
      summary: "High-value trade in liquid gas supplier completed by oversight committee spouse ahead of public pipeline fast-track approval announcement.",
      impactText: "Integrity alert flagged. Immediate disclosure audit triggered by open compliance scraper.",
      severity: "critical",
      timestamp: "2 hours ago",
      targetLegislatorId: "S000033",
      actionLabel: "Verify Conflict"
    }
  ]);

  // Outreach & Redress Portal States
  const [outreachLegislatorId, setOutreachLegislatorId] = useState<string>('');
  const [outreachMessage, setOutreachMessage] = useState<string>('');
  const [outreachStatusLog, setOutreachStatusLog] = useState<{status: 'idle' | 'drafting' | 'dispatching' | 'sent', text: string}>({
    status: 'idle',
    text: ''
  });
  const [customRedressStatement, setCustomRedressStatement] = useState<string>('');
  const [customRedressActions, setCustomRedressActions] = useState<string>('');

  const handleDispatchOutreach = async (legislatorId: string) => {
    if (!legislatorId) return;
    const leg = legislators.find(l => l.legislator_id === legislatorId);
    if (!leg) return;

    setOutreachStatusLog({
      status: 'drafting',
      text: `Drafting secure cryptographic invitation packet for Representative ${leg.name}...`
    });

    await new Promise(resolve => setTimeout(resolve, 800));

    setOutreachStatusLog({
      status: 'dispatching',
      text: `Dispatching encrypted invite to ${leg.role === 'Senator' ? 'senate.gov' : 'house.gov'} IT communications routing switch...`
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    setLegislators(prev => {
      const updated = prev.map(l => {
        if (l.legislator_id === legislatorId) {
          return {
            ...l,
            outreach_status: 'pending'
          };
        }
        return l;
      });
      try {
        localStorage.setItem('watchdog_legislators', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setOutreachStatusLog({
      status: 'sent',
      text: `✉️ Security outreach dispatch completed! An invitation token was routed to ${leg.name}'s official legislative representative channel.`
    });

    // Add a breaking event in the live feed!
    const newEvent: WatchdogEvent = {
      id: `event-outreach-${Date.now()}`,
      title: `Official Watchdog Request Dispatched`,
      category: 'OUTREACH',
      summary: `Independent constituent transparency audit and redress request formally delivered to ${leg.name}'s office.`,
      impactText: "Waiting on cryptographic verified identity claim & formal response statement publishing.",
      severity: "info",
      timestamp: "Just Now",
      targetLegislatorId: leg.legislator_id,
      actionLabel: "Filter Directory"
    };
    setCurrentEvents(prev => [newEvent, ...prev]);
  };

  const handleSimulateClaimAndPublish = async (legislatorId: string) => {
    if (!legislatorId) return;
    const leg = legislators.find(l => l.legislator_id === legislatorId);
    if (!leg) return;

    setOutreachStatusLog({
      status: 'dispatching',
      text: `Representative ${leg.name}'s staff is validating token & signing cryptographic declaration...`
    });

    await new Promise(resolve => setTimeout(resolve, 1200));

    let statement = `As a public servant, I take citizen concerns regarding special-interest lobbying and session timing seriously. While campaign contributions and tight scheduling can make legislative transparency difficult, I pledge to implement strict standards in my office.`;
    let correctiveActions = [
      "Co-sponsor the bipartisan 72-Hour Mandated Bill Review Act.",
      "Restrict and cap corporate PAC contributions during the current committee term.",
      "Initiate a monthly constituent-led transparency review livestream."
    ];

    try {
      const response = await fetch('/api/gemini/generate-rebuttal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          legislator: leg, 
          customStatement: customRedressStatement, 
          customActions: customRedressActions 
        })
      });
      if (response.ok) {
        const data = await response.json();
        statement = data.statement;
        correctiveActions = data.correctiveActions;
      }
    } catch (err) {
      console.error("Failed to generate custom rebuttal with Gemini", err);
    }

    setLegislators(prev => {
      const updated = prev.map(l => {
        if (l.legislator_id === legislatorId) {
          return {
            ...l,
            outreach_status: 'verified',
            verified_member_page: true,
            official_statement: statement,
            corrective_actions: correctiveActions
          };
        }
        return l;
      });
      try {
        localStorage.setItem('watchdog_legislators', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setCustomRedressStatement('');
    setCustomRedressActions('');

    setOutreachStatusLog({
      status: 'sent',
      text: `🎉 Official portal response published successfully! Representative ${leg.name} is now a VERIFIED member with redress statements visible to the public.`
    });

    // Append an event to the Live Event feed
    const newEvent: WatchdogEvent = {
      id: `event-verified-${Date.now()}`,
      title: `Official Response Published: ${leg.name}`,
      category: 'OUTREACH',
      summary: `${leg.name} (${leg.party}) has officially claimed their page, submitted an oversight rebuttal, and filed 3 corrective commitments.`,
      impactText: "Verified checkmark awarded. Voter transparency ratings recalculated with corrective action weightings.",
      severity: "info",
      timestamp: "Just Now",
      targetLegislatorId: leg.legislator_id,
      actionLabel: "Filter Directory"
    };
    setCurrentEvents(prev => [newEvent, ...prev]);
  };

  const handleGenerateMilestonePlan = async (milestoneId: string) => {
    const milestone = legislativeMilestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    setIsGeneratingMilestonePlan(true);
    setCustomMilestonePlan('');

    try {
      const response = await fetch('/api/gemini/generate-milestone-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestone })
      });
      if (response.ok) {
        const data = await response.json();
        setCustomMilestonePlan(data.plan);
      } else {
        throw new Error('Failed to generate milestone plan');
      }
    } catch (err) {
      console.error(err);
      setCustomMilestonePlan('⚠️ Could not generate plan. Please check your connection and try again.');
    } finally {
      setIsGeneratingMilestonePlan(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('watchdog_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.error("Error saving watchlist", e);
    }
  }, [watchlist]);

  // User Account & Profile state
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('watchdog_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error reading user profile", e);
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('watchdog_user_profile', JSON.stringify(user));
      } else {
        localStorage.removeItem('watchdog_user_profile');
      }
    } catch (e) {
      console.error("Error saving user profile", e);
    }
  }, [user]);

  // Debates state
  const [debates, setDebates] = useState<DebatePost[]>(() => {
    try {
      const saved = localStorage.getItem('watchdog_debates');
      return saved ? JSON.parse(saved) : PRELOADED_DEBATES;
    } catch (e) {
      console.error("Error reading debates", e);
      return PRELOADED_DEBATES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('watchdog_debates', JSON.stringify(debates));
    } catch (e) {
      console.error("Error saving debates", e);
    }
  }, [debates]);

  // Lawmaker Broadcasts state
  const [broadcasts, setBroadcasts] = useState<LawmakerBroadcast[]>(() => {
    try {
      const saved = localStorage.getItem('watchdog_broadcasts');
      return saved ? JSON.parse(saved) : PRELOADED_BROADCASTS;
    } catch (e) {
      console.error("Error reading broadcasts", e);
      return PRELOADED_BROADCASTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('watchdog_broadcasts', JSON.stringify(broadcasts));
    } catch (e) {
      console.error("Error saving broadcasts", e);
    }
  }, [broadcasts]);

  // Debate Actions
  const handleAddDebate = (newDebate: DebatePost) => {
    setDebates(prev => [newDebate, ...prev]);
  };

  const handleAddChallenge = (debateId: string, challenge: DebateChallenge) => {
    setDebates(prev => prev.map(d => {
      if (d.id === debateId) {
        return {
          ...d,
          challenges: [challenge, ...d.challenges]
        };
      }
      return d;
    }));
  };

  const handleVoteDebate = (debateId: string, type: 'support' | 'discredit' | 'appeal') => {
    setDebates(prev => prev.map(d => {
      if (d.id === debateId) {
        return {
          ...d,
          supportCount: type === 'support' ? d.supportCount + 1 : d.supportCount,
          discreditCount: type === 'discredit' ? d.discreditCount + 1 : d.discreditCount,
          appealCount: type === 'appeal' ? d.appealCount + 1 : d.appealCount
        };
      }
      return d;
    }));
  };

  // Broadcast Actions
  const handleAddBroadcast = (newBroadcast: LawmakerBroadcast) => {
    setBroadcasts(prev => [newBroadcast, ...prev]);
  };

  const handleAddCommentToBroadcast = (
    broadcastId: string, 
    commentText: string, 
    authorName: string, 
    authorRole: 'Citizen' | 'Politician'
  ) => {
    setBroadcasts(prev => prev.map(b => {
      if (b.id === broadcastId) {
        const newComment = {
          id: `bc-comment-${Date.now()}`,
          authorName,
          authorRole,
          text: commentText,
          timestamp: new Date().toISOString()
        };
        return {
          ...b,
          comments: [...b.comments, newComment]
        };
      }
      return b;
    }));
  };

  const handleLikeBroadcast = (broadcastId: string) => {
    setBroadcasts(prev => prev.map(b => {
      if (b.id === broadcastId) {
        return {
          ...b,
          likesCount: b.likesCount + 1
        };
      }
      return b;
    }));
  };

  const handleToggleFavorite = (id: string) => {
    setWatchlist(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // User-Defined Alignment Preferences (Weights)
  const [userPrefs, setUserPrefs] = useState<UserValuePreferences>(() => {
    try {
      const saved = localStorage.getItem('watchdog_user_prefs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading user preferences", e);
    }
    return {
      lobbyistWeight: 'high',
      transparencyWeight: 'medium',
      diligenceWeight: 'medium',
      independenceWeight: 'high'
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('watchdog_user_prefs', JSON.stringify(userPrefs));
    } catch (e) {
      console.error("Error saving user preferences", e);
    }
  }, [userPrefs]);

  // Master scoring function that models grassroots alignment
  const calculateUserAlignmentScore = (legislator: Legislator, prefs: UserValuePreferences): number => {
    // 1. PAC Rejection Score (100% means $0 campaign contribution)
    const lobbyistScore = Math.max(0, 100 - Math.round(legislator.aipac_funding_total / 3500));
    
    // 2. Voting Hours Transparency (100% means 0 late-night votes)
    const transparencyScore = Math.max(0, 100 - (legislator.late_night_votes_count * 15));
    
    // 3. Legislative Diligence (Ratio of hours spent reviewing vs 72-hour benchmark)
    const rawDiligence = Math.min(100, Math.round((legislator.avg_review_hours_major_bills / 72) * 100));
    const sponsorBonus = legislator.transparency_bill_sponsorships * 15;
    const diligenceScore = Math.min(100, rawDiligence + sponsorBonus);
    
    // 4. Financial Independence & Populism Index (0-100)
    // Low corporate vote index and 0 secret society affiliations yields 100.
    const corporatePenalization = legislator.corporate_vote_index;
    const societyPenalization = legislator.society_affiliations.length * 30;
    const independenceScore = Math.max(0, 100 - corporatePenalization - societyPenalization);

    const weightMap = { low: 1, medium: 3, high: 6 };
    const wLobbyist = weightMap[prefs.lobbyistWeight];
    const wTrans = weightMap[prefs.transparencyWeight];
    const wDiligence = weightMap[prefs.diligenceWeight];
    const wIndep = weightMap[prefs.independenceWeight];

    const totalWeight = wLobbyist + wTrans + wDiligence + wIndep;
    const weightedSum = (lobbyistScore * wLobbyist) + 
                        (transparencyScore * wTrans) + 
                        (diligenceScore * wDiligence) + 
                        (independenceScore * wIndep);

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 100;
  };

  const [toastAlert, setToastAlert] = useState<NotificationAlert | null>(null);

  const handleAddFlag = (newFlag: CustomFlag) => {
    setCustomFlags(prev => [newFlag, ...prev]);
  };

  const handleRemoveFlag = (id: string) => {
    setCustomFlags(prev => prev.filter(f => f.id !== id));
  };

  const handleRunScan = (flag: CustomFlag) => {
    const matches = legislators.filter(leg => {
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
    });

    if (matches.length === 0) {
      const newAlert = {
        id: `scan-${Date.now()}`,
        politicianName: "System Auditor",
        billNumber: "Audit Scan",
        timestamp: new Date().toLocaleTimeString(),
        fullMessage: `Watchdog scanner found 0 lawmakers matching custom rule: [${flag.name}].`
      };
      setAlerts(prev => [newAlert, ...prev]);
      setToastAlert(newAlert);
      return;
    }

    const matchedNames = matches.map(m => m.name).slice(0, 3).join(", ") + (matches.length > 3 ? ` and ${matches.length - 3} others` : "");
    
    const newAlert = {
      id: `scan-${Date.now()}`,
      politicianName: "Watchdog Agent",
      billNumber: "Batch Scan",
      timestamp: new Date().toLocaleTimeString(),
      fullMessage: `MATCHED! Custom rule [${flag.name}] flagged ${matches.length} lawmakers: ${matchedNames}. Added persistent trust alerts.`
    };

    setAlerts(prev => [newAlert, ...prev]);
    setToastAlert(newAlert);

    setLegislators(prev => prev.map(item => {
      const isMatch = matches.some(m => m.legislator_id === item.legislator_id);
      if (isMatch) {
        const existing = item.conflict_triggers || [];
        if (existing.some(e => e.title === `Flagged: ${flag.name}`)) {
          return item;
        }
        const newTrigger = {
          id: `custom-trig-${Date.now()}-${item.legislator_id}`,
          type: 'lobbyist_favoritism' as const,
          title: `Flagged: ${flag.name}`,
          severity: flag.severity,
          description: flag.description,
          date: new Date().toISOString().split('T')[0],
          details: {
            donor_or_entity: flag.metric === 'aipac_funding' ? 'AIPAC (C00797670)' : undefined,
            contract_value: flag.metric === 'aipac_funding' ? flag.value : undefined,
          }
        };
        return {
          ...item,
          conflict_triggers: [newTrigger, ...existing]
        };
      }
      return item;
    }));

    // Auto dismiss Toast Alert after 6 seconds
    setTimeout(() => {
      setToastAlert(curr => curr?.id === newAlert.id ? null : curr);
    }, 6000);
  };

  // Legislative Watchdog Hub State
  const [selectedBillId, setSelectedBillId] = useState<string>("bill-1");
  const [isCustomBill, setIsCustomBill] = useState(false);
  const [customBillNumber, setCustomBillNumber] = useState("HR 5055");
  const [customBillTitle, setCustomBillTitle] = useState("Corporate Subsidy Regulation Act");
  const [customBillPages, setCustomBillPages] = useState("245");
  const [customBillText, setCustomBillText] = useState("This legislation transfers financial oversight from Federal agencies to industrial self-auditing councils, reducing compliance auditing schedules...");
  const [customReleaseTime, setCustomReleaseTime] = useState("2026-07-01T08:00:00");
  const [customVoteTime, setCustomVoteTime] = useState("2026-07-02T14:00:00"); // 30 hours elapsed

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<WatchdogAnalysis | null>(null);

  // Bill Reader & AI Summarizer State
  const [isViewingBill, setIsViewingBill] = useState(false);
  const [viewingBillId, setViewingBillId] = useState<string | null>(null);
  const [isSummarizingBill, setIsSummarizingBill] = useState(false);
  const [viewingBillSummary, setViewingBillSummary] = useState<{
    executiveSummary: string;
    keyProvisions: string[];
    citizenImpact: string;
    usingDemoFallback?: boolean;
  } | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [isQueryingQuestion, setIsQueryingQuestion] = useState(false);
  const [customQuestionReplies, setCustomQuestionReplies] = useState<Array<{
    question: string;
    reply: string;
    usingDemoFallback?: boolean;
    timestamp: string;
  }>>([]);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [trendLegislatorId, setTrendLegislatorId] = useState<string>('M000355');
  const [pacChartView, setPacChartView] = useState<'individual' | 'comparison'>('individual');
  const [comparisonLegislatorIds, setComparisonLegislatorIds] = useState<string[]>(['M000355', 'C001098']);

  // PAC Anomaly Tooltip States
  const [showSpikes, setShowSpikes] = useState(true);
  const [showDips, setShowDips] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState<{
    term: string;
    fullTerm: string;
    pacFunding: number;
    avg: number;
    type: 'spike' | 'dip';
    legislatorName: string;
  } | null>(null);
  const [anomalyExplanation, setAnomalyExplanation] = useState<string | null>(null);
  const [anomalyLoading, setAnomalyLoading] = useState(false);

  const handleAnomalyClick = async (entry: any, avg: number, legislator: Legislator) => {
    const type = entry.pacFunding > avg ? 'spike' : 'dip';
    setSelectedAnomaly({
      term: entry.term,
      fullTerm: entry.fullTerm,
      pacFunding: entry.pacFunding,
      avg,
      type,
      legislatorName: legislator.name
    });
    setAnomalyExplanation(null);
    setAnomalyLoading(true);

    try {
      const res = await fetch("/api/gemini/pac-anomaly-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legislatorName: legislator.name,
          party: legislator.party,
          state: legislator.state,
          term: entry.fullTerm,
          pacFunding: entry.pacFunding,
          averageFunding: avg,
          type
        })
      });
      const data = await res.json();
      setAnomalyExplanation(data.explanation || "No explanation returned.");
    } catch (err) {
      console.error(err);
      setAnomalyExplanation("Failed to generate AI analysis of this funding anomaly. Please try again later.");
    } finally {
      setAnomalyLoading(false);
    }
  };
  const [partyFilter, setPartyFilter] = useState<'All' | 'Democrat' | 'Republican' | 'Independent'>('All');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Representative' | 'Senator'>('All');
  const [societyFilter, setSocietyFilter] = useState<string>('All');
  const [integrityFilter, setIntegrityFilter] = useState<'All' | 'donor_contract' | 'insider_trading' | 'lobbyist_favoritism' | 'secret_litigation' | 'clean'>('All');
  const [sortBy, setSortBy] = useState<'highest_pac' | 'lowest_pac' | 'highest_transparency' | 'lowest_transparency' | 'society_count' | 'highest_alerts' | 'highest_alignment' | 'lowest_alignment'>('highest_alignment');

  // Compare Mode state
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const handleToggleCompare = (legislatorId: string) => {
    setCompareSelection(prev => {
      if (prev.includes(legislatorId)) {
        return prev.filter(id => id !== legislatorId);
      }
      if (prev.length < 2) {
        return [...prev, legislatorId];
      }
      return prev;
    });
  };

  // Helper to calculate Factual Legislative Transparency Index (0 to 100)
  const calculateTransparencyIndex = (legislator: Legislator): number => {
    const f1 = Math.max(0, 100 - (legislator.late_night_votes_count * 15));
    const f2 = Math.min(100, Math.round((legislator.avg_review_hours_major_bills / 72) * 100));
    const f3 = Math.min(100, legislator.transparency_bill_sponsorships * 25);
    return Math.round((f1 * 0.4) + (f2 * 0.4) + (f3 * 0.2));
  };

  const currentViewingBill = useMemo(() => {
    if (!isViewingBill || !viewingBillId) return null;
    if (viewingBillId === 'custom') {
      return {
        id: "custom",
        billNumber: customBillNumber,
        title: customBillTitle,
        pageCount: Number(customBillPages) || 1,
        summaryText: customBillText,
        fullText: customBillText || "No text fragment provided. Type or paste legislative text on the left form to preview it."
      };
    }
    const preloaded = PRELOADED_BILLS.find(b => b.id === viewingBillId);
    if (!preloaded) return null;

    let draftText = "";
    if (viewingBillId === 'bill-1') {
      draftText = `H.R. 2670\n118th CONGRESS\n1st Session\n\nTo authorize appropriations for fiscal year 2024 for military activities of the Department of Defense, for military construction, and for defense activities of the Department of Energy, to prescribe military personnel strengths for such fiscal year, and for other purposes.\n\nIN THE HOUSE OF REPRESENTATIVES\n\nBe it enacted by the Senate and House of Representatives of the United States of America in Congress assembled,\n\nSECTION 1. SHORT TITLE; TABLE OF CONTENTS.\n(a) Short Title.—This Act may be cited as the “National Defense Authorization Act for Fiscal Year 2024”.\n\nSECTION 2. ORGANIZATION OF ACT INTO DIVISIONS.\n(a) Divisions.—This Act is organized into four divisions as follows:\n  (1) Division A—Department of Defense Authorizations.\n  (2) Division B—Military Construction Authorizations.\n  (3) Division C—Department of Energy National Security Authorizations.\n  (4) Division D—Funding Tables.\n\nSEC. 101. AUTHORIZATION OF APPROPRIATIONS.\nFunds are hereby authorized to be appropriated for fiscal year 2024 for the use of the Armed Forces and other activities and agencies of the Department of Defense for expenses, not otherwise provided for, for procurement, research, development, test and evaluation, and operation and maintenance, as specified in the funding tables in division D.\n\nSEC. 312. PROCUREMENT OF COMMODITIES WITH CORPORATE SELF-AUDITING OUTSOURCING.\nThe Secretary of Defense shall establish a specialized defense contractor certification pathway, allowing approved commercial suppliers of technology components to conduct compliance self-auditing routines, bypassing standard federal safety and pricing inspections.\n\nSEC. 805. MODIFICATION OF DEFENSE ACQUISITION REPORTING PROCESSES.\nRequirements for detailed cost oversight reports for major system procurements exceeding $500M are hereby repealed. Contractors may present simplified financial statements in lieu of auditing compliance audits.`;
    } else if (viewingBillId === 'bill-2') {
      draftText = `H.R. 1\n115th CONGRESS\n1st Session\n\nTo provide for reconciliation pursuant to titles II and V of the concurrent resolution on the budget for fiscal year 2018.\n\nIN THE HOUSE OF REPRESENTATIVES\n\nBe it enacted by the Senate and House of Representatives of the United States of America in Congress assembled,\n\nSECTION 1. SHORT TITLE.\n(a) Short Title.—This Act may be cited as the “Tax Cuts and Jobs Act”.\n\nSEC. 11011. REDUCTION IN CORPORATE TAX RATE.\n(a) In General.—Section 11(b) of the Internal Revenue Code of 1986 is amended to read as follows:\n  “(b) Amount Of Tax.—The amount of the tax imposed by subsection (a) on a corporation shall be 21 percent of the taxable income.”\n\nSEC. 11012. INCREASE IN STANDARD DEDUCTION.\n(a) In General.—Section 63(c)(2) of the Internal Revenue Code of 1986 is amended—\n  (1) by striking ‘$3,000’ and inserting ‘$12,000’,\n  (2) by striking ‘$4,400’ and inserting ‘$18,000’, and\n  (3) by striking ‘$6,000’ and inserting ‘$24,000’.\n\nSEC. 13001. REPEAL OF AFFORDABLE CARE ACT INDIVIDUAL MANDATE PENALTY.\n(a) In General.—Section 5000A(c) is amended—\n  (1) in paragraph (2)(B)(iii), by striking ‘2.5 percent’ and inserting ‘0 percent’,\n  (2) in paragraph (3)(A), by striking ‘$695’ and inserting ‘$0’.`;
    } else if (viewingBillId === 'bill-3') {
      draftText = `S. 3746\n118th CONGRESS\n1st Session\n\nTo suspend the debt limit, reduce discretionary spending, and expand certain work requirements for federal assistance programs.\n\nIN THE SENATE OF THE UNITED STATES\n\nBe it enacted by the Senate and House of Representatives of the United States of America in Congress assembled,\n\nSECTION 1. SHORT TITLE.\n(a) Short Title.—This Act may be cited as the “Fiscal Responsibility Act of 2023”.\n\nSEC. 101. TEMPORARY SUSPENSION OF DEBT LIMIT.\n(a) In General.—Section 3101(b) of title 31, United States Code, shall not apply for the period beginning on the date of the enactment of this Act and ending on January 2, 2025.\n\nSEC. 201. CAPS ON DISCRETIONARY BUDGET SPENDING.\n(a) Discretionary Spending Limits.—Except as provided in subsection (b), total discretionary budget authority for fiscal year 2024 shall be capped at $1.59 trillion, and for fiscal year 2025 shall be capped at $1.61 trillion.\n\nSEC. 311. MODIFICATION OF WORK REQUIREMENTS FOR SNAP.\n(a) In General.—Section 6(o)(2) of the Food and Nutrition Act of 2008 is amended by striking ‘50 years of age’ and inserting ‘54 years of age’.`;
    }

    return {
      ...preloaded,
      fullText: draftText
    };
  }, [isViewingBill, viewingBillId, customBillNumber, customBillTitle, customBillPages, customBillText]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setPartyFilter('All');
    setRoleFilter('All');
    setSocietyFilter('All');
    setIntegrityFilter('All');
    setSortBy('highest_pac');
  };

  // Extract unique societies in the dataset
  const uniqueSocieties = useMemo(() => {
    const societies = new Set<string>();
    legislators.forEach(item => {
      item.society_affiliations.forEach(soc => societies.add(soc));
    });
    return Array.from(societies).sort();
  }, [legislators]);

  // Filtered and Sorted list
  const filteredLegislators = useMemo(() => {
    let result = [...legislators];

    // Filter by search text
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        item => 
          item.name.toLowerCase().includes(q) || 
          item.state.toLowerCase().includes(q) ||
          item.legislator_id.toLowerCase().includes(q)
      );
    }

    // Filter by party
    if (partyFilter !== 'All') {
      result = result.filter(item => item.party === partyFilter);
    }

    // Filter by role (Representative/Senator)
    if (roleFilter !== 'All') {
      result = result.filter(item => item.role === roleFilter);
    }

    // Filter by specific secret society
    if (societyFilter !== 'All') {
      result = result.filter(item => item.society_affiliations.includes(societyFilter));
    }

    // Filter by integrity alert type
    if (integrityFilter !== 'All') {
      if (integrityFilter === 'clean') {
        result = result.filter(item => !item.conflict_triggers || item.conflict_triggers.length === 0);
      } else {
        result = result.filter(item => item.conflict_triggers && item.conflict_triggers.some(t => t.type === integrityFilter));
      }
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'highest_pac') {
        return b.aipac_funding_total - a.aipac_funding_total;
      }
      if (sortBy === 'lowest_pac') {
        return a.aipac_funding_total - b.aipac_funding_total;
      }
      if (sortBy === 'highest_transparency') {
        return calculateTransparencyIndex(b) - calculateTransparencyIndex(a);
      }
      if (sortBy === 'lowest_transparency') {
        return calculateTransparencyIndex(a) - calculateTransparencyIndex(b);
      }
      if (sortBy === 'society_count') {
        return b.society_affiliations.length - a.society_affiliations.length;
      }
      if (sortBy === 'highest_alerts') {
        const getAlertCount = (x: Legislator) => x.conflict_triggers ? x.conflict_triggers.length : 0;
        return getAlertCount(b) - getAlertCount(a);
      }
      if (sortBy === 'highest_alignment') {
        return calculateUserAlignmentScore(b, userPrefs) - calculateUserAlignmentScore(a, userPrefs);
      }
      if (sortBy === 'lowest_alignment') {
        return calculateUserAlignmentScore(a, userPrefs) - calculateUserAlignmentScore(b, userPrefs);
      }
      return 0;
    });

    return result;
  }, [legislators, search, partyFilter, roleFilter, societyFilter, integrityFilter, sortBy, userPrefs]);

  // Aggregate stats from the current filtered list
  const stats = useMemo(() => {
    const totalAipac = filteredLegislators.reduce((acc, curr) => acc + curr.aipac_funding_total, 0);
    const avgTransparencyScore = filteredLegislators.length > 0
      ? Math.round(filteredLegislators.reduce((acc, curr) => acc + calculateTransparencyIndex(curr), 0) / filteredLegislators.length)
      : 0;
    const societyMembersCount = filteredLegislators.filter(item => item.society_affiliations.length > 0).length;
    const midnightVotesActiveCount = filteredLegislators.filter(item => item.midnight_vote_badge).length;
    const totalIntegrityAlerts = filteredLegislators.reduce((acc, curr) => acc + (curr.conflict_triggers ? curr.conflict_triggers.length : 0), 0);

    return {
      totalAipac,
      avgTransparencyScore,
      societyMembersCount,
      midnightVotesActiveCount,
      totalIntegrityAlerts,
      legislatorCount: filteredLegislators.length
    };
  }, [filteredLegislators]);

  // Format helper for money
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Simulate Midnight Vote Event
  const handleSimulateMidnightVote = () => {
    // Pick a random politician from our state
    const targetIdx = Math.floor(Math.random() * legislators.length);
    const targetRep = legislators[targetIdx];

    // Pick a random non-standard time
    const midnightHours = ["10:15 PM", "11:42 PM", "01:20 AM", "02:45 AM", "03:55 AM", "04:10 AM"];
    const randomTime = midnightHours[Math.floor(Math.random() * midnightHours.length)];

    // Pick a bill
    const bills = ["HR 2670", "HR 1", "S 3746", "HR 82", "HR 302"];
    const randomBill = bills[Math.floor(Math.random() * bills.length)];

    const timestampFull = `${randomTime} EST`;
    const msg = `[${targetRep.name}] cast a vote on [${randomBill}] at [${timestampFull}], which is outside of standard transparency hours.`;

    const newAlert: NotificationAlert = {
      id: `alert-${Date.now()}`,
      politicianName: targetRep.name,
      billNumber: randomBill,
      timestamp: timestampFull,
      fullMessage: msg
    };

    // Update alerts lists
    setAlerts(prev => [newAlert, ...prev].slice(0, 10)); // Limit to 10 logs
    setToastAlert(newAlert);

    // Update specific legislator's record in state to trigger live badge immediately
    setLegislators(prev => prev.map((item, idx) => {
      if (idx === targetIdx) {
        const existingVotes = item.midnight_votes || [];
        return {
          ...item,
          midnight_vote_badge: true,
          midnight_votes: [
            {
              bill_number: randomBill,
              bill_name: "Congressional Decision Act",
              timestamp: randomTime
            },
            ...existingVotes
          ]
        };
      }
      return item;
    }));

    // Auto dismiss Toast Alert after 6 seconds
    setTimeout(() => {
      setToastAlert(curr => curr?.id === newAlert.id ? null : curr);
    }, 6050);
  };

  // Simulate Integrity Trigger Event
  const handleSimulateIntegrityTrigger = (type: 'donor_contract' | 'insider_trading' | 'lobbyist_favoritism' | 'secret_litigation') => {
    // Pick a random politician
    const targetIdx = Math.floor(Math.random() * legislators.length);
    const targetRep = legislators[targetIdx];

    let title = "";
    let severity: 'medium' | 'high' | 'critical' = 'high';
    let description = "";
    let details: any = {};
    const randomDate = new Date().toISOString().split('T')[0];

    if (type === 'donor_contract') {
      title = "Donor-Contract Award Correlation";
      severity = "high";
      const donors = ["Boeing Corp PAC", "Lockheed Martin PAC", "Pfizer PAC", "ExxonMobil Corp", "Goldman Sachs"];
      const randomDonor = donors[Math.floor(Math.random() * donors.length)];
      const contractVal = (Math.floor(Math.random() * 80) + 5) * 1000000;
      description = `Major campaign donor "${randomDonor}" subsidiary was awarded a federal procurement contract worth $${(contractVal / 1000000).toFixed(1)}M shortly after floor support by the Legislator.`;
      details = {
        donor_or_entity: randomDonor,
        contract_value: contractVal
      };
    } else if (type === 'insider_trading') {
      title = "Stock Transaction Prior to Vote";
      severity = "critical";
      const stocks = [
        { ticker: "MSFT (Microsoft)", sector: "AI Cloud" },
        { ticker: "LMT (Lockheed Martin)", sector: "Defense" },
        { ticker: "PFE (Pfizer)", sector: "Biotech" },
        { ticker: "XOM (ExxonMobil)", sector: "Energy" },
        { ticker: "NVDA (NVIDIA Corp)", sector: "Semiconductors" }
      ];
      const selectedStock = stocks[Math.floor(Math.random() * stocks.length)];
      const bills = ["H.R. 5202 - Defense Supply Authorization", "H.R. 1102 - Semiconductor Grant Funding", "S. 855 - Medical Device Fast-track Act", "S. 2099 - Clean Energy Infrastructure"];
      const randomBill = bills[Math.floor(Math.random() * bills.length)];
      const randomAmount = ["$15,001 - $50,000", "$50,001 - $100,000", "$100,001 - $250,000"][Math.floor(Math.random() * 3)];
      description = `Legislator or direct spouse executed a high-value "${selectedStock.ticker}" stock transaction valued at ${randomAmount} within 7 days before voting on ${randomBill.split(' - ')[0]} affecting the ${selectedStock.sector} sector.`;
      details = {
        stock_ticker: selectedStock.ticker,
        transaction_type: "Buy",
        transaction_amount: randomAmount,
        bill_affected: randomBill
      };
    } else if (type === 'lobbyist_favoritism') {
      title = "Lobbyist Text Favoritism Alert";
      severity = "medium";
      const firms = ["Akin Gump lobbyist", "BGR Group representative", "Brownstein Hyatt lobbyist", "Podesta Group adviser"];
      const randomFirm = firms[Math.floor(Math.random() * firms.length)];
      const bills = ["H.R. 3020 - Telecom Modernization Act", "S. 1403 - Financial Market Derigidification Act", "H.R. 822 - Natural Gas Extraction Act"];
      const randomBill = bills[Math.floor(Math.random() * bills.length)];
      description = `Verbatim textual match flagged between amendments sponsored by Legislator and model legislative text provided directly by "${randomFirm}".`;
      details = {
        lobbyist_firm: randomFirm,
        bill_affected: randomBill
      };
    } else if (type === 'secret_litigation') {
      title = "Secret Litigation & Notice Bypass";
      severity = "critical";
      const times = ["11:30 PM EST", "01:15 AM EST", "03:40 AM EST", "04:55 AM EST"];
      const randomTime = times[Math.floor(Math.random() * times.length)];
      const bills = ["H.R. 6112 - Omnibus Security Appropriations", "H.R. 9088 - Digital Asset Emergency Act", "S. 3442 - Emergency Bank Reserve Act"];
      const randomBill = bills[Math.floor(Math.random() * bills.length)];
      description = `Co-signed or voted to pass legislation directly affecting voter tax/regulatory frameworks in a closed-door session at ${randomTime}, with zero notice or public assembly.`;
      details = {
        secret_vote_time: randomTime,
        bill_affected: randomBill
      };
    }

    const msg = `[INTEGRITY ALERT] ${targetRep.name} flagged for "${title}" on ${details.bill_affected ? details.bill_affected.split(' - ')[0] : 'recent action'}.`;

    const newAlert: NotificationAlert = {
      id: `alert-${Date.now()}`,
      politicianName: targetRep.name,
      billNumber: details.bill_affected ? details.bill_affected.split(' - ')[0] : "Litigation",
      timestamp: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      fullMessage: msg
    };

    // Update alerts list
    setAlerts(prev => [newAlert, ...prev].slice(0, 10));
    setToastAlert(newAlert);

    // Update specific legislator in state list
    setLegislators(prev => prev.map((item, idx) => {
      if (idx === targetIdx) {
        const existingTriggers = item.conflict_triggers || [];
        const newTrigger = {
          id: `trig-${Date.now()}`,
          type,
          title,
          severity,
          description,
          date: randomDate,
          details
        };
        return {
          ...item,
          conflict_triggers: [newTrigger, ...existingTriggers]
        };
      }
      return item;
    }));

    // Auto dismiss Toast Alert after 6 seconds
    setTimeout(() => {
      setToastAlert(curr => curr?.id === newAlert.id ? null : curr);
    }, 6000);
  };

  // Run Watchdog AI Analysis via Full-stack route
  const handleExecuteWatchdogAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisProgress(["[INFO] Parsing bill parameters and timeline..."]);

    // Simulated terminal timing
    const steps = [
      { text: "[INFO] Validating transparency parameters (Threshold: Pages >= 100 OR Elapsed <= 48h)...", delay: 600 },
      { text: "[INFO] Contacting full-stack server pipeline at /api/watchdog/analyze...", delay: 1300 },
      { text: "[INFO] Requesting structured JSON analysis with Google Gemini (gemini-3.5-flash)...", delay: 2000 },
      { text: "[INFO] Generating critical summary logs focusing on special-interest benefits & late pork...", delay: 2800 },
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setAnalysisProgress(prev => [...prev, step.text]);
      }, step.delay);
    });

    let requestBody = {};
    if (isCustomBill) {
      requestBody = {
        billNumber: customBillNumber,
        title: customBillTitle,
        pageCount: Number(customBillPages) || 1,
        textReleaseTime: new Date(customReleaseTime).toISOString(),
        scheduledVoteTime: new Date(customVoteTime).toISOString(),
        customText: customBillText
      };
    } else {
      const preloaded = PRELOADED_BILLS.find(b => b.id === selectedBillId);
      if (preloaded) {
        requestBody = {
          billNumber: preloaded.billNumber,
          title: preloaded.title,
          pageCount: preloaded.pageCount,
          textReleaseTime: preloaded.textReleaseTime,
          scheduledVoteTime: preloaded.scheduledVoteTime,
          customText: preloaded.summaryText
        };
      }
    }

    try {
      const response = await fetch("/api/watchdog/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      
      setTimeout(() => {
        setAnalysisProgress(prev => [...prev, "[SUCCESS] Full analysis completed successfully.", "[INFO] Structuring output variables."]);
        setAnalysisResult(data.analysis);
        setIsAnalyzing(false);
      }, 3500);

    } catch (err: any) {
      console.error(err);
      setTimeout(() => {
        setAnalysisProgress(prev => [...prev, `[ERROR] Analysis failed: ${err.message || "Unknown Error"}`]);
        setIsAnalyzing(false);
      }, 3500);
    }
  };

  const handleSummarizeBill = async (billNumber: string, title: string, text: string) => {
    setIsSummarizingBill(true);
    setViewingBillSummary(null);
    try {
      const response = await fetch("/api/watchdog/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billNumber, title, billText: text }),
      });
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      setViewingBillSummary(data.summary);
    } catch (err: any) {
      console.error("Failed to summarize bill", err);
      setViewingBillSummary({
        executiveSummary: "The automated AI summarization pipeline was unable to complete the request. Please verify connection configurations or API keys.",
        keyProvisions: [
          "Failed to retrieve key provisions.",
          "Check backend connection logs."
        ],
        citizenImpact: "Connection issues prevent structural analysis.",
        usingDemoFallback: true
      });
    } finally {
      setIsSummarizingBill(false);
    }
  };

  const handleAskCustomQuestion = async (billNumber: string, title: string, text: string, questionText: string) => {
    if (!questionText.trim()) return;
    setIsQueryingQuestion(true);
    
    // Optimistically add question to chat with empty response or loading state
    const newQuestionObj = {
      question: questionText,
      reply: "Thinking... parsing legislative content clauses...",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      loading: true
    };

    try {
      const response = await fetch("/api/watchdog/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billNumber, title, billText: text, question: questionText }),
      });
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      setCustomQuestionReplies(prev => [
        ...prev,
        {
          question: questionText,
          reply: data.reply,
          usingDemoFallback: data.usingDemoFallback,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setCustomQuestion("");
    } catch (err: any) {
      console.error("Failed to ask custom question", err);
      setCustomQuestionReplies(prev => [
        ...prev,
        {
          question: questionText,
          reply: `Error: Unable to analyze question. ${err.message || "Please check backend connection."}`,
          usingDemoFallback: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsQueryingQuestion(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 antialiased font-sans pb-16 relative">
      
      {/* Background radial gradients for ambient vibe */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-emerald-950/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-rose-950/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Interactive Toast Alert Simulator */}
      {toastAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-slate-900/95 border border-rose-800/60 rounded-2xl p-4 shadow-2xl shadow-rose-950/20 animate-fade-in flex items-start gap-3">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-400">
            <BellRing size={18} className="animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black tracking-wider text-rose-400">📱 LIVE FCM PUSH NOTIFICATION</span>
              <button 
                onClick={() => setToastAlert(null)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-xs font-bold text-white mt-1">Midnight Vote warning dispatched!</p>
            <p className="text-[11px] text-slate-300 mt-1 leading-normal font-mono">
              {toastAlert.fullMessage}
            </p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="relative border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col xl:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-900/20 border border-indigo-500/20">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-white">CONGRESSIONAL DATA INTELLIGENCE</h1>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <p className="text-xs text-slate-400 font-medium">Lobbying, Fraternal Societies, & Live Transparency Warnings</p>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-1.5 py-0.5 rounded-md font-mono" title="Your flags and audit logs are automatically persisted in browser localStorage">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                  Auto-Save Active
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'dashboard' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity size={13} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('debate')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'debate' ? 'bg-slate-800 text-white shadow-md border border-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame size={13} className="text-amber-500 animate-pulse" />
              <span>Civic Arena</span>
            </button>

            <button
              onClick={() => setActiveTab('press')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'press' ? 'bg-slate-800 text-white shadow-md border border-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Megaphone size={13} className="text-indigo-400" />
              <span>Press Room</span>
            </button>

            <button
              onClick={() => setActiveTab('localaudit')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'localaudit' ? 'bg-slate-800 text-white shadow-md border border-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 size={13} className="text-emerald-400" />
              <span>Local Gov Audit</span>
            </button>

            <button
              onClick={() => setActiveTab('credentials')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'credentials' ? 'bg-slate-800 text-white shadow-md border border-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              {user ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 block shrink-0 animate-pulse" />
              ) : (
                <User size={13} className="text-rose-400" />
              )}
              <span>{user ? `Voter Card (${user.voterState})` : 'Credentials'}</span>
            </button>

            <button
              onClick={() => setActiveTab('watchdog')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'watchdog' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>Watchdog AI Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('flags')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'flags' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert size={13} className="text-indigo-400" />
              <span>Custom Watchdog Flags</span>
            </button>

            <button
              onClick={() => setActiveTab('functions')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'functions' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 size={13} className="text-rose-400" />
              <span>Cloud Functions</span>
            </button>

            <button
              onClick={() => setActiveTab('script')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'script' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal size={13} />
              <span>Termux Script</span>
            </button>

            <button
              onClick={() => setActiveTab('expo')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'expo' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone size={13} />
              <span>Expo Mobile</span>
            </button>

            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'json' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileJson size={13} />
              <span>JSON State</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        {/* Tab 1: Interactive Dashboard Simulator */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            
                        {/* Dashboard Sub-Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6 bg-slate-900/60 p-2 rounded-2xl border border-slate-800/80 w-full max-w-4xl mx-auto shadow-md">
              <button
                onClick={() => setDashboardTab('directory')}
                className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                  dashboardTab === 'directory' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Users size={14} />
                Members Directory
              </button>
              <button
                onClick={() => setDashboardTab('scorecard')}
                className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                  dashboardTab === 'scorecard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <SlidersHorizontal size={14} />
                Watchlist & Scorecard
              </button>
              <button
                onClick={() => setDashboardTab('metrics')}
                className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                  dashboardTab === 'metrics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Activity size={14} />
                Quick Metrics
              </button>
              <button
                onClick={() => setDashboardTab('pac')}
                className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                  dashboardTab === 'pac' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Coins size={14} />
                PAC Trends
              </button>
              <button
                onClick={() => setDashboardTab('events')}
                className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                  dashboardTab === 'events' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <BellRing size={14} />
                Live Feed & Outreach
              </button>
              <button
                onClick={() => setDashboardTab('advisor')}
                className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                  dashboardTab === 'advisor' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Bot size={14} />
                AI Advisor
              </button>
            </div>

            {/* AI Advisor Chatbot */}
            {dashboardTab === 'advisor' && (
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 max-w-3xl mx-auto animate-fade-in">
              
              {/* AI Civic Advisor Chatbox */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-[360px] lg:h-auto">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-2.5">
                    <h3 className="text-xs font-black tracking-wider text-indigo-400 uppercase flex items-center gap-1.5">
                      <Sparkles size={13} className="text-indigo-400 animate-spin-slow" />
                      AI Civic Guide & Advisor
                    </h3>
                    <span className="text-[8px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-850 font-bold uppercase tracking-wider animate-pulse">
                      Gemini Live
                    </span>
                  </div>

                  {/* Chat Message feed */}
                  <div className="overflow-y-auto pr-1 space-y-3 max-h-[190px] scrollbar-thin">
                    {advisorHistory.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`p-2.5 rounded-xl text-[11px] leading-relaxed ${
                          msg.role === 'user' 
                            ? 'bg-indigo-950/30 border border-indigo-900/35 text-indigo-200 ml-4' 
                            : 'bg-slate-950/80 border border-slate-850/80 text-slate-300 mr-4'
                        }`}
                      >
                        <div className="font-bold text-[9px] uppercase font-mono mb-1 text-slate-500">
                          {msg.role === 'user' ? 'Citizen' : 'AI Guide'}
                        </div>
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>
                    ))}
                    {advisorLoading && (
                      <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl mr-4 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                        <span>Civic Advisor is analyzing...</span>
                      </div>
                    )}
                  </div>

                  {/* Suggestions / Prompt starters to avoid feeling lost */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    <button 
                      onClick={() => handleSendAdvisorMessage("How do I use this app?")}
                      className="text-[9px] font-bold bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-white px-2 py-1 rounded-md transition-colors"
                    >
                      💡 How to use?
                    </button>
                    <button 
                      onClick={() => handleSendAdvisorMessage("Explain the Transparency Index")}
                      className="text-[9px] font-bold bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-white px-2 py-1 rounded-md transition-colors"
                    >
                      📊 Transparency Index
                    </button>
                    <button 
                      onClick={() => handleSendAdvisorMessage("Tell me about Mitch McConnell")}
                      className="text-[9px] font-bold bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-white px-2 py-1 rounded-md transition-colors"
                    >
                      🏛️ Mitch McConnell
                    </button>
                  </div>
                </div>

                {/* Input box */}
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ask the Civic Advisor anything..."
                    value={advisorInput}
                    onChange={(e) => setAdvisorInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAdvisorMessage()}
                    className="flex-1 h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-850 focus:border-indigo-500/70 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none"
                    disabled={advisorLoading}
                  />
                  <button
                    onClick={() => handleSendAdvisorMessage()}
                    disabled={advisorLoading || !advisorInput.trim()}
                    className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold tracking-wider uppercase transition-colors shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ask
                  </button>
                </div>
              </div>

            </div>
            )}

            {/* NEW: CAPITOL WATCHDOG LIVE EVENTS FEED & ELECTED OFFICIAL PORTAL */}
            {dashboardTab === 'events' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
              
              {/* Left Column: Breaking News & Live Legislative Watchdog Feed (7 cols) & Timeline */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* 1. Live Legislative Watchdog Feed */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <h3 className="text-xs font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                          🔴 LIVE CONGRESSIONAL WATCHDOG FEED
                        </h3>
                      </div>
                      <span className="text-[9px] font-mono bg-red-950/40 text-red-400 px-2 py-0.5 rounded-full border border-red-900/40 font-bold uppercase tracking-wider">
                        Breaking Alerts
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-normal mb-4">
                      Real-time crawler logs monitoring bill page lengths, late-night scheduled session changes, special-interest donation surges, and questionable family assets disclosures.
                    </p>

                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                      {currentEvents.map((evt) => {
                        let categoryBadge = "bg-slate-950 text-slate-400 border-slate-800";
                        let bgGrad = "from-slate-950/70 to-slate-950/40 border-slate-850/80";
                        if (evt.category === 'MIDNIGHT_VOTE') {
                          categoryBadge = "bg-rose-950/30 text-rose-400 border-rose-900/40";
                          bgGrad = "from-rose-950/5 via-slate-950/80 to-slate-950/50 border-rose-900/20";
                        } else if (evt.category === 'PAC_SPIKE') {
                          categoryBadge = "bg-amber-950/30 text-amber-400 border-amber-900/40";
                          bgGrad = "from-amber-950/5 via-slate-950/80 to-slate-950/50 border-amber-900/20";
                        } else if (evt.category === 'INSIDER_TRADE') {
                          categoryBadge = "bg-emerald-950/30 text-emerald-400 border-emerald-900/40";
                        } else if (evt.category === 'OUTREACH') {
                          categoryBadge = "bg-cyan-950/30 text-cyan-400 border-cyan-900/40";
                          bgGrad = "from-cyan-950/5 via-slate-950/80 to-slate-950/50 border-cyan-900/20";
                        }

                        return (
                          <div key={evt.id} className={`bg-gradient-to-r ${bgGrad} border p-3.5 rounded-xl transition-all hover:border-slate-700`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded border font-mono ${categoryBadge}`}>
                                    {evt.category.replace('_', ' ')}
                                  </span>
                                  <h4 className="text-xs font-bold text-white tracking-tight leading-snug">{evt.title}</h4>
                                </div>
                                <p className="text-[11px] text-slate-300 leading-relaxed">{evt.summary}</p>
                                <p className="text-[10px] text-slate-500 font-medium italic flex items-center gap-1">
                                  <span className="text-amber-500/70">✦ Impact:</span>
                                  <span>{evt.impactText}</span>
                                </p>
                              </div>
                              <span className="text-[9px] text-slate-500 font-semibold shrink-0 font-mono">{evt.timestamp}</span>
                            </div>

                            <div className="mt-2.5 pt-2.5 border-t border-slate-900/60 flex items-center justify-between gap-4">
                              <span className="text-[9px] text-slate-500 font-mono">ID: {evt.id}</span>
                              
                              {evt.actionLabel && (
                                <button
                                  onClick={() => {
                                    if (evt.actionLabel?.includes("Watchdog") || evt.actionLabel?.includes("Audit")) {
                                      setActiveTab('watchdog');
                                    } else if (evt.actionLabel?.includes("Filter") || evt.actionLabel?.includes("Directory")) {
                                      if (evt.targetLegislatorId) {
                                        const leg = legislators.find(l => l.legislator_id === evt.targetLegislatorId);
                                        if (leg) {
                                          setSearch(leg.name);
                                          const el = document.getElementById("search-controls-anchor");
                                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                                        }
                                      }
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 rounded text-[9px] font-black uppercase tracking-wider font-mono transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{evt.actionLabel}</span>
                                  <span className="text-[10px]">→</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-4">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Feed source: Congressional crawler v3.4 (simulated live update frequency)
                    </span>
                    
                    <button
                      onClick={() => {
                        const extraEvents: WatchdogEvent[] = [
                          {
                            id: `evt-extra-${Date.now()}-1`,
                            title: "Omnibus Fast-Track Subclause Detected",
                            category: "BILL",
                            summary: "Lobbyist-drafted liability shield clause identified on Page 1,024 of the Fast-Track Commerce Accord (SB 493).",
                            impactText: "Bypassed standard 72-hour review committee markup. Page count exceeds normal human review capacity.",
                            severity: "warning",
                            timestamp: "Just Now",
                            targetBillId: "sb-493",
                            actionLabel: "Run AI Watchdog Audit"
                          },
                          {
                            id: `evt-extra-${Date.now()}-2`,
                            title: "Lobbyist-Drafted Clause Injected Into Tax Bill",
                            category: "BILL",
                            summary: "A private equity capital gains tax exemption was copied verbatim from a lobby group's whitepaper and pasted as Clause 14(b) of HR 992.",
                            impactText: "Automated scraper flagged 94% text similarity against special-interest submission.",
                            severity: "critical",
                            timestamp: "Just Now",
                            actionLabel: "Analyze on Watchdog"
                          },
                          {
                            id: `evt-extra-${Date.now()}-3`,
                            title: "Sudden Committee PAC Donation Surge",
                            category: "PAC_SPIKE",
                            summary: "$220,000 in PAC donations accepted by 8 members of the Banking & Finance Committee ahead of the regulatory override vote.",
                            impactText: "Direct corporate alignment scores degraded across co-sponsoring representatives.",
                            severity: "critical",
                            timestamp: "Just Now",
                            actionLabel: "Filter Directory"
                          }
                        ];
                        
                        const selected = extraEvents[Math.floor(Math.random() * extraEvents.length)];
                        setCurrentEvents(prev => [selected, ...prev]);
                        
                        setAlerts(prev => [
                          {
                            id: `alert-${Date.now()}`,
                            fullMessage: `[Crawler Alert] ${selected.title}: ${selected.summary}`,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                          },
                          ...prev
                        ]);
                      }}
                      className="px-3 py-1 bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-900 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider font-mono transition-colors cursor-pointer"
                    >
                      ⚡ Simulate Live Watchdog Event
                    </button>
                  </div>
                </div>

                {/* 2. Visual Legislative Milestones Timeline */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-indigo-400 animate-pulse" />
                      <h3 className="text-xs font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                        📅 2026 CONGRESSIONAL SESSION TIMELINE
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        id="btn-auto-scroll-milestone"
                        onClick={() => scrollToCurrentMilestone('smooth')}
                        className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono text-cyan-400 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60 rounded-full transition-all cursor-pointer flex items-center gap-1"
                        title="Auto-scroll timeline to current active phase"
                      >
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                        </span>
                        Scroll to Current
                      </button>
                      <span className="text-[9px] font-mono bg-indigo-950/40 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-900/40 font-bold uppercase tracking-wider">
                        Oversight Calendar
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    Chronological tracking of critical recess windows, appropriation markup deadlines, and high-risk floor votes. Select a milestone node to review custom citizens' watch checklists.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
                    {/* Stepper Timeline Navigation (5 cols) */}
                    <div className="md:col-span-5 space-y-3 relative border-l border-slate-800 pl-4 ml-2.5">
                      {legislativeMilestones.map((ms, index) => {
                        const isSelected = selectedMilestoneId === ms.id;
                        let ringColor = "border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700";
                        let statusText = "Upcoming";
                        let statusBadge = "bg-slate-950 text-slate-500 border-slate-800/60";

                        if (ms.status === 'passed') {
                          ringColor = "border-emerald-500/50 bg-slate-950 text-emerald-400 hover:border-emerald-400";
                          statusText = "Completed";
                          statusBadge = "bg-emerald-950/30 text-emerald-400 border-emerald-900/35";
                        } else if (ms.status === 'current') {
                          ringColor = "border-cyan-500 bg-slate-950 text-cyan-400 ring-2 ring-cyan-500/20";
                          statusText = "Active Session";
                          statusBadge = "bg-cyan-950/40 text-cyan-400 border-cyan-900/40";
                        } else if (isSelected) {
                          ringColor = "border-indigo-500 bg-slate-950 text-indigo-400";
                        }

                        return (
                          <div
                            key={ms.id}
                            ref={ms.status === 'current' ? activeMilestoneRef : null}
                            onClick={() => {
                              setSelectedMilestoneId(ms.id);
                              setCustomMilestonePlan('');
                            }}
                            className={`group relative cursor-pointer flex flex-col p-2.5 rounded-xl border transition-all ${
                              isSelected 
                                ? "bg-slate-950/80 border-indigo-900/80 shadow-md" 
                                : "bg-transparent border-transparent hover:bg-slate-950/40 hover:border-slate-850"
                            }`}
                          >
                            {/* Chronological Circle Node */}
                            <div className={`absolute -left-[27.5px] top-[14px] w-5 h-5 rounded-full border text-[9px] font-mono font-black flex items-center justify-center transition-all ${ringColor}`}>
                              {ms.status === 'current' && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-20"></span>
                              )}
                              <span>{index + 1}</span>
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] font-mono text-slate-500 font-bold">{ms.date}</span>
                                <span className={`text-[7px] font-black uppercase px-1 rounded border font-mono ${statusBadge}`}>
                                  {statusText}
                                </span>
                              </div>
                              <h4 className={`text-[11px] font-bold tracking-tight leading-snug transition-colors ${
                                isSelected ? "text-indigo-400" : "text-slate-300 group-hover:text-white"
                              }`}>
                                {ms.title}
                              </h4>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Milestone Detail & AI Plan Panel (7 cols) */}
                    <div className="md:col-span-7 bg-slate-950/60 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
                      {(() => {
                        const ms = legislativeMilestones.find(m => m.id === selectedMilestoneId);
                        if (!ms) return <div className="text-xs text-slate-500 italic p-4 text-center">Select a milestone on the timeline to inspect.</div>;

                        let riskBadge = "bg-slate-900 text-slate-400 border-slate-800";
                        if (ms.riskLevel === 'high') {
                          riskBadge = "bg-rose-950/30 text-rose-400 border-rose-900/40";
                        } else if (ms.riskLevel === 'medium') {
                          riskBadge = "bg-amber-950/30 text-amber-400 border-amber-900/40";
                        }

                        return (
                          <div className="space-y-3 flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                              {/* Date & Risk Level */}
                              <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">
                                  📅 Scheduled: {ms.date}
                                </span>
                                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border font-mono ${riskBadge}`}>
                                  ⚠️ {ms.riskLabel}
                                </span>
                              </div>

                              {/* Title & Description */}
                              <div className="space-y-1">
                                <h4 className="text-xs font-black text-white tracking-tight leading-snug">{ms.title}</h4>
                                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                  {ms.description}
                                </p>
                              </div>

                              {/* Static action check */}
                              <div className="p-3 bg-slate-900/50 border border-slate-850 rounded-lg space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                                  📋 Core Watchdog Directives:
                                </span>
                                <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                                  {ms.citizenAction}
                                </p>
                              </div>
                            </div>

                            {/* Gemini AI Action Plan */}
                            <div className="pt-2 border-t border-slate-900">
                              {customMilestonePlan ? (
                                <div className="p-3 bg-indigo-950/10 border border-indigo-950 rounded-lg space-y-1.5 animate-fade-in max-h-[140px] overflow-y-auto scrollbar-thin">
                                  <div className="flex items-center justify-between border-b border-indigo-950/30 pb-1">
                                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider font-mono flex items-center gap-1">
                                      <Sparkles size={10} className="text-indigo-400" />
                                      AI Constituent Action Plan:
                                    </span>
                                    <button 
                                      onClick={() => setCustomMilestonePlan('')}
                                      className="text-[8px] text-slate-500 hover:text-slate-400 uppercase font-mono font-bold"
                                    >
                                      Reset
                                    </button>
                                  </div>
                                  <div className="text-[9.5px] text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                                    {customMilestonePlan}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2 text-center py-1">
                                  <p className="text-[10px] text-slate-500 italic">
                                    Request a deep strategic audit from Gemini regarding lobbyist targets for this milestone.
                                  </p>
                                  <button
                                    onClick={() => handleGenerateMilestonePlan(ms.id)}
                                    disabled={isGeneratingMilestonePlan}
                                    className="w-full py-1.5 px-3 bg-indigo-950 hover:bg-indigo-900 disabled:opacity-55 text-indigo-300 hover:text-white border border-indigo-900 hover:border-indigo-800 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    {isGeneratingMilestonePlan ? (
                                      <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                                        <span>Analyzing Congressional Schedule...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles size={11} className="text-indigo-400 animate-pulse" />
                                        <span>Generate AI Citizen Action Plan</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Lawmaker Direct Outreach & Verification Portal (5 cols) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-4">
                    <h3 className="text-xs font-black tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
                      <Megaphone size={13} className="text-cyan-400" />
                      Lawmaker Outreach & Verification Center
                    </h3>
                    <span className="text-[8px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold border border-cyan-900/30">
                      Constituent Hub
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal mb-4">
                    Reach out to flagged elected officials automatically to demand accountability. They can securely claim their official verified member page, publish rebuttal statements, and pledge binding corrective actions.
                  </p>

                  <div className="space-y-4">
                    {/* Step 1: Select Lawmaker */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                        Select Representative for Outreach:
                      </label>
                      <select
                        value={outreachLegislatorId}
                        onChange={(e) => {
                          setOutreachLegislatorId(e.target.value);
                          setOutreachStatusLog({ status: 'idle', text: '' });
                        }}
                        className="w-full h-10 px-3 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                      >
                        <option value="">-- Choose Lawmaker to Audit --</option>
                        {legislators.map(l => (
                          <option key={l.legislator_id} value={l.legislator_id}>
                            {l.name} ({l.party === 'Democrat' ? 'D' : l.party === 'Republican' ? 'R' : 'I'} - {l.state}) {l.verified_member_page ? '✓ Verified' : l.outreach_status === 'pending' ? '✉️ Pending' : '⚠️ Flagged'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {outreachLegislatorId && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-2 animate-fade-in">
                        {(() => {
                          const leg = legislators.find(l => l.legislator_id === outreachLegislatorId);
                          if (!leg) return null;
                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">
                                  Current Audit Metrics:
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-wider ${leg.verified_member_page ? 'text-cyan-400' : 'text-amber-500'}`}>
                                  {leg.verified_member_page ? 'VERIFIED PROFILE' : leg.outreach_status === 'pending' ? 'OUTREACH PENDING' : 'UNVERIFIED / FLAGGED'}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="p-1.5 rounded bg-slate-900 border border-slate-850">
                                  <div className="text-[8px] font-mono text-slate-500 uppercase">AIPAC PAC</div>
                                  <div className="font-bold text-white mt-0.5 font-mono">${(leg.aipac_funding_total || 0).toLocaleString()}</div>
                                </div>
                                <div className="p-1.5 rounded bg-slate-900 border border-slate-850">
                                  <div className="text-[8px] font-mono text-slate-500 uppercase">Review Hours</div>
                                  <div className="font-bold text-slate-300 mt-0.5 font-mono">{leg.avg_review_hours_major_bills}h</div>
                                </div>
                                <div className="p-1.5 rounded bg-slate-900 border border-slate-850">
                                  <div className="text-[8px] font-mono text-slate-500 uppercase">Integrity Alerts</div>
                                  <div className="font-bold text-rose-400 mt-0.5 font-mono">{leg.conflict_triggers?.length || 0}</div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {/* Step 2: Actions */}
                    {outreachLegislatorId && (
                      <div className="space-y-3 pt-2">
                        <button
                          onClick={() => handleDispatchOutreach(outreachLegislatorId)}
                          disabled={outreachStatusLog.status === 'drafting' || outreachStatusLog.status === 'dispatching'}
                          className="w-full py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>✉️ Dispatch Official Audit & Outreach Invitation</span>
                        </button>

                        <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3 space-y-3 mt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
                              🛡️ SIMULATE LAWMAKER CLAIM PORTAL
                            </span>
                            <span className="text-[8px] bg-slate-900 text-slate-400 px-1 rounded border border-slate-850 font-mono">
                              Oversight Sandbox
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-slate-400 leading-normal">
                            Simulate the lawmaker logging into their secure page portal to submit their explanation/rebuttal and corrective action pledges to correct flagged behaviors.
                          </p>

                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Optional: Customize rebuttal statement (AI defaults if empty)"
                              value={customRedressStatement}
                              onChange={(e) => setCustomRedressStatement(e.target.value)}
                              className="w-full h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-200 placeholder-slate-500 focus:outline-none"
                            />
                            <textarea
                              placeholder="Optional: Customize corrective actions (one per line)"
                              rows={2}
                              value={customRedressActions}
                              onChange={(e) => setCustomRedressActions(e.target.value)}
                              className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-200 placeholder-slate-500 focus:outline-none resize-none font-mono"
                            />
                          </div>

                          <button
                            onClick={() => handleSimulateClaimAndPublish(outreachLegislatorId)}
                            disabled={outreachStatusLog.status === 'drafting' || outreachStatusLog.status === 'dispatching'}
                            className="w-full py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-900 hover:border-cyan-800 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>⚡ Submit Portal Verification & Claim Page</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {outreachStatusLog.text && (
                      <div className="p-3 bg-slate-950 border border-cyan-950 rounded-xl space-y-1.5 animate-fade-in">
                        <div className="flex items-center gap-2">
                          {(outreachStatusLog.status === 'drafting' || outreachStatusLog.status === 'dispatching') ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          )}
                          <span className="text-[9px] font-black font-mono uppercase tracking-wider text-cyan-400">
                            Outreach Routing Log:
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-normal font-mono">
                          {outreachStatusLog.text}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 text-[10px] text-slate-500 text-center font-mono">
                  Encrypted securely using RSA-2048 signing keys.
                </div>
              </div>

            </div>
            )}

            {/* Quick Metrics Statistics Widgets */}
            {dashboardTab === 'metrics' && (
              <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Coins size={11} className="text-amber-400" />
                  Total PAC Contributions
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg md:text-xl font-black text-white font-mono">{formatMoney(stats.totalAipac)}</span>
                </div>
                <span className="text-[9px] text-slate-500 mt-1">AIPAC ID C00797670</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp size={11} className="text-indigo-400" />
                  Avg Transparency Index
                </span>
                <div className="mt-2">
                  <span className="text-lg md:text-xl font-black text-indigo-400 font-mono">{stats.avgTransparencyScore} / 100</span>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-400 h-full" style={{ width: `${stats.avgTransparencyScore}%` }}></div>
                  </div>
                </div>
                <span className="text-[9px] text-slate-500 mt-1">Factual transparency index</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert size={11} className="text-purple-400" />
                  Fraternal Affiliations
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg md:text-xl font-black text-white font-mono">{stats.societyMembersCount}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">({Math.round((stats.societyMembersCount / Math.max(stats.legislatorCount, 1)) * 100)}%)</span>
                </div>
                <span className="text-[9px] text-slate-500 mt-1">Found via Wikidata</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Moon size={11} className="text-rose-400" />
                  Midnight Vote Badges
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg md:text-xl font-black text-rose-400 font-mono">{stats.midnightVotesActiveCount}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">flagged active</span>
                </div>
                <span className="text-[9px] text-slate-500 mt-1">Lobby warnings raised</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert size={11} className="text-rose-500" />
                  Active Trust Alerts
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg md:text-xl font-black text-rose-500 font-mono">{stats.totalIntegrityAlerts}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">triggered alerts</span>
                </div>
                <span className="text-[9px] text-slate-500 mt-1">Real-time conflicts detected</span>
              </div>
            </div>

            {/* Simulated Live Alert Logs */}
            {alerts.length > 0 && (
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-black tracking-wider text-slate-400 uppercase flex items-center gap-2">
                    <BellRing size={13} className="text-rose-400" />
                    Simulated FCM Notification Alert Dispatcher ({alerts.length} logs)
                  </span>
                  <button 
                    onClick={() => setAlerts([])}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    Clear Alert Logs
                  </button>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1.5 pr-2 font-mono scrollbar-thin">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="text-[10px] text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-850 flex justify-between items-center gap-3">
                      <span className="text-rose-400 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                        WARNING
                      </span>
                      <span className="flex-1 text-slate-300 truncate">{alert.fullMessage}</span>
                      <span className="text-[9px] text-slate-500 font-semibold shrink-0">{alert.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            </div>
            )}

            {/* Value Scorecard Settings & Watchlist Section */}
            {dashboardTab === 'scorecard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Watchlist */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800/80">
                    <h3 className="text-xs font-black tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      My Watchdog Watchlist
                    </h3>
                    <span className="text-[10px] font-mono bg-slate-950 text-slate-400 px-2 py-0.5 rounded-full border border-slate-800 font-bold">
                      {watchlist.length} Lawmakers
                    </span>
                  </div>

                  {watchlist.length > 0 ? (
                    <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1 scrollbar-thin">
                      {legislators
                        .filter(l => watchlist.includes(l.legislator_id))
                        .map(l => {
                          const alignment = calculateUserAlignmentScore(l, userPrefs);
                          const transp = calculateTransparencyIndex(l);
                          const partyBadge = l.party === 'Democrat' ? 'text-blue-400 border-blue-900/40 bg-blue-950/25' : l.party === 'Republican' ? 'text-red-400 border-red-900/40 bg-red-950/25' : 'text-emerald-400 border-emerald-900/40 bg-emerald-950/25';
                          return (
                            <div key={l.legislator_id} className="bg-slate-950/70 border border-slate-850 hover:border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3 transition-colors">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs font-bold text-white truncate">{l.name}</h4>
                                  <span className={`text-[9px] font-bold px-1.5 rounded border ${partyBadge}`}>
                                    {l.party[0]}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5">{l.role} • {l.state}</p>
                                
                                {/* Badges and Warning triggers */}
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                  {l.midnight_vote_badge && (
                                    <span className="text-[8px] bg-rose-950/40 border border-rose-900/30 text-rose-300 px-1 rounded flex items-center gap-0.5">
                                      <Moon size={8} /> Midnight Vote
                                    </span>
                                  )}
                                  {l.conflict_triggers && l.conflict_triggers.length > 0 && (
                                    <span className="text-[8px] bg-amber-950/40 border border-amber-900/30 text-amber-300 px-1 rounded flex items-center gap-0.5">
                                      <ShieldAlert size={8} /> {l.conflict_triggers.length} Alerts
                                    </span>
                                  )}
                                  {l.aipac_funding_total === 0 && (
                                    <span className="text-[8px] bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 px-1 rounded font-mono font-bold">
                                      Grassroots
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right">
                                  <div className="text-xs font-black text-emerald-400 font-mono" title="Grassroots Alignment Score">
                                    {alignment}% <span className="text-[9px] font-normal text-slate-500">align</span>
                                  </div>
                                  <div className="text-[9px] text-slate-500 font-medium font-mono" title="Transparency Index">
                                    T-Idx: {transp}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleToggleFavorite(l.legislator_id)}
                                  className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                  title="Remove from watchlist"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center my-auto flex flex-col items-center justify-center min-h-[180px]">
                      <Star size={22} className="text-slate-600 mb-2 animate-pulse" />
                      <p className="text-xs text-slate-400 font-medium leading-normal max-w-xs">
                        Your watchlist is empty. Pin favorite representatives by clicking the ⭐️ star icon on profiles below for instant tracking.
                      </p>
                    </div>
                  )}
                </div>
                
                {watchlist.length > 0 && (
                  <button
                    onClick={() => setWatchlist([])}
                    className="w-full mt-4 py-1.5 bg-slate-950 hover:bg-slate-950/80 text-slate-400 hover:text-white border border-slate-850 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    Clear Watchlist
                  </button>
                )}
              </div>

              {/* Right Column: Values Dashboard Scorecard Settings */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-1 pb-2.5 border-b border-slate-800/80">
                  <h3 className="text-xs font-black tracking-wider text-indigo-400 uppercase flex items-center gap-1.5">
                    <SlidersHorizontal size={13} className="text-indigo-400" />
                    Personal Value Scorecard Settings
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-900/60 px-2 py-0.5 rounded-full font-mono">
                    Dynamic Re-grading Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal mb-4">
                  Define your civic values below. Lawmakers will instantly be scored and ranked dynamically based on your custom weight multipliers.
                </p>

                <div className="space-y-3">
                  {/* Lobbyist Weight */}
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-850/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-900/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <Coins size={14} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          Campaign Debt & PAC Influence
                          {userPrefs.lobbyistWeight === 'high' && <span className="text-[8px] font-mono uppercase bg-emerald-900/40 text-emerald-300 px-1 py-0.5 rounded font-bold">Top Priority</span>}
                        </h4>
                        <p className="text-[10px] text-slate-400 leading-normal">Penalizes lawmakers for accepting special-interest lobbyist PAC campaign funding.</p>
                      </div>
                    </div>
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 self-end sm:self-center shrink-0">
                      {(['low', 'medium', 'high'] as const).map((w) => (
                        <button
                          key={w}
                          onClick={() => setUserPrefs(prev => ({ ...prev, lobbyistWeight: w }))}
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded transition-colors cursor-pointer ${
                            userPrefs.lobbyistWeight === w 
                              ? 'bg-slate-800 text-white' 
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transparency Weight */}
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-850/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-950/40 border border-rose-900/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                        <Moon size={14} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          Absolute Session Transparency
                          {userPrefs.transparencyWeight === 'high' && <span className="text-[8px] font-mono uppercase bg-rose-900/40 text-rose-300 px-1 py-0.5 rounded font-bold">Top Priority</span>}
                        </h4>
                        <p className="text-[10px] text-slate-400 leading-normal">Penalizes votes held in midnight or secret sessions outside daylight hours.</p>
                      </div>
                    </div>
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 self-end sm:self-center shrink-0">
                      {(['low', 'medium', 'high'] as const).map((w) => (
                        <button
                          key={w}
                          onClick={() => setUserPrefs(prev => ({ ...prev, transparencyWeight: w }))}
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded transition-colors cursor-pointer ${
                            userPrefs.transparencyWeight === w 
                              ? 'bg-slate-800 text-white' 
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Diligence Weight */}
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-850/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-900/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                        <Clock size={14} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          Legislative Waiting & Diligence
                          {userPrefs.diligenceWeight === 'high' && <span className="text-[8px] font-mono uppercase bg-amber-900/40 text-amber-300 px-1 py-0.5 rounded font-bold">Top Priority</span>}
                        </h4>
                        <p className="text-[10px] text-slate-400 leading-normal">Rewards lawmakers who enforce a 72-hour review period on complex bills.</p>
                      </div>
                    </div>
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 self-end sm:self-center shrink-0">
                      {(['low', 'medium', 'high'] as const).map((w) => (
                        <button
                          key={w}
                          onClick={() => setUserPrefs(prev => ({ ...prev, diligenceWeight: w }))}
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded transition-colors cursor-pointer ${
                            userPrefs.diligenceWeight === w 
                              ? 'bg-slate-800 text-white' 
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Independence Weight */}
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-850/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-950/40 border border-purple-900/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                        <ShieldAlert size={14} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          Anti-Establishment & Populism
                          {userPrefs.independenceWeight === 'high' && <span className="text-[8px] font-mono uppercase bg-purple-900/40 text-purple-300 px-1 py-0.5 rounded font-bold">Top Priority</span>}
                        </h4>
                        <p className="text-[10px] text-slate-400 leading-normal">Penalizes elite corporate index ratings and membership in secret societies.</p>
                      </div>
                    </div>
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 self-end sm:self-center shrink-0">
                      {(['low', 'medium', 'high'] as const).map((w) => (
                        <button
                          key={w}
                          onClick={() => setUserPrefs(prev => ({ ...prev, independenceWeight: w }))}
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded transition-colors cursor-pointer ${
                            userPrefs.independenceWeight === w 
                              ? 'bg-slate-800 text-white' 
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
            )}

                        {/* PAC Funding Trend & Legislative Alignment Section */}
            {dashboardTab === 'pac' && (() => {
              const trendLegislator = legislators.find(l => l.legislator_id === trendLegislatorId) || legislators[0];
              if (!trendLegislator) return null;
              
              const trendData = getPacFundingTrendData(trendLegislator);
              const latestData = trendData[trendData.length - 1];
              const earliestData = trendData[0];
              const growthPct = earliestData.pacFunding > 0 
                ? Math.round(((latestData.pacFunding - earliestData.pacFunding) / earliestData.pacFunding) * 100) 
                : 150;

              const partyBadge = trendLegislator.party === 'Democrat' 
                ? 'text-blue-400 border-blue-900/40 bg-blue-950/25' 
                : trendLegislator.party === 'Republican' 
                ? 'text-red-400 border-red-900/40 bg-red-950/25' 
                : 'text-emerald-400 border-emerald-900/40 bg-emerald-950/25';

              const comparisonLegislators = legislators.filter(l => comparisonLegislatorIds.includes(l.legislator_id));
              
              // Build comparison data
              const comparisonData = (() => {
                const terms = [
                  { name: "115th Congress (2017-18)", short: "115th" },
                  { name: "116th Congress (2019-20)", short: "116th" },
                  { name: "117th Congress (2021-22)", short: "117th" },
                  { name: "118th Congress (2023-24)", short: "118th" },
                  { name: "119th Congress (2025-26)", short: "119th" },
                ];
                return terms.map((term, index) => {
                  const dataPoint: any = { term: term.short, fullTerm: term.name };
                  comparisonLegislators.forEach(leg => {
                    const seed = leg.legislator_id.charCodeAt(0) + (leg.legislator_id.charCodeAt(1) || 0);
                    const basePAC = leg.aipac_funding_total || 50000;
                    const stepMultiplier = 0.4 + (index * 0.15) + ((seed % 10) / 100);
                    dataPoint[leg.legislator_id] = Math.round(basePAC * stepMultiplier);
                  });
                  return dataPoint;
                });
              })();

              const chartColors = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#06b6d4', '#f97316', '#8b5cf6'];

              return (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden space-y-6 animate-fade-in">
                  <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
                  
                  {/* Section Title, Description and Selectors */}
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-slate-850">
                    <div className="flex-1">
                      <h3 className="text-sm font-black tracking-wider text-indigo-400 uppercase flex items-center gap-2">
                        <Activity size={14} className="text-indigo-400" />
                        PAC Funding Trend & Legislative Alignment Tracker
                      </h3>
                      <p className="text-xs text-slate-400 leading-normal mt-1">
                        Historical mapping of corporate PAC injections against key votes across the past 5 Congressional terms.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 lg:items-end shrink-0">
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start lg:self-end">
                        <button
                          onClick={() => setPacChartView('individual')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${pacChartView === 'individual' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          Individual Detail
                        </button>
                        <button
                          onClick={() => setPacChartView('comparison')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${pacChartView === 'comparison' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          Compare Multiple
                        </button>
                      </div>

                      {pacChartView === 'individual' ? (
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                          <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Select Lawmaker:</span>
                          <select
                            value={trendLegislatorId}
                            onChange={(e) => setTrendLegislatorId(e.target.value)}
                            className="h-10 px-3 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors w-full lg:max-w-[240px]"
                          >
                            {legislators.map((l) => (
                              <option key={l.legislator_id} value={l.legislator_id}>
                                {l.name} ({l.party === 'Democrat' ? 'D' : l.party === 'Republican' ? 'R' : 'I'} - {l.state})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 w-full lg:w-auto">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Add Lawmaker:</span>
                            <select
                              value=""
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val && !comparisonLegislatorIds.includes(val)) {
                                  setComparisonLegislatorIds([...comparisonLegislatorIds, val]);
                                }
                              }}
                              className="h-10 px-3 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors w-full lg:max-w-[240px]"
                            >
                              <option value="" disabled>Select to add...</option>
                              {legislators.filter(l => !comparisonLegislatorIds.includes(l.legislator_id)).map((l) => (
                                <option key={l.legislator_id} value={l.legislator_id}>
                                  {l.name} ({l.party === 'Democrat' ? 'D' : l.party === 'Republican' ? 'R' : 'I'} - {l.state})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {pacChartView === 'comparison' && comparisonLegislators.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-2">
                      {comparisonLegislators.map((l, idx) => (
                        <div key={l.legislator_id} className="flex items-center gap-2 bg-slate-950 border border-slate-800 pl-2 pr-1 py-1 rounded-lg">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors[idx % chartColors.length] }} />
                          <span className="text-xs font-semibold text-slate-300">{l.name}</span>
                          <button 
                            onClick={() => setComparisonLegislatorIds(comparisonLegislatorIds.filter(id => id !== l.legislator_id))}
                            className="text-slate-500 hover:text-red-400 ml-1 p-0.5 rounded-md hover:bg-slate-900 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {comparisonLegislators.length === 0 && (
                        <span className="text-xs text-slate-500 italic">No lawmakers selected for comparison.</span>
                      )}
                    </div>
                  )}

                  {/* Inside Layout: Statistics on Left, Recharts on Right */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {pacChartView === 'individual' && (
                      <div className="lg:col-span-4 flex flex-col justify-between bg-slate-950/50 border border-slate-850 p-4.5 rounded-xl space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${partyBadge}`}>
                              {trendLegislator.role} • {trendLegislator.party} • {trendLegislator.state}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-400">Total PAC Funding:</span>
                              <span className="text-sm font-bold text-white font-mono">
                                ${(trendLegislator.aipac_funding_total || 0).toLocaleString()}
                              </span>
                            </div>

                            <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-400">Corporate Vote Index:</span>
                              <span className="text-sm font-bold text-indigo-400 font-mono">
                                {trendLegislator.corporate_vote_index}%
                              </span>
                            </div>

                            <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-400">5-Term PAC Growth:</span>
                              <span className="text-sm font-bold text-emerald-400 font-mono">
                                +{growthPct}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Watchdog Verdict Narrative */}
                        <div className="p-3 bg-indigo-950/15 border border-indigo-900/30 rounded-lg space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <ShieldAlert size={12} className="text-indigo-400" />
                            <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">Watchdog Evaluation Verdict</span>
                          </div>
                          <p className="text-[10.5px] leading-relaxed text-slate-300">
                            {trendLegislator.corporate_vote_index > 70 ? (
                              <span>
                                <strong>{trendLegislator.name}</strong> shows a strong positive correlation between increased PAC campaign contributions and votes matching corporate interest agendas, reaching a <strong>{trendLegislator.corporate_vote_index}%</strong> alignment index in the 119th Congress.
                              </span>
                            ) : trendLegislator.corporate_vote_index < 30 ? (
                              <span>
                                <strong>{trendLegislator.name}</strong> has maintained low corporate alignment over time, resisting special-interest PAC leverage even as general campaign funding costs rise, reflecting strong grassroots commitment.
                              </span>
                            ) : (
                              <span>
                                <strong>{trendLegislator.name}</strong> displays a moderate corporate lobby alignment index of <strong>{trendLegislator.corporate_vote_index}%</strong>, indicating a selective or split pattern of support across industry sectors and PAC programs.
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Right Cols: Recharts Chart */}
                    <div className={`${pacChartView === 'individual' ? 'lg:col-span-8' : 'lg:col-span-12'} bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between min-h-[300px]`}>
                      
                      {/* Chart Title / Legend Summary */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-900 pb-2 mb-4">
                        {pacChartView === 'individual' ? (
                          <>
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded bg-indigo-500 inline-block"></span>
                              Corporate PAC Funding ($)
                            </span>
                            <span className="flex items-center gap-2 text-[9px] text-slate-500">
                              <button 
                                onClick={() => setShowSpikes(!showSpikes)}
                                className={`flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-80 ${showSpikes ? 'opacity-100' : 'opacity-40 grayscale'}`}
                              >
                                <span className="w-1.5 h-1.5 rounded bg-red-500 inline-block"></span>
                                High Spike (&gt;35% above avg)
                              </button>
                              <button 
                                onClick={() => setShowDips(!showDips)}
                                className={`flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-80 ${showDips ? 'opacity-100' : 'opacity-40 grayscale'}`}
                              >
                                <span className="w-1.5 h-1.5 rounded bg-emerald-500 inline-block"></span>
                                Low Dip (&gt;35% below avg)
                              </button>
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span>
                            Corporate Aligned Votes (Out of 30 Key Votes)
                          </span>
                          </>
                        ) : (
                          <span className="flex items-center gap-1">
                            PAC Contributions Comparison ($) over 5 Terms
                          </span>
                        )}
                      </div>


                      {/* Summary Stats Panel */}
                      {(() => {
                        let absoluteVariance = 0;
                        let percentGrowth = 0;
                        let title = "Selected Time Range Growth";

                        if (pacChartView === 'individual') {
                          absoluteVariance = latestData.pacFunding - earliestData.pacFunding;
                          percentGrowth = earliestData.pacFunding > 0 ? (absoluteVariance / earliestData.pacFunding) * 100 : 0;
                          title = "5-Term Funding Variance";
                        } else if (comparisonLegislators.length > 0) {
                          let earliestTotal = 0;
                          let latestTotal = 0;
                          comparisonLegislators.forEach(leg => {
                            earliestTotal += comparisonData[0][leg.legislator_id] || 0;
                            latestTotal += comparisonData[comparisonData.length - 1][leg.legislator_id] || 0;
                          });
                          absoluteVariance = latestTotal - earliestTotal;
                          percentGrowth = earliestTotal > 0 ? (absoluteVariance / earliestTotal) * 100 : 0;
                          title = "Aggregate 5-Term Funding Variance";
                        } else {
                          return null;
                        }

                        const isPositive = absoluteVariance > 0;
                        const isNegative = absoluteVariance < 0;
                        // Match the existing styling where growth is emerald (or use indigo as a neutral primary)
                        const colorClass = isPositive ? 'text-emerald-400' : isNegative ? 'text-indigo-400' : 'text-slate-400';
                        const sign = isPositive ? '+' : '';

                        return (
                          <div className="flex items-center gap-6 mb-4 px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                            <div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</div>
                              <div className="flex items-end gap-3">
                                <span className={`text-xl font-bold font-mono tracking-tight ${colorClass}`}>
                                  {sign}${Math.abs(absoluteVariance).toLocaleString()}
                                </span>
                                <div className={`flex items-center gap-1 text-sm font-bold mb-0.5 ${colorClass}`}>
                                  {isPositive ? <TrendingUp size={14} /> : isNegative ? <TrendingDown size={14} /> : <Minus size={14} />}
                                  <span>{sign}{percentGrowth.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      {/* Recharts Container */}
                      <div className="flex-1 min-h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          {pacChartView === 'individual' ? (
                            <ComposedChart
                              data={trendData}
                              margin={{ top: 10, right: 10, bottom: 5, left: -10 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis 
                                dataKey="term" 
                                stroke="#64748b" 
                                fontSize={10} 
                                fontWeight="bold"
                                tickLine={false}
                              />
                              <YAxis 
                                yAxisId="left" 
                                stroke="#818cf8" 
                                fontSize={10} 
                                fontWeight="medium"
                                tickLine={false}
                                tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                              />
                              <YAxis 
                                yAxisId="right" 
                                orientation="right" 
                                stroke="#f59e0b" 
                                fontSize={10} 
                                fontWeight="medium"
                                tickLine={false}
                                domain={[0, 30]}
                              />
                              <Tooltip
                                contentStyle={{ 
                                  backgroundColor: '#0f172a', 
                                  border: '1px solid #334155', 
                                  borderRadius: '12px',
                                  padding: '10px'
                                }}
                                itemStyle={{ color: '#e2e8f0', fontSize: '11px' }}
                                labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}
                                formatter={(value: any, name: any, props: any) => {
                                  if (name === "pacFunding") {
                                    return [`$${value.toLocaleString()}`, "PAC Contributions"];
                                  }
                                  if (name === "alignedVotes") {
                                    return [`${value} of 30 (${props.payload.corporatePercentage}%)`, "Corporate Aligned Votes"];
                                  }
                                  return [value, name];
                                }}
                                labelFormatter={(label) => {
                                  const matched = trendData.find(d => d.term === label);
                                  return matched ? matched.fullTerm : label;
                                }}
                              />
                                                            <Bar 
                                yAxisId="left" 
                                dataKey="pacFunding" 
                                radius={[4, 4, 0, 0]} 
                                maxBarSize={45}
                              >
                                {trendData.map((entry, index) => {
                                  const avg = trendData.reduce((sum, d) => sum + d.pacFunding, 0) / trendData.length;
                                  let fill = "#4f46e5"; // default indigo
                                  let isAnomaly = false;
                                  let isActiveAnomaly = false;

                                  if (entry.pacFunding > avg * 1.35) {
                                    isAnomaly = true;
                                    if (showSpikes) {
                                      fill = "#ef4444"; // red for high spike
                                      isActiveAnomaly = true;
                                    }
                                  } else if (entry.pacFunding < avg * 0.65) {
                                    isAnomaly = true;
                                    if (showDips) {
                                      fill = "#10b981"; // emerald for low dip
                                      isActiveAnomaly = true;
                                    }
                                  }
                                  
                                  return (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={fill} 
                                      cursor={isActiveAnomaly ? "pointer" : "default"}
                                      onClick={() => {
                                        if (isActiveAnomaly) {
                                          handleAnomalyClick(entry, avg, trendLegislator);
                                        }
                                      }}
                                    />
                                  );
                                })}
                              </Bar>
                              <Line 
                                yAxisId="right" 
                                type="monotone" 
                                dataKey="alignedVotes" 
                                stroke="#f59e0b" 
                                strokeWidth={3} 
                                dot={{ r: 5, strokeWidth: 2, fill: '#0f172a' }} 
                                activeDot={{ r: 7 }} 
                              />
                            </ComposedChart>
                          ) : (
                            <ComposedChart
                              data={comparisonData}
                              margin={{ top: 10, right: 10, bottom: 5, left: -10 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis 
                                dataKey="term" 
                                stroke="#64748b" 
                                fontSize={10} 
                                fontWeight="bold"
                                tickLine={false}
                              />
                              <YAxis 
                                stroke="#818cf8" 
                                fontSize={10} 
                                fontWeight="medium"
                                tickLine={false}
                                tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                              />
                              <Tooltip
                                contentStyle={{ 
                                  backgroundColor: '#0f172a', 
                                  border: '1px solid #334155', 
                                  borderRadius: '12px',
                                  padding: '10px'
                                }}
                                itemStyle={{ fontSize: '11px' }}
                                labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}
                                formatter={(value: any, name: any) => {
                                  const leg = comparisonLegislators.find(l => l.legislator_id === name);
                                  return [`$${value.toLocaleString()}`, leg ? leg.name : name];
                                }}
                                labelFormatter={(label) => {
                                  const matched = comparisonData.find(d => d.term === label);
                                  return matched ? matched.fullTerm : label;
                                }}
                              />
                              {comparisonLegislators.map((leg, idx) => (
                                <Line 
                                  key={leg.legislator_id}
                                  type="monotone" 
                                  dataKey={leg.legislator_id} 
                                  stroke={chartColors[idx % chartColors.length]} 
                                  strokeWidth={3} 
                                  dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }} 
                                  activeDot={{ r: 6 }} 
                                />
                              ))}
                            </ComposedChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                      {/* Anomaly Explanation Pane */}
                      {selectedAnomaly && pacChartView === 'individual' && (
                        <div className="mt-4 bg-slate-900 border border-indigo-900/40 rounded-xl p-4 animate-fade-in relative overflow-hidden">
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-transparent"></div>
                          <button 
                            onClick={() => setSelectedAnomaly(null)}
                            className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            <X size={14} />
                          </button>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={16} className={selectedAnomaly.type === 'spike' ? 'text-red-400' : 'text-emerald-400'} />
                            <h4 className="text-xs font-black tracking-wide text-indigo-300 uppercase">
                              AI PAC Anomaly Analysis
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono ml-auto mr-6">
                              {selectedAnomaly.legislatorName} • {selectedAnomaly.fullTerm}
                            </span>
                          </div>

                          <div className="bg-slate-950 rounded-lg p-3 border border-slate-900">
                            <div className="flex flex-wrap items-center gap-3 mb-2 border-b border-slate-800 pb-2">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${selectedAnomaly.type === 'spike' ? 'text-red-400 border-red-900/40 bg-red-950/30' : 'text-emerald-400 border-emerald-900/40 bg-emerald-950/30'}`}>
                                {selectedAnomaly.type === 'spike' ? 'High Spike' : 'Low Dip'} Detected
                              </span>
                              <span className="text-xs font-mono text-slate-300">
                                ${selectedAnomaly.pacFunding.toLocaleString()} vs ${Math.round(selectedAnomaly.avg).toLocaleString()} (5-Term Avg)
                              </span>
                            </div>
                            
                            {anomalyLoading ? (
                              <div className="flex items-center gap-2 text-indigo-400 text-xs py-2">
                                <RefreshCw size={14} className="animate-spin" />
                                <span>Generating investigative context from historical records...</span>
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-300 leading-relaxed font-sans mt-2">
                                {anomalyExplanation}
                              </p>
                            )}
                          </div>
                        </div>
                      )}


                    </div>
                  </div>
                </div>
              );
            })()}

            {/* DIRECTORY & SCORECARD TAB */}
            {dashboardTab === 'directory' && (
              <div className="space-y-8 animate-fade-in">

            {/* Controls panel (Search & Filtering System) */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-5">
              
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search representative or senator name, state, ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500/70 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                {/* Sort selector dropdown */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 whitespace-nowrap">
                    <ArrowUpDown size={14} className="text-indigo-400" />
                    Sort By:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="h-11 px-4 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="highest_alignment">✨ Highest Grassroots Alignment</option>
                    <option value="lowest_alignment">⚠️ Lowest Grassroots Alignment</option>
                    <option value="highest_pac">💰 Highest PAC Funding</option>
                    <option value="lowest_pac">💵 Lowest PAC Funding</option>
                    <option value="highest_transparency">🟢 Highest Transparency Index</option>
                    <option value="lowest_transparency">🔴 Lowest Transparency Index</option>
                    <option value="highest_alerts">🚨 Most Active Integrity Alerts</option>
                    <option value="society_count">👁️ Secret Society Members</option>
                  </select>
                </div>

                {/* Reset button */}
                <button
                  onClick={handleResetFilters}
                  className="h-11 px-4 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <RefreshCw size={13} />
                  <span>Reset</span>
                </button>

              </div>

              {/* Advanced filter criteria grid */}
              <div className="pt-4 border-t border-slate-850/60 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Party selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Political Party
                  </label>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
                    {(['All', 'Democrat', 'Republican', 'Independent'] as const).map((party) => (
                      <button
                        key={party}
                        onClick={() => setPartyFilter(party)}
                        className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-colors ${
                          partyFilter === party 
                            ? 'bg-slate-850 text-white' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {party}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Society selector dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    Fraternal Society Membership
                  </label>
                  <select
                    value={societyFilter}
                    onChange={(e) => setSocietyFilter(e.target.value)}
                    className="h-9 px-3 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-850 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="All">All Societies ({uniqueSocieties.length})</option>
                    {uniqueSocieties.map((society) => (
                      <option key={society} value={society}>
                        👁️ {society}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Legislative Chamber role selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Legislative Chamber
                  </label>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
                    {(['All', 'Representative', 'Senator'] as const).map((chamber) => (
                      <button
                        key={chamber}
                        onClick={() => setRoleFilter(chamber)}
                        className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-colors ${
                          roleFilter === chamber 
                            ? 'bg-slate-850 text-white' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {chamber === 'Representative' ? 'House' : chamber === 'Senator' ? 'Senate' : 'All'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Integrity Alerts filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    Integrity Alerts & Conflicts
                  </label>
                  <select
                    value={integrityFilter}
                    onChange={(e: any) => setIntegrityFilter(e.target.value)}
                    className="h-9 px-3 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-850 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="All">All Integrity Triggers</option>
                    <option value="donor_contract">💰 Donor Contract Awards</option>
                    <option value="insider_trading">📈 Family Stock Trading</option>
                    <option value="lobbyist_favoritism">📝 Lobbyist Amendment Copying</option>
                    <option value="secret_litigation">🚪 Closed-door Secret Votes</option>
                    <option value="clean">🛡️ No Active Triggers</option>
                  </select>
                </div>

              </div>

            </div>

            {/* Representative Cards Display Grid */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal size={14} className="text-indigo-400" />
                  Congressional Representatives Index ({filteredLegislators.length} Match)
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsCompareMode(!isCompareMode);
                      if (isCompareMode) setCompareSelection([]); // Clear selection when turning off
                    }}
                    className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg border transition-colors ${isCompareMode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                  >
                    Compare Mode
                  </button>
                  <p className="text-xs text-slate-400 italic">Showing structured feed state</p>
                </div>
              </div>

              {isCompareMode && (
                <div className="mb-4 bg-indigo-950/40 border border-indigo-900/50 p-3 rounded-xl flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 font-bold text-xs">Select two legislators to compare:</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 border border-slate-800">
                      {compareSelection.length} / 2 Selected
                    </span>
                  </div>
                  {compareSelection.length === 2 && (
                    <button
                      onClick={() => setShowCompareModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-colors"
                    >
                      View Comparison
                    </button>
                  )}
                </div>
              )}

              {filteredLegislators.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLegislators.map((legislator) => (
                    <RepresentativeCard 
                      key={legislator.legislator_id} 
                      legislator={legislator} 
                      customFlags={customFlags} 
                      isFavorite={watchlist.includes(legislator.legislator_id)}
                      onToggleFavorite={handleToggleFavorite}
                      alignmentScore={calculateUserAlignmentScore(legislator, userPrefs)}
                      onShowBriefing={handleGenerateBriefing}
                      onScanFindings={handleScanFindings}
                      compareMode={isCompareMode}
                      isSelectedForCompare={compareSelection.includes(legislator.legislator_id)}
                      onToggleCompare={handleToggleCompare}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-850 text-center py-16 px-4 rounded-2xl">
                  <p className="text-slate-400 font-medium mb-1 text-sm">No legislators found matching the filtered parameters.</p>
                  <p className="text-xs text-slate-500">Try loosening your search terms or clearing your society filters.</p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Clear Filter Constraints
                  </button>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
        )}

        {/* Tab 2: AI Legislative Watchdog Hub */}
        {activeTab === 'watchdog' && (
          <div className="animate-fade-in space-y-6">
            
            {/* Context Summary Callout */}
            <div className="bg-gradient-to-r from-slate-900 via-amber-950/10 to-slate-900 border border-amber-950/40 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />
              <div className="max-w-4xl">
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400 animate-pulse" />
                  AI-Powered 'Legislative Watchdog' Analysis Center
                </h2>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  Analyze complex, high-velocity legislation automatically. This module targets bills exceeding <strong>100 pages</strong> or where a vote is scheduled <strong>within 48 hours</strong> of publication. 
                  It triggers a server-side Gemini analysis identifying lobby benefits, non-germane amendments ('pork'), and oversight transfers.
                </p>
              </div>
            </div>

            {/* Split view: Selection Form & AI Output Terminal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">
                    1. Select Legislation Target
                  </h3>
                  
                  {/* Mode Selector */}
                  <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-850 mb-4">
                    <button
                      onClick={() => setIsCustomBill(false)}
                      className={`text-xs font-bold py-2 rounded-lg transition-colors ${
                        !isCustomBill ? 'bg-slate-850 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Preloaded Bills
                    </button>
                    <button
                      onClick={() => setIsCustomBill(true)}
                      className={`text-xs font-bold py-2 rounded-lg transition-colors ${
                        isCustomBill ? 'bg-slate-850 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Custom Submission
                    </button>
                  </div>

                  {!isCustomBill ? (
                    /* Preloaded Selector */
                    <div className="space-y-2">
                      {PRELOADED_BILLS.map((bill) => (
                        <label 
                          key={bill.id} 
                          className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                            selectedBillId === bill.id && !isCustomBill
                              ? 'bg-indigo-950/20 border-indigo-500/50 shadow-md'
                              : 'bg-slate-950/50 border-slate-850 hover:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="radio" 
                              name="preloaded_bill" 
                              value={bill.id}
                              checked={selectedBillId === bill.id && !isCustomBill}
                              onChange={() => setSelectedBillId(bill.id)}
                              className="accent-indigo-500"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-indigo-400 font-mono">{bill.billNumber}</span>
                              <h4 className="text-xs font-bold text-white truncate mt-0.5">{bill.title}</h4>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                            <span>📄 {bill.pageCount} pages</span>
                            <span className="font-mono text-amber-400">Vote scheduled &lt; 48 hours</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    /* Custom Inputs */
                    <div className="space-y-3.5 bg-slate-950/40 p-4 rounded-xl border border-slate-850/60">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bill ID / Number</label>
                          <input 
                            type="text" 
                            value={customBillNumber}
                            onChange={(e) => setCustomBillNumber(e.target.value)}
                            className="h-9 px-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Page Count</label>
                          <input 
                            type="number" 
                            value={customBillPages}
                            onChange={(e) => setCustomBillPages(e.target.value)}
                            className="h-9 px-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bill Title</label>
                        <input 
                          type="text" 
                          value={customBillTitle}
                          onChange={(e) => setCustomBillTitle(e.target.value)}
                          className="h-9 px-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Text Released At</label>
                          <input 
                            type="datetime-local" 
                            value={customReleaseTime}
                            onChange={(e) => setCustomReleaseTime(e.target.value)}
                            className="h-9 px-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vote Scheduled At</label>
                          <input 
                            type="datetime-local" 
                            value={customVoteTime}
                            onChange={(e) => setCustomVoteTime(e.target.value)}
                            className="h-9 px-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                          <span>Bill Text Fragment / Summary</span>
                          <span className="text-slate-500 font-medium">Context limits apply</span>
                        </label>
                        <textarea
                          rows={4}
                          value={customBillText}
                          onChange={(e) => setCustomBillText(e.target.value)}
                          className="p-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-sans resize-none"
                          placeholder="Paste a draft fragment or outline summary..."
                        />
                      </div>
                    </div>
                  )}

                </div>

                <div className="pt-2 border-t border-slate-850 flex flex-col gap-2">
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase font-mono">Bill Reader & Summaries</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const bill = isCustomBill 
                          ? { id: "custom", billNumber: customBillNumber, title: customBillTitle, summaryText: customBillText } 
                          : PRELOADED_BILLS.find(b => b.id === selectedBillId);
                        if (bill) {
                          setViewingBillId(bill.id);
                          setViewingBillSummary(null);
                          setIsViewingBill(true);
                        }
                      }}
                      className="py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-[11px] font-bold rounded-xl text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <BookOpen size={13} className="text-indigo-400" />
                      <span>View Draft</span>
                    </button>

                    <button
                      onClick={async () => {
                        const bill = isCustomBill 
                          ? { id: "custom", billNumber: customBillNumber, title: customBillTitle, summaryText: customBillText } 
                          : PRELOADED_BILLS.find(b => b.id === selectedBillId);
                        if (bill) {
                          setViewingBillId(bill.id);
                          setIsViewingBill(true);
                          await handleSummarizeBill(bill.billNumber, bill.title, bill.summaryText || "");
                        }
                      }}
                      className="py-2.5 bg-indigo-950/30 hover:bg-indigo-900/40 border border-indigo-900/30 hover:border-indigo-800/40 text-[11px] font-bold rounded-xl text-indigo-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles size={13} className="text-amber-400" />
                      <span>AI Summarize</span>
                    </button>
                  </div>
                </div>

                <div className="pt-1 flex flex-col gap-2">
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase font-mono">Special Interest Audits</span>
                  <button
                    onClick={handleExecuteWatchdogAnalysis}
                    disabled={isAnalyzing}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-xs font-black rounded-xl text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-indigo-950/20 disabled:opacity-50 transition-all uppercase tracking-wider"
                  >
                    <Sparkles size={14} className="text-white animate-pulse" />
                    {isAnalyzing ? "Executing AI Audit..." : "Execute Watchdog Analysis"}
                  </button>
                </div>

              </div>

              {/* Right Column: High Fidelity Auditing Console */}
              <div className="lg:col-span-7 space-y-4">
                
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[450px]">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
                        <span className="text-xs font-black text-slate-300 uppercase tracking-widest font-mono">LEGISLATIVE WATCHDOG TERMINAL</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">MODEL: gemini-3.5-flash</span>
                    </div>

                    {/* Progress logging */}
                    {analysisProgress.length > 0 && (
                      <div className="bg-slate-950 rounded-xl p-4.5 border border-slate-850 font-mono text-[11px] leading-relaxed text-slate-300 space-y-1">
                        {analysisProgress.map((line, idx) => {
                          let color = "text-slate-400";
                          if (line.includes("[SUCCESS]")) color = "text-emerald-400 font-bold";
                          if (line.includes("[ERROR]")) color = "text-rose-400 font-bold";
                          if (line.includes("[INFO]")) color = "text-slate-300";
                          return <div key={idx} className={color}>{line}</div>;
                        })}
                        {isAnalyzing && (
                          <div className="text-indigo-400 animate-pulse flex items-center gap-1 mt-2">
                            <RefreshCw size={11} className="animate-spin" />
                            <span>Awaiting server response... (analyzing corporate patterns)</span>
                          </div>
                        )}
                      </div>
                    )}

                    {!analysisResult && !isAnalyzing && (
                      <div className="flex flex-col items-center justify-center text-center py-20 text-slate-500">
                        <Terminal size={36} className="text-slate-600 mb-3" />
                        <p className="text-xs font-bold text-slate-400">Terminal Awaiting Pipeline Stream</p>
                        <p className="text-[11px] max-w-sm mt-1">Select a piece of legislation on the left side and trigger the critical audit button to stream live Gemini evaluation.</p>
                      </div>
                    )}

                    {/* Output results */}
                    {analysisResult && (
                      <div className="space-y-5 mt-4">
                        
                        {/* Status bar */}
                        <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-xl flex items-center justify-between">
                          <span className="text-xs text-slate-300 flex items-center gap-1.5 font-bold">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            Audit Active: {analysisResult.isWatchdogTarget ? "Critical Transparency Violation" : "Standard Review"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{analysisResult.elapsedTimeText}</span>
                        </div>

                        {/* Fallback Warning if key is missing */}
                        {analysisResult.usingDemoFallback && (
                          <div className="p-3.5 bg-rose-950/20 border border-rose-800/40 rounded-xl flex items-start gap-2.5">
                            <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-rose-300">Using Demo Analysis Fallback</p>
                              <p className="text-[10px] text-slate-300 leading-normal">
                                The server processed this request using a robust structured fallback model. To enable live AI generation directly from your personal settings, configure your <code className="text-white font-mono bg-slate-950 px-1 py-0.5 rounded">GEMINI_API_KEY</code> in the **Secrets** panel.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Critical Breakdown Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          {/* Benefits */}
                          <div className="bg-slate-950/50 p-4 border border-slate-850/80 rounded-xl">
                            <div className="text-[10px] font-black tracking-wider uppercase text-amber-400 mb-2.5 flex items-center gap-1">
                              <Coins size={12} />
                              Lobbyist Beneficiaries
                            </div>
                            <ul className="space-y-2">
                              {analysisResult.benefits.map((item, idx) => (
                                <li key={idx} className="text-[10px] text-slate-300 leading-normal flex items-start gap-1.5">
                                  <span className="text-amber-500 font-bold mt-0.5">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Pork */}
                          <div className="bg-slate-950/50 p-4 border border-slate-850/80 rounded-xl">
                            <div className="text-[10px] font-black tracking-wider uppercase text-rose-400 mb-2.5 flex items-center gap-1">
                              <AlertTriangle size={12} />
                              Pork Earmarks
                            </div>
                            <ul className="space-y-2">
                              {analysisResult.pork.map((item, idx) => (
                                <li key={idx} className="text-[10px] text-slate-300 leading-normal flex items-start gap-1.5">
                                  <span className="text-rose-500 font-bold mt-0.5">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Regulatory Shifts */}
                          <div className="bg-slate-950/50 p-4 border border-slate-850/80 rounded-xl">
                            <div className="text-[10px] font-black tracking-wider uppercase text-purple-400 mb-2.5 flex items-center gap-1">
                              <ShieldAlert size={12} />
                              Oversight Transfers
                            </div>
                            <ul className="space-y-2">
                              {analysisResult.regulatoryShifts.map((item, idx) => (
                                <li key={idx} className="text-[10px] text-slate-300 leading-normal flex items-start gap-1.5">
                                  <span className="text-purple-400 font-bold mt-0.5">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                        </div>

                      </div>
                    )}

                  </div>

                  <div className="text-[10px] text-slate-500 font-medium italic mt-4 text-center">
                    Audits are powered by server-side NLP indexing metrics.
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Tab: Local Government Audit & Complaints Hub */}
        {activeTab === 'localaudit' && (
          <div className="animate-fade-in space-y-6">
            <LocalAuditHub user={user} />
          </div>
        )}

        {/* Tab: Civic Debate Arena */}
        {activeTab === 'debate' && (
          <div className="animate-fade-in space-y-6">
            <CivicArena
              debates={debates}
              user={user}
              onAddDebate={handleAddDebate}
              onAddChallenge={handleAddChallenge}
              onVoteDebate={handleVoteDebate}
            />
          </div>
        )}

        {/* Tab: Press Room */}
        {activeTab === 'press' && (
          <div className="animate-fade-in space-y-6">
            <PressRoom
              broadcasts={broadcasts}
              user={user}
              onAddBroadcast={handleAddBroadcast}
              onAddComment={handleAddCommentToBroadcast}
              onLikeBroadcast={handleLikeBroadcast}
            />
          </div>
        )}

        {/* Tab: Credentials / My Voter Card */}
        {activeTab === 'credentials' && (
          <div className="animate-fade-in space-y-6">
            <AccountPanel
              user={user}
              onLogin={setUser}
              onLogout={() => setUser(null)}
              legislators={legislators}
            />
          </div>
        )}

        {/* Tab: Watchdog Custom Flags Engine */}
        {activeTab === 'flags' && (
          <div className="animate-fade-in space-y-6">
            <CustomFlagsPanel
              customFlags={customFlags}
              onAddFlag={handleAddFlag}
              onRemoveFlag={handleRemoveFlag}
              onRunScan={handleRunScan}
              legislators={legislators}
            />
          </div>
        )}

        {/* Tab 3: Firebase Cloud Function Exporter (New) */}
        {activeTab === 'functions' && (
          <div className="animate-fade-in space-y-6">
            
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-2">Firebase Cloud Function Source Code</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                This contains the production-ready source code for the Firebase Cloud Function described in Feature 4.
                It queries the Congress.gov API on a crontab schedule, filters roll-call timestamps for non-standard transparent hours (8:00 PM - 7:00 AM EST), updates Firestore profiles dynamically, and issues real-time push notifications using Firebase Cloud Messaging (FCM).
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-black text-rose-400 font-mono flex items-center gap-1.5">
                  <Moon size={14} />
                  functions/index.js
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded">NodeJS v18+ / Firebase v2</span>
              </div>

              {/* Read Only Source Viewer */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 max-h-96 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre scrollbar-thin">
{`/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

// Define 'non-standard hours' as 8:00 PM to 7:00 AM Eastern Time
function isNonStandardHours(timestampString) {
  const date = new Date(timestampString);
  // Convert timestamp to Eastern Time specifically
  const etString = date.toLocaleString("en-US", { timeZone: "America/New_York" });
  const etDate = new Date(etString);
  const hours = etDate.getHours();
  return hours >= 20 || hours < 7;
}

/**
 * Scheduled Cloud Function (running every 10 minutes)
 * to monitor Congress.gov API for new roll-call votes.
 */
exports.monitorMidnightVotes = onSchedule("*/10 * * * *", async (event) => {
  try {
    const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;
    if (!CONGRESS_API_KEY) {
      console.error("Missing CONGRESS_API_KEY in environment variables.");
      return;
    }

    console.log("Checking recent roll-call votes...");
    const response = await axios.get("https://api.congress.gov/v3/votes", {
      params: {
        api_key: CONGRESS_API_KEY,
        limit: 10,
        format: "json"
      }
    });

    const votes = response.data.votes || [];

    for (const vote of votes) {
      const { voteId, billNumber, billName, timestamp, politicianName, politicianId } = vote;

      // Check for processed vote to prevent repeat push triggers
      const voteRef = db.collection("processed_votes").doc(voteId);
      const doc = await voteRef.get();
      if (doc.exists) continue;

      // Verify transparency window criteria
      if (isNonStandardHours(timestamp)) {
        console.log(\`Midnight vote violation for \${politicianName} on \${billNumber}\`);

        // 1. Dispatch Firebase Cloud Messaging payload
        const payload = {
          notification: {
            title: "Transparency Warning: Midnight Vote Cast",
            body: \`[\${politicianName}] cast a vote on [\${billNumber}] at [\${timestamp}], which is outside of standard transparency hours.\`
          },
          topic: "transparency_alerts"
        };

        await admin.messaging().send(payload);

        // 2. Flags representative profile in Firestore collection
        const repRef = db.collection("legislators").doc(politicianId);
        await repRef.set({
          midnight_vote_badge: true,
          midnight_votes: admin.firestore.FieldValue.arrayUnion({
            bill_number: billNumber,
            bill_name: billName,
            timestamp: timestamp
          })
        }, { merge: true });
      }

      // Mark processed
      await voteRef.set({ processedAt: admin.firestore.FieldValue.serverTimestamp() });
    }
  } catch (error) {
    console.error("Transparency monitor crash:", error);
  }
});`}
              </div>

              {/* Developer Implementation Guide */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">Deploy Instructions</h4>
                <ol className="text-xs text-slate-400 space-y-1.5 list-decimal pl-4 leading-normal">
                  <li>Install Firebase CLI: <code className="text-slate-200 bg-slate-950 px-1 rounded font-mono">npm install -g firebase-tools</code></li>
                  <li>Log in and initialize inside your project directory: <code className="text-slate-200 bg-slate-950 px-1 rounded font-mono">firebase init functions</code></li>
                  <li>Paste this source code inside the generated <code className="text-slate-200 font-mono">functions/index.js</code> file.</li>
                  <li>Configure your secrets: <code className="text-slate-200 bg-slate-950 px-1 rounded font-mono">firebase functions:secrets:set CONGRESS_API_KEY="your_key"</code></li>
                  <li>Deploy the scheduler: <code className="text-slate-200 bg-slate-950 px-1 rounded font-mono">firebase deploy --only functions</code></li>
                </ol>
              </div>

            </div>

          </div>
        )}

        {/* Tab 4: Script Viewer for Termux */}
        {activeTab === 'script' && (
          <div className="animate-fade-in space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-2">Termux Command-Line Python Script</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                This is the complete pipeline script designed and optimized to run directly on Termux, standard Linux shells, or local terminal.
                It queries OpenFEC to map PAC receipts, scrapes roll-call summaries, and runs a real-time SPARQL query on Wikidata over HTTP.
              </p>
            </div>
            <ScriptViewer />
          </div>
        )}

        {/* Tab 5: Expo React Native Code */}
        {activeTab === 'expo' && (
          <div className="animate-fade-in space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-2">React Native (Expo) Entrypoint Code</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Below is the complete, modular code for a React Native (Expo) app implementing the <code className="text-slate-200">RepresentativeCard</code> layout and components, filtering mechanisms, and the dark mode theme.
              </p>
            </div>
            <ReactNativeExporter />
          </div>
        )}

        {/* Tab 6: Normalized JSON Feed */}
        {activeTab === 'json' && (
          <div className="animate-fade-in space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-2">Normalized Congressional JSON Feed</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                This is the structure produced by the Termux python aggregator. It conforms exactly to the specifications of the database schemas requested.
              </p>
            </div>
            <JsonViewer />
          </div>
        )}

      </main>


      {/* Committee Findings Modal Overlay */}
      {activeFindingsLegislator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-850 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-950">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-950/50 border border-rose-900/50 text-rose-400">
                  <Search size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-none">
                    Ethics & Committee Findings Scan
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-2 uppercase font-semibold tracking-wider">
                    {activeFindingsLegislator.name} • {activeFindingsLegislator.party} {activeFindingsLegislator.role} ({activeFindingsLegislator.state})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveFindingsLegislator(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-950/50">
              {findingsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-rose-900/40 rounded-full"></div>
                    <div className="w-12 h-12 border-4 border-rose-500 rounded-full border-t-transparent animate-spin absolute inset-0"></div>
                  </div>
                  <p className="text-sm font-bold tracking-widest uppercase text-rose-400 animate-pulse">
                    Scanning public records & committee findings...
                  </p>
                  <p className="text-xs text-slate-500 font-mono">This involves AI investigation of historical controversies.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Results Panel */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                    <h4 className="text-xs font-black uppercase text-rose-400 tracking-wider mb-4 flex items-center gap-2">
                      <ShieldAlert size={14} /> AI Investigative Report
                    </h4>
                    
                    <div className="text-sm text-slate-300 leading-relaxed font-sans space-y-4">
                      {findingsText ? (
                         findingsText.split('\n\n').map((paragraph, i) => (
                           <p key={i}>{paragraph}</p>
                         ))
                      ) : (
                        <p className="text-slate-500 italic">No report available.</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Disclaimer */}
                  <div className="bg-slate-950 border border-rose-900/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-relaxed text-slate-400 font-mono">
                      <strong>AI SYNTHESIZED REPORT:</strong> This summary is generated dynamically by an AI agent using public records and internet history. It does not reflect a legal verdict or guarantee perfect factual accuracy. Consult primary investigative journalism or official committee publications for verified details.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* AI Legislator Briefing Modal Overlay */}
      {activeBriefingLegislator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-850 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-950">
              <div className="flex items-center gap-2.5">
                <Sparkles className="text-indigo-400 animate-pulse" size={18} />
                <div>
                  <h3 className="font-bold text-white text-base leading-none">
                    AI Factual Integrity Briefing
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-2 uppercase font-semibold tracking-wider">
                    {activeBriefingLegislator.name} • {activeBriefingLegislator.party} {activeBriefingLegislator.role} ({activeBriefingLegislator.state})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveBriefingLegislator(null);
                  setBriefingText(null);
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-950/40 border border-slate-850 hover:border-slate-800 transition-colors font-bold font-mono text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {briefingLoading ? (
                <div className="py-16 text-center space-y-4">
                  <div className="relative w-10 h-10 mx-auto">
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono tracking-wide uppercase">
                    Synthesizing Campaign Finance & Transparency Datasets...
                  </div>
                </div>
              ) : briefingText ? (
                <div className="text-slate-300 text-xs leading-relaxed space-y-3 max-w-none">
                  <div className="space-y-4">
                    {briefingText.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('###') || paragraph.startsWith('##')) {
                        return (
                          <h4 key={pIdx} className="text-xs font-black tracking-wider uppercase text-white border-b border-slate-850 pb-1 mt-4">
                            {paragraph.replace(/###|##/g, '').trim()}
                          </h4>
                        );
                      }
                      if (paragraph.includes('**')) {
                        // Check if paragraph is formatted as a bullet list of details
                        const lines = paragraph.split('\n');
                        if (lines.length > 1 || lines[0].startsWith('-') || lines[0].startsWith('*')) {
                          return (
                            <div key={pIdx} className="space-y-2.5">
                              {lines.map((line, lIdx) => {
                                const cleanLine = line.replace(/^[-*]\s+/, '');
                                const match = cleanLine.match(/^\*\*(.*?)\*\*:\s*(.*)/);
                                if (match) {
                                  return (
                                    <div key={lIdx} className="bg-slate-950/45 border border-slate-850/60 p-3.5 rounded-xl">
                                      <span className="text-[10px] font-black tracking-wider text-indigo-400 font-mono uppercase block mb-1">
                                        {match[1]}
                                      </span>
                                      <span className="text-slate-300 text-xs leading-relaxed">
                                        {match[2]}
                                      </span>
                                    </div>
                                  );
                                }
                                return (
                                  <p key={lIdx} className="text-slate-300 pl-4">
                                    {cleanLine}
                                  </p>
                                );
                              })}
                            </div>
                          );
                        }
                      }
                      return (
                        <p key={pIdx} className="text-slate-300 leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs italic">
                  No briefing details generated.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/55 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldAlert size={11} className="text-indigo-500" />
                Independent watchdog indexing
              </span>
              <span>Model: gemini-3.5-flash</span>
            </div>

          </div>
        </div>
      )}

      {/* Bill Reader & AI Summarizer Modal Overlay */}
      {isViewingBill && currentViewingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-5xl bg-slate-900 border border-slate-850 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-950 shrink-0">
              <div className="flex items-center gap-2.5">
                <BookOpen className="text-indigo-400" size={18} />
                <div>
                  <h3 className="font-bold text-white text-base leading-none flex items-center gap-2">
                    {currentViewingBill.title}
                    <span className="text-xs font-mono text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded-md font-bold">
                      {currentViewingBill.billNumber}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-1.5 uppercase font-semibold tracking-wider">
                    Official Legislative Text Draft • {currentViewingBill.pageCount} Pages • State: Public Record
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsViewingBill(false);
                  setViewingBillId(null);
                  setViewingBillSummary(null);
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-950/40 border border-slate-850 hover:border-slate-800 transition-colors font-bold font-mono text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Split Panel Body */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0 bg-slate-950">
              
              {/* Left Column: Official Document View (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col h-full border-r border-slate-850 overflow-hidden bg-slate-900/40">
                <div className="p-3 bg-slate-900/90 border-b border-slate-850 shrink-0 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>📄 LEGISLATIVE_DRAFT_STREAM.txt</span>
                  <span className="text-[10px] text-slate-500">LINE ALIGNED 1:1</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed text-slate-300 select-text scrollbar-thin">
                  <div className="flex gap-4">
                    {/* Line numbers on the left */}
                    <div className="text-slate-600 text-right select-none pr-3 border-r border-slate-800 text-[11px] font-semibold space-y-1">
                      {Array.from({ length: currentViewingBill.fullText?.split('\n').length || 20 }).map((_, idx) => (
                        <div key={idx} className="h-[18px]">{idx + 1}</div>
                      ))}
                    </div>
                    {/* Content on the right */}
                    <div className="flex-1 space-y-1 text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-[18px]">
                      {currentViewingBill.fullText}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Summary Panel (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col h-full overflow-hidden bg-slate-900/20">
                <div className="p-4 bg-slate-900/60 border-b border-slate-850 shrink-0 flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400 animate-pulse" />
                    AI Layman Summarization
                  </span>
                  {!viewingBillSummary && !isSummarizingBill && (
                    <button
                      onClick={() => handleSummarizeBill(currentViewingBill.billNumber, currentViewingBill.title, currentViewingBill.fullText)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-extrabold rounded-lg text-white transition-colors cursor-pointer"
                    >
                      Generate Summary
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
                  
                  {isSummarizingBill && (
                    <div className="h-full flex flex-col items-center justify-center text-center py-24 space-y-4">
                      <div className="relative w-10 h-10">
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider">Deploying Gemini summarizing model...</p>
                        <p className="text-[10px] text-slate-400">Parsing textual clauses and drafting bulleted outputs</p>
                      </div>
                    </div>
                  )}

                  {!viewingBillSummary && !isSummarizingBill && (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 text-slate-500">
                      <Sparkles size={36} className="text-slate-600 mb-3 animate-pulse" />
                      <p className="text-xs font-bold text-slate-400">AI Summary Awaiting Activation</p>
                      <p className="text-[11px] max-w-xs mt-1 leading-relaxed">
                        Have Google Gemini analyze and translate this complex bill text into easy-to-understand bullet points and impact statements.
                      </p>
                      <button
                        onClick={() => handleSummarizeBill(currentViewingBill.billNumber, currentViewingBill.title, currentViewingBill.fullText)}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-xs font-bold rounded-xl text-white flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <Sparkles size={13} />
                        <span>Run AI Summarizer</span>
                      </button>
                    </div>
                  )}

                  {viewingBillSummary && (
                    <div className="space-y-5 animate-fade-in">
                      
                      {/* Warning fallback banner */}
                      {viewingBillSummary.usingDemoFallback && (
                        <div className="p-3 bg-indigo-950/15 border border-indigo-900/30 rounded-xl">
                          <p className="text-[10px] font-bold text-indigo-300">Using Preloaded Layman Analysis</p>
                          <p className="text-[9px] text-slate-400 leading-normal mt-0.5">
                            Displayed from verified pre-structured public records fallback. Add a GEMINI_API_KEY to trigger live Gemini generations.
                          </p>
                        </div>
                      )}

                      {/* Executive Summary */}
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 space-y-1.5">
                        <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase font-mono">Executive Summary</span>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {viewingBillSummary.executiveSummary}
                        </p>
                      </div>

                      {/* Key Provisions */}
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 space-y-3">
                        <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase font-mono block">Key Provisions & Clauses</span>
                        <div className="space-y-2.5">
                          {viewingBillSummary.keyProvisions.map((provision, idx) => (
                            <div key={idx} className="flex gap-2.5 items-start">
                              <span className="w-5 h-5 rounded-full bg-emerald-950/50 border border-emerald-900/40 flex items-center justify-center text-emerald-400 text-[10px] font-black font-mono shrink-0">
                                {idx + 1}
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed font-sans pt-0.5">
                                {provision}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Citizen Impact */}
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 space-y-1.5">
                        <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase font-mono">Citizen Impact Statement</span>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {viewingBillSummary.citizenImpact}
                        </p>
                      </div>

                      {/* Follow-up Q&A Log */}
                      {customQuestionReplies.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-slate-850">
                          <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase font-mono block">Follow-up Q&A Log</span>
                          <div className="space-y-3">
                            {customQuestionReplies.map((q, idx) => (
                              <div key={idx} className="bg-slate-950/60 p-4 border border-indigo-950/30 rounded-xl space-y-2.5 animate-fade-in text-xs">
                                <div className="flex justify-between items-start text-slate-400 text-[9px] font-mono">
                                  <span className="text-indigo-300 font-bold flex items-center gap-1">
                                    <HelpCircle size={10} /> CITIZEN QUESTION {idx + 1}
                                  </span>
                                  <span>{q.timestamp}</span>
                                </div>
                                <p className="text-slate-200 font-medium font-sans">
                                  "{q.question}"
                                </p>
                                <div className="pt-2 border-t border-slate-900 text-slate-300 font-sans leading-relaxed flex gap-2">
                                  <Sparkles size={12} className="text-amber-400 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs">{q.reply}</p>
                                    {q.usingDemoFallback && (
                                      <p className="text-[9px] text-indigo-400/80 font-mono mt-1">
                                        ℹ️ Shown in offline demo mode. Add a GEMINI_API_KEY to test live dynamic questions!
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>

                {/* Fixed Custom Question Input Bar at bottom of column */}
                <div className="p-4 bg-slate-900/60 border-t border-slate-850 shrink-0 space-y-2">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder={viewingBillSummary ? "Ask about Section 4, small businesses, etc..." : "Generate AI summary first to ask questions..."}
                      disabled={!viewingBillSummary || isQueryingQuestion}
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customQuestion.trim()) {
                          handleAskCustomQuestion(
                            currentViewingBill.billNumber,
                            currentViewingBill.title,
                            currentViewingBill.fullText || "",
                            customQuestion
                          );
                        }
                      }}
                      className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-500 rounded-xl outline-none transition-all disabled:opacity-50"
                    />
                    <button
                      disabled={!viewingBillSummary || isQueryingQuestion || !customQuestion.trim()}
                      onClick={() => {
                        handleAskCustomQuestion(
                          currentViewingBill.billNumber,
                          currentViewingBill.title,
                          currentViewingBill.fullText || "",
                          customQuestion
                        );
                      }}
                      className="absolute right-1.5 p-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-30 disabled:hover:text-indigo-400 transition-colors cursor-pointer"
                      title="Send Question"
                    >
                      {isQueryingQuestion ? (
                        <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={13} />
                      )}
                    </button>
                  </div>
                  <div className="flex gap-2 text-[9px] text-slate-500 font-mono justify-between">
                    <span>Example: "How does Section 4 impact small businesses?"</span>
                    <span className="text-indigo-400 font-bold">Powered by Gemini</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/55 flex justify-between items-center text-[10px] text-slate-500 font-mono shrink-0">
              <span className="flex items-center gap-1.5">
                <ShieldAlert size={11} className="text-indigo-500" />
                Layman translation & reading room
              </span>
              <span>Model: gemini-3.5-flash</span>
            </div>

          </div>
        </div>
      )}

      {/* Embedded CSS for transitions */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #020617;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 4px;
        }
      `}</style>

      {/* Compare Modal Overlay */}
      {showCompareModal && compareSelection.length === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
              <h2 className="text-lg font-bold text-white tracking-wide uppercase flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-indigo-400" />
                Head-to-Head Comparison
              </h2>
              <button 
                onClick={() => setShowCompareModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 relative">
                {/* Vertical Divider */}
                <div className="absolute top-0 bottom-0 left-1/2 -ml-px w-px bg-slate-800"></div>

                {compareSelection.map((id, index) => {
                  const leg = legislators.find(l => l.legislator_id === id);
                  if (!leg) return null;
                  
                  return (
                    <div key={id} className={`flex flex-col gap-6 ${index === 0 ? 'pr-2' : 'pl-2'}`}>
                      {/* Identity */}
                      <div className="text-center space-y-1">
                        <div className="mx-auto w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-3">
                           {leg.role === 'Senator' ? <Landmark size={24} className="text-slate-400" /> : <User size={24} className="text-slate-400" />}
                        </div>
                        <h3 className="text-xl font-bold text-white">{leg.name}</h3>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{leg.role} • {leg.state} • {leg.party}</p>
                      </div>

                      {/* PAC Funding Section */}
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5 border-b border-indigo-900/40 pb-2">
                          <Coins size={12} /> Corporate PAC Funding
                        </h4>
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-semibold text-slate-400">Total Pipeline</span>
                          <span className="text-2xl font-bold text-white">${leg.aipac_funding_total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-semibold text-slate-400">PAC % of Total</span>
                          <span className="text-lg font-bold text-indigo-300">{leg.pac_percentage}%</span>
                        </div>
                      </div>

                      {/* Transparency Section */}
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5 border-b border-amber-900/40 pb-2">
                          <ShieldAlert size={12} /> Transparency & Integrity
                        </h4>
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-semibold text-slate-400">Conflict Alerts</span>
                          <span className={`text-xl font-bold ${leg.conflict_triggers.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {leg.conflict_triggers.length} Active
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-semibold text-slate-400">Secret Societies</span>
                          <span className="text-lg font-bold text-amber-300">{leg.society_affiliations.length}</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
