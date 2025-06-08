import { expect } from "chai";
import { ethers } from "hardhat";

const example = "0xC257274276a4E539741Ca11b590B9447B26A8051";

describe("AddressStringUtil", function () {
  let addressStringUtil: any;

  beforeEach(async function () {
    const AddressStringUtilTest = await ethers.getContractFactory("AddressStringUtilTest");
    addressStringUtil = await AddressStringUtilTest.deploy();
    await addressStringUtil.waitForDeployment();
  });

  describe("toAsciiString", function () {
    it("zero address", async function () {
      expect(await addressStringUtil.toAsciiString(ethers.ZeroAddress, 40)).to.eq(ethers.ZeroAddress.slice(2));
    });

    it("own address", async function () {
      const address = await addressStringUtil.getAddress();
      expect(await addressStringUtil.toAsciiString(address, 40)).to.eq(
        address.slice(2).toUpperCase()
      );
    });

    it("random address", async function () {
      expect(await addressStringUtil.toAsciiString(example, 40)).to.eq(example.slice(2).toUpperCase());
    });

    it("reverts if len % 2 != 0", async function () {
      await expect(addressStringUtil.toAsciiString(example, 39)).to.be.revertedWith("AddressStringUtil: INVALID_LEN");
    });

    it("reverts if len >= 40", async function () {
      await expect(addressStringUtil.toAsciiString(example, 42)).to.be.revertedWith("AddressStringUtil: INVALID_LEN");
    });

    it("reverts if len == 0", async function () {
      await expect(addressStringUtil.toAsciiString(example, 0)).to.be.revertedWith("AddressStringUtil: INVALID_LEN");
    });

    it("produces len characters", async function () {
      expect(await addressStringUtil.toAsciiString(example, 4)).to.eq(example.slice(2, 6).toUpperCase());
      expect(await addressStringUtil.toAsciiString(example, 10)).to.eq(example.slice(2, 12).toUpperCase());
      expect(await addressStringUtil.toAsciiString(example, 16)).to.eq(example.slice(2, 18).toUpperCase());
    });
  });
});
