import { ethers } from "hardhat";
import { Wallet } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

declare const hre: HardhatRuntimeEnvironment;

// get the n wallets from hardhat config
export function getWallets(n: number): Wallet[] {
    const provider = new ethers.JsonRpcProvider(hre.network.config.url);
    const accounts = hre.network.config.accounts as string[];
    const allWallets = accounts.map((account: string) => new Wallet(account, provider));
    return allWallets.slice(0, n);
  }