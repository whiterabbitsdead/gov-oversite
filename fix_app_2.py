import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target = "updateBackgroundTask(taskId, { status: 'complete', result: data.answer });"
new_target = "updateBackgroundTask(taskId, { status: 'complete', result: data });"
content = content.replace(target, new_target)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated App.tsx updateBackgroundTask")
