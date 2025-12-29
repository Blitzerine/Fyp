/**
 * Utility to get country flag emoji from country name
 * Maps common country names to their flag emoji using Unicode flag sequences
 */

// Convert country name to ISO 3166-1 alpha-2 code, then to flag emoji
const COUNTRY_TO_ISO = {
  'Afghanistan': 'AF', 'Albania': 'AL', 'Algeria': 'DZ', 'Argentina': 'AR',
  'Australia': 'AU', 'Austria': 'AT', 'Bangladesh': 'BD', 'Belgium': 'BE',
  'Brazil': 'BR', 'Bulgaria': 'BG', 'Canada': 'CA', 'Chile': 'CL',
  'China': 'CN', 'Colombia': 'CO', 'Costa Rica': 'CR', 'Croatia': 'HR',
  'Czech Republic': 'CZ', 'Denmark': 'DK', 'Ecuador': 'EC', 'Egypt': 'EG',
  'Ethiopia': 'ET', 'Finland': 'FI', 'France': 'FR', 'Germany': 'DE',
  'Ghana': 'GH', 'Greece': 'GR', 'Hungary': 'HU', 'Iceland': 'IS',
  'India': 'IN', 'Indonesia': 'ID', 'Iran': 'IR', 'Iraq': 'IQ',
  'Ireland': 'IE', 'Israel': 'IL', 'Italy': 'IT', 'Japan': 'JP',
  'Kenya': 'KE', 'Kuwait': 'KW', 'Malaysia': 'MY', 'Mexico': 'MX',
  'Morocco': 'MA', 'Netherlands': 'NL', 'New Zealand': 'NZ', 'Nigeria': 'NG',
  'Norway': 'NO', 'Pakistan': 'PK', 'Peru': 'PE', 'Philippines': 'PH',
  'Poland': 'PL', 'Portugal': 'PT', 'Qatar': 'QA', 'Romania': 'RO',
  'Russia': 'RU', 'Saudi Arabia': 'SA', 'Singapore': 'SG', 'South Africa': 'ZA',
  'South Korea': 'KR', 'Spain': 'ES', 'Sri Lanka': 'LK', 'Sweden': 'SE',
  'Switzerland': 'CH', 'Thailand': 'TH', 'Turkey': 'TR', 'Ukraine': 'UA',
  'United Arab Emirates': 'AE', 'United Kingdom': 'GB', 'United States': 'US',
  'Venezuela': 'VE', 'Vietnam': 'VN', 'Yemen': 'YE', 'Zambia': 'ZM',
  'Zimbabwe': 'ZW'
};

/**
 * Convert ISO 3166-1 alpha-2 code to flag emoji
 * @param {string} isoCode - Two-letter country code (e.g., 'PK' for Pakistan)
 * @returns {string} Flag emoji
 */
const isoToFlagEmoji = (isoCode) => {
  if (!isoCode || isoCode.length !== 2) return '';
  
  // Convert to uppercase
  const code = isoCode.toUpperCase();
  
  // Convert each letter to Regional Indicator Symbol (Unicode range 0x1F1E6-0x1F1FF)
  // 'A' (0x41) -> 0x1F1E6, 'B' (0x42) -> 0x1F1E7, etc.
  const codePointA = 0x1F1E6 + (code.charCodeAt(0) - 0x41);
  const codePointB = 0x1F1E6 + (code.charCodeAt(1) - 0x41);
  
  return String.fromCodePoint(codePointA, codePointB);
};

/**
 * Get flag emoji for a country name
 * @param {string} countryName - Name of the country
 * @returns {string} Flag emoji or empty string if not found
 */
export const getCountryFlag = (countryName) => {
  if (!countryName) return '';
  
  // Direct lookup
  let isoCode = COUNTRY_TO_ISO[countryName];
  
  if (!isoCode) {
    // Try case-insensitive lookup
    const normalizedName = Object.keys(COUNTRY_TO_ISO).find(
      key => key.toLowerCase() === countryName.toLowerCase()
    );
    
    if (normalizedName) {
      isoCode = COUNTRY_TO_ISO[normalizedName];
    }
  }
  
  if (isoCode) {
    return isoToFlagEmoji(isoCode);
  }
  
  // Return empty string if not found
  return '';
};

/**
 * Component helper: Country name with flag
 * @param {string} countryName - Name of the country
 * @returns {JSX.Element} Span with flag emoji and country name
 */
export const CountryWithFlag = ({ countryName, className = '' }) => {
  const flag = getCountryFlag(countryName);
  
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      {flag && <span style={{ fontSize: '1.2em' }}>{flag}</span>}
      <span>{countryName || '-'}</span>
    </span>
  );
};

