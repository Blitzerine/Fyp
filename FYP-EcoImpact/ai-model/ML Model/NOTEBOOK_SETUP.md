# Notebook Setup Guide

## ✅ Changes Made to `model.ipynb`

### 1. **Kernel Verification Cell** (Cell 3)
   - Added after imports
   - Checks if using `backend/venv/Scripts/python.exe`
   - Verifies all required packages are installed
   - Shows clear warnings if wrong kernel is selected

### 2. **Dataset Loading Cell** (Cell 5)
   - Replaced absolute Desktop path with project-relative paths
   - Uses multiple path strategies to find the dataset
   - Provides helpful error messages if file not found
   - Path format: `ai-model/dataset/processed/ecoimpact_complete_dataset.csv`

---

## 📋 Setup Checklist

### Step 1: Select Correct Kernel
- [ ] Open Jupyter Notebook: `ai-model/ML Model/model.ipynb`
- [ ] Go to: **Kernel → Change Kernel**
- [ ] Select: **Python 3.11.9** (or the one pointing to `backend/venv/Scripts/python.exe`)
- [ ] If not listed, add it:
  - Go to: **Kernel → Change Kernel → Select Another Kernel → Browse**
  - Navigate to: `D:\Fyp\FYP-EcoImpact\backend\venv\Scripts\python.exe`

### Step 2: Verify Kernel
- [ ] Run **Cell 3** (Kernel Verification)
- [ ] Check output shows: `✅ CORRECT: Using backend virtual environment`
- [ ] Verify all packages show: `✅ pandas`, `✅ numpy`, `✅ matplotlib`, `✅ seaborn`, `✅ sklearn`

### Step 3: Verify Dataset Path
- [ ] Ensure CSV file exists at: `ai-model/dataset/processed/ecoimpact_complete_dataset.csv`
- [ ] Run **Cell 5** (Dataset Loading)
- [ ] Check output shows: `✅ Dataset loaded successfully!`
- [ ] Verify shape matches expected: `(2808, 25)` or similar

### Step 4: Run Notebook
- [ ] Run cells sequentially: **Kernel → Restart & Run All**
- [ ] Verify no errors occur
- [ ] Models should train and save successfully

---

## 🔧 Dataset Path Format

**Expected Location:**
```
FYP-EcoImpact/
  └── ai-model/
      ├── ML Model/
      │   └── model.ipynb          ← Notebook location
      └── dataset/
          └── processed/
              └── ecoimpact_complete_dataset.csv  ← Dataset location
```

**Relative Path from Notebook:**
- From `ai-model/ML Model/model.ipynb`
- To `ai-model/dataset/processed/ecoimpact_complete_dataset.csv`
- Path: `../dataset/processed/ecoimpact_complete_dataset.csv`

---

## 🐛 Troubleshooting

### Problem: "Not using backend venv" warning
**Solution:**
1. Go to: Kernel → Change Kernel
2. Select the Python environment that matches: `backend/venv/Scripts/python.exe`
3. If not available, install ipykernel in backend venv:
   ```bash
   cd backend
   .\venv\Scripts\python.exe -m pip install ipykernel
   .\venv\Scripts\python.exe -m ipykernel install --user --name=backend-venv
   ```
4. Restart Jupyter and select the new kernel

### Problem: "Dataset not found" error
**Solution:**
1. Verify file exists: `ai-model/dataset/processed/ecoimpact_complete_dataset.csv`
2. Check current working directory in Cell 5 output
3. If running from wrong directory, change to project root:
   ```python
   import os
   os.chdir(r'D:\Fyp\FYP-EcoImpact')
   ```

### Problem: ModuleNotFoundError for packages
**Solution:**
1. Ensure backend venv kernel is selected
2. Install missing packages:
   ```bash
   cd backend
   .\venv\Scripts\python.exe -m pip install pandas numpy matplotlib seaborn scikit-learn
   ```
3. Restart kernel: Kernel → Restart

---

## 📝 Code Cells Added

### Cell 3: Kernel Verification
```python
## ✅ Kernel Verification - Check Python Environment
# (Full code in notebook)
```

### Cell 5: Dataset Loading (Updated)
```python
## Load Dataset with Project-Relative Path
# (Full code in notebook)
```

---

## ✅ Verification Commands

Run these in order to verify setup:

1. **Check kernel:**
   ```python
   import sys
   print(sys.executable)  # Should show backend/venv/Scripts/python.exe
   ```

2. **Check dataset path:**
   ```python
   from pathlib import Path
   dataset_path = Path('../dataset/processed/ecoimpact_complete_dataset.csv').resolve()
   print(dataset_path.exists())  # Should be True
   ```

3. **Check packages:**
   ```python
   import pandas, numpy, matplotlib, seaborn, sklearn
   print("All packages imported successfully!")
   ```

---

## 🎯 Expected Output

When everything is correct, you should see:

```
======================================================================
🔍 KERNEL VERIFICATION
======================================================================
Python executable: D:\Fyp\FYP-EcoImpact\backend\venv\Scripts\python.exe
Python version: 3.11.9...

✅ CORRECT: Using backend virtual environment

📦 Checking required packages:
   ✅ pandas       2.1.3
   ✅ numpy        1.26.2
   ✅ matplotlib   3.10.8
   ✅ seaborn      0.13.2
   ✅ sklearn      1.3.2
======================================================================

======================================================================
📂 DATASET LOADING
======================================================================
Current working directory: D:\Fyp\FYP-EcoImpact\ai-model\ML Model

Looking for dataset at: D:\Fyp\FYP-EcoImpact\ai-model\dataset\processed\ecoimpact_complete_dataset.csv
File exists: True

✅ Dataset loaded successfully!
   Shape: 2808 rows × 25 columns
   File path: D:\Fyp\FYP-EcoImpact\ai-model\dataset\processed\ecoimpact_complete_dataset.csv
======================================================================
```


