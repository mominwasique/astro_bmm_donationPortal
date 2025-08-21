export const userFields = [
  { name: 'title', label: 'Title' },
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'phone', label: 'Phone' },
  { name: 'email', label: 'Email' },
];

export const addressFields = [
  { name: 'country', label: 'Country' }, // Moved to the top
  { name: 'postcode', label: 'Postcode' }, // Added postcode for PAF
  { name: 'address1', label: 'Address 1' },
  { name: 'address2', label: 'Address 2' },
  { name: 'city', label: 'City' },
];

export const titleOptions = ['MR', 'MRS', 'MS'];

export function getRequiredFields(cartData) {
  const baseFields = [
    'title',
    'firstName',
    'lastName',
    'email',
    'phone',
    'country',
    'postcode',
    'address1',
    'city_id',
    'address2',
  ];
  
  if (cartData?.some(item => item.donation_period == 'direct-debit')) {
    return [...baseFields, 'bank_sort_code', 'bank_ac_no', 'dd_run'];
  }
  return baseFields;
}
// Initialize with empty array for server-side rendering
let cartData = [];

// Only access localStorage in browser environment
if (typeof window !== 'undefined') {
  try {
    cartData = JSON.parse(localStorage.getItem('cart')) || [];
  } catch (error) {
    cartData = [];
  }
}

export const requiredFields = getRequiredFields(cartData);