/**
 * SERVICE AREA & BOOKING AVAILABILITY CONFIGURATION
 * 
 * 1. Global Emergency Toggle:
 *    - Set `IS_BOOKING_ENABLED = false` to suspend bookings & pincode checker across the platform.
 *    - Set `IS_BOOKING_ENABLED = true` to resume taking orders immediately.
 *    - Can also be controlled via environment variables:
 *      `NEXT_PUBLIC_SERVICE_AVAILABLE=false` (or `true`)
 *      `NEXT_PUBLIC_BOOKING_ENABLED=false` (or `true`)
 * 
 * 2. Serviceable Pincodes List:
 *    - `SERVICEABLE_PINCODES`: Array of pincodes where services are active.
 *    - To suspend a specific pincode, remove it from this array.
 *    - When empty or when IS_BOOKING_ENABLED is false, all areas are marked paused.
 */

// Standard alert message displayed across all pincode checkers and booking modals
export const SERVICE_UNAVAILABLE_MESSAGE = 
  "Services Temporarily Unavailable: We are currently upgrading our local technician slots in this area. Bookings are temporarily paused and will resume shortly.";

// Priority: environment variable if explicitly defined, otherwise this hardcoded boolean flag
const envBookingEnabled = typeof process !== 'undefined' && process.env 
  ? (process.env.NEXT_PUBLIC_SERVICE_AVAILABLE !== undefined 
      ? process.env.NEXT_PUBLIC_SERVICE_AVAILABLE === 'true' 
      : (process.env.NEXT_PUBLIC_BOOKING_ENABLED !== undefined 
          ? process.env.NEXT_PUBLIC_BOOKING_ENABLED === 'true' 
          : null))
  : null;

/**
 * Global Emergency Toggle
 * Set to FALSE to temporarily pause all bookings and pincode checks.
 * Set to TRUE to resume normal operations.
 */
export const IS_BOOKING_ENABLED = envBookingEnabled !== null 
  ? envBookingEnabled 
  : true; // Default: true (All booking services & pincode checks fully active across Indore)

/**
 * Configurable list of active serviceable Indore pincodes.
 * To pause an individual pincode, comment it out or remove it from this array.
 */
export const SERVICEABLE_PINCODES = [
  "452001", // Central Indore, Palasia, MG Road
  "452002", // Siyaganj, Chhatribagh
  "452003", // Snehalataganj, Jail Road
  "452005", // Annapurna, Usha Nagar
  "452006", // Rajendra Nagar, Silicon City
  "452007", // Malharganj, Subhash Nagar
  "452008", // Pipliyahana, World Cup Square
  "452009", // Sudama Nagar, Scheme 71
  "452010", // Vijay Nagar, Scheme 54, Scheme 78
  "452011", // Khajrana, Ring Road
  "452012", // Rau, Pithampur bypass
  "452013", // Bada Sarafa, Rajwada
  "452014", // Bhanwarkuan, Transport Nagar
  "452015", // Tilak Nagar, Goyal Nagar
  "452016", // Nipania, BCM Heights, Bypass
  "452018", // Saket Nagar, Bengali Square
  "452020", // MR-10, Super Corridor
  "453331", // Mhow, Rau suburban
  "453555"  // Pithampur industrial area
];

/**
 * Helper function to check if a specific pincode is currently serviceable.
 * Returns true ONLY if global bookings are enabled AND the pincode is in SERVICEABLE_PINCODES.
 */
export function isPincodeServiceable(pincode) {
  if (!IS_BOOKING_ENABLED) return false;
  if (!pincode) return false;
  const clean = pincode.toString().trim();
  return SERVICEABLE_PINCODES.includes(clean);
}
