import { DebatePost, LawmakerBroadcast } from './types';

export const PRELOADED_DEBATES: DebatePost[] = [
  {
    id: "debate-1",
    title: "Should stock trading be banned for active members of Congress?",
    category: "Conflict of Interest",
    mainArgument: "Active representatives routinely receive non-public intelligence during classified intelligence committee briefings. Allowing them or their spouses to trade individual stocks creates an irreconcilable conflict of interest, eroding public trust in democratic systems.",
    authorName: "Marcus Vance",
    authorVoterState: "OH",
    authorRole: "Citizen",
    timestamp: "2026-07-01T14:30:00Z",
    supportCount: 420,
    discreditCount: 15,
    appealCount: 110,
    challenges: [
      {
        id: "challenge-1-1",
        authorName: "Elizabeth Warren",
        authorVoterState: "MA",
        authorRole: "Politician",
        type: "appeal",
        argumentText: "We need the ETHICS Act immediately. Our job is to represent the American people, not our personal stock portfolios. When representatives trade stocks while sitting on committees regulating those same companies, it is a direct conflict.",
        evidenceLinks: ["https://www.congress.gov/bill/ethics-act"],
        timestamp: "2026-07-02T09:15:00Z",
        upvotes: 280
      },
      {
        id: "challenge-1-2",
        authorName: "David Sterling",
        authorVoterState: "TX",
        authorRole: "Citizen",
        type: "challenge",
        argumentText: "While I agree in spirit, total bans might deter highly qualified financial professionals from running for public office. We should instead mandate blind trusts for all liquid assets during their tenure.",
        evidenceLinks: [],
        timestamp: "2026-07-02T18:45:00Z",
        upvotes: 45
      }
    ]
  },
  {
    id: "debate-2",
    title: "Are super PAC contributions equivalent to voter silencing?",
    category: "PAC Funding",
    mainArgument: "When corporate super PACs pump millions of dollars into primary races, small-dollar individual contributions are effectively drowned out. Representatives become beholden to billionaire donors rather than the working-class citizens who elect them.",
    authorName: "Elena Rostova",
    authorVoterState: "PA",
    authorRole: "Citizen",
    timestamp: "2026-06-29T10:00:00Z",
    supportCount: 512,
    discreditCount: 38,
    appealCount: 95,
    challenges: [
      {
        id: "challenge-2-1",
        authorName: "Bradford Sterling",
        authorVoterState: "DE",
        authorRole: "Citizen",
        type: "discredit",
        argumentText: "This argument ignores Supreme Court precedent in Citizens United. Political spending is protected speech under the First Amendment. Restricting associations from expressing their policy alignment violates basic civil liberties.",
        evidenceLinks: ["https://www.oyez.org/cases/2008/08-205"],
        timestamp: "2026-06-30T11:20:00Z",
        upvotes: 62
      },
      {
        id: "challenge-2-2",
        authorName: "Sarah Jenkins",
        authorVoterState: "WI",
        authorRole: "Citizen",
        type: "appeal",
        argumentText: "Our OpenFEC analysis of representatives shows that those with less than 15% small-dollar contributions are twice as likely to vote against bipartisan consumer protection acts. Follow the money!",
        evidenceLinks: [],
        timestamp: "2026-07-01T15:10:00Z",
        upvotes: 189
      }
    ]
  },
  {
    id: "debate-3",
    title: "Does high legislative effectiveness correlate with policy compromise?",
    category: "CEL Performance",
    mainArgument: "The Center for Effective Lawmaking (CEL) database shows that the most effective legislators (those who move bills out of committee and get them signed into law) are almost always those who engage in bipartisan compromise. Ideological purity is the enemy of actual lawmaking.",
    authorName: "Prof. Alan Fletcher",
    authorVoterState: "VA",
    authorRole: "Citizen",
    timestamp: "2026-07-02T08:00:00Z",
    supportCount: 230,
    discreditCount: 45,
    appealCount: 67,
    challenges: [
      {
        id: "challenge-3-1",
        authorName: "John Smith",
        authorVoterState: "KY",
        authorRole: "Politician",
        type: "challenge",
        argumentText: "Bipartisanship is noble, but sometimes compromise dilutes critical environmental or consumer safety regulations to the point of uselessness. We shouldn't measure success merely by bill quantity, but by the material protection it provides.",
        evidenceLinks: [],
        timestamp: "2026-07-02T12:30:00Z",
        upvotes: 112
      }
    ]
  }
];

export const PRELOADED_BROADCASTS: LawmakerBroadcast[] = [
  {
    id: "broadcast-1",
    lawmakerId: "S000033",
    lawmakerName: "Bernie Sanders",
    lawmakerRole: "Senator",
    lawmakerParty: "Independent",
    lawmakerState: "VT",
    title: "Taking On Wall Street and Corporate Greed in Campaign Financing",
    content: "The current system is corrupt. We have a campaign finance system that allows billionaires and large corporations to buy elections. My campaign has been proudly funded by millions of small-dollar contributions averaging just $27. That is how we rebuild trust. We must pass constitutional amendments to overturn Citizens United and establish public funding of elections so that our representatives represent you, not big money interests.",
    timestamp: "2026-07-03T16:45:00Z",
    viewsCount: 1240,
    likesCount: 840,
    comments: [
      {
        id: "bc-comment-1-1",
        authorName: "Regina Thompson",
        authorRole: "Citizen",
        text: "Thank you Senator! The small-dollar ratio feature on your profile shows 74% small contributions. Truly grassroots.",
        timestamp: "2026-07-03T17:10:00Z"
      },
      {
        id: "bc-comment-1-2",
        authorName: "Harold Miller",
        authorRole: "Citizen",
        text: "Is public funding really feasible without raising taxes? That's my main concern.",
        timestamp: "2026-07-03T18:20:00Z"
      }
    ]
  },
  {
    id: "broadcast-2",
    lawmakerId: "P000197",
    lawmakerName: "Nancy Pelosi",
    lawmakerRole: "Representative",
    lawmakerParty: "Democrat",
    lawmakerState: "CA",
    title: "Defending Democratic Institutions & Enhancing Semiconductor Self-Reliance",
    content: "Our work on the CHIPS and Science Act represents a monumental investment in American ingenuity and manufacturing. By onshoring our high-tech supply chains, we ensure both national security and high-paying jobs for American workers. We must continue to support innovation, research, and technical education across all states to out-compete foreign industrial monoliths.",
    timestamp: "2026-07-02T10:30:00Z",
    viewsCount: 950,
    likesCount: 320,
    comments: [
      {
        id: "bc-comment-2-1",
        authorName: "Liam O'Connor",
        authorRole: "Citizen",
        text: "The CHIPS Act is great, but we need more transparency surrounding personal stock option trades of committee members' spouses during legislative markups.",
        timestamp: "2026-07-02T11:15:00Z"
      }
    ]
  }
];
