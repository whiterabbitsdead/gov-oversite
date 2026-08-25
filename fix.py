with open("src/App.tsx", "r") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Clear Filter Constraints" in line:
        start_idx = i
        break

# The lines we want to replace are from start_idx - 1 to start_idx + 8
new_lines = [
    '                  <button\n',
    '                    onClick={handleResetFilters}\n',
    '                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors"\n',
    '                  >\n',
    '                    Clear Filter Constraints\n',
    '                  </button>\n',
    '                </div>\n',
    '              )}\n',
    '            </div>\n',
    '          </div>\n',
    '          )}\n',
    '        </div>\n',
    '        )}\n',
    '\n',
    '        {/* Tab 2: AI Legislative Watchdog Hub */}\n'
]

end_idx = start_idx + 10 # approximate
for i in range(start_idx, len(lines)):
    if "Tab 2: AI Legislative Watchdog Hub" in lines[i]:
        end_idx = i
        break

lines = lines[:start_idx - 3] + new_lines + lines[end_idx + 1:]

with open("src/App.tsx", "w") as f:
    f.writelines(lines)
