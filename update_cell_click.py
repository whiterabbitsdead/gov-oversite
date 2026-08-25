import re

with open("src/App.tsx", "r") as f:
    content = f.read()

replacement = """                                  const isAnomaly = entry.pacFunding > avg * 1.35 || entry.pacFunding < avg * 0.65;
                                  return (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={fill} 
                                      cursor={isAnomaly ? "pointer" : "default"}
                                      onClick={() => {
                                        if (isAnomaly) {
                                          handleAnomalyClick(entry, avg, trendLegislator);
                                        }
                                      }}
                                    />
                                  );"""

content = content.replace("                                  return <Cell key={`cell-${index}`} fill={fill} />;", replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated Cell with onClick.")
