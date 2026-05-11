import { isOfType } from '../utils/typeUtils.js';

type PhantomType<T> = { [P in keyof T]: undefined };

// Type marker: Do not export the symbol, this destroys type safety
// Has to be a string iff the error is directly serialized (e.g. for the frontend)
const finalMarker: unique symbol = Symbol();
export type Final<IN, LS> = {
  type: typeof finalMarker;
  lambdas: PhantomType<LS>;
  id: string;
};

export function isFinal<I, LS>(
  input: StepFunction<I, LS>,
): input is Final<I, LS> {
  return isOfType(input, finalMarker);
}
function mkFinal<IN, LS>(id: string): Final<IN, LS> {
  const lambdas = {} as PhantomType<LS>;
  return {
    type: finalMarker,
    lambdas,
    id,
  };
}

export const final = mkFinal;

// Type marker: Do not export the symbol, this destroys type safety
// Has to be a string iff the error is directly serialized (e.g. for the frontend)
const funcMarker: unique symbol = Symbol();
export type Func<IN, LS> = {
  type: typeof funcMarker;
  inner: (i: IN) => Promise<unknown>;
  uniqueIdentifier: string;
  lambdas: PhantomType<LS>;
};

export function isFunc<I, LS>(
  input: StepFunction<I, LS>,
): input is Func<I, LS> {
  return isOfType(input, funcMarker);
}

function mkFunc<IN, OUT, LS>(
  uniqueIdentifier: keyof LS & string,
  inner: (i: IN) => Promise<OUT>,
): Func<IN, LS> {
  const lambdas = {} as PhantomType<LS>;
  lambdas[uniqueIdentifier] = undefined;
  return {
    type: funcMarker,
    inner,
    uniqueIdentifier,
    lambdas,
  };
}

// Type marker: Do not export the symbol, this destroys type safety
// Has to be a string iff the error is directly serialized (e.g. for the frontend)
const restMarker: unique symbol = Symbol();
export type Rest<IN, LS> = {
  type: typeof restMarker;
  // what do we put here?
  f: Func<IN, unknown>;
  rest: StepFunction<unknown, unknown>;
  lambdas: PhantomType<LS>;
};
export function isRest<I, LS>(
  input: StepFunction<I, LS>,
): input is Rest<I, LS> {
  return isOfType(input, restMarker);
}
function mkRest<IN, IN1, LS1, LS2>(
  f: Func<IN, LS1>,
  rest: StepFunction<IN1, LS2>,
  lambdas: PhantomType<LS1 & LS2>,
): Rest<IN, LS1 & LS2> {
  return {
    type: restMarker,
    f,
    rest: rest as StepFunction<unknown, unknown>,
    lambdas,
  };
}

// Type marker: Do not export the symbol, this destroys type safety
// Has to be a string iff the error is directly serialized (e.g. for the frontend)
const ifThenElseMarker: unique symbol = Symbol();
export type IfThenElse<IN, LS> = {
  type: typeof ifThenElseMarker;
  f: Func<IN, unknown>;
  case1: StepFunction<unknown, unknown>;
  case2: StepFunction<unknown, unknown>;
  lambdas: PhantomType<LS>;
  id: string;
};
export function isIfThenElse<I, LS>(
  input: StepFunction<I, LS>,
): input is IfThenElse<I, LS> {
  return isOfType(input, ifThenElseMarker);
}
function mkIfThenElse<IN, IN1, IN2, LS1, LS2, LS3>(
  f: Func<IN, LS1>,
  restTrue: StepFunction<IN1, LS2>,
  restFalse: StepFunction<IN2, LS3>,
  id: string,
): IfThenElse<IN, LS1 & LS2 & LS3> {
  return {
    type: ifThenElseMarker,
    f,
    case1: restTrue as StepFunction<unknown, unknown>,
    case2: restFalse as StepFunction<unknown, unknown>,
    lambdas: { ...f.lambdas, ...restTrue.lambdas, ...restFalse.lambdas },
    id,
  };
}

