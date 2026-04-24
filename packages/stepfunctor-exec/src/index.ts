import { assertExhausted } from "stepfunctor-lang";
import { Func, isFunc, isIfThenElse, isLoopWhile, isRest, isSwitchCase2, isSwitchCase3, StepFunction } from "stepfunctor-lang";

function exportHere<I, LS>(f: Func<I, LS>, m: NodeJS.Module): void {
  m.exports[f.uniqueIdentifier] = f;
}

export function exportStepFunction<I, LS>(
  sf: StepFunction<I, LS>,
  m: NodeJS.Module,
): void {
  if (isFunc<I, LS>(sf)) {
    exportHere(sf, m);
    return;
  }

  if (isRest<I, LS>(sf)) {
    const { f, rest } = sf;
    exportHere(f, m);
    exportStepFunction(rest, m);
    return;
  }

  if (isIfThenElse<I, LS>(sf)) {
    const { f, case1, case2 } = sf;
    exportHere(f, m);
    exportStepFunction(case1, m);
    exportStepFunction(case2, m);
    return;
  }

  if (isLoopWhile<I, LS>(sf)) {
    const { f, continuation } = sf;
    exportHere(f, m);
    exportStepFunction(continuation, m);
    return;
  }

  if (isSwitchCase2<I, LS>(sf)) {
    const { f, case1, case2 } = sf;
    exportHere(f, m);
    exportStepFunction(case1, m);
    exportStepFunction(case2, m);
    return;
  }

  if (isSwitchCase3<I, LS>(sf)) {
    const { f, case1, case2, case3 } = sf;
    exportHere(f, m);
    exportStepFunction(case1, m);
    exportStepFunction(case2, m);
    exportStepFunction(case3, m);
    return;
  }

  assertExhausted(sf);
}
