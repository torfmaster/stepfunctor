import { final, loopWhile, prepend } from 'stepfunctor-lang';

async function start() {
  return { s: 'Hello, world!' };
}

async function loop(input: {
  s: string;
}): Promise<{ s: string; output?: { s: string } }> {
  return {
    s: input.s.substring(0, input.s.length - 1),
    output: input.s.length > 1 ? undefined : { s: input.s },
  };
}

async function cont(_: { s: string }): Promise<void> {
  console.log('done');
}

const loopSf = loopWhile(
  loop,
  'loop',
  prepend('cont', cont, final('Done!')),
  5,
);

export const sf = prepend('start', start, loopSf);

// todo ifthenelse
// switch