// Type marker: Do not export the symbol, this destroys type safety
// Has to be a string iff the error is directly serialized (e.g. for the frontend)
const switchCase2Marker: unique symbol = Symbol();
export type SwitchCase2<IN, LS> = {
  type: typeof switchCase2Marker;
  f: Func<IN, unknown>;
  case1: StepFunction<unknown, unknown>;
  case2: StepFunction<unknown, unknown>;
  lambdas: PhantomType<LS>;
  case1Name: string;
  case2Name: string;
  id: string;
};
export function isSwitchCase2<I, LS>(
  input: StepFunction<I, LS>,
): input is SwitchCase2<I, LS> {
  return isOfType(input, switchCase2Marker);
}
function mkSwitchCase2<IN, IN1, IN2, LS1, LS2, LS3>(
  f: Func<IN, LS1>,
  case1: StepFunction<IN1, LS2>,
  case2: StepFunction<IN2, LS3>,
  case1Name: string,
  case2Name: string,
  id: string,
): SwitchCase2<IN, LS1 & LS2 & LS3> {
  return {
    type: switchCase2Marker,
    f,
    case1: case1 as StepFunction<unknown, unknown>,
    case2: case2 as StepFunction<unknown, unknown>,
    case1Name,
    case2Name,
    lambdas: { ...f.lambdas, ...case1.lambdas, ...case2.lambdas },
    id,
  };
}

// Type marker: Do not export the symbol, this destroys type safety
// Has to be a string iff the error is directly serialized (e.g. for the frontend)
const switchCase3Marker: unique symbol = Symbol();
export type SwitchCase3<IN, LS> = {
  type: typeof switchCase3Marker;
  f: Func<IN, unknown>;
  case1: StepFunction<unknown, unknown>;
  case2: StepFunction<unknown, unknown>;
  case3: StepFunction<unknown, unknown>;
  lambdas: PhantomType<LS>;
  case1Name: string;
  case2Name: string;
  case3Name: string;
  id: string;
};
export function isSwitchCase3<I, LS>(
  input: StepFunction<I, LS>,
): input is SwitchCase3<I, LS> {
  return isOfType(input, switchCase3Marker);
}
function mkSwitchCase3<IN, IN1, IN2, IN3, LS1, LS2, LS3, LS4>(
  f: Func<IN, LS1>,
  case1: StepFunction<IN1, LS2>,
  case2: StepFunction<IN2, LS3>,
  case3: StepFunction<IN3, LS4>,
  case1Name: string,
  case2Name: string,
  case3Name: string,
  id: string,
): SwitchCase3<IN, LS1 & LS2 & LS3 & LS4> {
  return {
    type: switchCase3Marker,
    f,
    case1: case1 as StepFunction<unknown, unknown>,
    case2: case2 as StepFunction<unknown, unknown>,
    case3: case3 as StepFunction<unknown, unknown>,
    case1Name,
    case2Name,
    case3Name,
    lambdas: {
      ...f.lambdas,
      ...case1.lambdas,
      ...case2.lambdas,
      ...case3.lambdas,
    },
    id,
  };
}

// Type marker: Do not export the symbol, this destroys type safety
// Has to be a string iff the error is directly serialized (e.g. for the frontend)
const loopWhileMarker: unique symbol = Symbol();
export type LoopWhile<IN, LS> = {
  type: typeof loopWhileMarker;
  f: Func<IN, unknown>;
  continuation: StepFunction<unknown, unknown>;
  durationSeconds: number;
  lambdas: PhantomType<LS>;
  id: string;
};

export function isLoopWhile<I, LS>(
  input: StepFunction<I, LS>,
): input is LoopWhile<I, LS> {
  return isOfType(input, loopWhileMarker);
}
function mkLoopWhile<IN, CONTIN, LS, LSCONT>(
  f: Func<IN, LS>,
  continuation: StepFunction<CONTIN, LSCONT>,
  durationSeconds: number,
  id: string,
): LoopWhile<IN, LS & LSCONT> {
  return {
    type: loopWhileMarker,
    f,
    continuation: continuation as StepFunction<unknown, unknown>,
    durationSeconds,
    lambdas: { ...f.lambdas, ...continuation.lambdas },
    id,
  };
}

export type StepFunction<I, LS> =
  | Func<I, LS>
  | Rest<I, LS>
  | IfThenElse<I, LS>
  | LoopWhile<I, LS>
  | SwitchCase2<I, LS>
  | SwitchCase3<I, LS>
  | Final<I, LS>;

/**
 * Creates a single function as step function
 *
 * @param uniqueIdentifier - a globally unique
 * @param inner - the function to execute
 * @returns
 */
export const createFunction = mkFunc;

/**
 * Executes the provided function @param f and pass the input to the provided step function
 * @param rest
 *
 * @param f - the function to execute
 * @param fnUniqueIdentifier - a globally unique identifier for @param f
 * @param rest - the step function to execute afterwards
 * @returns the composed step function
 *
 */
export function prepend<FIN, RESTIN, LSF, LSREST>(
  fnUniqueIdentifier: keyof LSF & string,
  f: (i: FIN) => Promise<RESTIN>,
  rest: StepFunction<RESTIN, LSREST>,
): StepFunction<FIN, LSF & LSREST> {
  const func = mkFunc(fnUniqueIdentifier, f);
  const newLambdas = { ...func.lambdas, ...rest.lambdas };
  return mkRest(func, rest, newLambdas);
}

