from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from zen import ZenEngine
from typing import Dict, Any
import os
import glob
import json

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../examples"))

class RuleContent(BaseModel):
    content: dict

@app.get("/api/rules")
def list_rules():
    """List all rule.json files in the examples directory."""
    rules = []
    # Search for all rule.json files recursively
    for root, dirs, files in os.walk(BASE_DIR):
        if "rule.json" in files:
            rel_path = os.path.relpath(os.path.join(root, "rule.json"), BASE_DIR)
            rules.append({
                "name": os.path.basename(root),
                "path": rel_path
            })
    return rules

@app.get("/api/rules/{path:path}/data/{filename}")
def get_test_data(path: str, filename: str):
    """Get content of a specific test data file."""
    rule_dir = os.path.dirname(os.path.join(BASE_DIR, path))
    data_file = os.path.join(rule_dir, "data", filename)
    
    if not os.path.exists(data_file):
        raise HTTPException(status_code=404, detail="Data file not found")
        
    try:
        with open(data_file, "r") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/rules/{path:path}/data")
def list_test_data(path: str):
    """List all test data files for a specific rule."""
    # Rule path is like "fastest_partner/rule.json"
    # Data dir is "fastest_partner/data"
    rule_dir = os.path.dirname(os.path.join(BASE_DIR, path))
    data_dir = os.path.join(rule_dir, "data")
    
    if not os.path.exists(data_dir):
        return []
        
    files = []
    for f in os.listdir(data_dir):
        if f.endswith(".json"):
            files.append(f)
    return sorted(files)

@app.get("/api/rules/{path:path}")
def get_rule(path: str):
    """Get the content of a specific rule file."""
    full_path = os.path.join(BASE_DIR, path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Rule not found")
    
    try:
        with open(full_path, "r") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rules/{path:path}")
def save_rule(path: str, rule: RuleContent):
    """Save the content of a specific rule file."""
    full_path = os.path.join(BASE_DIR, path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Rule not found")
    
    try:
        with open(full_path, "w") as f:
            json.dump(rule.content, f, indent=2)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



class SimulateRequest(BaseModel):
    content: Dict[str, Any]
    context: Dict[str, Any]

@app.post("/api/simulate")
async def simulate_rule(request: SimulateRequest):
    try:
        engine = ZenEngine()
        # Evaluate with trace=True to get execution details
        # Evaluate with trace=True to get execution details
        content_str = json.dumps(request.content)
        decision = engine.create_decision(content_str)
        result = decision.evaluate(request.context, opts={"trace": True})
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
