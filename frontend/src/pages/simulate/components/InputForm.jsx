import { useState, useEffect } from 'react';
import { getAvailableCountries } from '../../../utils/api/predictions';
import { useNotificationContext, useTheme } from '../../../App';
import { extractErrorMessage } from '../../../utils/errorHandler';

export default function InputForm({ onSubmit, loading, hasResults }) {
  const { showError } = useNotificationContext();
  const { theme } = useTheme();
  const [sliderUpdate, setSliderUpdate] = useState(0); // Force slider re-render
  const [formData, setFormData] = useState({
    country: '',
    policyType: 'Carbon tax',
    carbonPrice: '',
    coverage: 40,
    duration: 5,
    year: 2025
  });

  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null); // 'country' | 'policyType' | null
  const showDropdown = openDropdown === 'country';
  const showPolicyTypeDropdown = openDropdown === 'policyType';


  const policyTypeOptions = [
    { value: 'Carbon tax', label: 'Carbon Tax' },
    { value: 'ETS', label: 'ETS (Emissions Trading System)' }
  ];

  const durationOptions = [1, 3, 5, 10, 20]; // Allowed duration values

  useEffect(() => {
    getAvailableCountries()
      .then(setCountries)
      .catch(err => {
        showError(extractErrorMessage(err));
        console.error('Failed to load countries:', err);
      });
  }, [showError]);

  // Check theme periodically to ensure slider updates
  useEffect(() => {
    const checkTheme = () => {
      // Force re-render to update slider color
      setSliderUpdate(prev => prev + 1);
    };
    
    // Check every 2 seconds
    const interval = setInterval(checkTheme, 2000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Only add listener when a dropdown is open
    if (!openDropdown) return;

    const handleClickOutside = (event) => {
      // Check if click is outside any dropdown container
      const clickedInsideDropdown = event.target.closest('.dropdown-container');
      if (!clickedInsideDropdown) {
        setOpenDropdown(null);
      }
    };

    // Use a small delay to avoid closing immediately on open
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleCountrySelect = (country) => {
    setFormData(prev => ({ ...prev, country }));
    setSearchTerm(country);
    setOpenDropdown(null);
  };


  const handlePolicyTypeSelect = (value) => {
    setFormData(prev => ({ ...prev, policyType: value }));
    setOpenDropdown(null);
  };

  const handleDropdownToggle = (dropdownType) => {
    // If clicking the same dropdown that's open, close it
    // Otherwise, close any open dropdown and open the clicked one
    setOpenDropdown(prev => {
      if (prev === dropdownType) {
        return null; // Close if already open
      }
      return dropdownType; // Open the clicked dropdown (this automatically closes any other)
    });
  };


  const getPolicyTypeLabel = () => {
    const option = policyTypeOptions.find(opt => opt.value === formData.policyType);
    return option ? option.label : formData.policyType;
  };

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.country || !formData.country.trim()) {
      newErrors.country = 'Please select a country';
    }
    
    if (!formData.carbonPrice || parseFloat(formData.carbonPrice) <= 0) {
      newErrors.carbonPrice = 'Please enter a valid carbon price greater than 0';
    }
    
    if (parseFloat(formData.carbonPrice) > 1000) {
      newErrors.carbonPrice = 'Carbon price cannot exceed $1,000 per tonne';
    }
    
    if (!formData.coverage || parseFloat(formData.coverage) < 10 || parseFloat(formData.coverage) > 90) {
      newErrors.coverage = 'Coverage must be between 10% and 90%';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-[#00FF6F] text-5xl font-bold mb-10 uppercase tracking-wide">
        Set Input Parameters
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10" style={{ overflow: 'visible' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ overflow: 'visible' }}>
          <div className="bg-[rgba(26,38,30,0.8)] border border-[rgba(0,255,111,0.15)] rounded-xl p-6 flex flex-col gap-4 transition-all duration-300 hover:border-[rgba(0,255,111,0.3)] hover:shadow-[0_5px_20px_rgba(0,255,111,0.1)]" style={{ overflow: 'visible', position: 'relative', zIndex: 0 }}>
            <label className="text-[#00FF6F] text-sm font-semibold uppercase tracking-wider">
              Duration
            </label>
            <div className="relative flex items-center gap-2">
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                max="20"
                step="1"
                className="flex-1 px-4 py-3 bg-[rgba(10,13,11,0.8)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white text-base transition-all duration-300 focus:outline-none focus:border-[#00FF6F] focus:bg-[rgba(10,13,11,0.95)] focus:shadow-[0_0_0_3px_rgba(0,255,111,0.1)] text-center duration-input"
                readOnly
              />
              <div className="flex flex-col gap-1 duration-buttons">
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = durationOptions.indexOf(formData.duration);
                    if (currentIndex < durationOptions.length - 1) {
                      const newValue = durationOptions[currentIndex + 1];
                      setFormData(prev => ({ ...prev, duration: newValue }));
                    }
                  }}
                  disabled={formData.duration >= 20}
                  className="w-10 h-8 flex items-center justify-center bg-[rgba(10,13,11,0.8)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white text-sm transition-all duration-300 hover:bg-[rgba(0,255,111,0.1)] hover:border-[#00FF6F] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[rgba(10,13,11,0.8)] disabled:hover:border-[rgba(255,255,255,0.1)] duration-up-btn"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = durationOptions.indexOf(formData.duration);
                    if (currentIndex > 0) {
                      const newValue = durationOptions[currentIndex - 1];
                      setFormData(prev => ({ ...prev, duration: newValue }));
                    }
                  }}
                  disabled={formData.duration <= 1}
                  className="w-10 h-8 flex items-center justify-center bg-[rgba(10,13,11,0.8)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white text-sm transition-all duration-300 hover:bg-[rgba(0,255,111,0.1)] hover:border-[#00FF6F] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[rgba(10,13,11,0.8)] disabled:hover:border-[rgba(255,255,255,0.1)] duration-down-btn"
                >
                  ▼
                </button>
              </div>
              <span className="text-white text-sm ml-2 min-w-[60px] duration-label">
                {formData.duration === 1 ? 'Year' : 'Years'}
              </span>
            </div>
          </div>

          <div className="bg-[rgba(26,38,30,0.8)] border border-[rgba(0,255,111,0.15)] rounded-xl p-6 flex flex-col gap-4 transition-all duration-300 hover:border-[rgba(0,255,111,0.3)] hover:shadow-[0_5px_20px_rgba(0,255,111,0.1)]">
            <label className="text-[#00FF6F] text-sm font-semibold uppercase tracking-wider">
              {formData.policyType === 'Carbon tax' ? 'Tax Rate (USD/tonne)' : 'Carbon Price (USD/tonne)'}
            </label>
            <input
              type="number"
              name="carbonPrice"
              value={formData.carbonPrice}
              onChange={handleChange}
              placeholder={formData.policyType === 'Carbon tax' ? 'Enter tax rate' : 'Enter price'}
              min="1"
              step="0.01"
              className={`w-full px-4 py-3 bg-[rgba(10,13,11,0.8)] border rounded-lg text-white text-base placeholder-[rgba(255,255,255,0.4)] transition-all duration-300 focus:outline-none focus:bg-[rgba(10,13,11,0.95)] focus:shadow-[0_0_0_3px_rgba(0,255,111,0.1)] ${
                errors.carbonPrice
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[rgba(255,255,255,0.1)] focus:border-[#00FF6F]'
              }`}
            />
            {errors.carbonPrice && (
              <p className="text-red-400 text-sm mt-1">{errors.carbonPrice}</p>
            )}
          </div>

          <div className="bg-[rgba(26,38,30,0.8)] border border-[rgba(0,255,111,0.15)] rounded-xl p-6 flex flex-col gap-4 transition-all duration-300 hover:border-[rgba(0,255,111,0.3)] hover:shadow-[0_5px_20px_rgba(0,255,111,0.1)]" style={{ overflow: 'visible', position: 'relative', zIndex: 0 }}>
            <label className="text-[#00FF6F] text-sm font-semibold uppercase tracking-wider">
              Country
            </label>
            <div className="relative dropdown-container" style={{ zIndex: 1000, position: 'relative' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Always open country dropdown when typing (closes any other open dropdown)
                  setOpenDropdown('country');
                }}
                onFocus={() => {
                  // Close any other dropdown and open country
                  setOpenDropdown('country');
                }}
                placeholder="Select Country"
                className={`w-full px-4 py-3 pr-10 bg-[rgba(10,13,11,0.8)] border rounded-lg text-white text-base placeholder-[rgba(255,255,255,0.4)] transition-all duration-300 focus:outline-none focus:bg-[rgba(10,13,11,0.95)] focus:shadow-[0_0_0_3px_rgba(0,255,111,0.1)] cursor-pointer ${
                  errors.country
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-[rgba(255,255,255,0.1)] focus:border-[#00FF6F]'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.6)] text-xs pointer-events-none select-none">
                {showDropdown ? '▲' : '▼'}
              </span>
              {showDropdown && filteredCountries.length > 0 && (
                <div className="absolute z-[9999] w-full mt-2 bg-[rgba(26,38,30,0.95)] border border-[rgba(0,255,111,0.3)] rounded-lg max-h-60 overflow-y-auto shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md" style={{ zIndex: 9999, position: 'absolute', top: '100%', left: 0, width: '100%' }}>
                  {filteredCountries.map((country) => (
                    <div
                      key={country}
                      onClick={() => handleCountrySelect(country)}
                      className="px-4 py-3 text-white text-base cursor-pointer transition-all duration-200 border-b border-[rgba(255,255,255,0.05)] last:border-b-0 hover:bg-[rgba(0,255,111,0.1)] hover:text-[#00FF6F]"
                    >
                      {country}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.country && (
              <p className="text-red-400 text-sm mt-1">{errors.country}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[rgba(26,38,30,0.8)] border border-[rgba(0,255,111,0.15)] rounded-xl p-6 flex flex-col gap-4 transition-all duration-300 hover:border-[rgba(0,255,111,0.3)] hover:shadow-[0_5px_20px_rgba(0,255,111,0.1)]" style={{ overflow: 'visible', position: 'relative', zIndex: 0 }}>
            <label className="text-[#00FF6F] text-sm font-semibold uppercase tracking-wider">
              Policy Type
            </label>
            <div className="relative dropdown-container" style={{ zIndex: 1000, position: 'relative' }}>
              <div
                onClick={() => handleDropdownToggle('policyType')}
                className="w-full px-4 py-3 pr-10 bg-[rgba(10,13,11,0.8)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white text-base transition-all duration-300 focus:outline-none focus:border-[#00FF6F] focus:bg-[rgba(10,13,11,0.95)] focus:shadow-[0_0_0_3px_rgba(0,255,111,0.1)] cursor-pointer"
              >
                {getPolicyTypeLabel()}
              </div>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.6)] text-xs pointer-events-none select-none">
                {showPolicyTypeDropdown ? '▲' : '▼'}
              </span>
              {showPolicyTypeDropdown && (
                <div className="absolute z-[9999] w-full mt-2 bg-[rgba(26,38,30,0.95)] border border-[rgba(0,255,111,0.3)] rounded-lg overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md" style={{ zIndex: 9999, position: 'absolute', top: '100%', left: 0, width: '100%' }}>
                  {policyTypeOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => handlePolicyTypeSelect(option.value)}
                      className="px-4 py-3 text-white text-base cursor-pointer transition-all duration-200 border-b border-[rgba(255,255,255,0.05)] last:border-b-0 hover:bg-[rgba(0,255,111,0.1)] hover:text-[#00FF6F]"
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[rgba(26,38,30,0.8)] border border-[rgba(0,255,111,0.15)] rounded-xl p-6 flex flex-col gap-4 transition-all duration-300 hover:border-[rgba(0,255,111,0.3)] hover:shadow-[0_5px_20px_rgba(0,255,111,0.1)]" style={{ position: 'relative', zIndex: 0, overflow: 'visible' }}>
            <label className="text-[#00FF6F] text-sm font-semibold uppercase tracking-wider">
              Coverage ({formData.coverage}%)
            </label>
            <p className="text-[rgba(255,255,255,0.4)] text-xs font-normal leading-relaxed mb-2">
              Percentage of total emissions covered by the policy
            </p>
            <input
              type="range"
              name="coverage"
              value={formData.coverage}
              onChange={handleChange}
              min="10"
              max="90"
              className={`w-full h-2 bg-[rgba(10,13,11,0.6)] rounded-lg appearance-none cursor-pointer slider ${
                errors.coverage ? 'border-red-500' : ''
              }`}
              style={{
                '--slider-progress': `${((formData.coverage - 10) / 80) * 100}%`,
                background: (() => {
                  const isBright = document.documentElement.className.includes('theme-bright');
                  const progress = ((formData.coverage - 10) / 80) * 100;
                  return isBright
                    ? `linear-gradient(to right, #2563eb 0%, #2563eb ${progress}%, #DDE6EE ${progress}%, #DDE6EE 100%)`
                    : `linear-gradient(to right, #00FF6F 0%, #00FF6F ${progress}%, rgba(255,255,255,0.1) ${progress}%, rgba(255,255,255,0.1) 100%)`;
                })()
              }}
              key={`slider-${sliderUpdate}`}
            />
            {errors.coverage && (
              <p className="text-red-400 text-sm mt-1">{errors.coverage}</p>
            )}
            <div className="flex justify-between text-xs text-[rgba(255,255,255,0.4)] mt-1">
              <span>10%</span>
              <span>90%</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-[50px] py-[18px] rounded-[10px] bg-gradient-to-r from-[#00FF6F] to-[#01D6DF] text-[#0A0D0B] font-semibold text-lg uppercase tracking-[1px] min-w-[200px] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_8px_25px_rgba(0,255,111,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </form>

      {!hasResults && !loading && (
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <p className="text-[rgba(255,255,255,0.4)] text-xs leading-relaxed font-extralight tracking-wide">
            Configure key policy settings including duration, carbon price, coverage, and country. Generate real-time projections of how your carbon pricing policy will affect both the environment and the economy. After running the simulation, Eco-Impact AI displays clear insights on revenue predictions, CO2 reduction potential, policy risk assessment, and environmental equivalencies, supported by interactive charts and year-by-year projections for deeper analysis.
          </p>
        </div>
      )}
    </div>
  );
}