/**
 * Evaluates @param f and the based on the result passed to the "condition"
 * field in the return value executes @param restTrue or @param restFalse
 *
 * @param f - the function to execute
 * @param fnUniqueIdentifier - a globally unique identifier for @param f
 * @param restTrue - step function to execute in case `condition` is "true"
 * @param restFalse - step function to execute in case `condition` is "false"
 * @returns the if/then/else step function
 */
export function ifThenElse<FIN, RESTIN, LSF, LS1, LS2>(
  f: (i: FIN) => Promise<RESTIN & { condition: boolean }>,
  fnUniqueIdentifier: keyof LSF & string,
  restTrue: StepFunction<RESTIN, LS1>,
  restFalse: StepFunction<RESTIN, LS2>,
): StepFunction<FIN, LSF & LS1 & LS2> {
  const func = mkFunc(fnUniqueIdentifier, f);
  return mkIfThenElse(func, restTrue, restFalse, fnUniqueIdentifier);
}

/**
 * Loops the excution of @param f until a payload `output` is present
 *
 * @param f - the function to execute
 * @param fnUniqueIdentifier - a globally unique identifier for @param f
 * @param continuation the function to execute after the loop
 * @param durationSeconds the pause between invocations of @param f
 * @returns the loop step function
 */
export function loopWhile<FIN, CONTIN, LSF, LSC>(
  f: (i: FIN) => Promise<FIN & { output?: CONTIN }>,
  fnUniqueIdentifier: keyof LSF & string,
  continuation: StepFunction<CONTIN, LSC>,
  durationSeconds: number,
): StepFunction<FIN, LSF & LSC> {
  const func = mkFunc(fnUniqueIdentifier, f);
  return mkLoopWhile(func, continuation, durationSeconds, fnUniqueIdentifier);
}

export type Case<IN, LS, CHARACTERISTIC extends string> = {
  case: StepFunction<IN, LS>;
  name: CHARACTERISTIC;
};

/**
 * Switch case over 2 cases
 *
 * @param f - the function to evaluate returns the case in the characteristic field
 * @param fnUniqueIdentifier  - a globally unique indentifier for @param f returns
 * the characteristic to choose in the characteristic field in the return value
 * @param case1 - case 1
 * @param case2 - case 2
 * @returns - the step function
 */
export function switchCase2<
  FIN,
  LSF,
  LS1,
  LS2,
  CASEIN,
  CASE1 extends string,
  CASE2 extends string,
>(
  f: (i: FIN) => Promise<CASEIN & { characteristic: CASE1 | CASE2 }>,
  fnUniqueIdentifier: keyof LSF & string,
  case1: StepFunction<CASEIN, LS1>,
  case2: StepFunction<CASEIN, LS2>,
  case1Name: CASE1,
  case2Name: CASE2,
): StepFunction<FIN, LSF & LS1 & LS2> {
  const func = mkFunc(fnUniqueIdentifier, f);
  return mkSwitchCase2(
    func,
    case1,
    case2,
    case1Name,
    case2Name,
    fnUniqueIdentifier,
  );
}

/**
 * Switch case over 3 cases
 *
 * @param f - the function to evaluate returns the case in the characteristic field
 * @param fnUniqueIdentifier  - a globally unique indentifier for @param f returns
 * the characteristic to choose in the characteristic field in the return value
 * @param case1 - case 1
 * @param case2 - case 2
 * @param case3 - case 3
 * @returns - the step function
 */
export function switchCase3<
  FIN,
  LSF,
  LS1,
  LS2,
  LS3,
  CASEIN,
  CASE1 extends string,
  CASE2 extends string,
  CASE3 extends string,
>(
  f: (i: FIN) => Promise<CASEIN & { characteristic: CASE1 | CASE2 }>,
  fnUniqueIdentifier: keyof LSF & string,
  case1: StepFunction<CASEIN, LS1>,
  case2: StepFunction<CASEIN, LS2>,
  case3: StepFunction<CASEIN, LS3>,
  case1Name: CASE1,
  case2Name: CASE2,
  case3Name: CASE3,
): StepFunction<FIN, LSF & LS1 & LS2 & LS3> {
  const func = mkFunc(fnUniqueIdentifier, f);
  return mkSwitchCase3(
    func,
    case1,
    case2,
    case3,
    case1Name,
    case2Name,
    case3Name,
    fnUniqueIdentifier,
  );
}
