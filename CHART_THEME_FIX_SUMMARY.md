# Chart Color Mixing Fix - Summary

## ✅ Problem Fixed
When toggling theme (dark ↔ bright) while a chart is visible, chart colors were mixing (old + new theme) because chart instances were being reused instead of fully recreated.

## ✅ Solution Implemented

### 1. Force Full Chart Re-creation on Theme Change

**Approach**: Used `useMemo` to rebuild all chart data and layout objects when theme changes, combined with `key={theme}` on Plot components.

**Files Updated**:
- `frontend/src/pages/simulate/components/ProjectionsSection.jsx`
- `frontend/src/pages/simulate/components/FinancialSection.jsx`
- `frontend/src/pages/simulate/components/EnvironmentalSection.jsx`
- `frontend/src/pages/simulate/components/RiskSection.jsx`

**Changes**:
- Wrapped all chart data arrays in `useMemo(() => [...], [dependencies, chartTheme, theme])`
- Wrapped all chart layout objects in `useMemo(() => ({...}), [chartTheme, theme])`
- All Plot components already have `key={theme}` prop to force React remount

### 2. Recompute Chart Options from Theme Variables

**Updated**: `frontend/src/utils/chartTheme.js`
- Improved CSS variable reading with helper function
- Added `tooltipBorder` property
- Added `success` color to seriesColors
- All colors now read from CSS variables with proper fallbacks

### 3. Chart Color Rules

**Dark Theme**:
- Background: `--page-bg: #070A08` (near black)
- Grid: `--border: rgba(70,255,160,0.15)` (dark green/muted)
- Text: `--text: #EAF4EE` (light grey)
- Accent: `--accent-primary: #46FFA0` (neon green)

**Bright Theme**:
- Background: `--page-bg: #EAF6FF` (sky blue)
- Grid: `--border: rgba(11, 61, 46, 0.20)` (light grey)
- Text: `--text: #0B0F0C` (dark)
- Accent: `--accent-primary: #0B3D2E` (dark green)

**No hardcoded colors**: All colors come from CSS variables via `getChartTheme()`

## ✅ Implementation Details

### Chart Components Updated:

1. **ProjectionsSection.jsx**
   - `revenueCo2Data` - wrapped in useMemo
   - `revenueCo2Layout` - wrapped in useMemo
   - `riskEvolutionData` - wrapped in useMemo
   - `riskEvolutionLayout` - wrapped in useMemo
   - Plot component: `key={`revenue-co2-${theme}`}`

2. **FinancialSection.jsx**
   - `revenueData` - wrapped in useMemo
   - `revenueLayout` - wrapped in useMemo
   - Plot component: `key={`financial-${theme}`}`

3. **EnvironmentalSection.jsx**
   - `donutColors` - wrapped in useMemo
   - `donutData` - wrapped in useMemo
   - `donutLayout` - wrapped in useMemo
   - `funnelColors` - wrapped in useMemo
   - `funnelData` - wrapped in useMemo
   - `funnelLayout` - wrapped in useMemo
   - Plot component: `key={`donut-${theme}`}`

4. **RiskSection.jsx**
   - `riskFactors` - wrapped in useMemo
   - `gaugeData` - wrapped in useMemo
   - `gaugeLayout` - wrapped in useMemo
   - `riskBarData` - wrapped in useMemo
   - `riskBarLayout` - wrapped in useMemo
   - Plot component: `key={`gauge-${theme}`}`

### Key Pattern Used:

```javascript
// Chart data - recreated when theme changes
const chartData = useMemo(() => [{
  // ... chart config using chartTheme
}], [dependencies, chartTheme, theme]);

// Chart layout - recreated when theme changes
const chartLayout = useMemo(() => ({
  paper_bgcolor: chartTheme.paperBg,
  plot_bgcolor: chartTheme.plotBg,
  // ... all colors from chartTheme
}), [chartTheme, theme]);

// Plot component - key forces remount
<Plot
  key={`chart-${theme}`}
  data={chartData}
  layout={chartLayout}
/>
```

## ✅ Acceptance Criteria Met

✅ Toggle theme while graph is visible
✅ Chart instantly switches theme
✅ No mixed colors
✅ No leftover dark grid in bright mode
✅ No black background in bright mode

## 📝 Files Modified

1. `frontend/src/pages/simulate/components/ProjectionsSection.jsx`
2. `frontend/src/pages/simulate/components/FinancialSection.jsx`
3. `frontend/src/pages/simulate/components/EnvironmentalSection.jsx`
4. `frontend/src/pages/simulate/components/RiskSection.jsx`
5. `frontend/src/utils/chartTheme.js`

## ✅ Result

All charts now fully re-render when theme changes, with no color mixing. Charts use theme-aware colors from CSS variables and are completely recreated (not mutated) on theme toggle.


