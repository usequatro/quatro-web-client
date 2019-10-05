export type Task = {
  id: string,
  title: string,
  effort: number,
  impact: number,
  description: string,
  created: number,
  due: number | null,
  scheduledStart: number | null,
  completed: number | null,
  score: number | null,
  trashed: number | null,
  userId: string,
  prioritizedAheadOf: string | null,
  dependencyIds: [string],
  recurringConfigId: string | null,
};

export type TaskDependency = {
  id: string,
  taskId: string,
  type: string,
  config: {
    taskId?: string,
    value?: string,
  },
};

export type ActiveWeekdays = {
  mon: boolean,
  tue: boolean,
  wed: boolean,
  thu: boolean,
  fri: boolean,
  sat: boolean,
  sun: boolean,
};

export type RecurringConfig = {
  id: string
  unit: string,
  amount: number,
  userId: string,
  activeWeekdays: ActiveWeekdays,
  referenceDate: number | null,
};

export type OptionalKeys<T> = {
  [P in keyof T]?: T[P];
}
