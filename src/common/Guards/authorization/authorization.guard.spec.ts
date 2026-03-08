import { AuthorizationGuard } from "./authorization.guard";
import { Reflector } from "@nestjs/core";

describe("AuthorizationGuard", () => {
  it("should be defined", () => {
    expect(new AuthorizationGuard(new Reflector())).toBeDefined();
  });
});
