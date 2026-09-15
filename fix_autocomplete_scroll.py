import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target = """                            onClick={() => {
                              setSearch(leg.name);
                              handleAddRecentSearch(leg.name);
                              setSearchFocused(false);
                            }}"""

replacement = """                            onClick={() => {
                              setSearch(leg.name);
                              handleAddRecentSearch(leg.name);
                              setSearchFocused(false);
                              
                              // Small timeout to allow the filter state to flush and re-render the list if needed
                              setTimeout(() => {
                                const cardElement = document.getElementById(`card-${leg.legislator_id}`);
                                if (cardElement) {
                                  // Add a highlight class temporarily
                                  cardElement.classList.add('ring-4', 'ring-indigo-500', 'ring-offset-4', 'ring-offset-slate-950');
                                  
                                  // Scroll into view centering it
                                  cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  
                                  // Remove highlight after 2 seconds
                                  setTimeout(() => {
                                    cardElement.classList.remove('ring-4', 'ring-indigo-500', 'ring-offset-4', 'ring-offset-slate-950');
                                  }, 2000);
                                }
                              }, 100);
                            }}"""

content = content.replace(target, replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Added smooth scrolling logic")
