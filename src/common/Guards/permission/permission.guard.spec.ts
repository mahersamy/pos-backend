import { PermissionGuard } from "./permission.guard";
import { Reflector } from "@nestjs/core";

describe("PermissionGuard", () => {
  it("should be defined", () => {
    expect(new PermissionGuard(new Reflector())).toBeDefined();
  });
});
