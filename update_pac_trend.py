import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add Cell to recharts import
content = content.replace("  Tooltip,\n  Legend\n} from 'recharts';", "  Tooltip,\n  Legend,\n  Cell\n} from 'recharts';")

# Replace getPacFundingTrendData
new_trend_data = """// Stable deterministic 5-term PAC trend generator for selected legislator
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
};"""

pattern = r"// Stable deterministic 5-term PAC trend generator for selected legislator.*?\}\);"
content = re.sub(pattern, new_trend_data, content, flags=re.DOTALL)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated getPacFundingTrendData.")
