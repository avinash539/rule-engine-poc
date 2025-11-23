# Eligible Partners Example

This example demonstrates how to filter network/delivery partners based on their service constraints.

## Partner Constraints

### Shreemaruti
- **Parcel Category**: `ecomm` or `courier`
- **Weight**: Less than 50kg

### Porter
- **Parcel Category**: `hyperlocal`
- **Weight**: Less than 20kg

### Bigship
- **Parcel Category**: `cargo`
- **Weight**: More than 30kg and less than 150kg

### Expressbees
- **Parcel Category**: `cargo`
- **Weight**: More than 50kg and less than 550kg

### DHL, Fedex, Aramax
- **Parcel Category**: `international`
- **Weight**: No restrictions

## Input Format

```json
{
    "tenant_id": "tenant_a",
    "user_id": "user_1",
    "order": {
        "order_id": "ORD001",
        "parcel_category": "ecomm",
        "weight": 25
    },
    "partners": [
        {
            "partner_code": "Shreemaruti",
            "name": "Shreemaruti Courier"
        },
        {
            "partner_code": "Porter",
            "name": "Porter Hyperlocal"
        }
    ]
}
```

## Output Format

```json
{
    "eligible_partners": [
        {
            "partner_code": "Shreemaruti",
            "name": "Shreemaruti Courier"
        }
    ],
    "total_eligible": 1,
    "order_details": {
        "parcel_category": "ecomm",
        "weight": 25
    }
}
```

## Test Cases

### 1. ecomm_25kg.json
- **Category**: ecomm
- **Weight**: 25kg
- **Expected**: Shreemaruti

### 2. hyperlocal_15kg.json
- **Category**: hyperlocal
- **Weight**: 15kg
- **Expected**: Porter

### 3. cargo_100kg.json
- **Category**: cargo
- **Weight**: 100kg
- **Expected**: Bigship, Expressbees

### 4. international_30kg.json
- **Category**: international
- **Weight**: 30kg
- **Expected**: DHL, Fedex, Aramax

### 5. cargo_40kg.json
- **Category**: cargo
- **Weight**: 40kg
- **Expected**: Bigship (not Expressbees as weight must be > 50kg)

### 6. courier_60kg_no_match.json
- **Category**: courier
- **Weight**: 60kg
- **Expected**: No eligible partners (Shreemaruti requires weight < 50kg)

## Usage

Run the example:
```bash
cd examples/eligible_partners
python main.py
```

Or using uv:
```bash
cd examples/eligible_partners
uv run python main.py
```
