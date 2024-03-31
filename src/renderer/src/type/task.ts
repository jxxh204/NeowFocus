import { ChangeEventHandler } from "react";

export type TaskType = "SET_TASK" | "SET_NAME" | "SET_TIMER" | "SET_DATE";
export type TaskName = "taskName" | "timer" | "date";
export type TaskAction = {
  type: TaskType;
  name: TaskName;
  value: string | number;
};
export type T_ChangeHandler = ChangeEventHandler<HTMLInputElement>;

export type LocalStorageValue<T> = T | null;
