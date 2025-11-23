# Reusability Demo

This example demonstrates how to use Zen Engine's **Decision Node** (Call Node) and **Loader** mechanism to create modular, reusable decision logic.

## Structure

*   **`router.json`**: The main entry point. It contains a `switchNode` that checks the user's `preference` ("fastest" or "cheapest") and routes the execution to the appropriate sub-decision.
*   **`fastest.json`**: A standalone JDM that selects the fastest partner.
*   **`cheapest.json`**: A standalone JDM that selects the cheapest partner.
*   **`main.py`**: The Python script that initializes the engine with a custom `loader` to resolve the sub-decisions by their filenames.

## How it works

1.  The `main.py` defines a `loader(key)` function that reads JSON files from the current directory.
2.  The engine is initialized with this loader: `zen.ZenEngine({"loader": loader})`.
3.  When `router.json` is evaluated, if it hits the "Select Fastest" node, the engine calls `loader("fastest.json")` to fetch and execute that rule.
4.  The result of the sub-decision becomes the result of the main decision (or can be mapped to a specific output field).

## Running the Demo

```bash
uv run python main.py
```

## Input Data

*   **`data/input_fastest.json`**: Sets `preference: "fastest"`.
*   **`data/input_cheapest.json`**: Sets `preference: "cheapest"`.
