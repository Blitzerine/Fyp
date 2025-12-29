# How to Change Jupyter Notebook Kernel

## ✅ Kernel Registered Successfully!

The backend virtual environment is now registered as a Jupyter kernel:
- **Kernel Name:** `backend-venv`
- **Display Name:** `Python (backend-venv)`
- **Python Path:** `D:\Fyp\FYP-EcoImpact\backend\venv\Scripts\python.exe`

---

## 🔄 Steps to Change Kernel in Jupyter Notebook

### Method 1: Using the Notebook UI

1. **Open your notebook:** `ai-model/ML Model/model.ipynb`

2. **Change Kernel:**
   - Look at the **top-right corner** of the notebook
   - Click on the **kernel name** (usually shows "Python 3" or similar)
   - Select: **"Python (backend-venv)"**
   
   OR
   
   - Go to menu: **Kernel → Change Kernel → Python (backend-venv)**

3. **Verify:**
   - Restart kernel: **Kernel → Restart**
   - Run Cell 3 (Kernel Verification)
   - Should show: `✅ CORRECT: Using backend virtual environment`

---

### Method 2: Using Jupyter Notebook Classic UI

1. In the notebook, go to: **Kernel → Change Kernel**
2. Select: **Python (backend-venv)**
3. The kernel indicator (top-right) should update

---

### Method 3: VS Code / Jupyter Extension

1. Look at the **top-right corner** for kernel selector
2. Click on it
3. Select: **Python (backend-venv)** or **backend-venv**

---

## ✅ Verification

After changing the kernel, run Cell 3 (Kernel Verification):

```python
## ✅ Kernel Verification - Check Python Environment
```

**Expected Output:**
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
```

---

## 🐛 Troubleshooting

### Problem: Kernel "Python (backend-venv)" not showing up

**Solution:**
1. Close and reopen Jupyter/VS Code
2. Or re-register the kernel:
   ```bash
   cd backend
   .\venv\Scripts\python.exe -m ipykernel install --user --name=backend-venv --display-name="Python (backend-venv)" --force
   ```

### Problem: Still getting ModuleNotFoundError

**Solution:**
1. Verify kernel is changed: Check top-right corner shows "Python (backend-venv)"
2. Restart kernel: **Kernel → Restart**
3. Run Cell 3 to verify environment
4. If still failing, check sys.executable in a new cell:
   ```python
   import sys
   print(sys.executable)
   # Should show: D:\Fyp\FYP-EcoImpact\backend\venv\Scripts\python.exe
   ```

---

## 📝 Quick Reference

**Current Issue:** ModuleNotFoundError for matplotlib
**Cause:** Notebook using wrong Python environment
**Fix:** Change kernel to "Python (backend-venv)"

**Kernel Location:** `C:\Users\UCPBl\AppData\Roaming\jupyter\kernels\backend-venv`
**Python Path:** `D:\Fyp\FYP-EcoImpact\backend\venv\Scripts\python.exe`


