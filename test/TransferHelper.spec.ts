import { expect } from "chai";
import { ethers } from "hardhat";

describe("TransferHelper", function () {
  let transferHelper: any;
  let fakeFallback: any;
  let fakeCompliant: any;
  let fakeNoncompliant: any;
  let wallet: any;

  beforeEach(async function () {
    [wallet] = await ethers.getSigners();
    const TransferHelperTest = await ethers.getContractFactory("TransferHelperTest");
    const FakeFallback = await ethers.getContractFactory("TransferHelperTestFakeFallback");
    const FakeERC20Noncompliant = await ethers.getContractFactory("TransferHelperTestFakeERC20Noncompliant");
    const FakeERC20Compliant = await ethers.getContractFactory("TransferHelperTestFakeERC20Compliant");

    transferHelper = await TransferHelperTest.deploy();
    fakeFallback = await FakeFallback.deploy();
    fakeNoncompliant = await FakeERC20Noncompliant.deploy();
    fakeCompliant = await FakeERC20Compliant.deploy();

    await transferHelper.waitForDeployment();
    await fakeFallback.waitForDeployment();
    await fakeNoncompliant.waitForDeployment();
    await fakeCompliant.waitForDeployment();
  });

  // sets up the fixtures for each token situation that should be tested
  function harness({ sendTx, expectedError }: { sendTx: (tokenAddress: string) => Promise<void>; expectedError: string }) {
    it("succeeds with compliant with no revert and true return", async function () {
      await fakeCompliant.setup(true, false);
      await sendTx(await fakeCompliant.getAddress());
    });

    it("fails with compliant with no revert and false return", async function () {
      await fakeCompliant.setup(false, false);
      await expect(sendTx(await fakeCompliant.getAddress())).to.be.revertedWith(expectedError);
    });

    it("fails with compliant with revert", async function () {
      await fakeCompliant.setup(false, true);
      await expect(sendTx(await fakeCompliant.getAddress())).to.be.revertedWith(expectedError);
    });

    it("succeeds with noncompliant (no return) with no revert", async function () {
      await fakeNoncompliant.setup(false);
      await sendTx(await fakeNoncompliant.getAddress());
    });

    it("fails with noncompliant (no return) with revert", async function () {
      await fakeNoncompliant.setup(true);
      await expect(sendTx(await fakeNoncompliant.getAddress())).to.be.revertedWith(expectedError);
    });
  }

  describe("#safeApprove", function () {
    harness({
      sendTx: (tokenAddress) => transferHelper.safeApprove(tokenAddress, ethers.ZeroAddress, ethers.MaxUint256),
      expectedError: "TransferHelper::safeApprove: approve failed",
    });
  });

  describe("#safeTransfer", function () {
    harness({
      sendTx: (tokenAddress) => transferHelper.safeTransfer(tokenAddress, ethers.ZeroAddress, ethers.MaxUint256),
      expectedError: "TransferHelper::safeTransfer: transfer failed",
    });
  });

  describe("#safeTransferFrom", function () {
    harness({
      sendTx: (tokenAddress) =>
        transferHelper.safeTransferFrom(tokenAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.MaxUint256),
      expectedError: "TransferHelper::transferFrom: transferFrom failed",
    });
  });

  describe("#safeTransferETH", function () {
    it("succeeds call not reverted", async function () {
      await fakeFallback.setup(false);
      await transferHelper.safeTransferETH(await fakeFallback.getAddress(), 0);
    });

    it("fails if call reverts", async function () {
      await fakeFallback.setup(true);
      await expect(transferHelper.safeTransferETH(await fakeFallback.getAddress(), 0)).to.be.revertedWith(
        "TransferHelper::safeTransferETH: ETH transfer failed"
      );
    });
  });
});
