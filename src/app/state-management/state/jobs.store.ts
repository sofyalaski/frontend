import { JobInterface } from "shared/sdk/models/Job";
import { JobFilters } from "state-management/models";

export interface JobsState {
  jobs: JobInterface[];
  currentJob: JobInterface | undefined;

  totalCount: number;

  submitError: Error | undefined;

  filters: JobFilters;
}

export const initialJobsState: JobsState = {
  jobs: [],
  currentJob: undefined,

  totalCount: 0,

  submitError: undefined,

  filters: {
    mode: undefined,
    sortField: "creationTime:desc",
    skip: 0,
    limit: 25,
  },
};
