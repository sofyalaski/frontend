import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of, from } from "rxjs";
import {
  catchError,
  map,
  switchMap,
  mergeMap,
  toArray,
  concatMap,
} from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";
import { MessageType } from "state-management/models";
import { showMessageAction } from "state-management/actions/user.actions";
import * as fromActions from "state-management/actions/onedep.actions";
import { Depositor } from "shared/sdk/apis/onedep-depositor.service";
import {
  OneDepCreated,
  UploadedFile,
  DepBackendVersion,
} from "shared/sdk/models/OneDep";
import { EmFile } from "../../datasets/onedep/types/methods.enum";
@Injectable()
export class OneDepEffects {
  createDeposition$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.connectToDepositor),
      switchMap(() =>
        this.onedepDepositor.getVersion().pipe(
          map((res) =>
            fromActions.connectToDepositorSuccess({
              depositor: res as DepBackendVersion,
            }),
          ),
          catchError((err) =>
            of(fromActions.connectToDepositorFailure({ err })),
          ),
        ),
      ),
    );
  });
  connectToDepositorSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.connectToDepositorSuccess),
      switchMap(({ depositor }) => {
        const message = {
          type: MessageType.Success,
          content:
            "Successfully connected to depositor version " + depositor.version,
          duration: 5000,
        };
        return of(showMessageAction({ message }));
      }),
    );
  });

  connectToDepositorFailure$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.connectToDepositorFailure),
      switchMap(({ err }) => {
        const errorMessage =
          err instanceof HttpErrorResponse
            ? (err.error?.message ?? err.message ?? "Unknown error")
            : err.message || "Unknown error";
        const message = {
          type: MessageType.Error,
          content:
            "Failed to connect to the depositor service: " +
            errorMessage +
            " Are you sure service is running?",
          duration: 5000,
        };
        return of(showMessageAction({ message }));
      }),
    );
  });
  submitDeposition$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.submitDeposition),
      switchMap(({ deposition, files }) =>
        this.onedepDepositor.createDep(deposition).pipe(
          switchMap((dep) =>
            from(files).pipe(
              concatMap((file) => {
                return (
                  file.fileType === EmFile.Coordinates
                    ? this.onedepDepositor.sendCoordFile(dep.id, file.form)
                    : this.onedepDepositor.sendFile(dep.id, file.form)
                ).pipe(
                  map((uploadedFile) =>
                    fromActions.sendFileSuccess({
                      depID: dep.id,
                      uploadedFile,
                    }),
                  ),
                  catchError((err) => {
                    return of(
                      fromActions.sendFileFailure({ depID: dep.id, err }),
                    );
                  }),
                );
              }),
              toArray(),
              mergeMap((uploadActions) => [
                ...uploadActions,
                fromActions.submitDepositionSuccess({
                  deposition: dep as OneDepCreated,
                }),
              ]),
            ),
          ),
          catchError((err) => {
            return of(fromActions.submitDepositionFailure({ err }));
          }),
        ),
      ),
    );
  });

  sendFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.sendFile),
      switchMap(({ depID, form }) =>
        this.onedepDepositor.sendFile(depID, form).pipe(
          map((res) =>
            fromActions.sendFileSuccess({
              depID,
              uploadedFile: res as UploadedFile,
            }),
          ),
          catchError((err) => {
            return of(fromActions.sendFileFailure({ depID, err }));
          }),
        ),
      ),
    );
  });

  sendFileSuccessMessage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.sendFileSuccess),
      switchMap(({ depID, uploadedFile }) => {
        const message = {
          type: MessageType.Success,
          content:
            uploadedFile.type +
            " file Upladed to Deposition " +
            depID +
            " with File ID: " +
            uploadedFile.id,
          duration: 5000,
        };
        return of(showMessageAction({ message }));
      }),
    );
  });

  sendFileFailureMessage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.sendFileFailure),
      switchMap(({ depID, err }) => {
        const errorMessage =
          err instanceof HttpErrorResponse
            ? (err.error?.message ?? err.message ?? "Unknown error")
            : err.message || "Unknown error";
        const message = {
          type: MessageType.Error,
          content:
            "Failed to upload file to Deposition " +
            depID +
            ": " +
            errorMessage,
          duration: 10000,
        };
        return of(showMessageAction({ message }));
      }),
    );
  });

  submitDepositionSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.submitDepositionSuccess),
      switchMap(({ deposition }) => {
        const message = {
          type: MessageType.Success,
          content:
            "Deposition Created Successfully. Deposition ID: " + deposition.id,
          duration: 5000,
        };
        return of(showMessageAction({ message }));
      }),
    );
  });

  submitDepositionFailure$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.submitDepositionFailure),
      switchMap(({ err }) => {
        const errorMessage =
          err instanceof HttpErrorResponse
            ? (err.error?.message ?? err.message ?? "Unknown error")
            : err.message || "Unknown error";
        const message = {
          type: MessageType.Error,
          content: "Deposition to OneDep failed: " + errorMessage,
          duration: 10000,
        };
        return of(showMessageAction({ message }));
      }),
    );
  });

  sendCoordFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.sendCoordFile),
      switchMap(({ depID, form }) =>
        this.onedepDepositor.sendCoordFile(depID, form).pipe(
          map((res) =>
            fromActions.sendFileSuccess({
              depID,
              uploadedFile: res as UploadedFile,
            }),
          ),
          catchError((err) => {
            return of(fromActions.sendFileFailure({ depID, err }));
          }),
        ),
      ),
    );
  });

  sendMetadataFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.sendMetadataFile),
      switchMap(({ depID, form }) =>
        this.onedepDepositor.sendMetadata(depID, form).pipe(
          map((res) =>
            fromActions.sendFileSuccess({
              depID,
              uploadedFile: res as UploadedFile,
            }),
          ),
          catchError((err) => {
            return of(fromActions.sendFileFailure({ depID, err }));
          }),
        ),
      ),
    );
  });

  constructor(
    private actions$: Actions,
    private onedepDepositor: Depositor,
  ) {}
}
