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
    print("Testing engine.create_decision(content).evaluate(ctx)...")
    content_str = json.dumps(content)
    decision = engine.create_decision(content_str)
    result = decision.evaluate(context, opts={"trace": True})
    print("Result keys:", result.keys())
    if "trace" in result:
        print("Trace found!")
    else:
        print("Trace NOT found in result.")
except Exception as e:
    print("Error:", e)
