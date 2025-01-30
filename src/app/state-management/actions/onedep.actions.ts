import { createAction, props } from "@ngrx/store";
import {
  OneDepUserInfo,
  OneDepCreated,
  UploadedFile,
  FileUpload,
  DepBackendVersion,
} from "shared/sdk/models/OneDep";

export const connectToDepositor = createAction("[OneDep] Connect to Depositor");
export const connectToDepositorSuccess = createAction(
  "[OneDep] Connect To Depositor Success",
  props<{ depositor: DepBackendVersion }>(),
);

export const connectToDepositorFailure = createAction(
  "[OneDep] Connect To Depositor Failure",
  props<{ err: Error }>(),
);
export const submitDeposition = createAction(
  "[OneDep] Submit Deposition",
  props<{ deposition: OneDepUserInfo; files: FileUpload[] }>(),
);
export const submitDepositionSuccess = createAction(
  "[OneDep] Create Deposition Complete",
  props<{ deposition: OneDepCreated }>(),
);

export const submitDepositionFailure = createAction(
  "[OneDep] Create Deposition Failure",
  props<{ err: Error }>(),
);

export const sendFile = createAction(
  "[OneDep] Send File",
  props<{ depID: string; form: FormData }>(),
);

export const sendFileSuccess = createAction(
  "[OneDep] Send File Success",
  props<{ depID: string; uploadedFile: UploadedFile }>(),
);

export const sendFileFailure = createAction(
  "[OneDep] Send File Failure",
  props<{ depID: string; err: Error }>(),
);

export const sendCoordFile = createAction(
  "[OneDep] Send Coord File",
  props<{ depID: string; form: FormData }>(),
);

export const sendMetadataFile = createAction(
  "[OneDep] Send Metadata",
  props<{ depID: string; form: FormData }>(),
);
