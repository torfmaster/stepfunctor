"use strict";

// packages/stepfunctor-lang/dist/src/utils/typeUtils.js
function assertExhausted(_argument) {
  throw new Error("unreachable");
}
function isOfType(input, s) {
  return input.type === s;
}

// packages/stepfunctor-lang/dist/src/lang/stepfunctionLang.js
var funcMarker = /* @__PURE__ */ Symbol();
function isFunc(input) {
  return isOfType(input, funcMarker);
}
function mkFunc(uniqueIdentifier, inner) {
  const lambdas = {};
  lambdas[uniqueIdentifier] = void 0;
  return {
    type: funcMarker,
    inner,
    uniqueIdentifier,
    lambdas
  };
}
function exportHere(f, m) {
  m.exports[f.uniqueIdentifier] = f;
}
var restMarker = /* @__PURE__ */ Symbol();
function isRest(input) {
  return isOfType(input, restMarker);
}
function mkRest(f, rest, lambdas) {
  return {
    type: restMarker,
    f,
    rest,
    lambdas
  };
}
var ifThenElseMarker = /* @__PURE__ */ Symbol();
function isIfThenElse(input) {
  return isOfType(input, ifThenElseMarker);
}
var switchCase2Marker = /* @__PURE__ */ Symbol();
function isSwitchCase2(input) {
  return isOfType(input, switchCase2Marker);
}
var switchCase3Marker = /* @__PURE__ */ Symbol();
function isSwitchCase3(input) {
  return isOfType(input, switchCase3Marker);
}
var loopWhileMarker = /* @__PURE__ */ Symbol();
function isLoopWhile(input) {
  return isOfType(input, loopWhileMarker);
}
function mkLoopWhile(f, continuation, durationSeconds) {
  return {
    type: loopWhileMarker,
    f,
    continuation,
    durationSeconds,
    lambdas: { ...f.lambdas, ...continuation.lambdas }
  };
}
function exportStepFunction(sf2, m) {
  if (isFunc(sf2)) {
    exportHere(sf2, m);
    return;
  }
  if (isRest(sf2)) {
    const { f, rest } = sf2;
    exportHere(f, m);
    exportStepFunction(rest, m);
    return;
  }
  if (isIfThenElse(sf2)) {
    const { f, case1, case2 } = sf2;
    exportHere(f, m);
    exportStepFunction(case1, m);
    exportStepFunction(case2, m);
    return;
  }
  if (isLoopWhile(sf2)) {
    const { f, continuation } = sf2;
    exportHere(f, m);
    exportStepFunction(continuation, m);
    return;
  }
  if (isSwitchCase2(sf2)) {
    const { f, case1, case2 } = sf2;
    exportHere(f, m);
    exportStepFunction(case1, m);
    exportStepFunction(case2, m);
    return;
  }
  if (isSwitchCase3(sf2)) {
    const { f, case1, case2, case3 } = sf2;
    exportHere(f, m);
    exportStepFunction(case1, m);
    exportStepFunction(case2, m);
    exportStepFunction(case3, m);
    return;
  }
  assertExhausted(sf2);
}
var createFunction = mkFunc;
function prepend(fnUniqueIdentifier, f, rest) {
  const func = mkFunc(fnUniqueIdentifier, f);
  const newLambdas = { ...func.lambdas, ...rest.lambdas };
  return mkRest(func, rest, newLambdas);
}
function loopWhile(f, fnUniqueIdentifier, continuation, durationSeconds) {
  const func = mkFunc(fnUniqueIdentifier, f);
  return mkLoopWhile(func, continuation, durationSeconds);
}

// packages/example-shared/dist/index.js
async function start() {
  return { s: "Hello, world!" };
}
async function loop(input) {
  return {
    s: input.s.substring(0, input.s.length),
    condition: input.s.length > 1
  };
}
async function cont(_) {
  console.log("done");
}
var loopSf = loopWhile(loop, "loop", createFunction("cont", cont), 5);
var sf = prepend("start", start, loopSf);

// packages/example-lambda/src/index.ts
exportStepFunction(sf, module);
