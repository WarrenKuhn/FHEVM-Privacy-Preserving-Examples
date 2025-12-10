# FHE Counter - Simple Encrypted Counter

## Overview

A beginner-friendly example demonstrating the fundamentals of Fully Homomorphic Encryption in smart contracts. This simple counter shows how to encrypt values and perform arithmetic operations on encrypted data.

**Status**: Production Ready
**Category**: Basic
**Difficulty**: Beginner
**Estimated Time**: 15 minutes
**Network**: Ethereum Sepolia Testnet

---

## What You'll Learn

✅ How to encrypt values in Solidity
✅ How to store encrypted data
✅ How to perform arithmetic on encrypted values
✅ How to grant permissions for encrypted data
✅ How to compare encrypted values

---

## The Problem

Traditional smart contracts require all data to be public or plaintext. But sometimes you want:
- Private values that only the owner can read
- Operations that don't expose intermediate values
- Encrypted state that remains encrypted during computation

**Solution**: Use FHE to keep the counter encrypted at all times.

---

## How It Works

### Traditional Counter
```solidity
contract Counter {
    uint32 private count = 0;  // Public to smart contract

    function increment(uint32 amount) external {
        count += amount;  // Exposed during computation
    }

    function getCount() external view returns (uint32) {
        return count;  // Exposed in result
    }
}
```

**Problem**: Count is always exposed to contract logic

### FHE Counter
```solidity
contract FHECounter {
    euint32 private count;  // Encrypted

    function increment(uint32 amount) external {
        euint32 encrypted = FHE.asEuint32(amount);
        count = FHE.add(count, encrypted);  // Encrypted operation
        FHE.allowThis(count);
        FHE.allow(count, msg.sender);
    }

    function getCount() external view returns (euint32) {
        return count;  // Still encrypted
    }
}
```

**Benefit**: Count stays encrypted, only caller can decrypt

---

## Key Concepts

### 1. Encryption

Convert plaintext to encrypted form:

```solidity
uint32 plainValue = 42;
euint32 encrypted = FHE.asEuint32(plainValue);
```

The `euint32` type represents encrypted unsigned 32-bit integers.

### 2. Encrypted Arithmetic

Perform arithmetic on encrypted data:

```solidity
euint32 encrypted1 = FHE.asEuint32(10);
euint32 encrypted2 = FHE.asEuint32(5);

// Add two encrypted numbers
euint32 sum = FHE.add(encrypted1, encrypted2);

// Subtract encrypted numbers
euint32 diff = FHE.sub(encrypted1, encrypted2);

// Multiply encrypted numbers
euint32 product = FHE.mul(encrypted1, encrypted2);
```

### 3. Permissions

Always grant permissions to use encrypted values:

```solidity
// Grant contract permission (allows smart contract to compute on value)
FHE.allowThis(encryptedValue);

// Grant user permission (allows user to decrypt value)
FHE.allow(encryptedValue, msg.sender);
```

### 4. Comparison

Compare encrypted values:

```solidity
euint32 encrypted1 = FHE.asEuint32(10);
euint32 encrypted2 = FHE.asEuint32(5);

// These all return ebool (encrypted boolean)
ebool isGreater = FHE.gt(encrypted1, encrypted2);   // 10 > 5 = true
ebool isEqual = FHE.eq(encrypted1, encrypted2);     // 10 == 5 = false
ebool isLess = FHE.lt(encrypted1, encrypted2);      // 10 < 5 = false
```

---

## Contract Structure

### State Variables

```solidity
euint32 private count;  // Encrypted counter value
```

### Constructor

```solidity
constructor() {
    count = FHE.asEuint32(0);  // Initialize with encrypted zero
}
```

### Functions

#### increment()

Increase counter by specified amount:

```solidity
function increment(uint32 _amount) external {
    // Encrypt the amount
    euint32 encryptedAmount = FHE.asEuint32(_amount);

    // Add to counter (encrypted operation)
    count = FHE.add(count, encryptedAmount);

    // Grant permissions
    FHE.allowThis(count);
    FHE.allow(count, msg.sender);
}
```

#### decrement()

Decrease counter by specified amount:

```solidity
function decrement(uint32 _amount) external {
    // Encrypt the amount
    euint32 encryptedAmount = FHE.asEuint32(_amount);

    // Subtract from counter (encrypted operation)
    count = FHE.sub(count, encryptedAmount);

    // Grant permissions
    FHE.allowThis(count);
    FHE.allow(count, msg.sender);
}
```

#### getCount()

Retrieve encrypted counter value:

```solidity
function getCount() external view returns (euint32) {
    return count;  // Returns encrypted value
}
```

---

## Test Examples

### Test 1: Initialize Counter

```typescript
it("should initialize counter to zero", async () => {
    const contract = await deploy();
    const count = await contract.getCount();
    // count is encrypted zero
});
```

### Test 2: Increment

```typescript
it("should increment counter", async () => {
    const contract = await deploy();

    // Increment by 10
    const tx = await contract.increment(10);
    const receipt = await tx.wait();

    expect(receipt.status).to.equal(1);  // Success
});
```

### Test 3: Decrement

