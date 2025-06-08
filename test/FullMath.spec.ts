import { expect } from "chai";
import { ethers } from "hardhat";

describe("FullMath", function () {
  let fm: any;

  beforeEach(async function () {
    const FullMathTest = await ethers.getContractFactory("FullMathTest");
    fm = await FullMathTest.deploy();
    await fm.waitForDeployment();
  });

  describe("#mulDiv", function () {
    const Q128 = ethers.getBigInt(2) ** ethers.getBigInt(128);

    it("accurate without phantom overflow", async function () {
      const result = Q128 / ethers.getBigInt(3);
      expect(
        await fm.mulDiv(
          Q128,
          /*0.5=*/ (ethers.getBigInt(50) * Q128) / ethers.getBigInt(100),
          /*1.5=*/ (ethers.getBigInt(150) * Q128) / ethers.getBigInt(100)
        )
      ).to.eq(result);

      expect(
        await fm.mulDivRoundingUp(
          Q128,
          /*0.5=*/ (ethers.getBigInt(50) * Q128) / ethers.getBigInt(100),
          /*1.5=*/ (ethers.getBigInt(150) * Q128) / ethers.getBigInt(100)
        )
      ).to.eq(result + ethers.getBigInt(1));
    });

    it("accurate with phantom overflow", async function () {
      const result = (ethers.getBigInt(4375) * Q128) / ethers.getBigInt(1000);
      expect(await fm.mulDiv(Q128, ethers.getBigInt(35) * Q128, ethers.getBigInt(8) * Q128)).to.eq(result);
      expect(await fm.mulDivRoundingUp(Q128, ethers.getBigInt(35) * Q128, ethers.getBigInt(8) * Q128)).to.eq(result);
    });

    it("accurate with phantom overflow and repeating decimal", async function () {
      const result = (ethers.getBigInt(1) * Q128) / ethers.getBigInt(3);
      expect(await fm.mulDiv(Q128, ethers.getBigInt(1000) * Q128, ethers.getBigInt(3000) * Q128)).to.eq(result);
      expect(await fm.mulDivRoundingUp(Q128, ethers.getBigInt(1000) * Q128, ethers.getBigInt(3000) * Q128)).to.eq(
        result + ethers.getBigInt(1)
      );
    });
  });
});
