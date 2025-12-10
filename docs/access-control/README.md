# Access Control - FHE Permission Management

## Overview

This intermediate example demonstrates proper access control patterns for encrypted values in FHEVM. You'll learn how to use `FHE.allowThis()` and `FHE.allow()` to manage permissions and control who can access encrypted data.

**Status**: Production Ready
**Category**: Intermediate
**Difficulty**: Intermediate
**Estimated Time**: 25 minutes
**Network**: Ethereum Sepolia Testnet

---

## Why Access Control Matters

When using encrypted values, you need to control:

1. **Who can compute on the value** - Contract permissions
2. **Who can decrypt the value** - User permissions
3. **What operations are allowed** - Fine-grained control
4. **When permissions are valid** - Temporal constraints

---

## The Permission Model

FHEVM uses a cryptographic binding model:

```
Encrypted Value = Encrypt(plaintext, [contract_address, user_address])
```

This binding means:
- An encrypted value is unique to a specific [contract, user] pair
- Both must explicitly grant permission
- Permissions are required before using the value

---

## Permission System Explained

### Step 1: Contract Permission (allowThis)

```solidity
euint32 myEncryptedValue = FHE.asEuint32(42);

// Grant contract permission to compute on this value
FHE.allowThis(myEncryptedValue);
```

**What it does**: Allows the smart contract itself to perform operations on the encrypted value

**Why it's needed**: The contract needs to read/compute on values it stores

### Step 2: User Permission (allow)

```solidity
// Grant specific user permission to access/decrypt this value
FHE.allow(myEncryptedValue, msg.sender);
```

**What it does**: Allows the specified user to access the encrypted value (including decryption)

**Why it's needed**: Users should only be able to access their own data

### Both Required

```solidity
function storeEncryptedValue(uint32 plainValue) external {
    // Encrypt the value
    euint32 encrypted = FHE.asEuint32(plainValue);

    // Store in contract storage
    myValue = encrypted;

    // BOTH permissions required!
    FHE.allowThis(encrypted);      // ← Contract permission
    FHE.allow(encrypted, msg.sender); // ← User permission

    // If you forget either, operations will fail!
}
```

---

## Access Control Patterns

### Pattern 1: Owner-Only Access

```solidity
contract OwnerOnly {
    address public owner;
    euint32 private secretValue;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setSecret(uint32 value) external onlyOwner {
        secretValue = FHE.asEuint32(value);

        FHE.allowThis(secretValue);
        FHE.allow(secretValue, owner);  // Only owner gets permission
    }

    function getSecret() external view onlyOwner returns (euint32) {
        return secretValue;  // Only owner can call
    }
}
```

**Use Case**: Admin-only configuration values

### Pattern 2: User-Specific Access

```solidity
contract UserData {
    mapping(address => euint32) private userSecrets;

    function setMySecret(uint32 value) external {
        euint32 encrypted = FHE.asEuint32(value);

        // Store in user's mapping
        userSecrets[msg.sender] = encrypted;

        FHE.allowThis(encrypted);
        FHE.allow(encrypted, msg.sender);  // User gets their own data
    }

    function getMySecret() external view returns (euint32) {
        return userSecrets[msg.sender];  // User can only get their own
    }
}
```

**Use Case**: Per-user private data

### Pattern 3: Multi-Party Access

```solidity
contract SharedAccess {
    euint32 private sharedSecret;
    address public party1;
    address public party2;

    constructor(address _party2) {
        party1 = msg.sender;
        party2 = _party2;
    }

    function setSharedSecret(uint32 value) external {
        require(msg.sender == party1, "Only party1");

        euint32 encrypted = FHE.asEuint32(value);
        sharedSecret = encrypted;

        FHE.allowThis(encrypted);
        FHE.allow(encrypted, party1);   // Party1 gets access
        FHE.allow(encrypted, party2);   // Party2 gets access
    }
}
```

**Use Case**: Shared secrets between multiple parties

---

## Common Pitfalls

### ❌ Pitfall 1: Missing allowThis()

```solidity
// WRONG - Missing allowThis!
function addNumbers(uint32 a, uint32 b) external returns (euint32) {
    euint32 encA = FHE.asEuint32(a);
    euint32 encB = FHE.asEuint32(b);

    return FHE.add(encA, encB);  // Will fail!
    // Missing: FHE.allowThis(encA);
    // Missing: FHE.allowThis(encB);
}
```

✅ **Correct**:
```solidity
function addNumbers(uint32 a, uint32 b) external returns (euint32) {
    euint32 encA = FHE.asEuint32(a);
    euint32 encB = FHE.asEuint32(b);

    FHE.allowThis(encA);
    FHE.allowThis(encB);

    return FHE.add(encA, encB);  // Works!
}
```

### ❌ Pitfall 2: Wrong User Permission

```solidity
// WRONG - Giving permission to wrong user!
function storeValue(uint32 value) external {
    euint32 encrypted = FHE.asEuint32(value);

    FHE.allowThis(encrypted);
    FHE.allow(encrypted, address(0));  // Wrong address!
}
```

✅ **Correct**:
```solidity
function storeValue(uint32 value) external {
    euint32 encrypted = FHE.asEuint32(value);

    FHE.allowThis(encrypted);
    FHE.allow(encrypted, msg.sender);  // Caller gets access
}
```

### ❌ Pitfall 3: Forgetting Permissions for Stored Values

```solidity
// WRONG - No permissions on stored value!
contract BadCounter {
    euint32 count;

    function increment() external {
        count = FHE.add(count, FHE.asEuint32(1));
        // Missing permissions!
    }
}
```

