const Pending = Symbol("pending");

export const coerce =
  <A, T, R = Error>(
    pending: () => A,
    resolved: (result: T) => A,
    rejected: (reason: R) => A
  ) =>
  (promise: Promise<T>): Promise<A> =>
    Promise.race([promise, Pending]).then(
      (result) => (result === Pending ? pending() : resolved(result as T)),
      rejected
    );
