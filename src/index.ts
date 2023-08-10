const Pending = Symbol("pending");

export const coerce =
  <T, A, R = Error>(
    pending: () => A,
    resolved: (result: T) => A,
    rejected: (reason: R) => A
  ) =>
  (value: Promise<T>): Promise<A> =>
    Promise.race([value, Pending]).then(
      (result) => (result === Pending ? pending() : resolved(result as T)),
      rejected
    );
