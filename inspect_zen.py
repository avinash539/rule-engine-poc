import zen
import inspect

print("ZenEngine methods:")
print(dir(zen.ZenEngine))

try:
    print("\nHelp on evaluate:")
    help(zen.ZenEngine.evaluate)
except:
    print("Could not get help on evaluate")

try:
    print("\nSignature of evaluate:")
    print(inspect.signature(zen.ZenEngine.evaluate))
except:
    print("Could not get signature of evaluate")
