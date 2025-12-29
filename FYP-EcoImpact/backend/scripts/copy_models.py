#!/usr/bin/env python3
"""
Copy Models Script
Copies trained ML models and encoders from ai-model/ML Model/ to backend/models/ and backend/encoders/
This script ensures models are properly placed for FastAPI backend usage.
"""

import shutil
from pathlib import Path
import sys

# Get project root (two levels up from backend/scripts/)
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent
ML_MODEL_DIR = PROJECT_ROOT / 'ai-model' / 'ML Model'
MODELS_DIR = BACKEND_DIR / 'models'
ENCODERS_DIR = BACKEND_DIR / 'encoders'

def copy_models():
    """Copy model files from ML Model directory to backend directories"""
    
    print("=" * 70)
    print("📦 COPYING ML MODELS TO BACKEND")
    print("=" * 70)
    print(f"Source: {ML_MODEL_DIR}")
    print(f"Models destination: {MODELS_DIR}")
    print(f"Encoders destination: {ENCODERS_DIR}")
    print()
    
    # Create directories if they don't exist
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    ENCODERS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Model file mappings: (source_name, dest_name, description)
    model_files = [
        ('revenue_model_gb.pkl', 'revenue_model_gb.pkl', 'Revenue prediction model'),
        ('success_model_gb.pkl', 'success_model_gb.pkl', 'Success probability model'),
    ]
    
    encoder_files = [
        ('revenue_encoders.pkl', 'encoders_direct.pkl', 'Revenue model encoders'),
        ('success_encoders.pkl', 'encoders_success.pkl', 'Success model encoders'),
    ]
    
    success_count = 0
    error_count = 0
    
    # Copy models
    print("🔹 Copying model files:")
    for src_name, dest_name, description in model_files:
        src_path = ML_MODEL_DIR / src_name
        dest_path = MODELS_DIR / dest_name
        
        if not src_path.exists():
            print(f"   ❌ {src_name} not found in {ML_MODEL_DIR}")
            error_count += 1
            continue
        
        file_size = src_path.stat().st_size
        if file_size == 0:
            print(f"   ⚠️  {src_name} is empty (0 bytes) - skipping")
            error_count += 1
            continue
        
        try:
            shutil.copy2(src_path, dest_path)
            print(f"   ✅ {dest_name} ({file_size / 1024:.1f} KB) - {description}")
            success_count += 1
        except Exception as e:
            print(f"   ❌ Error copying {src_name}: {e}")
            error_count += 1
    
    print()
    
    # Copy encoders
    print("🔹 Copying encoder files:")
    for src_name, dest_name, description in encoder_files:
        src_path = ML_MODEL_DIR / src_name
        dest_path = ENCODERS_DIR / dest_name
        
        if not src_path.exists():
            print(f"   ❌ {src_name} not found in {ML_MODEL_DIR}")
            error_count += 1
            continue
        
        file_size = src_path.stat().st_size
        if file_size == 0:
            print(f"   ⚠️  {src_name} is empty (0 bytes) - skipping")
            error_count += 1
            continue
        
        try:
            shutil.copy2(src_path, dest_path)
            print(f"   ✅ {dest_name} ({file_size} bytes) - {description}")
            success_count += 1
        except Exception as e:
            print(f"   ❌ Error copying {src_name}: {e}")
            error_count += 1
    
    print()
    print("=" * 70)
    if error_count == 0:
        print(f"✅ SUCCESS: Copied {success_count} files successfully!")
    else:
        print(f"⚠️  COMPLETED: {success_count} files copied, {error_count} errors")
    print("=" * 70)
    print()
    print("📋 Verification:")
    print(f"   Models directory: {MODELS_DIR}")
    print(f"   Encoders directory: {ENCODERS_DIR}")
    print()
    print("💡 Next steps:")
    print("   1. Restart FastAPI backend: uvicorn app:app --reload --port 8000")
    print("   2. Check health: http://localhost:8000/api/health")
    print("   3. Verify models_loaded: true in health response")
    print()
    
    return error_count == 0


if __name__ == '__main__':
    try:
        success = copy_models()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        sys.exit(1)