✅ **Correct**:
```solidity
contract GoodCounter {
    euint32 count;

    function increment() external {
        count = FHE.add(count, FHE.asEuint32(1));

        FHE.allowThis(count);
        FHE.allow(count, msg.sender);  // Grant permissions after update
    }
}
```

---

## Practical Example: Private Balance

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title PrivateBalance
 * @dev Each user has an encrypted balance only they can see
 */
contract PrivateBalance is ZamaEthereumConfig {
    mapping(address => euint32) public balances;

    event Deposit(address indexed user);
    event Withdrawal(address indexed user);

    /**
     * Deposit funds (amount is encrypted)
     */
    function deposit(uint32 amount) external {
        euint32 encAmount = FHE.asEuint32(amount);

        // Get current balance
        euint32 currentBalance = balances[msg.sender];

        // Add deposit
        euint32 newBalance = FHE.add(currentBalance, encAmount);

        // Store new balance
        balances[msg.sender] = newBalance;

        // Grant permissions - CRITICAL!
        FHE.allowThis(newBalance);
        FHE.allow(newBalance, msg.sender);  // Only user can see

        emit Deposit(msg.sender);
    }

    /**
     * Withdraw funds
     */
    function withdraw(uint32 amount) external {
        euint32 encAmount = FHE.asEuint32(amount);
        euint32 currentBalance = balances[msg.sender];

        // Subtract withdrawal
        euint32 newBalance = FHE.sub(currentBalance, encAmount);

        // Store new balance
        balances[msg.sender] = newBalance;

        // Grant permissions
        FHE.allowThis(newBalance);
        FHE.allow(newBalance, msg.sender);

        emit Withdrawal(msg.sender);
    }

    /**
     * Get your encrypted balance
     */
    function getBalance() external view returns (euint32) {
        return balances[msg.sender];  // Only caller gets their balance
    }
}
```

---

## Testing Access Control

### Test 1: Verify Permissions Are Required

```typescript
it("should require permissions to operate on encrypted values", async () => {
    const contract = await deploy();

    // Operation without permissions should fail
    await expect(
        contract.addNumbers(10, 20)  // No permissions granted
    ).to.be.reverted;
});
```

### Test 2: Verify User Isolation

```typescript
it("should prevent cross-user access", async () => {
    const contract = await deploy();

    // User 1 sets secret
    await contract.connect(user1).setSecret(42);

    // User 2 tries to get User 1's secret
    await expect(
        contract.connect(user2).getSecret()  // No permission!
    ).to.be.reverted;

    // User 1 can get their own
    const secret = await contract.connect(user1).getSecret();
    expect(secret).to.exist;
});
```

### Test 3: Verify Permission Grant

```typescript
it("should allow multiple users if permissions granted", async () => {
    const contract = await deploy();

    // Owner shares secret with user
    await contract.setSharedSecret(42);

    // Both can access
    const secret1 = await contract.connect(owner).getSecret();
    const secret2 = await contract.connect(user).getSecret();

    expect(secret1).to.exist;
    expect(secret2).to.exist;
});
```

---

## Best Practices

✅ **DO**:
- Always grant both `allowThis()` and `allow()`
- Grant permissions immediately after creating/modifying encrypted values
- Use specific addresses in `allow()`, not generic addresses
- Separate contract permissions from user permissions conceptually
- Document access control in comments

❌ **DON'T**:
- Forget permissions (will cause runtime failures)
- Grant permissions to wrong addresses
- Assume permissions persist across calls
- Use `address(0)` for user permissions
- Grant overly broad permissions

---

## Gas Optimization

### Single Permission Grant
```solidity
// Efficient for new values
FHE.allowThis(encrypted);
FHE.allow(encrypted, msg.sender);  // 2 calls
```

### Batch Permissions
```solidity
// For aggregated values, grant once
euint32 aggregated = FHE.add(a, FHE.add(b, c));
FHE.allowThis(aggregated);      // Grant on result
FHE.allow(aggregated, msg.sender);
```

---

## Next Steps

### Learn More

1. ✅ Understand this example
2. 🏗️ Study [Transportation Dispatch](../transportation-dispatch/README.md) (advanced)
3. 🔗 Review [TECHNICAL_DOCUMENTATION.md](../../TECHNICAL_DOCUMENTATION.md)

### Try It Yourself

1. Implement multi-user access patterns
2. Add temporal access controls
3. Create role-based permissions
4. Implement permission revocation

---

## Key Takeaways

✅ **Contract Permission**: `FHE.allowThis()` grants contract computing rights
✅ **User Permission**: `FHE.allow()` grants user access/decrypt rights
✅ **Both Required**: Always use both for encrypted values
✅ **Immediate**: Grant permissions right after creating/modifying
✅ **Specific**: Use specific addresses, never generic ones

---

## Resources

- **Full Code**: `contracts/AccessControl.sol`
- **Tests**: `test/AccessControl.test.ts`
- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **TECHNICAL_DOCUMENTATION**: [TECHNICAL_DOCUMENTATION.md](../../TECHNICAL_DOCUMENTATION.md)

---

**Status**: Production Ready ✅
**Version**: 1.0.0
**Last Updated**: December 2025
**License**: MIT

---

[Back to Examples](../SUMMARY.md) | [Getting Started](../GETTING_STARTED.md) | [Previous: Counter](../fhe-counter/README.md) | [Next: Transportation Dispatch](../transportation-dispatch/README.md)
