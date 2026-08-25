import re

with open("server.ts", "r") as f:
    content = f.read()

officials_insert = """
    "el_dorado_ca": [
      {
        id: "eld-1",
        name: "Jeff Leikauf",
        role: "County Sheriff",
        party: "Non-Partisan",
        integrityScore: 65,
        rating: "C",
        salary: 185000,
        tenure: "Current Term",
        conflicts: ["Former Sheriff John D'Agostini, who endorsed him and helped him win the election, has publicly demanded his resignation citing 'buyer's remorse' and policy disagreements."],
        contributions: [
          { donor: "El Dorado County Deputy Sheriff's Association", amount: 15000, category: "Union Lobbying" },
          { donor: "Former Sheriff Support PAC", amount: 10000, category: "Individual/PAC" }
        ],
        recentActions: ["Publicly stated he will not resign and intends to fulfill his elected term.", "Managing department amidst intense political pressure from predecessor."]
      }
    ],
"""

# Insert into preseededCountyOfficials
content = re.sub(r'  const preseededCountyOfficials: Record<string, CountyOfficial\[\]> = \{', 
                 '  const preseededCountyOfficials: Record<string, CountyOfficial[]> = {\n' + officials_insert, 
                 content)

complaint_insert = """
    {
      id: "comp-eld-1",
      county: "El Dorado County",
      state: "California",
      title: "Sheriff Succession Dispute and Department Instability",
      category: "Corruption",
      description: "The current Sheriff is being asked to step down by the former Sheriff who heavily campaigned to help him win the election. This highly public political dispute over leadership direction has raised concerns about departmental stability and the influence of predecessors on elected officials.",
      evidenceDescription: "Public letters and local news coverage of former Sheriff D'Agostini demanding Sheriff Leikauf's resignation.",
      status: "Public Exposed",
      dateSubmitted: "2026-08-18",
      reporterNotes: [
        "Verified public demands for resignation. Sheriff Leikauf confirmed he will remain in office."
      ],
      upvotes: 112,
      submittedBy: "NorCal Civic Observer"
    },
"""

# Insert into localComplaintsDb
content = re.sub(r'  let localComplaintsDb: LocalComplaint\[\] = \[', 
                 '  let localComplaintsDb: LocalComplaint[] = [\n' + complaint_insert, 
                 content)

with open("server.ts", "w") as f:
    f.write(content)

print("El Dorado info added.")
