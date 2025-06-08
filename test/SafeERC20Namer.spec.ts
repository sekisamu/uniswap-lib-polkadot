import { expect } from "chai";
import { ethers } from "hardhat";

// last byte in bytes32 strings is null terminator
const fullBytes32Name = "NAME".repeat(8).substr(0, 31);
const fullBytes32Symbol = "SYMB".repeat(8).substr(0, 31);

describe("SafeERC20Namer", function () {
  let safeNamer: any;
  let wallet: any;

  beforeEach(async function () {
    [wallet] = await ethers.getSigners();
    const SafeERC20NamerTest = await ethers.getContractFactory("SafeERC20NamerTest");
    safeNamer = await SafeERC20NamerTest.deploy();
    await safeNamer.waitForDeployment();
  });

  async function deployCompliant({ name, symbol }: { name: string; symbol: string }) {
    const FakeCompliantERC20 = await ethers.getContractFactory("NamerTestFakeCompliantERC20");
    return await FakeCompliantERC20.deploy(name, symbol);
  }

  async function deployNoncompliant({ name, symbol }: { name: string; symbol: string }) {
    const FakeNoncompliantERC20 = await ethers.getContractFactory("NamerTestFakeNoncompliantERC20");
    return await FakeNoncompliantERC20.deploy(ethers.encodeBytes32String(name), ethers.encodeBytes32String(symbol));
  }

  async function deployOptional() {
    const FakeOptionalERC20 = await ethers.getContractFactory("NamerTestFakeOptionalERC20");
    return await FakeOptionalERC20.deploy();
  }

  async function getName(tokenAddress: string): Promise<string> {
    return await safeNamer.tokenName(tokenAddress);
  }

  async function getSymbol(tokenAddress: string): Promise<string> {
    return await safeNamer.tokenSymbol(tokenAddress);
  }

  describe("#tokenName", function () {
    it("works with compliant", async function () {
      const token = await deployCompliant({ name: "token name", symbol: "tn" });
      expect(await getName(await token.getAddress())).to.eq("token name");
    });

    it("works with noncompliant", async function () {
      const token = await deployNoncompliant({ name: "token name", symbol: "tn" });
      expect(await getName(await token.getAddress())).to.eq("token name");
    });

    it("works with empty bytes32", async function () {
      const token = await deployNoncompliant({ name: "", symbol: "" });
      expect(await getName(await token.getAddress())).to.eq((await token.getAddress()).toUpperCase().substr(2));
    });

    it("works with noncompliant full bytes32", async function () {
      const token = await deployNoncompliant({ name: fullBytes32Name, symbol: fullBytes32Symbol });
      expect(await getName(await token.getAddress())).to.eq(fullBytes32Name);
    });

    it("works with optional", async function () {
      const token = await deployOptional();
      expect(await getName(await token.getAddress())).to.eq((await token.getAddress()).toUpperCase().substr(2));
    });

    it("works with non-code address", async function () {
      expect(await getName(ethers.ZeroAddress)).to.eq(ethers.ZeroAddress.substr(2));
    });

    it("works with really long strings", async function () {
      const token = await deployCompliant({ name: "token name".repeat(32), symbol: "tn".repeat(32) });
      expect(await getName(await token.getAddress())).to.eq("token name".repeat(32));
    });

    it("falls back to address with empty strings", async function () {
      const token = await deployCompliant({ name: "", symbol: "" });
      expect(await getName(await token.getAddress())).to.eq((await token.getAddress()).toUpperCase().substr(2));
    });
  });

  describe("#tokenSymbol", function () {
    it("works with compliant", async function () {
      const token = await deployCompliant({ name: "token name", symbol: "tn" });
      expect(await getSymbol(await token.getAddress())).to.eq("tn");
    });

    it("works with noncompliant", async function () {
      const token = await deployNoncompliant({ name: "token name", symbol: "tn" });
      expect(await getSymbol(await token.getAddress())).to.eq("tn");
    });

    it("works with empty bytes32", async function () {
      const token = await deployNoncompliant({ name: "", symbol: "" });
      expect(await getSymbol(await token.getAddress())).to.eq((await token.getAddress()).substr(2, 6).toUpperCase());
    });

    it("works with noncompliant full bytes32", async function () {
      const token = await deployNoncompliant({ name: fullBytes32Name, symbol: fullBytes32Symbol });
      expect(await getSymbol(await token.getAddress())).to.eq(fullBytes32Symbol);
    });

    it("works with optional", async function () {
      const token = await deployOptional();
      expect(await getSymbol(await token.getAddress())).to.eq((await token.getAddress()).substr(2, 6).toUpperCase());
    });

    it("works with non-code address", async function () {
      expect(await getSymbol(ethers.ZeroAddress)).to.eq(ethers.ZeroAddress.substr(2, 6));
    });

    it("works with really long strings", async function () {
      const token = await deployCompliant({ name: "token name".repeat(32), symbol: "tn".repeat(32) });
      expect(await getSymbol(await token.getAddress())).to.eq("tn".repeat(32));
    });

    it("falls back to address with empty strings", async function () {
      const token = await deployCompliant({ name: "", symbol: "" });
      expect(await getSymbol(await token.getAddress())).to.eq((await token.getAddress()).substr(2, 6).toUpperCase());
    });
  });
});
