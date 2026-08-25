import re

with open("src/App.tsx", "r") as f:
    content = f.read()

states = """  // AI Legislator Briefing States
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
  };"""

content = content.replace("""  // AI Legislator Briefing States
  const [activeBriefingLegislator, setActiveBriefingLegislator] = useState<any | null>(null);
  const [briefingText, setBriefingText] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);""", states)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Added findings state and handler.")
