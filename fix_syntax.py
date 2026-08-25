import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Replace from `    } catch (err) {`
# to `    setCustomRedressStatement('');`
# which corresponds to lines 814 to 830

pattern = re.compile(r'    \} catch \(err\) \{\n      console\.error\(err\);\n      updateBackgroundTask\(taskId, \{ status: \'error\', error: "Failed to generate AI rebuttal\." \}\);\n    \}\n  \};\n        \}\n        return l;\n      \}\);\n      try \{\n        localStorage\.setItem\(\'watchdog_legislators\', JSON\.stringify\(updated\)\);\n      \} catch \(e\) \{\n        console\.error\(e\);\n      \}\n      return updated;\n    \}\);\n')
content = pattern.sub(r'    } catch (err) {\n      console.error(err);\n      updateBackgroundTask(taskId, { status: \'error\', error: "Failed to generate AI rebuttal." });\n    }\n  };\n', content)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Fixed syntax.")
