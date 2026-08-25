with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("TrendingUp, ", "TrendingUp, \n  TrendingDown, \n  Minus, ")

with open("src/App.tsx", "w") as f:
    f.write(content)
