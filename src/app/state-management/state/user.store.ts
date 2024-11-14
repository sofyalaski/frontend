import { Settings, Message, User, TableColumn } from "../models";
import { AccessToken } from "shared/sdk";
import {
  ConditionConfig,
  FilterConfig,
} from "../../shared/modules/filters/filters.module";

// NOTE It IS ok to make up a state of other sub states
export interface UserState {
  currentUser: User | undefined;
  accountType?: string;
  profile?: any;

  scicatToken: AccessToken;

  settings: Settings;

  message: Message | undefined;

  isLoggingIn: boolean;
  isLoggedIn: boolean;

  isLoading: boolean;

  columns: TableColumn[];

  filters: FilterConfig[];

  conditions: ConditionConfig[];
}

export const initialUserState: UserState = {
  currentUser: undefined,
  profile: null,

  scicatToken: {
    id: "",
    ttl: 0,
    scopes: ["string"],
    created: new Date(),
    userId: "",
    user: {},
  },

  settings: {
    tapeCopies: "one",
    datasetCount: 25,
    jobCount: 25,
    darkTheme: false,
  }, // TODO sync with server settings?

  message: undefined,

  isLoggingIn: false,
  isLoggedIn: false,

  isLoading: false,

  columns: [],

  filters: [
    { LocationFilter: true },
    { PidFilter: true },
    { GroupFilter: true },
    { TypeFilter: true },
    { KeywordFilter: true },
    { DateRangeFilter: true },
    { TextFilter: true },
  ],

  conditions: [],
};
