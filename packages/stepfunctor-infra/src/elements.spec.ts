import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Construct } from 'constructs';
import path from 'path';
import { buildStepFunctionConstruct } from './infra/infra.js';
import {
  final,
  ifThenElse,
  loopWhile,
  prepend,
  StepFunction,
  switchCase2,
  switchCase3,
} from 'stepfunctor-lang';

class TestStack<IN, LS> extends Stack {
  constructor(sf: StepFunction<IN, LS>, scope: Construct) {
    super(scope, 'myStack');
    buildStepFunctionConstruct(
      sf,
      {
        moduleName: 'index',
        artifactPath: path.join(
          __dirname,
          '../../../packages/example-lambda/dist/',
        ),
        scope: this,
      },
      'MyStepFunction',
    );
  }
}

describe('elements of the language', () => {
  test('simple function', () => {
    const sf = prepend(
      'function',
      async () => {
        console.log('hello');
      },
      final('theend'),
    );
    const stack = new TestStack(sf, new App());

    const template = Template.fromStack(stack);

    expect(template.toJSON()).toMatchSnapshot();
  });

  test('if then else', () => {
    const sf = ifThenElse(
      async () => {
        return { condition: 1 === 1 };
      },
      'condition',
      final('true'),
      final('false'),
    );
    const stack = new TestStack(sf, new App());

    const template = Template.fromStack(stack);

    expect(template.toJSON()).toMatchSnapshot();
  });

  test('case 2', () => {
    const sf = switchCase2(
      async () => {
        return { characteristic: 'case2' };
      },
      'switchcase',
      final('case1'),
      final('case2'),
      'case1',
      'case2',
    );
    const stack = new TestStack(sf, new App());

    const template = Template.fromStack(stack);

    expect(template.toJSON()).toMatchSnapshot();
  });

  test('case 3', () => {
    const sf = switchCase3(
      async () => {
        return { characteristic: 'case2' };
      },
      'switchcase',
      final('case1'),
      final('case2'),
      final('case3'),
      'case1',
      'case2',
      'case3',
    );
    const stack = new TestStack(sf, new App());

    const template = Template.fromStack(stack);

    expect(template.toJSON()).toMatchSnapshot();
  });

  test('loop', () => {
    const sf = loopWhile(
      async () => {
        return { output: 42 };
      },
      'loop',
      final('case1'),
      2,
    );
    const stack = new TestStack(sf, new App());

    const template = Template.fromStack(stack);

    expect(template.toJSON()).toMatchSnapshot();
  });
});
