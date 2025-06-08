import { expect } from "chai";
import { ethers } from "hardhat";

describe("Babylonian", function () {
  let babylonian: any;

  beforeEach(async function () {
    const BabylonianTest = await ethers.getContractFactory("BabylonianTest");
    babylonian = await BabylonianTest.deploy();
    await babylonian.waitForDeployment();
  });

  describe("sqrt", function () {
    it("works for 0-99", async function () {
      for (let i = 0; i < 100; i++) {
        expect(await babylonian.sqrt(i)).to.eq(Math.floor(Math.sqrt(i)));
      }
    });

    it("product of numbers close to max uint112", async function () {
      const max = ethers.getBigInt(2) ** ethers.getBigInt(112) - ethers.getBigInt(1);
      expect(await babylonian.sqrt(max * max)).to.eq(max);
      const maxMinus1 = max - ethers.getBigInt(1);
      expect(await babylonian.sqrt(maxMinus1 * maxMinus1)).to.eq(maxMinus1);
      const maxMinus2 = max - ethers.getBigInt(2);
      expect(await babylonian.sqrt(maxMinus2 * maxMinus2)).to.eq(maxMinus2);

      expect(await babylonian.sqrt(max * maxMinus1)).to.eq(maxMinus1);
      expect(await babylonian.sqrt(max * maxMinus2)).to.eq(maxMinus2);
      expect(await babylonian.sqrt(maxMinus1 * maxMinus2)).to.eq(maxMinus2);
    });

    it("max uint256", async function () {
      const expected = ethers.getBigInt(2) ** ethers.getBigInt(128) - ethers.getBigInt(1);
      expect(await babylonian.sqrt(ethers.MaxUint256)).to.eq(expected);
    });

    // it("gas cost", async function () {
    //   expect(await babylonian.getGasCostOfSqrt(150)).to.eq(678);
    // });

    // it("gas cost of large number", async function () {
    //   expect(await babylonian.getGasCostOfSqrt(ethers.getBigInt(2) ** ethers.getBigInt(150))).to.eq(720);
    // });

    // it("gas cost of max uint", async function () {
    //   expect(await babylonian.getGasCostOfSqrt(ethers.MaxUint256)).to.eq(798);
    // });
  });
});
