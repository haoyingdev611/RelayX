// @flow
import { isValidRelayOneQR } from "../src/relayone";

it("rejects empty string", () => {
  expect(isValidRelayOneQR("")).toBe(false);
});

it("rejects string without prefix", () => {
  expect(isValidRelayOneQR("1QBphLkRZoMj9NbChkdunEgGVmaKxVkZjy")).toBe(false);
});

it("rejects valid public key without address", () => {
  expect(
    isValidRelayOneQR(
      "relayone://036c20030d511150b1a1528eaf15c3233b41c26a0737de67d4c45d4cafd1041dd1"
    )
  ).toBe(false);
});

it("rejects invalid public key", () => {
  expect(
    isValidRelayOneQR(
      "relayone://036c20030d511150b1a1528eaf15c3233b41c26a0737de67d4c45d4cafd104?address=1NBvnxX37jEtkke5B5VcGUviCADWRLvFXJ"
    )
  ).toBe(false);
});

it("accepts valid public key", () => {
  expect(
    isValidRelayOneQR(
      "relayone://036c20030d511150b1a1528eaf15c3233b41c26a0737de67d4c45d4cafd1041dd1?address=1NBvnxX37jEtkke5B5VcGUviCADWRLvFXJ"
    )
  ).toBe(true);
});
