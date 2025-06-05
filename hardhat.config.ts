import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import "@parity/hardhat-polkadot";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.30",
  resolc: {
    compilerSource: "binary",
    settings: {
      compilerPath: "~/.cargo/bin/resolc-0.1.0-dev.16",
    }
  },
  networks: {
    hardhat: {
      polkavm: true,
      nodeConfig: {
        nodeBinaryPath: '../../../code/polkadot-sdk/target/debug/substrate-node',
        rpcPort: 8000,
        dev: true,
      },
      adapterConfig: {
        adapterBinaryPath: '../../../code/polkadot-sdk/target/debug/eth-rpc',
        dev: true,
      },
    },
    local: {
      polkavm: true,
      url: 'http://127.0.0.1:8545',
      accounts: [
        process.env.LOCAL_PRIV_KEY as string,
        process.env.AH_PRIV_KEY as string,
      ],
    },

    ah: {
      polkavm: true,
      url: "https://westend-asset-hub-eth-rpc.polkadot.io",
      accounts: [
        process.env.AH_PRIV_KEY as string,
      ],
    },
  }
};

export default config;
