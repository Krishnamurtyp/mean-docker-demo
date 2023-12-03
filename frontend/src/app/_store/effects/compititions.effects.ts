import { Injectable } from "@angular/core";
import * as CompititionActions from "../actions/compititions.actions";
import * as FixturesActions from "../actions/fixures.actions";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, exhaustMap, catchError, mergeMap } from "rxjs/operators";
import { of } from "rxjs";
import { CompititionService } from "src/app/_services/compitition.service";

@Injectable()
export class CompititionsEffects {
  constructor(private actions$: Actions, private compititionService: CompititionService) {}

  loadCompititions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CompititionActions.loadCompititions),
      map((action: any) => action.payload),
      mergeMap(() => {
        return this.compititionService.loadCompititions().pipe(
          map((data) =>
            Array.isArray(data)
              ? CompititionActions.loadCompititionsSuccess({ data })
              : CompititionActions.loadCompititionsSuccess({ data: [{ id: 0, name: "No Compititions Found" }] })
          ),
          catchError((error) => of(CompititionActions.loadCompititionsFailure({ error })))
        );
      })
    )
  );
}
