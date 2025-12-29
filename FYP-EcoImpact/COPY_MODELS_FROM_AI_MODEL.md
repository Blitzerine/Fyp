# Quick Fix: Copy Models from ai-model to backend

If you already have models saved in `ai-model/ML Model/` directory, you can copy them:

## Option 1: Manual Copy (Windows)

```powershell
cd D:\Fyp\FYP-EcoImpact

# Copy models
Copy-Item "ai-model\ML Model\revenue_model_gb.pkl" "backend\models\" -Force
Copy-Item "ai-model\ML Model\success_model_gb.pkl" "backend\models\" -Force

# Copy encoders
Copy-Item "ai-model\ML Model\revenue_encoders.pkl" "backend\encoders\encoders_direct.pkl" -Force
Copy-Item "ai-model\ML Model\success_encoders.pkl" "backend\encoders\encoders_success.pkl" -Force
```

## Option 2: Run All Training Cells First

If the variables don't exist, you need to:

1. **Restart the kernel** (Kernel → Restart)
2. **Run ALL cells from the beginning** (Cell → Run All)
3. **Then run the save code cell**

This will ensure all variables (`gb_direct`, `gb_success_final`, `encoders_direct`, `encoders_success`) are defined.

## Option 3: Check if Variables Exist

Before running the save code, check if variables exist:

```python
# Check if variables exist
try:
    print(f"gb_direct: {type(gb_direct)}")
    print(f"gb_success_final: {type(gb_success_final)}")
    print(f"encoders_direct: {type(encoders_direct)}")
    print(f"encoders_success: {type(encoders_success)}")
    print("\n✅ All variables exist! You can run the save code.")
except NameError as e:
    print(f"❌ Variable not found: {e}")
    print("You need to run the training cells first.")
```



