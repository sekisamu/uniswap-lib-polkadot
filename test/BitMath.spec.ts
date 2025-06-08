import { expect } from "chai";
import { ethers } from "hardhat";

describe("BitMath", function () {
  let bitMath: any;

  beforeEach(async function () {
    const BitMathTest = await ethers.getContractFactory("BitMathTest");
    bitMath = await BitMathTest.deploy();
    await bitMath.waitForDeployment();
  });

  describe("mostSignificantBit", function () {
    it("0", async function () {
      await expect(bitMath.mostSignificantBit(0)).to.be.revertedWith("BitMath::mostSignificantBit: zero");
    });

    it("1", async function () {
      expect(await bitMath.mostSignificantBit(1)).to.eq(0);
    });

    it("2", async function () {
      expect(await bitMath.mostSignificantBit(2)).to.eq(1);
    });

    it("all powers of 2", async function () {
      const results = [];
      for (let i = 0; i < 255; i++) {
        results.push(await bitMath.mostSignificantBit(ethers.getBigInt(2) ** ethers.getBigInt(i)));
      }
      expect(results).to.deep.eq([...Array(255)].map((_, i) => i));
    });

    it("uint256(-1)", async function () {
      expect(await bitMath.mostSignificantBit(ethers.MaxUint256)).to.eq(255);
    });

    // it("gas cost of smaller number", async function () {
    //   expect(await bitMath.getGasCostOfMostSignificantBit(3568)).to.eq(295);
    // });

    // it("gas cost of max uint128", async function () {
    //   expect(await bitMath.getGasCostOfMostSignificantBit(ethers.getBigInt(2) ** ethers.getBigInt(128) - ethers.getBigInt(1))).to.eq(367);
    // });

    // it("gas cost of max uint256", async function () {
    //   expect(await bitMath.getGasCostOfMostSignificantBit(ethers.MaxUint256)).to.eq(385);
    // });
  });

  describe("leastSignificantBit", function () {
    it("0", async function () {
      await expect(bitMath.leastSignificantBit(0)).to.be.revertedWith("BitMath::leastSignificantBit: zero");
    });

    it("1", async function () {
      expect(await bitMath.leastSignificantBit(1)).to.eq(0);
    });

    it("2", async function () {
      expect(await bitMath.leastSignificantBit(2)).to.eq(1);
    });

    it("all powers of 2", async function () {
      const results = [];
      for (let i = 0; i < 255; i++) {
        results.push(await bitMath.leastSignificantBit(ethers.getBigInt(2) ** ethers.getBigInt(i)));
      }
      expect(results).to.deep.eq([...Array(255)].map((_, i) => i));
    });

    it("uint256(-1)", async function () {
      expect(await bitMath.leastSignificantBit(ethers.MaxUint256)).to.eq(0);
    });

    // it("gas cost of smaller number", async function () {
    //   expect(await bitMath.getGasCostOfLeastSignificantBit(3568)).to.eq(408);
    // });

    // it("gas cost of max uint128", async function () {
    //   expect(await bitMath.getGasCostOfLeastSignificantBit(ethers.getBigInt(2) ** ethers.getBigInt(128) - ethers.getBigInt(1))).to.eq(407);
    // });

    // it("gas cost of max uint256", async function () {
    //   expect(await bitMath.getGasCostOfLeastSignificantBit(ethers.MaxUint256)).to.eq(407);
    // });
  });
});
