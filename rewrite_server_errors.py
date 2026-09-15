import re

with open("server.ts", "r") as f:
    content = f.read()

# Watchdog Analysis
content = re.sub(
    r'catch \(error: any\) \{\s*console\.warn\("Watchdog analysis endpoint error[^)]*\);\s*return res\.json\(\{\s*analysis:.*?\s*usingDemoFallback: true\s*\}\);\s*\}',
    r'catch (error: any) {\n      console.warn("Watchdog analysis endpoint error:", error.message);\n      return res.status(503).json({ error: "AI Service is temporarily unavailable or overloaded. Please try again later." });\n    }',
    content,
    flags=re.DOTALL
)

# Watchdog Summarization
content = re.sub(
    r'catch \(error: any\) \{\s*console\.warn\("Watchdog summarization endpoint error[^)]*\);.*?usingDemoFallback: true\s*\}\);\s*\}',
    r'catch (error: any) {\n      console.warn("Watchdog summarization endpoint error:", error.message);\n      return res.status(503).json({ error: "AI Service is temporarily unavailable or overloaded. Please try again later." });\n    }',
    content,
    flags=re.DOTALL
)

# Watchdog Ask
content = re.sub(
    r'catch \(error: any\) \{\s*console\.warn\("Watchdog custom question query error[^)]*\);.*?usingDemoFallback: true\s*\}\);\s*\}',
    r'catch (error: any) {\n      console.warn("Watchdog custom question query error:", error.message);\n      return res.status(503).json({ error: "AI Service is temporarily unavailable or overloaded. Please try again later." });\n    }',
    content,
    flags=re.DOTALL
)

# AI Advisor
content = re.sub(
    r'catch \(error: any\) \{\s*console\.warn\("AI Advisor error, using graceful fallback[^)]*\);.*?return res\.json\(\{.*?\}\);\s*\}',
    r'catch (error: any) {\n      console.warn("AI Advisor error:", error.message);\n      return res.status(503).json({ error: "AI Advisor is temporarily unavailable or overloaded. Please try again later." });\n    }',
    content,
    flags=re.DOTALL
)

# Legislator Briefing
content = re.sub(
    r'catch \(error: any\) \{\s*console\.warn\("Legislator briefing error, using graceful fallback[^)]*\);.*?return res\.json\(\{.*?\}\);\s*\}',
    r'catch (error: any) {\n      console.warn("Legislator briefing error:", error.message);\n      return res.status(503).json({ error: "Briefing service is temporarily unavailable. Please try again later." });\n    }',
    content,
    flags=re.DOTALL
)

# Generate Rebuttal
content = re.sub(
    r'catch \(error: any\) \{\s*console\.warn\("Generate rebuttal error, using graceful fallback[^)]*\);.*?return res\.json\(\{.*?\}\);\s*\}',
    r'catch (error: any) {\n      console.warn("Generate rebuttal error:", error.message);\n      return res.status(503).json({ error: "AI generation service is temporarily unavailable. Please try again later." });\n    }',
    content,
    flags=re.DOTALL
)

# Generate Milestone Plan
content = re.sub(
    r'catch \(error: any\) \{\s*console\.warn\("Generate milestone plan error, using graceful fallback[^)]*\);.*?return res\.json\(\{.*?\}\);\s*\}',
    r'catch (error: any) {\n      console.warn("Generate milestone plan error:", error.message);\n      return res.status(503).json({ error: "AI generation service is temporarily unavailable. Please try again later." });\n    }',
    content,
    flags=re.DOTALL
)

with open("server.ts", "w") as f:
    f.write(content)

print("Rewrote server.ts")
