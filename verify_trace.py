import zen
import json

engine = zen.ZenEngine()

content = {
    "nodes": [
        {"id": "input", "type": "inputNode", "name": "Input"},
        {"id": "output", "type": "outputNode", "name": "Output"}
    ],
    "edges": [
        {"id": "e1", "sourceId": "input", "targetId": "output", "type": "edge"}
    ]
}

context = {}

try:
    print("Evaluating with opts={'trace': True}...")
    result = engine.evaluate(content, context, opts={"trace": True})
    print("Result keys:", result.keys())
    if "trace" in result:
        print("Trace found!")
    else:
        print("Trace NOT found in result.")
        print("Result:", result)
except Exception as e:
    print("Error:", e)
