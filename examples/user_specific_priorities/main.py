import json
import zen
import os
import glob

def load_json(path):
    with open(path, "r") as f:
        return json.load(f)

def load_jdm(path):
    with open(path, "r") as f:
        return f.read()

def main():
    # Initialize engine
    engine = zen.ZenEngine()
    
    # Determine base path relative to this script
    base_path = os.path.dirname(os.path.abspath(__file__))
    
    # Load Rule
    rule_path = os.path.join(base_path, "rule.json")
    if not os.path.exists(rule_path):
        print(f"Error: {rule_path} not found.")
        return

    jdm_content = load_jdm(rule_path)
    decision = engine.create_decision(jdm_content)
    
    # Process all data files
    data_dir = os.path.join(base_path, "data")
    data_files = glob.glob(os.path.join(data_dir, "*.json"))
    data_files.sort()
    
    print(f"--- Executing Rule: {rule_path} ---")
    
    for data_file in data_files:
        print(f"\nProcessing: {os.path.basename(data_file)}")
        input_data = load_json(data_file)
        
        try:
            result = decision.evaluate(input_data)
            print(f"User: {input_data.get('user_id')}")
            print(f"Result: {json.dumps(result, indent=2)}")
        except Exception as e:
            print(f"Error evaluating {data_file}: {e}")
            
    print("\n--- Execution Complete ---")

if __name__ == "__main__":
    main()
