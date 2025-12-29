"""
Script to save ML models and encoders from Jupyter notebook
Run this AFTER training your models in the notebook
"""

import pickle
import sys
from pathlib import Path

# Get the backend directory
BASE_DIR = Path(__file__).parent
MODELS_DIR = BASE_DIR / 'models'
ENCODERS_DIR = BASE_DIR / 'encoders'

# Create directories if they don't exist
MODELS_DIR.mkdir(parents=True, exist_ok=True)
ENCODERS_DIR.mkdir(parents=True, exist_ok=True)

print("=" * 60)
print("Save ML Models and Encoders")
print("=" * 60)
print(f"\nSaving to:")
print(f"  Models: {MODELS_DIR}")
print(f"  Encoders: {ENCODERS_DIR}\n")

# Try to import from notebook (if running in same Python session)
# Otherwise, this script needs to be run from the notebook with %run

try:
    # Common variable names - adjust if your notebook uses different names
    import __main__
    
    # Try to get model variables from __main__ namespace
    # Replace these with your actual variable names
    revenue_model = None
    success_model = None
    encoders_direct = None
    encoders_success = None
    
    # Try common variable names
    possible_revenue_names = ['gb_direct', 'revenue_model', 'revenue_gb', 'gb_revenue']
    possible_success_names = ['gb_success_final', 'success_model', 'success_gb', 'gb_success']
    possible_encoder_direct_names = ['encoders_direct', 'encoders_revenue', 'label_encoders_direct']
    possible_encoder_success_names = ['encoders_success', 'encoders_success_final', 'label_encoders_success']
    
    # Try to find revenue model
    for name in possible_revenue_names:
        if hasattr(__main__, name):
            revenue_model = getattr(__main__, name)
            print(f"✓ Found revenue model: {name}")
            break
    
    # Try to find success model
    for name in possible_success_names:
        if hasattr(__main__, name):
            success_model = getattr(__main__, name)
            print(f"✓ Found success model: {name}")
            break
    
    # Try to find encoders
    for name in possible_encoder_direct_names:
        if hasattr(__main__, name):
            encoders_direct = getattr(__main__, name)
            print(f"✓ Found encoders_direct: {name}")
            break
    
    for name in possible_encoder_success_names:
        if hasattr(__main__, name):
            encoders_success = getattr(__main__, name)
            print(f"✓ Found encoders_success: {name}")
            break
    
    # Save models if found
    if revenue_model:
        with open(MODELS_DIR / 'revenue_model_gb.pkl', 'wb') as f:
            pickle.dump(revenue_model, f)
        print(f"\n✅ Saved revenue model to {MODELS_DIR / 'revenue_model_gb.pkl'}")
    else:
        print("\n❌ Revenue model not found. Please check variable names.")
        print(f"   Looked for: {possible_revenue_names}")
    
    if success_model:
        with open(MODELS_DIR / 'success_model_gb.pkl', 'wb') as f:
            pickle.dump(success_model, f)
        print(f"✅ Saved success model to {MODELS_DIR / 'success_model_gb.pkl'}")
    else:
        print("❌ Success model not found. Please check variable names.")
        print(f"   Looked for: {possible_success_names}")
    
    if encoders_direct:
        with open(ENCODERS_DIR / 'encoders_direct.pkl', 'wb') as f:
            pickle.dump(encoders_direct, f)
        print(f"✅ Saved encoders_direct to {ENCODERS_DIR / 'encoders_direct.pkl'}")
    else:
        print("❌ encoders_direct not found. Please check variable names.")
        print(f"   Looked for: {possible_encoder_direct_names}")
    
    if encoders_success:
        with open(ENCODERS_DIR / 'encoders_success.pkl', 'wb') as f:
            pickle.dump(encoders_success, f)
        print(f"✅ Saved encoders_success to {ENCODERS_DIR / 'encoders_success.pkl'}")
    else:
        print("❌ encoders_success not found. Please check variable names.")
        print(f"   Looked for: {possible_encoder_success_names}")
    
    print("\n" + "=" * 60)
    if revenue_model and success_model and encoders_direct and encoders_success:
        print("✅ All models and encoders saved successfully!")
    else:
        print("⚠️  Some models/encoders were not saved. Please check above.")
    print("=" * 60)

except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nThis script needs to be run from your Jupyter notebook.")
    print("Add this code to a new cell in your notebook instead:")
    print("-" * 60)
    print(__doc__)



