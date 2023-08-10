const Pending = Symbol("pending");
type Pending = [typeof Pending];
const pending: Pending = [Pending];

const Resolved = Symbol("resolved");
type Resolved<T> = [typeof Resolved, T];
const resolved = <T>(result: T): Resolved<T> => [Resolved, result];

const Rejected = Symbol("rejected");
type Rejected<R = Error> = [typeof Rejected, R];
const rejected = <B = Error>(reason: B): Rejected<B> => [Rejected, reason];

const Coerced = Symbol("coerced");

export type Coerced<A, R = Error> = {
  [Coerced]: Pending | Resolved<A> | Rejected<R>;
};

export const coerce = <A, R = Error>(
  value: Promise<A>
): Promise<Coerced<A, R>> =>
  Promise.race([value, pending])
    .then((result) => (result === pending ? pending : resolved(result as A)))
    .catch(rejected)
    .then((coerced) => ({ [Coerced]: coerced }));

export const match =
  <T, A, R = Error>(
    pending: () => A,
    resolved: (result: T) => A,
    rejected: (reason: R) => A
  ) =>
  (coerced: Coerced<T, R>): A => {
    const value = coerced[Coerced];
    switch (value[0]) {
      case Pending:
        return pending();
      case Resolved:
        return resolved(value[1]);
      case Rejected:
        return rejected(value[1]);
    }
  };
