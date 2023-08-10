import { expect } from "chai";
import { coerce } from ".";

describe("coerce", () => {
  context("given a matcher", () => {
    const match = coerce(
      () => "pending",
      (result) => `resolved: ${result}`,
      (reason) => `rejected: ${reason.message}`
    );

    context("and a promise that eventually", () => {
      const delay = 1000;

      context("rejects", () => {
        const rejects = () =>
          new Promise<number>((_, reject) =>
            setTimeout(() => reject(new Error()), delay)
          );

        it("should return the pending match", async () => {
          expect(await match(rejects())).to.equal("pending");
        });

        it("should not wait for the promise to settle", async () => {
          const started = Date.now();
          await match(rejects());
          const ended = Date.now();
          const elapsed = ended - started;
          expect(elapsed).to.be.lessThan(delay);
        });
      });

      context("resolves", () => {
        const resolves = () =>
          new Promise<number>((resolve) => setTimeout(() => resolve(1), delay));

        it("should return the pending match", async () => {
          expect(await match(resolves())).to.equal("pending");
        });

        it("should not wait for the promise to settle", async () => {
          const started = Date.now();
          await match(resolves());
          const ended = Date.now();
          const elapsed = ended - started;
          expect(elapsed).to.be.lessThan(delay);
        });
      });
    });

    context("and a promise that's resolved", () => {
      const value = 100;
      const resolved = () => Promise.resolve(value);

      it("should return the resolved match", async () => {
        expect(await match(resolved())).to.equal(`resolved: ${value}`);
      });
    });

    context("and a promise that's rejected", () => {
      const message = "error message";
      const rejected = () => Promise.reject(new Error(message));

      it("should return the rejected match", async () => {
        expect(await match(rejected())).to.equal(`rejected: ${message}`);
      });
    });
  });
});
