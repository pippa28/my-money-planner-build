export type PlannerValues = {
  monthly_income: number
  housing: number
  utilities: number
  food: number
  transport: number
  debts: number
  savings: number
  subscriptions: number
  fun: number
  buffer: number
}

export const toMoney = (value: unknown) => Number(value || 0)

export function calculateBudget(planner: PlannerValues, additionalDebt = 0) {
  const essential = planner.housing + planner.utilities + planner.food + planner.transport
  const minimumDebt = planner.debts
  const disposable = planner.monthly_income - essential - minimumDebt
  const allocated = planner.savings + planner.subscriptions + planner.fun + planner.buffer + additionalDebt
  const remaining = disposable - allocated
  return {
    essential,
    minimumDebt,
    disposable,
    allocated,
    remaining,
    shortfall: Math.max(0, -remaining),
    allocationTotal: essential + minimumDebt + allocated + Math.max(0, remaining),
  }
}

export const allocationCategories = (planner: PlannerValues, additionalDebt = 0) => [
  { label: 'Essential living', value: planner.housing + planner.utilities + planner.food + planner.transport, color: '#21866B' },
  { label: 'Minimum debt', value: planner.debts, color: '#7B61FF' },
  { label: 'Savings', value: planner.savings, color: '#F0B429' },
  { label: 'Lifestyle', value: planner.subscriptions + planner.fun + planner.buffer, color: '#E07A5F' },
  ...(additionalDebt > 0 ? [{ label: 'Additional debt', value: additionalDebt, color: '#A855F7' }] : []),
]
