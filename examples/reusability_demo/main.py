import zen
import json
import os
import glob
import traceback

def main():
    base_path = os.path.dirname(os.path.abspath(__file__))
    
    def loader(key):
        # Load referenced JDM files
        # The key comes from the decisionNode content, e.g. "fastest.json"
        path = os.path.join(base_path, key)
        if not os.path.exists(path):
            raise Exception(f"File not found: {path}")
        with open(path, 'r') as f:
            return f.read()

    # Initialize engine with loader
    engine = zen.ZenEngine({"loader": loader})
    
    # Load Main Router Rule
    router_path = os.path.join(base_path, "router.json")
    if not os.path.exists(router_path):
        print(f"Error: {router_path} not found.")
        return

    with open(router_path, 'r') as f:
        router_content = f.read()

    try:
        decision = engine.create_decision(router_content)
    except Exception as e:
        print(f"Error creating decision: {e}")
        return
    
    # Process all data files
    data_dir = os.path.join(base_path, "data")
    data_files = glob.glob(os.path.join(data_dir, "*.json"))
    data_files.sort()
    
    print(f"--- Executing Reusability Demo: {router_path} ---")
    
    for data_file in data_files:
        print(f"\nProcessing: {os.path.basename(data_file)}")
        with open(data_file, 'r') as f:
            input_data = json.load(f)
        
        try:
            result = decision.evaluate(input_data)
            print(f"Preference: {input_data.get('preference')}")
            print(f"Result: {json.dumps(result, indent=2)}")
        except Exception as e:
            print(f"Error evaluating {data_file}: {e}")
            traceback.print_exc()
            
    print("\n--- Execution Complete ---")

if __name__ == "__main__":
    main()
