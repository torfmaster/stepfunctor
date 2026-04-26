// Interpreter

import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Duration } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import {
  Chain,
  Choice,
  Condition,
  Pass,
  Result,
  StateMachine,
  Succeed,
  TaskInput,
  Wait,
  WaitTime,
} from 'aws-cdk-lib/aws-stepfunctions';
import {
  Func,
  isFunc,
  isIfThenElse,
  isLoopWhile,
  isRest,
  isSwitchCase2,
  isSwitchCase3,
  StepFunction,
  assertExhausted,
  isFinal,
} from 'stepfunctor-lang';

export type CdkExecutionContext = {
  moduleName: string;
  artifactPath: string;
  scope: Construct;
};

type Ret<LS> = {
  lambdaInvoke: LambdaInvoke;
  lambdas: { [key in keyof LS]: Function };
};
function buildLambda<IN, LS>(
  fn: Func<IN, LS>,
  context: CdkExecutionContext,
): Ret<LS> {
  const lambdaFunction = new Function(
    context.scope,
    `${fn.uniqueIdentifier}-lambda`,
    {
      runtime: Runtime.NODEJS_22_X,
      handler: `${context.moduleName}.${fn.uniqueIdentifier}`,
      code: Code.fromAsset(context.artifactPath),
    },
  );
  const m: { [key: string]: Function } = {};
  m[fn.uniqueIdentifier] = lambdaFunction;
  return {
    lambdaInvoke: new LambdaInvoke(
      context.scope,
      `${fn.uniqueIdentifier}-invoke`,
      {
        lambdaFunction: lambdaFunction,
        payload: TaskInput.fromJsonPathAt('$.Payload'),
      },
    ),
    lambdas: m as { [key in keyof LS]: Function },
  };
}

// FIXME: the next two types deserve a better name
type Utility<LS, F> = { [key in keyof LS]: F };

type Return<LS> = {
  chain: Chain;
  lambdas: { [key in keyof LS]: Function };
};

function buildStepFunctionInner<I, LS>(
  sf: StepFunction<I, LS>,
  context: CdkExecutionContext,
): Return<LS> {
  if (isFunc(sf)) {
    const l = buildLambda(sf, context);

    return { chain: Chain.start(l.lambdaInvoke), lambdas: l.lambdas };
  }

  if (isRest(sf)) {
    const { f, rest } = sf;
    const nextable1 = buildLambda(f, context);
    const nextable2 = buildStepFunctionInner(rest, context);
    const combinedLambdas = { ...nextable1.lambdas, ...nextable2.lambdas };
    return {
      chain: nextable1.lambdaInvoke.next(nextable2.chain),
      lambdas: combinedLambdas as { [key in keyof LS]: Function },
    };
  }

  if (isIfThenElse(sf)) {
    const { f, case1: restTrue, case2: restFalse } = sf;
    const condition = buildLambda(f, context);
    const sfTrue = buildStepFunctionInner(restTrue, context);
    const sfFalse = buildStepFunctionInner(restFalse, context);
    const choice = new Choice(context.scope, `${sf.id}-choice`)
      .when(Condition.booleanEquals('$.condition', true), sfTrue.chain)
      .otherwise(sfFalse.chain);
    const composition = condition.lambdaInvoke.next(choice);
    const combinedLambdas = {
      ...condition.lambdas,
      ...sfTrue.lambdas,
      ...sfFalse.lambdas,
    };
    return {
      chain: composition,
      lambdas: combinedLambdas as Utility<LS, Function>,
    };
  }

  if (isLoopWhile(sf)) {
    const { f, continuation, durationSeconds } = sf;
    const condition = buildLambda(f, context);
    const continuationStepFunction = buildStepFunctionInner(
      continuation,
      context,
    );

    const wait = new Wait(context.scope, `${sf.id}-wait`, {
      time: WaitTime.duration(Duration.seconds(durationSeconds)),
    });

    const transformer = new Pass(context.scope, `${sf.id}-pass`, {
      inputPath: '$.Payload.output',
      result: Result.fromObject({
        Payload: Result.fromObject({}),
      }),
      resultPath: '$.Payload',
    });

    const conditionChain = Chain.start(condition.lambdaInvoke);
    conditionChain.next(
      // fixme generate id
      new Choice(context.scope, `${sf.id}-condition`)
        // fixme map payload to match types
        .when(
          Condition.isPresent('$.Payload.output'),
          transformer.next(continuationStepFunction.chain),
        )
        .otherwise(wait.next(conditionChain)),
    );
    const lambdas = {
      ...continuationStepFunction.lambdas,
      ...condition.lambdas,
    };
    return { chain: conditionChain, lambdas: lambdas as Utility<LS, Function> };
  }

  if (isSwitchCase2(sf)) {
    const { f, case1, case2, case1Name } = sf;
    const switcher = buildLambda(f, context);
    const case1Sf = buildStepFunctionInner(case1, context);
    const case2Sf = buildStepFunctionInner(case2, context);

    const choice = new Choice(context.scope, 'SwitchCase')
      .when(
        Condition.stringEquals('$.characteristic', case1Name),
        case1Sf.chain,
      )
      .otherwise(case2Sf.chain);
    const composition = switcher.lambdaInvoke.next(choice);
    const combinedLambdas = {
      ...switcher.lambdas,
      ...case1Sf.lambdas,
      ...case2Sf.lambdas,
    };
    return {
      chain: composition,
      lambdas: combinedLambdas as Utility<LS, Function>,
    };
  }

  if (isSwitchCase3(sf)) {
    const { f, case1, case2, case3, case1Name, case2Name } = sf;
    const switcher = buildLambda(f, context);
    const case1Sf = buildStepFunctionInner(case1, context);
    const case2Sf = buildStepFunctionInner(case2, context);
    const case3Sf = buildStepFunctionInner(case3, context);

    const choice = new Choice(context.scope, `${sf.id}-choice`)
      .when(
        Condition.stringEquals('$.characteristic', case1Name),
        case1Sf.chain,
      )
      .when(
        Condition.stringEquals('$.characteristic', case2Name),
        case2Sf.chain,
      )
      .otherwise(case3Sf.chain);
    const composition = switcher.lambdaInvoke.next(choice);
    const combinedLambdas = {
      ...switcher.lambdas,
      ...case1Sf.lambdas,
      ...case2Sf.lambdas,
      ...case3Sf.lambdas,
    };
    return {
      chain: composition,
      lambdas: combinedLambdas as Utility<LS, Function>,
    };
  }

  if (isFinal(sf)) {
    return {
      chain: Chain.start(new Succeed(context.scope, sf.id)),
      lambdas: {} as Utility<LS, Function>,
    };
  }

  assertExhausted(sf);
}

export type PublicReturn<LS> = { lambdas: { [key in keyof LS]: Function } };

export function buildStepFunctionConstruct<I, LS>(
  sf: StepFunction<I, LS>,
  context: CdkExecutionContext,
  id: string,
): PublicReturn<LS> {
  const chain = buildStepFunctionInner(sf, context);
  new StateMachine(context.scope, id, {
    definition: chain.chain,
  });
  return chain;
}
