// Test file to verify date utilities are working
import { formatDate, getRelativeTime } from './dateUtils';

// Test the date utilities
console.log('Testing date utilities:');
console.log('Current time:', formatDate(new Date(), 'time'));
console.log('Current date:', formatDate(new Date(), 'date'));
console.log('Relative time (now):', getRelativeTime(new Date()));
console.log('Relative time (1 hour ago):', getRelativeTime(new Date(Date.now() - 3600000)));

// Test with ISO string
const isoString = new Date().toISOString();
console.log('ISO string test:', formatDate(isoString, 'time'));