/**
 * Simulated HR profile generator.
 *
 * Real factory HR data is not accessible; the application seeds realistic
 * values within the same ranges as the Kaggle "employee burnout" dataset
 * (mock-data/employee-burnt-out.json) so the AI receives valid inputs.
 */

const COMPANY_TYPES = ['Service', 'Product'];
const SHIFT_TYPES = ['Day', 'Night', 'Rotating'];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randDateBetween(startYear, endYear) {
  const start = new Date(`${startYear}-01-01`).getTime();
  const end = new Date(`${endYear}-12-31`).getTime();
  return new Date(start + Math.random() * (end - start));
}

/**
 * Build a synthetic hr_profile row.
 *
 * @param {{ departmentIds: number[] }} options
 * @returns {{
 *   department_id: number,
 *   date_of_joining: Date,
 *   company_type: 'Service'|'Product',
 *   wfh_available: boolean,
 *   designation: number,
 *   resource_allocation: number|null,
 *   shift_type: 'Day'|'Night'|'Rotating'
 * }}
 */
export function simulateHrProfile({ departmentIds }) {
  if (!departmentIds || departmentIds.length === 0) {
    throw new Error('simulateHrProfile requires at least one departmentId');
  }
  return {
    department_id: randChoice(departmentIds),
    date_of_joining: randDateBetween(2018, 2025),
    company_type: randChoice(COMPANY_TYPES),
    wfh_available: Math.random() < 0.4,
    designation: randInt(1, 5),
    // Mock dataset contains nulls — keep that 10 % of the time so the AI
    // service contract handles missing values realistically.
    resource_allocation: Math.random() < 0.1 ? null : randInt(1, 10),
    shift_type: randChoice(SHIFT_TYPES),
  };
}
