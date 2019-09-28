export type RecurringConfig = null | {
  unit: string,
  amount: number,
  activeWeekdays?: {
    mon: boolean,
    tue: boolean,
    wed: boolean,
    thu: boolean,
    fri: boolean,
    sat: boolean,
    sun: boolean,
  },
};
