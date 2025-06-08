import { expect } from "chai";
import { ethers } from "hardhat";
import { BaseContract } from "ethers";

interface AddressStringUtilTest extends BaseContract {
  toAsciiString(address: string, len: number): Promise<string>;
  address: string;
  deployed(): Promise<AddressStringUtilTest>;
}

describe("AddressStringUtil", function () {
  let addressStringUtil: AddressStringUtilTest;
  const example = "0xC257274276a4E539741Ca11b590B9447B26A8051";

  beforeEach(async function () {
    const AddressStringUtilTest = await ethers.getContractFactory("AddressStringUtilTest");
    addressStringUtil = await AddressStringUtilTest.deploy() as AddressStringUtilTest;
    await addressStringUtil.deployed();
  });

  describe("toAsciiString", function () {
    it("should handle zero address", async function () {
      const result = await addressStringUtil.toAsciiString(ethers.ZeroAddress, 40);
      expect(result).to.equal(ethers.ZeroAddress.slice(2));
    });

    it("should handle contract address", async function () {
      const result = await addressStringUtil.toAsciiString(addressStringUtil.address, 40);
      expect(result).to.equal(addressStringUtil.address.slice(2).toUpperCase());
    });

    it("should handle random address", async function () {
      const result = await addressStringUtil.toAsciiString(example, 40);
      expect(result).to.equal(example.slice(2).toUpperCase());
    });

    it("should revert if length is odd", async function () {
      await expect(addressStringUtil.toAsciiString(example, 39))
        .to.be.revertedWith("AddressStringUtil: INVALID_LEN");
    });

    it("should revert if length is greater than 40", async function () {
      await expect(addressStringUtil.toAsciiString(example, 42))
        .to.be.revertedWith("AddressStringUtil: INVALID_LEN");
    });

    it("should revert if length is 0", async function () {
      await expect(addressStringUtil.toAsciiString(example, 0))
        .to.be.revertedWith("AddressStringUtil: INVALID_LEN");
    });

    it("should produce correct length characters", async function () {
      const result4 = await addressStringUtil.toAsciiString(example, 4);
      expect(result4).to.equal(example.slice(2, 6).toUpperCase());

      const result10 = await addressStringUtil.toAsciiString(example, 10);
      expect(result10).to.equal(example.slice(2, 12).toUpperCase());

      const result16 = await addressStringUtil.toAsciiString(example, 16);
      expect(result16).to.equal(example.slice(2, 18).toUpperCase());
    });
  });
});
