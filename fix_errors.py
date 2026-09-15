with open("server.ts", "r") as f:
    content = f.read()

content = content.replace('console.error("Watchdog analysis endpoint error, using graceful fallback:", error);', 'console.warn("Watchdog analysis endpoint error, using graceful fallback:", error.message);')
content = content.replace('console.error("Watchdog summarization endpoint error, using graceful fallback:", error);', 'console.warn("Watchdog summarization endpoint error, using graceful fallback:", error.message);')
content = content.replace('console.error("Watchdog custom question query error, using graceful fallback:", error);', 'console.warn("Watchdog custom question query error, using graceful fallback:", error.message);')
content = content.replace('console.error("AI Advisor error, using graceful fallback:", error);', 'console.warn("AI Advisor error, using graceful fallback:", error.message);')
content = content.replace('console.error("Legislator briefing error, using graceful fallback:", error);', 'console.warn("Legislator briefing error, using graceful fallback:", error.message);')
content = content.replace('console.error("Generate rebuttal error, using graceful fallback:", error);', 'console.warn("Generate rebuttal error, using graceful fallback:", error.message);')
content = content.replace('console.error("Generate milestone plan error, using graceful fallback:", error);', 'console.warn("Generate milestone plan error, using graceful fallback:", error.message);')
content = content.replace('console.error("Gemini county generator failed, using smart local generator", gemError);', 'console.warn("Gemini county generator failed, using smart local generator", gemError.message);')
content = content.replace('console.error("Local government audit lookup error:", err);', 'console.warn("Local government audit lookup error:", err.message);')

with open("server.ts", "w") as f:
    f.write(content)
print("Updated server.ts")
