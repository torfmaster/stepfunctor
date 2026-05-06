import { assertExhausted, isFinal } from 'stepfunctor-lang';
import {
  Func,
  isFunc,
  isIfThenElse,
  isLoopWhile,
  isRest,
  isSwitchCase2,
  isSwitchCase3,
  StepFunction,
} from 'stepfunctor-lang';

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

  if (isFinal(sf)) {
    return;
  }

  assertExhausted(sf);
}

export async function runStepFunction<I, LS>(
  sf: StepFunction<I, LS>,
  input: I,
): Promise<unknown> {
  if (isFunc<I, LS>(sf)) {
    return sf.inner(input);
  }

  if (isRest<I, LS>(sf)) {
    const { f, rest } = sf;
    const out = await f.inner(input);
    return runStepFunction(rest, out);
  }

  if (isIfThenElse<I, LS>(sf)) {
    const { f, case1, case2 } = sf;
    const out = (await f.inner(input)) as { condition: boolean };

    if (out.condition) {
      return runStepFunction(case1, out);
    } else {
      return runStepFunction(case2, out);
    }
  }

  if (isLoopWhile<I, LS>(sf)) {
    const { f, continuation } = sf;
    let nextInput = input;
    while (true) {
      const out = (await f.inner(nextInput)) as { output: unknown };
      if (out.output !== undefined) {
        return runStepFunction(continuation, out.output);
      }
      nextInput = out as I;
    }
  }

  if (isSwitchCase2<I, LS>(sf)) {
    const { f, case1, case2, case1Name, case2Name } = sf;
    const out = (await f.inner(input)) as { characteristic: string };
    if (out.characteristic === case1Name) {
      return runStepFunction(case1, out);
    }
    if (out.characteristic === case2Name) {
      return runStepFunction(case2, out);
    }
    throw new Error('Unreachable');
  }

  if (isSwitchCase3<I, LS>(sf)) {
    const { f, case1, case2, case3, case1Name, case2Name, case3Name } = sf;
    const out = (await f.inner(input)) as { characteristic: string };
    if (out.characteristic === case1Name) {
      return runStepFunction(case1, out);
    }
    if (out.characteristic === case2Name) {
      return runStepFunction(case2, out);
    }
    if (out.characteristic === case3Name) {
      return runStepFunction(case3, out);
    }
    throw new Error('Unreachable');
  }

  if (isFinal(sf)) {
    return;
  }

  assertExhausted(sf);
}
