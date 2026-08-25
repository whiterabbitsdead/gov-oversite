import re

with open("src/components/RepresentativeCard.tsx", "r") as f:
    content = f.read()

props_replacement = """  alignmentScore?: number;
  onShowBriefing?: (legislator: Legislator) => void;
  compareMode?: boolean;
  isSelectedForCompare?: boolean;
  onToggleCompare?: (legislatorId: string) => void;
  key?: React.Key;
}

export function RepresentativeCard({ 
  legislator, 
  customFlags = [], 
  isFavorite = false, 
  onToggleFavorite, 
  alignmentScore,
  onShowBriefing,
  compareMode = false,
  isSelectedForCompare = false,
  onToggleCompare
}: RepresentativeCardProps) {"""

content = re.sub(r'  alignmentScore\?: number;\n  onShowBriefing\?: \(legislator: Legislator\) => void;\n  key\?: React\.Key;\n\}\n\nexport function RepresentativeCard\(\{\s+legislator,\s+customFlags = \[\],\s+isFavorite = false,\s+onToggleFavorite,\s+alignmentScore,\s+onShowBriefing\n\}: RepresentativeCardProps\) \{', props_replacement, content)

with open("src/components/RepresentativeCard.tsx", "w") as f:
    f.write(content)

print("Updated RepresentativeCardProps")