```typescript
it("should decrement counter", async () => {
    const contract = await deploy();

    // Increment by 20
    await contract.increment(20);

    // Decrement by 5
    const tx = await contract.decrement(5);
    const receipt = await tx.wait();

    expect(receipt.status).to.equal(1);  // Success
});
```

### Test 4: Multiple Operations

```typescript
it("should handle multiple operations", async () => {
    const contract = await deploy();

    // Sequence of operations (all encrypted)
    await contract.increment(10);
    await contract.increment(20);
    await contract.decrement(5);
    await contract.increment(15);

    // Counter is now: 0 + 10 + 20 - 5 + 15 = 40 (but encrypted)
});
```

---

## Running Tests

### Compile

```bash
npm run compile
```

### Test

```bash
# All tests
npm run test

# This test file only
npm run test -- test/FHECounter.test.ts

# Specific test
npm run test -- --grep "increment"

# With output
npm run test -- --reporter spec
```

### Expected Output

```
FHE Counter
  ✓ should initialize to zero (100ms)
  ✓ should increment counter (150ms)
  ✓ should decrement counter (150ms)
  ✓ should handle multiple operations (200ms)
  ✓ should store encrypted value (120ms)

5 passing (720ms)
```

---

## FHE Operations Reference

### Type Conversions
```solidity
euint8 small = FHE.asEuint8(5);      // 8-bit
euint16 medium = FHE.asEuint16(100); // 16-bit
euint32 large = FHE.asEuint32(1000); // 32-bit
```

### Arithmetic
```solidity
euint32 a = FHE.asEuint32(10);
euint32 b = FHE.asEuint32(5);

euint32 sum = FHE.add(a, b);        // 10 + 5 = 15
euint32 diff = FHE.sub(a, b);       // 10 - 5 = 5
euint32 product = FHE.mul(a, b);    // 10 * 5 = 50
// Division not supported
```

### Comparison
```solidity
ebool gt = FHE.gt(a, b);    // a > b
ebool gte = FHE.ge(a, b);   // a >= b
ebool lt = FHE.lt(a, b);    // a < b
ebool lte = FHE.le(a, b);   // a <= b
ebool eq = FHE.eq(a, b);    // a == b
ebool ne = FHE.ne(a, b);    // a != b
```

### Permissions
```solidity
FHE.allowThis(value);        // Grant contract permission
FHE.allow(value, address);   // Grant user permission
```

---

## Common Mistakes to Avoid

❌ **Mistake 1**: Forgetting permissions

```solidity
// WRONG - Will fail!
count = FHE.add(count, encrypted);
// Missing: FHE.allowThis(count);
// Missing: FHE.allow(count, msg.sender);
```

✅ **Correct**:
```solidity
count = FHE.add(count, encrypted);
FHE.allowThis(count);
FHE.allow(count, msg.sender);
```

❌ **Mistake 2**: Trying to use encrypted value as if plaintext

```solidity
// WRONG - Can't compare encrypted values directly
if (count > 100) {  // This won't work!
    // ...
}
```

✅ **Correct**: Use FHE comparison
```solidity
ebool isGreater = FHE.gt(count, FHE.asEuint32(100));
// Now use FHE.select to act on result
```

---

## Deployment

### To Sepolia

```bash
export SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
export PRIVATE_KEY=0xYourKey
npm run deploy -- --network sepolia
```

### To Localhost

```bash
# Terminal 1
npx hardhat node

# Terminal 2
npx hardhat run scripts/deploy.ts --network localhost
```

---

## Next Steps

### Learn More

1. ✅ Understand this example
2. 📖 Read [Access Control Example](../access-control/README.md)
3. 🏗️ Study [Transportation Dispatch](../transportation-dispatch/README.md)
4. 🔗 Explore [TECHNICAL_DOCUMENTATION.md](../../TECHNICAL_DOCUMENTATION.md)

### Try It Yourself

1. Modify increment to add validation
2. Create a multiply function
3. Add a reset function
4. Implement a get-if-greater function

### Advanced Variations

- Multi-user counter with individual limits
- Counter with expiration
- Encrypted multiplier counter
- Time-limited counter

---

## Key Takeaways

✅ **Encryption**: Use `FHE.asEuint32()` to encrypt values
✅ **Arithmetic**: Perform operations with `FHE.add()`, `FHE.sub()`, `FHE.mul()`
✅ **Permissions**: Always call `FHE.allowThis()` and `FHE.allow()`
✅ **Comparison**: Use `FHE.gt()`, `FHE.lt()`, etc., not regular operators
✅ **Security**: Encrypted values stay encrypted throughout computation

---

## Resources

- **Full Code**: `contracts/FHECounter.sol`
- **Tests**: `test/FHECounter.test.ts`
- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **TECHNICAL_DOCUMENTATION**: See [TECHNICAL_DOCUMENTATION.md](../../TECHNICAL_DOCUMENTATION.md)

---

**Status**: Production Ready ✅
**Version**: 1.0.0
**Last Updated**: December 2025
**License**: MIT

---

[Back to Examples](../SUMMARY.md) | [Getting Started](../GETTING_STARTED.md) | [Next: Access Control](../access-control/README.md)
