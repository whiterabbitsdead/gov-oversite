/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Legislator {
  legislator_id: string;
  name: string;
  state: string;
  party: 'Democrat' | 'Republican' | 'Independent';
  role: 'Representative' | 'Senator';
  aipac_funding_total: number;
  corporate_vote_index: number; // 0 to 100 (100 is fully corporate, 0 is fully populist)
  society_affiliations: string[];
  midnight_vote_badge?: boolean;
  midnight_votes?: Array<{
    bill_number: string;
    bill_name: string;
    timestamp: string;
  }>;
  late_night_votes_count: number;
  avg_review_hours_major_bills: number;
  transparency_bill_sponsorships: number;
  sponsored_transparency_bills?: string[];
  conflict_triggers?: ConflictTrigger[];

  // Feature 7: Legislative Effectiveness Scoring (CEL)
  les_score?: number;
  les_benchmark?: number;
  les_rating?: 'Exceeds Expectations' | 'Meets Expectations' | 'Below Expectations';
  bills_sponsored_count?: number;
  bills_out_of_committee_count?: number;
  bills_became_law_count?: number;

  // Feature 8: Small-Dollar vs Mega-Donor Ratio (OpenFEC)
  total_campaign_funds?: number;
  small_dollar_percentage?: number; // unitemized individual contributions (<$200)
  large_dollar_percentage?: number; // itemized large contributions
  pac_percentage?: number;          // PAC injections

  // Feature 9: Committee Oversight vs Investment Mapping (Congress.gov)
  committees?: Array<{
    name: string;
    role: string;
  }>;
  committee_conflicts?: Array<{
    id: string;
    committee_name: string;
    industry_or_pac: string;
    overlap_description: string;
    source: 'PAC Donation' | 'Stock Investment' | 'Industry Ties';
  }>;

  // Official member portal / verification state
  verified_member_page?: boolean;
  outreach_status?: 'not_sent' | 'pending' | 'verified';
  official_statement?: string;
  corrective_actions?: string[];

  // Factual public records disclosures (Epstein disclosures & Partisan Weaponized Committee tracking)
  epstein_associated?: boolean;
  epstein_association_details?: string;
  weaponized_committee?: boolean;
  weaponized_committee_details?: string;
}

export interface ConflictTrigger {
  id: string;
  type: 'donor_contract' | 'insider_trading' | 'lobbyist_favoritism' | 'secret_litigation';
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  date: string;
  details: {
    donor_or_entity?: string;
    contract_value?: number;
    stock_ticker?: string;
    transaction_type?: 'Buy' | 'Sell';
    transaction_amount?: string;
    lobbyist_firm?: string;
    bill_affected?: string;
    secret_vote_time?: string;
  };
}

export interface WatchdogBill {
  id: string;
  billNumber: string;
  title: string;
  pageCount: number;
  textReleaseTime: string;
  scheduledVoteTime: string;
  summaryText?: string;
  analysis?: WatchdogAnalysis;
}

export interface WatchdogAnalysis {
  benefits: string[];
  pork: string[];
  regulatoryShifts: string[];
  elapsedTimeText: string;
  isWatchdogTarget: boolean;
  analyzedAt: string;
  usingDemoFallback?: boolean;
}

export interface UserValuePreferences {
  lobbyistWeight: 'low' | 'medium' | 'high';
  transparencyWeight: 'low' | 'medium' | 'high';
  diligenceWeight: 'low' | 'medium' | 'high';
  independenceWeight: 'low' | 'medium' | 'high';
}

export interface NotificationAlert {
  id: string;
  politicianName: string;
  billNumber: string;
  timestamp: string;
  fullMessage: string;
}

// User Profile and Account Information
export interface UserProfile {
  name: string;
  birthday: string;
  registeredVoter: 'Yes' | 'No' | 'Not Registered';
  voterState: string;
  politicalAffiliation: string;
  avatarUrl?: string;
  bio?: string;
  isRepresentative?: boolean;
  representativeId?: string; // Links to legislator_id if they claim a profile
}

// Debate & Challenge Arena
export interface DebateChallenge {
  id: string;
  authorName: string;
  authorVoterState?: string;
  authorRole: 'Citizen' | 'Politician';
  type: 'appeal' | 'challenge' | 'discredit';
  argumentText: string;
  evidenceLinks: string[];
  timestamp: string;
  upvotes: number;
}

export interface DebatePost {
  id: string;
  title: string;
  category: 'PAC Funding' | 'Legislative Speed' | 'Conflict of Interest' | 'Constituent Oversight' | 'CEL Performance';
  mainArgument: string;
  authorName: string;
  authorVoterState?: string;
  authorRole: 'Citizen' | 'Politician';
  timestamp: string;
  supportCount: number;
  discreditCount: number;
  appealCount: number;
  challenges: DebateChallenge[];
}

// Lawmaker Broadcast & Content
export interface LawmakerBroadcastComment {
  id: string;
  authorName: string;
  authorRole: 'Citizen' | 'Politician';
  text: string;
  timestamp: string;
}

export interface LawmakerBroadcast {
  id: string;
  lawmakerId: string;
  lawmakerName: string;
  lawmakerRole: string;
  lawmakerParty: string;
  lawmakerState: string;
  title: string;
  content: string;
  timestamp: string;
  viewsCount: number;
  likesCount: number;
  comments: LawmakerBroadcastComment[];
}

export interface LegislativeMilestone {
  id: string;
  date: string;
  title: string;
  status: 'passed' | 'current' | 'upcoming';
  riskLevel: 'low' | 'medium' | 'high';
  riskLabel: string;
  iconType: 'calendar' | 'money' | 'vote' | 'alert' | 'flag';
  description: string;
  citizenAction: string;
}

export interface CountyOfficial {
  id: string;
  name: string;
  role: string;
  party: 'Democrat' | 'Republican' | 'Independent' | 'Non-Partisan';
  integrityScore: number;
  rating: 'A' | 'B' | 'C' | 'D' | 'F';
  salary: number;
  tenure: string;
  conflicts: string[];
  contributions: Array<{ donor: string; amount: number; category: string }>;
  recentActions: string[];
}

export interface LocalComplaint {
  id: string;
  county: string;
  state: string;
  title: string;
  category: 'Corruption' | 'Constitutional Violation' | 'Police Misconduct' | 'Open Records Denial' | 'Financial Waste' | 'Election Integrity';
  description: string;
  evidenceDescription?: string;
  status: 'Pending' | 'Under Investigation' | 'Verified' | 'Dismissed' | 'Public Exposed';
  dateSubmitted: string;
  reporterNotes?: string[];
  upvotes: number;
  submittedBy: string;
}




