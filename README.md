# Uniswap Solidity Library for Polkadot

This project is a Polkadot version of the Uniswap V2 Solidity library with the following modifications:

## Test Framework Migration

### Test File Modifications

1. Migration from Waffle to Hardhat

   - Removed Waffle-related dependencies and configurations
   - Replaced Waffle's `ethers` with Hardhat's `ethers`
   - Replaced Waffle's `deployContract` with Hardhat's `ethers.getContractFactory` and `deploy` methods
   - Replaced `deployed` with `waitForDeployment`

2. Updated Test Files
   - `AddressStringUtil.spec.ts`
   - `Babylonian.spec.ts`
   - `BitMath.spec.ts`
   - `FixedPoint.spec.ts`
   - `FullMath.spec.ts`
   - `SafeERC20Namer.spec.ts`
   - `TransferHelper.spec.ts`

### Reasons for Changes

1. Hardhat provides a more modern testing framework and toolchain
2. Better TypeScript support
3. More active community maintenance
4. Enhanced development experience and debugging tools

## Contract Modifications

### Major Changes

1. Updated Solidity version to 0.8.0 and above

   - Utilizing built-in overflow checks
   - Removing manual SafeMath checks
   - Improving code readability and security

2. Optimized numerical processing

   - Using `unchecked` blocks for known safe mathematical operations
   - Optimizing fixed-point calculations
   - Improving gas efficiency

### FullMath.sol Specific Changes

1. Solidity 0.8.x Compatibility

   - Replaced `-uint256` with `~uint256 + 1` for negative number representation
   - Added `unchecked` blocks to handle arithmetic operations safely
   - Removed SafeMath library dependency

2. Key Function Modifications
   - `mulDiv`: Added `unchecked` blocks for arithmetic operations
   - `fullMul`: Optimized `mulmod` operation with `unchecked` block
   - `fullDiv`: Enhanced division operations with `unchecked` blocks

### FixedPoint.sol Specific Changes

1. uint112 Boundary Handling

   - Fixed handling of maximum uint112 value (2^112 - 1)
   - Ensured proper type conversion in encode function
   - Added validation for uint112 range limits

2. Value Range Validation

   - Implemented strict bounds checking for Q112.112 format
   - Fixed overflow issues in encoding/decoding operations
   - Enhanced error handling for out-of-range values

### Reasons for Changes

1. Improved code security
2. Enhanced code maintainability
3. Adaptation to Polkadot ecosystem requirements

## Test Cases

All test cases maintain their original functional testing, including:

- Boundary condition tests
- Overflow tests
- Error handling tests
- Compatibility tests

## Usage Instructions

1. Install dependencies

```bash
pnpm install
```

2. Run tests

```bash
npx hardhat test
```

## Notes

1. All contracts use Solidity 0.8.0 or higher
2. Tests use the Hardhat testing framework
