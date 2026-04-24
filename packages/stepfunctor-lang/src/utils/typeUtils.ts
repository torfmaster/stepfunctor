export function assertExhausted(_argument: never): never {
  throw new Error('unreachable');
}

// Generic Utilities for ADTs
export type GenericADTMember<T> = {
  type: T;
};

export type PayloadType<S, T extends GenericADTMember<S>> = Omit<T, 'type'>;

export function isOfType<E extends GenericADTMember<unknown>, S extends symbol>(
  input: GenericADTMember<unknown>,
  s: S,
): input is E {
  return input.type === s;
}
