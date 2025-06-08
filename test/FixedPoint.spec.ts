import { expect } from "chai";
import { ethers } from "hardhat";
import { getWallets } from "./helper";
import { Wallet } from "ethers";

const Q112 = ethers.getBigInt(2) ** ethers.getBigInt(112);

describe("FixedPoint", function () {
  let fixedPoint: any;
  let walletForLargeContract: Wallet;

  beforeEach(async function () {
    [walletForLargeContract] = getWallets(1);
    const FixedPointTest = await ethers.getContractFactory("FixedPointTest", walletForLargeContract);
    fixedPoint = await FixedPointTest.deploy();
    await fixedPoint.waitForDeployment();
  });

  describe("encode", function () {
    it("shifts left by 112", async function () {
      expect((await fixedPoint.encode("0x01"))[0]).to.eq(Q112.toString());
    });

    it("will not take >uint112(-1)", async function () {
      const value = ethers.getBigInt(2) ** ethers.getBigInt(113) - ethers.getBigInt(1);
      try {
        await fixedPoint.encode(value);
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).to.include("value out-of-bounds");
      }
    });
  });

  describe("encode144", function () {
    it("shifts left by 112", async function () {
      expect((await fixedPoint.encode144("0x01"))[0]).to.eq(Q112.toString());
    });

    it("will not take >uint144(-1)", async function () {
      const value = ethers.getBigInt(2) ** ethers.getBigInt(145) - ethers.getBigInt(1);
      try {
        await fixedPoint.encode144(value);
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).to.include("value out-of-bounds");
      }
    });
  });

  describe("decode", function () {
    it("shifts right by 112", async function () {
      expect(await fixedPoint.decode([ethers.getBigInt(3) * Q112])).to.eq(ethers.getBigInt(3));
    });

    it("will not take >uint224(-1)", async function () {
      const value = ethers.getBigInt(2) ** ethers.getBigInt(225) - ethers.getBigInt(1);
      try {
        await fixedPoint.decode([value]);
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).to.include("value out-of-bounds");
      }
    });
  });

  describe("decode144", function () {
    it("shifts right by 112", async function () {
      expect(await fixedPoint.decode([ethers.getBigInt(3) * Q112])).to.eq(ethers.getBigInt(3));
    });

    it("will not take >uint256(-1)", async function () {
      const value = ethers.getBigInt(2) ** ethers.getBigInt(257) - ethers.getBigInt(1);
      try {
        await fixedPoint.decode([value]);
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).to.include("value out-of-bounds");
      }
    });
  });

  describe("mul", function () {
    it("works for 0", async function () {
      expect((await fixedPoint.mul([0], 1))[0]).to.eq(0);
      expect((await fixedPoint.mul([1], 0))[0]).to.eq(0);
    });

    it("correct multiplication", async function () {
      expect((await fixedPoint.mul([ethers.getBigInt(3) * Q112], ethers.getBigInt(2)))[0]).to.eq(
        ethers.getBigInt(3) * ethers.getBigInt(2) * Q112
      );
    });

    it("overflow", async function () {
      await expect(fixedPoint.mul([ethers.getBigInt(1) * Q112], ethers.getBigInt(2) ** ethers.getBigInt(144))).to.be.revertedWith(
        "FixedPoint::mul: overflow"
      );
    });

    it("max of q112x112", async function () {
      expect((await fixedPoint.mul([ethers.getBigInt(2) ** ethers.getBigInt(112)], ethers.getBigInt(2) ** ethers.getBigInt(112)))[0]).to.eq(
        ethers.getBigInt(2) ** ethers.getBigInt(224)
      );
    });

    it("max without overflow, largest fixed point", async function () {
      const maxMultiplier = ethers.getBigInt(2) ** ethers.getBigInt(32);
      expect((await fixedPoint.mul([ethers.getBigInt(2) ** ethers.getBigInt(224) - ethers.getBigInt(1)], maxMultiplier))[0]).to.eq(
        ethers.getBigInt("115792089237316195423570985008687907853269984665640564039457584007908834672640")
      );
      await expect(fixedPoint.mul([ethers.getBigInt(2) ** ethers.getBigInt(224) - ethers.getBigInt(1)], maxMultiplier + ethers.getBigInt(1))).to.be.revertedWith(
        "FixedPoint::mul: overflow"
      );
    });

    it("max without overflow, smallest fixed point", async function () {
      const maxUint = ethers.getBigInt(2) ** ethers.getBigInt(256) - ethers.getBigInt(1);
      expect((await fixedPoint.mul([ethers.getBigInt(1)], maxUint))[0]).to.eq(maxUint);
      await expect(fixedPoint.mul([ethers.getBigInt(2)], maxUint)).to.be.revertedWith(
        "FixedPoint::mul: overflow"
      );
    });
  });

  describe("muli", function () {
    it("works for 0", async function () {
      expect(await fixedPoint.muli([ethers.getBigInt(0) * Q112], ethers.getBigInt(1))).to.eq(ethers.getBigInt(0));
      expect(await fixedPoint.muli([ethers.getBigInt(1) * Q112], ethers.getBigInt(0))).to.eq(ethers.getBigInt(0));
    });

    it("works for 3*2", async function () {
      expect(await fixedPoint.muli([ethers.getBigInt(3) * Q112], ethers.getBigInt(2))).to.eq(ethers.getBigInt(6));
    });

    it("works for 3*-2", async function () {
      expect(await fixedPoint.muli([ethers.getBigInt(3) * Q112], ethers.getBigInt(-2))).to.eq(ethers.getBigInt(-6));
    });

    it("max without overflow, largest int", async function () {
      const maxInt = ethers.getBigInt(2) ** ethers.getBigInt(255) - ethers.getBigInt(1);
      expect(await fixedPoint.muli([ethers.getBigInt(1) * Q112], maxInt)).to.be.eq(maxInt);

      const minInt = ethers.getBigInt(2) ** ethers.getBigInt(255) * ethers.getBigInt(-1);
      await expect(fixedPoint.muli([ethers.getBigInt(1) * Q112], minInt)).to.be.revertedWith(
        "FixedPoint::muli: overflow"
      );

      expect(await fixedPoint.muli([ethers.getBigInt(1) * Q112 - ethers.getBigInt(1)], minInt)).to.be.eq(
        "-57896044618658097711785492504343942776262393067508711251869655679775811829760"
      );
      expect(await fixedPoint.muli([ethers.getBigInt(1) * Q112], minInt + ethers.getBigInt(1))).to.be.eq(minInt + ethers.getBigInt(1));
    });

    it("max without overflow, largest fixed point", async function () {
      const maxMultiplier = (ethers.getBigInt(2) ** ethers.getBigInt(255 + 112)) / (ethers.getBigInt(2) ** ethers.getBigInt(224) - ethers.getBigInt(1));
      expect(await fixedPoint.muli([ethers.getBigInt(2) ** ethers.getBigInt(224) - ethers.getBigInt(1)], maxMultiplier)).to.eq(
        ethers.getBigInt("57896044618658097711785492504343953926634992332820282019728792003954417336320")
      );
      await expect(fixedPoint.muli([ethers.getBigInt(2) ** ethers.getBigInt(224) - ethers.getBigInt(1)], maxMultiplier + ethers.getBigInt(1))).to.be.revertedWith(
        "FixedPoint::muli: overflow"
      );

      // negative versions
      expect(await fixedPoint.muli([ethers.getBigInt(2) ** ethers.getBigInt(224) - ethers.getBigInt(1)], maxMultiplier * ethers.getBigInt(-1))).to.eq(
        ethers.getBigInt("57896044618658097711785492504343953926634992332820282019728792003954417336320") * ethers.getBigInt(-1)
      );
      await expect(
        fixedPoint.muli([ethers.getBigInt(2) ** ethers.getBigInt(224) - ethers.getBigInt(1)], (maxMultiplier + ethers.getBigInt(1)) * ethers.getBigInt(-1))
      ).to.be.revertedWith("FixedPoint::muli: overflow");
    });
  });

  describe("muluq", function () {
    it("works for 0", async function () {
      expect((await fixedPoint.muluq([ethers.getBigInt(0)], [Q112]))[0]).to.eq(ethers.getBigInt(0));
      expect((await fixedPoint.muluq([Q112], [ethers.getBigInt(0)]))[0]).to.eq(ethers.getBigInt(0));
    });

    it("multiplies 3*2", async function () {
      expect((await fixedPoint.muluq([ethers.getBigInt(3) * Q112], [ethers.getBigInt(2) * Q112]))[0]).to.eq(
        ethers.getBigInt(3) * ethers.getBigInt(2) * Q112
      );
    });

    function multiplyExpanded(self: bigint, other: bigint): bigint {
      const upper = (self >> ethers.getBigInt(112)) * (other >> ethers.getBigInt(112));
      const lower = (self & (ethers.getBigInt(2) ** ethers.getBigInt(112) - ethers.getBigInt(1))) * (other & (ethers.getBigInt(2) ** ethers.getBigInt(112) - ethers.getBigInt(1)));
      const uppersLowero = (self >> ethers.getBigInt(112)) * (other & (ethers.getBigInt(2) ** ethers.getBigInt(112) - ethers.getBigInt(1)));
      const upperoLowers = (self & (ethers.getBigInt(2) ** ethers.getBigInt(112) - ethers.getBigInt(1))) * (other >> ethers.getBigInt(112));
      return upper * Q112 + uppersLowero + upperoLowers + lower / Q112;
    }

    it("multiplies 4/3*4/3", async function () {
      const multiplier = (ethers.getBigInt(4) * Q112) / ethers.getBigInt(3);
      const expectedResult = multiplyExpanded(multiplier, multiplier);
      expect((await fixedPoint.muluq([multiplier], [multiplier]))[0]).to.eq(expectedResult);
      expect(expectedResult + ethers.getBigInt(1)).to.eq((ethers.getBigInt(16) * Q112) / ethers.getBigInt(9)); // close to 16/9
    });

    it("overflow upper", async function () {
      const multiplier1 = Q112 * ethers.getBigInt(2);
      const multiplier2 = (Q112 * Q112) / ethers.getBigInt(2);
      await expect(fixedPoint.muluq([multiplier1], [multiplier2])).to.be.revertedWith(
        "FixedPoint::muluq: upper overflow"
      );
      expect((await fixedPoint.muluq([multiplier1 - ethers.getBigInt(1)], [multiplier2]))[0]).to.eq(
        multiplyExpanded(multiplier1 - ethers.getBigInt(1), multiplier2)
      );
      expect((await fixedPoint.muluq([multiplier1], [multiplier2 - ethers.getBigInt(1)]))[0]).to.eq(
        multiplyExpanded(multiplier1, multiplier2 - ethers.getBigInt(1))
      );
    });

    it("gas for short circuit where one multiplicand is 0", async function () {
      // expect(await fixedPoint.getGasCostOfMuluq([ethers.getBigInt(0)], [ethers.getBigInt(30) * Q112])).to.eq(671);
      // expect(await fixedPoint.getGasCostOfMuluq([ethers.getBigInt(50) * Q112], [ethers.getBigInt(0)])).to.eq(688);
    });

    it("gas", async function () {
      // expect(await fixedPoint.getGasCostOfMuluq([ethers.getBigInt(30) * Q112], [ethers.getBigInt(30) * Q112])).to.eq(992);
    });
  });

  describe("divuq", function () {
    it("works for 0 numerator", async function () {
      expect((await fixedPoint.divuq([ethers.getBigInt(0)], [Q112]))[0]).to.eq(ethers.getBigInt(0));
    });

    it("throws for 0 denominator", async function () {
      await expect(fixedPoint.divuq([Q112], [ethers.getBigInt(0)])).to.be.revertedWith(
        "FixedPoint::divuq: division by zero"
      );
    });

    it("equality 30/30", async function () {
      expect((await fixedPoint.divuq([ethers.getBigInt(30) * Q112], [ethers.getBigInt(30) * Q112]))[0]).to.eq(Q112);
    });

    it("divides 30/10", async function () {
      expect((await fixedPoint.divuq([ethers.getBigInt(30) * Q112], [ethers.getBigInt(10) * Q112]))[0]).to.eq(
        ethers.getBigInt(3) * Q112
      );
    });

    it("divides 35/8", async function () {
      expect((await fixedPoint.divuq([ethers.getBigInt(35) * Q112], [ethers.getBigInt(8) * Q112]))[0]).to.eq(
        (ethers.getBigInt(4375) * Q112) / ethers.getBigInt(1000)
      );
    });

    it("divides 1/3", async function () {
      expect((await fixedPoint.divuq([ethers.getBigInt(1) * Q112], [ethers.getBigInt(3) * Q112]))[0]).to.eq(
        // this is max precision 0.3333 repeating
        "1730765619511609209510165443073365"
      );
    });

    it("divides 1e15/3e15 (long division, repeating)", async function () {
      expect(
        (
          await fixedPoint.divuq(
            [ethers.getBigInt(10) ** ethers.getBigInt(15) * Q112],
            [ethers.getBigInt(3) * ethers.getBigInt(10) ** ethers.getBigInt(15) * Q112]
          )
        )[0]
      ).to.eq("1730765619511609209510165443073365");
    });

    it("boundary of full precision", async function () {
      const maxNumeratorFullPrecision = ethers.getBigInt(2) ** ethers.getBigInt(144) - ethers.getBigInt(1);
      const minDenominatorFullPrecision = ethers.getBigInt("4294967296"); // ceiling(uint144(-1) * Q112 / uint224(-1))

      expect((await fixedPoint.divuq([maxNumeratorFullPrecision], [minDenominatorFullPrecision]))[0]).to.eq(
        ethers.getBigInt("26959946667150639794667015087019630673637143213614752866474435543040")
      );

      await expect(
        fixedPoint.divuq([maxNumeratorFullPrecision + ethers.getBigInt(1)], [minDenominatorFullPrecision])
      ).to.be.revertedWith("FixedPoint::divuq: overflow");

      await expect(
        fixedPoint.divuq([maxNumeratorFullPrecision], [minDenominatorFullPrecision - ethers.getBigInt(1)])
      ).to.be.revertedWith("FixedPoint::divuq: overflow");
    });

    it("precision", async function () {
      const numerator = ethers.getBigInt(2) ** ethers.getBigInt(144);

      expect((await fixedPoint.divuq([numerator], [numerator - ethers.getBigInt(1)]))[0]).to.eq(
        ethers.getBigInt("5192296858534827628530496329220096")
      );

      expect((await fixedPoint.divuq([numerator], [numerator + ethers.getBigInt(1)]))[0]).to.eq(
        ethers.getBigInt("5192296858534827628530496329220095")
      );
    });

    it("gas cost of dividend = divisor short circuit", async function () {
      // expect(await fixedPoint.getGasCostOfDivuq([ethers.getBigInt(30) * Q112], [ethers.getBigInt(30) * Q112])).to.eq(698);
    });

    it("divuq overflow with smaller numbers", async function () {
      const numerator = ethers.getBigInt(2) ** ethers.getBigInt(143);
      const denominator = ethers.getBigInt(2) ** ethers.getBigInt(29);
      await expect(fixedPoint.divuq([numerator], [denominator])).to.be.revertedWith("FixedPoint::divuq: overflow");
    });

    it("divuq overflow with large numbers", async function () {
      const numerator = ethers.getBigInt(2) ** ethers.getBigInt(145);
      const denominator = ethers.getBigInt(2) ** ethers.getBigInt(32);
      await expect(fixedPoint.divuq([numerator], [denominator])).to.be.revertedWith("FixedPoint::divuq: overflow");
    });

    it("gas cost of full precision small dividend short circuit", async function () {
      // expect(await fixedPoint.getGasCostOfDivuq([ethers.getBigInt(125) * Q112], [ethers.getBigInt(30) * Q112])).to.eq(838);
      // expect(await fixedPoint.getGasCostOfDivuq([ethers.getBigInt(28) * Q112], [ethers.getBigInt(280) * Q112])).to.eq(838);
      // expect(await fixedPoint.getGasCostOfDivuq([ethers.getBigInt(1) * Q112], [ethers.getBigInt(3) * Q112])).to.eq(838);
    });

    it("gas cost of long division with less than 112 iterations", async function () {
      // long division but makes fewer iterations
      // expect(
      //   await fixedPoint.getGasCostOfDivuq([ethers.getBigInt(10) ** ethers.getBigInt(10) * Q112], [ethers.getBigInt(25) * Q112])
      // ).to.eq(1502);
    });

    it("gas cost of long division with all iterations", async function () {
      // 1/3rd, should make all iterations
      // expect(
      //   await fixedPoint.getGasCostOfDivuq(
      //     [ethers.getBigInt(10) ** ethers.getBigInt(10) * Q112],
      //     [ethers.getBigInt(3) * ethers.getBigInt(10) ** ethers.getBigInt(10) * Q112]
      //   )
      // ).to.eq(1502);
    });
  });

  describe("fraction", function () {
    it("correct computation less than 1", async function () {
      expect((await fixedPoint.fraction(4, 100))[0]).to.eq((ethers.getBigInt(4) * Q112) / ethers.getBigInt(100));
    });

    it("correct computation greater than 1", async function () {
      expect((await fixedPoint.fraction(100, 4))[0]).to.eq((ethers.getBigInt(100) * Q112) / ethers.getBigInt(4));
    });

    it("fails with 0 denominator", async function () {
      await expect(fixedPoint.fraction(ethers.getBigInt(1), ethers.getBigInt(0))).to.be.revertedWith(
        "FixedPoint::fraction: division by zero"
      );
    });

    it("can be called with numerator exceeding uint112 max", async function () {
      expect((await fixedPoint.fraction(Q112 * ethers.getBigInt(2359), 6950))[0]).to.eq((Q112 * Q112 * ethers.getBigInt(2359)) / ethers.getBigInt(6950));
    });

    it("can be called with denominator exceeding uint112 max", async function () {
      expect((await fixedPoint.fraction(2359, Q112 * ethers.getBigInt(2359)))[0]).to.eq(1);
    });

    it("can be called with numerator exceeding uint144 max", async function () {
      expect((await fixedPoint.fraction(Q112 * ethers.getBigInt(2359) * (ethers.getBigInt(2) ** ethers.getBigInt(32)), Q112 * ethers.getBigInt(50)))[0]).to.eq(
        (ethers.getBigInt(2359) * Q112 * (ethers.getBigInt(2) ** ethers.getBigInt(32))) / ethers.getBigInt(50)
      );
    });

    it("can be called with numerator and denominator exceeding uint112 max", async function () {
      expect((await fixedPoint.fraction(Q112 * ethers.getBigInt(2359), Q112 * ethers.getBigInt(50)))[0]).to.eq((ethers.getBigInt(2359) * Q112) / ethers.getBigInt(50));
    });

    it("short circuits for 0", async function () {
      expect((await fixedPoint.fraction(0, Q112 * Q112 * ethers.getBigInt(2360)))[0]).to.eq(0);
    });

    it("can overflow if result of division does not fit", async function () {
      await expect(fixedPoint.fraction(Q112 * ethers.getBigInt(2359), 50)).to.be.revertedWith("FixedPoint::fraction: overflow");
    });

    it("gas cost of 0", async function () {
      // expect(await fixedPoint.getGasCostOfFraction(ethers.getBigInt(0), ethers.getBigInt(569))).to.eq(210);
    });

    it("gas cost of smaller numbers", async function () {
      // expect(await fixedPoint.getGasCostOfFraction(ethers.getBigInt(239), ethers.getBigInt(569))).to.eq(314);
    });

    it("gas cost of number greater than Q112 numbers", async function () {
      // expect(await fixedPoint.getGasCostOfFraction(Q112 * ethers.getBigInt(2359), Q112 * ethers.getBigInt(2360))).to.eq(314);
    });

    it("gas cost of number greater than Q112 numbers", async function () {
      // expect(
      //   await fixedPoint.getGasCostOfFraction(Q112 * (ethers.getBigInt(2) ** ethers.getBigInt(32)) * ethers.getBigInt(2359), Q112 * ethers.getBigInt(2360))
      // ).to.eq(996);
    });
  });

  describe("reciprocal", function () {
    it("fails for 0", async function () {
      await expect(fixedPoint.reciprocal([ethers.getBigInt(0)])).to.be.revertedWith(
        "FixedPoint::reciprocal: reciprocal of zero"
      );
    });

    it("fails for 1", async function () {
      await expect(fixedPoint.reciprocal([ethers.getBigInt(1)])).to.be.revertedWith("FixedPoint::reciprocal: overflow");
    });

    it("works for 0.25", async function () {
      expect((await fixedPoint.reciprocal([Q112 * ethers.getBigInt(25) / ethers.getBigInt(100)]))[0]).to.eq(Q112 * ethers.getBigInt(4));
    });

    it("works for 5", async function () {
      expect((await fixedPoint.reciprocal([Q112 * ethers.getBigInt(5)]))[0]).to.eq(Q112 / ethers.getBigInt(5));
    });
  });

  describe("sqrt", function () {
    it("works with 0", async function () {
      expect((await fixedPoint.sqrt([ethers.getBigInt(0)]))[0]).to.eq(ethers.getBigInt(0));
    });

    it("works with numbers less than 1", async function () {
      expect((await fixedPoint.sqrt([ethers.getBigInt(1225) * Q112 / ethers.getBigInt(100)]))[0]).to.eq(
        ethers.getBigInt(35) * Q112 / ethers.getBigInt(10)
      );
    });

    it("gas cost of less than 1", async function () {
      // const input = ethers.getBigInt(1225) * Q112 / ethers.getBigInt(100);
      // expect(await fixedPoint.getGasCostOfSqrt([input])).to.eq(1173);
    });

    it("works for 25", async function () {
      expect((await fixedPoint.sqrt([ethers.getBigInt(25) * Q112]))[0]).to.eq(ethers.getBigInt(5) * Q112);
    });

    it("gas cost of 25", async function () {
      // const input = ethers.getBigInt(25) * Q112;
      // expect(await fixedPoint.getGasCostOfSqrt([input])).to.eq(1191);
    });

    it("works for max uint144", async function () {
      const input = ethers.getBigInt(2) ** ethers.getBigInt(144) - ethers.getBigInt(1);
      const result = (await fixedPoint.sqrt([input]))[0];
      const expected = ethers.getBigInt("340282366920938463463374607431768211455");
      expect(result).to.eq(expected);
    });

    it("gas cost of max uint144", async function () {
      // const input = ethers.getBigInt(2) ** ethers.getBigInt(144) - ethers.getBigInt(1);
      // expect(await fixedPoint.getGasCostOfSqrt([input])).to.eq(1235);
    });

    it("works for 2**144", async function () {
      const input = ethers.getBigInt(2) ** ethers.getBigInt(144);
      const result = (await fixedPoint.sqrt([input]))[0];
      const expected = ethers.getBigInt("340282366920938463463374607431768211456");
      expect(result).to.eq((expected >> ethers.getBigInt(2)) << ethers.getBigInt(2));
    });

    it("gas cost of 2**144", async function () {
      // const input = ethers.getBigInt(2) ** ethers.getBigInt(144);
      // expect(await fixedPoint.getGasCostOfSqrt([input])).to.eq(1640);
    });

    it("works for encoded max uint112", async function () {
      const input = (ethers.getBigInt(2) ** ethers.getBigInt(112) - ethers.getBigInt(1)) * Q112;
      const result = (await fixedPoint.sqrt([input]))[0];
      const expected = ethers.getBigInt("374144419156711147060143317175368417003121712037887");
      expect(result).to.eq((expected >> ethers.getBigInt(40)) << ethers.getBigInt(40));
    });

    it("gas cost of encoded max uint112", async function () {
      // const input = (ethers.getBigInt(2) ** ethers.getBigInt(112) - ethers.getBigInt(1)) * Q112;
      // expect(await fixedPoint.getGasCostOfSqrt([input])).to.eq(1723);
    });

    it("works for max uint224", async function () {
      const input = ethers.getBigInt(2) ** ethers.getBigInt(224) - ethers.getBigInt(1);
      const result = (await fixedPoint.sqrt([input]))[0];
      const expected = ethers.getBigInt("374144419156711147060143317175368453031918731001855");
      expect(result).to.eq((expected >> ethers.getBigInt(40)) << ethers.getBigInt(40));
    });

    it("gas cost of max uint224", async function () {
      // const input = ethers.getBigInt(2) ** ethers.getBigInt(224) - ethers.getBigInt(1);
      // expect(await fixedPoint.getGasCostOfSqrt([input])).to.eq(1723);
    });
  });
});
