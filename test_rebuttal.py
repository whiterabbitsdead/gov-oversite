with open("src/App.tsx", "r") as f:
    text = f.read()

start = text.find("  const handleSimulateClaimAndPublish = async (legislatorId: string) => {")
end = text.find("  const handleGenerateMilestonePlan = async", start)
print(text[start:end])
