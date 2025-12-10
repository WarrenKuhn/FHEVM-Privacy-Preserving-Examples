# Technical Documentation: Privacy-Preserving Transportation Dispatch

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Cryptographic Model](#cryptographic-model)
3. [Smart Contract Specification](#smart-contract-specification)
4. [FHE Operations Reference](#fhe-operations-reference)
5. [Integration Guide](#integration-guide)
6. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Layers

```
┌─────────────────────────────────────────┐
│     User Interface Layer                 │
│  (Web3 Wallet, Transaction UI)          │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│     Contract Interaction Layer           │
│  (Web3 Libraries, Contract ABI)         │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│     Smart Contract Layer                 │
│  (AnonymousTransport.sol)                │
│  ├─ Route Management                    │
│  ├─ Request Processing                  │
│  ├─ FHE-Based Optimization              │
│  └─ Access Control                      │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│     FHEVM Encryption Layer               │
│  (Zama FHEVM Library)                   │
│  ├─ euint16, euint32 Types              │
│  ├─ Arithmetic Operations                │
│  ├─ Comparison Operations                │
│  └─ Conditional Operations               │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│     Blockchain Layer                     │
│  (Ethereum Sepolia)                     │
└─────────────────────────────────────────┘
```

### Data Flow

#### Route Registration Flow

```
User (Carrier)
    │
    ├─ Specifies: startX, startY, endX, endY, capacity, priority
    │
    ▼
Contract.registerRoute()
    │
    ├─ FHE.asEuint16(startX) → Encrypt coordinate
    ├─ FHE.asEuint16(startY) → Encrypt coordinate
    ├─ FHE.asEuint16(endX)   → Encrypt coordinate
    ├─ FHE.asEuint16(endY)   → Encrypt coordinate
    ├─ FHE.asEuint32(capacity) → Encrypt capacity
    ├─ FHE.asEuint16(priority) → Encrypt priority
    │
    ├─ FHE.allowThis(encStartX) → Grant contract permission
    ├─ FHE.allowThis(encStartY) → Grant contract permission
    ├─ FHE.allowThis(encEndX)   → Grant contract permission
    ├─ FHE.allowThis(encEndY)   → Grant contract permission
    ├─ FHE.allowThis(encCapacity) → Grant contract permission
    ├─ FHE.allowThis(encPriority) → Grant contract permission
    │
    ├─ FHE.allow(encStartX, msg.sender) → Grant carrier permission
    ├─ FHE.allow(encStartY, msg.sender) → Grant carrier permission
    ├─ FHE.allow(encEndX, msg.sender)   → Grant carrier permission
    ├─ FHE.allow(encEndY, msg.sender)   → Grant carrier permission
    ├─ FHE.allow(encCapacity, msg.sender) → Grant carrier permission
    ├─ FHE.allow(encPriority, msg.sender) → Grant carrier permission
    │
    ├─ routes[routeCounter] = RouteData{...}
    ├─ carrierRoutes[msg.sender].push(routeCounter)
    ├─ emit RouteRegistered(routeCounter, msg.sender)
    │
    ▼
Blockchain
    └─ Immutable encrypted route record
```

#### Optimization Flow

```
Carrier calls optimizeSchedule(routeId)
    │
    ▼
Contract.optimizeSchedule()
    │
    ├─ For each unmatched request:
    │   │
    │   ├─ _checkRouteCompatibility(routeId, requestId)
    │   │   │
    │   │   ├─ pickupInRoute = FHE.and(
    │   │   │       FHE.le(route.startX - 50, request.pickupX),
    │   │   │       FHE.le(request.pickupX, route.endX + 50)
    │   │   │   )
    │   │   │
    │   │   ├─ dropInRoute = FHE.and(
    │   │   │       FHE.le(route.startY - 50, request.dropY),
    │   │   │       FHE.le(request.dropY, route.endY + 50)
    │   │   │   )
    │   │   │
    │   │   ├─ withinCapacity = FHE.le(request.weight, route.capacity)
    │   │   │
    │   │   └─ return FHE.and(FHE.and(pickupInRoute, dropInRoute), withinCapacity)
    │   │
    │   ├─ If compatible, add to compatibleRequests[]
    │   └─ totalLoad = FHE.add(totalLoad, request.weight)
    │
    ├─ efficiency = _calculateEfficiency(routeId, compatibleRequests, count)
    │   │
    │   ├─ Aggregate encrypted urgency and weight
    │   ├─ Calculate base efficiency
    │   ├─ Apply conditional boost if significant weight
    │   └─ return efficiency score
    │
    ├─ schedules[routeId] = OptimalSchedule{...}
    ├─ FHE.allowThis(totalLoad)
    ├─ FHE.allowThis(efficiency)
    ├─ FHE.allow(totalLoad, msg.sender)
    ├─ FHE.allow(efficiency, msg.sender)
    ├─ emit ScheduleOptimized(routeId, timestamp)
    │
    ▼
Blockchain
    └─ Immutable optimization record with encrypted metrics
```

---

## Cryptographic Model

### FHEVM Encryption Binding

FHEVM uses a unique cryptographic binding model where encrypted values are bound to specific `[contract, user]` pairs:

```
Encrypted Value = Encrypt(plaintext, [contract_address, user_address])
```

This binding ensures:
1. An encrypted value created for `[ContractA, Alice]` cannot be used in `[ContractB, Bob]`
2. Both the contract and user must explicitly grant permission to use the value
3. Decryption is only possible with knowledge of the binding parameters

### Permission Gates

Every encrypted value in FHEVM requires two permission gates:

```solidity
// Grant contract permission (allows contract to compute on value)
FHE.allowThis(encryptedValue);

// Grant user permission (allows user to operate on value)
FHE.allow(encryptedValue, msg.sender);
```

### Type System

```solidity
// 8-bit encrypted unsigned integer
euint8 smallValue = FHE.asEuint8(value);

// 16-bit encrypted unsigned integer (used for coordinates)
euint16 coordinate = FHE.asEuint16(value);

// 32-bit encrypted unsigned integer (used for weights, capacity)
euint32 capacity = FHE.asEuint32(value);

// Encrypted boolean (result of comparisons)
ebool isGreater = FHE.gt(valueA, valueB);
```

### Comparison Operations

```solidity
// Less than
ebool result = FHE.lt(a, b);

// Less than or equal
ebool result = FHE.le(a, b);

// Greater than
ebool result = FHE.gt(a, b);

// Greater than or equal
ebool result = FHE.ge(a, b);

// Equal
ebool result = FHE.eq(a, b);

// Not equal
ebool result = FHE.ne(a, b);
```

### Arithmetic Operations

```solidity
// Addition (maintains type)
euint32 sum = FHE.add(a, b);

// Subtraction (must ensure a >= b to avoid underflow)
euint32 diff = FHE.sub(a, b);

// Multiplication
euint32 product = FHE.mul(a, b);

// Note: Division is not supported in FHEVM
```

### Boolean Operations

```solidity
// Logical AND
ebool result = FHE.and(boolA, boolB);

// Logical OR
ebool result = FHE.or(boolA, boolB);

// Logical NOT
ebool result = FHE.not(boolValue);

// Conditional selection (if condition then trueValue else falseValue)
euint32 result = FHE.select(condition, trueValue, falseValue);
```

### Critical Pattern: Ranged Comparisons

One of the key techniques used in route optimization:

```solidity
// Check if value is within range [min, max]
// Implementation: (value >= min) AND (value <= max)
ebool isInRange = FHE.and(
    FHE.le(minBound, value),        // value >= min
    FHE.le(value, maxBound)         // value <= max
);
```

In the context of route matching:

```solidity
// Check if pickup point is within route's service area (50 unit buffer)
ebool pickupServiceable = FHE.and(
    FHE.le(
        FHE.sub(route.startX, FHE.asEuint16(50)),  // min bound
        request.pickupX                             // value
    ),
    FHE.le(
        request.pickupX,                            // value
        FHE.add(route.endX, FHE.asEuint16(50))     // max bound
    )
);
```

---

## Smart Contract Specification

### State Variables

```solidity
address public owner;                    // Contract owner
uint32 public routeCounter;              // Route ID generator
uint32 public requestCounter;            // Request ID generator

mapping(uint32 => RouteData) public routes;              // All routes
mapping(uint32 => TransportRequest) public requests;    // All requests
mapping(uint32 => OptimalSchedule) public schedules;    // All schedules

mapping(address => uint32[]) public carrierRoutes;      // Carrier's routes
mapping(address => uint32[]) public userRequests;       // User's requests
```

### Events

```solidity
event RouteRegistered(uint32 indexed routeId, address indexed carrier);
event RequestSubmitted(uint32 indexed requestId, address indexed requester);
event ScheduleOptimized(uint32 indexed routeId, uint256 timestamp);
event TransportMatched(uint32 indexed requestId, uint32 indexed routeId);
```

### Modifiers

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not authorized");
    _;
}

modifier onlyCarrier(uint32 _routeId) {
    require(routes[_routeId].carrier == msg.sender, "Not route carrier");
    _;
}
```

### Gas Considerations

#### registerRoute()
- 6 type conversions: ~6,000 gas
- 6 allowThis permissions: ~60,000 gas
- 6 allow permissions: ~70,000 gas
- Storage write: ~20,000 gas
- Total: ~156,000 gas

#### submitTransportRequest()
- 7 type conversions: ~7,000 gas
- 7 allowThis permissions: ~70,000 gas
- 7 allow permissions: ~84,000 gas
- Storage write: ~20,000 gas
- Total: ~181,000 gas

#### optimizeSchedule()
- Loop iterations: ~100 requests × 3,000 gas = ~300,000 gas
- FHE operations: ~50,000 gas
- Storage writes: ~20,000 gas
- Permissions: ~30,000 gas
- Total: ~400,000 gas (highly variable)

---

## FHE Operations Reference

### Basic Arithmetic Pattern

```solidity
// Accumulate encrypted values
euint32 accumulator = FHE.asEuint32(0);

// Loop through items
for (uint32 i = 0; i < itemCount; i++) {
    euint32 itemValue = FHE.asEuint32(items[i]);
    accumulator = FHE.add(accumulator, itemValue);
}

// Grant permissions on result
FHE.allowThis(accumulator);
FHE.allow(accumulator, msg.sender);
```

### Conditional Pattern

```solidity
// Determine condition
ebool shouldBoost = FHE.gt(totalWeight, FHE.asEuint32(threshold));

// Calculate both outcomes
euint16 standardResult = FHE.asEuint16(baseValue);
euint16 boostedResult = FHE.mul(baseValue, FHE.asEuint16(2));

// Select based on condition (no plaintext comparison!)
euint16 finalResult = FHE.select(shouldBoost, boostedResult, standardResult);

// Grant permissions
FHE.allowThis(finalResult);
FHE.allow(finalResult, msg.sender);
```

### Range Check Pattern

```solidity
// Check if coordinate is within [minX, maxX] × [minY, maxY]
ebool withinRange = FHE.and(
    FHE.and(
        FHE.le(minX, coordinate.x),
        FHE.le(coordinate.x, maxX)
    ),
    FHE.and(
        FHE.le(minY, coordinate.y),
        FHE.le(coordinate.y, maxY)
    )
);
```

### Optimization Pattern

```solidity
function optimizeSelection(
    uint32[] memory candidates,
    uint32 candidateCount
) private returns (uint32[] memory optimal) {
    uint32[] memory selected = new uint32[](candidates.length);
    uint32 selectedCount = 0;
    euint32 totalMetric = FHE.asEuint32(0);

    // Evaluate each candidate on encrypted metrics
    for (uint32 i = 0; i < candidateCount; i++) {
        ebool meetsRequirement = evaluateCandidate(candidates[i]);

        // Only process if meets requirement
        if (/* condition determined by FHE */) {
            selected[selectedCount] = candidates[i];
            totalMetric = FHE.add(totalMetric, getMetric(candidates[i]));
            selectedCount++;
        }
    }

    // Return selected candidates
    return selected;
}
```

---

## Integration Guide

### Prerequisites

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "dependencies": {
    "@fhevm/solidity": "^0.7.0",
    "@fhevm/hardhat-plugin": "^0.0.1-3",
    "ethers": "^5.7.2"
  }
}
```

### Contract Interaction Example

#### Using ethers.js v5

```typescript
import { ethers } from 'ethers';

// 1. Connect to network
const provider = ethers.getDefaultProvider('sepolia');
const wallet = new ethers.Wallet(privateKey, provider);

// 2. Get contract instance
const contract = new ethers.Contract(
    contractAddress,
    abi,
    wallet
);

// 3. Register route
const tx = await contract.registerRoute(
    startX,      // uint16
    startY,      // uint16
    endX,        // uint16
    endY,        // uint16
    capacity,    // uint32
    priority     // uint16
);

const receipt = await tx.wait();
console.log('Route registered:', receipt.transactionHash);

// 4. Listen for events
contract.on('RouteRegistered', (routeId, carrier) => {
    console.log(`Route ${routeId} registered by ${carrier}`);
});
```

#### Reading Data

```typescript
// Get route information (public data only)
const routeInfo = await contract.getRouteInfo(routeId);
console.log('Active:', routeInfo.isActive);
console.log('Carrier:', routeInfo.carrier);
console.log('Created:', new Date(routeInfo.timestamp * 1000));

// Get user's requests
const userRequests = await contract.getUserRequests(userAddress);
console.log('User has', userRequests.length, 'requests');

// Get carrier's routes
const carrierRoutes = await contract.getCarrierRoutes(carrierAddress);
console.log('Carrier manages', carrierRoutes.length, 'routes');
```

### Web3.js Integration

```typescript
import Web3 from 'web3';

const web3 = new Web3('https://sepolia.infura.io/v3/YOUR_API_KEY');
const contract = new web3.eth.Contract(abi, contractAddress);

// Submit request
const result = await contract.methods.submitTransportRequest(
    pickupX,
    pickupY,
    dropX,
    dropY,
    weight,
    urgency,
    maxCost
).send({
    from: senderAddress,
    gas: 200000,
});

console.log('Request submitted:', result.transactionHash);
```

---

## Troubleshooting

### Common Issues

#### Issue 1: "Permission Denied" Error

**Symptom**: Transaction reverts with permission-related error

**Cause**: Missing `FHE.allowThis()` or `FHE.allow()` calls

**Solution**:
```solidity
// Always grant both permissions
FHE.allowThis(encryptedValue);           // Contract permission
FHE.allow(encryptedValue, msg.sender);   // User permission
```

#### Issue 2: Gas Limit Exceeded

**Symptom**: Transaction fails with "out of gas" error

**Cause**: Too many FHE operations in single transaction

**Solution**:
```typescript
// Increase gas limit
const tx = await contract.optimizeSchedule(routeId, {
    gasLimit: 500000  // Increase if needed
});
```

#### Issue 3: Type Mismatch in FHE Operations

**Symptom**: Compilation error about incompatible types

**Cause**: Operating on different euint types

**Solution**:
```solidity
// Convert to same type before operation
euint16 a = FHE.asEuint16(16bitValue);
euint32 b = FHE.asEuint32(32bitValue);

// Convert a to euint32 for operation
euint32 c = FHE.add(
    euint32(a),  // Convert euint16 to euint32
    b
);
```

#### Issue 4: Incorrect Coordinate Bounds

**Symptom**: Routes and requests never match despite being compatible

**Cause**: Incorrect range calculation

**Solution**:
```solidity
// Double-check bounds calculation
// For point to be in range [start, end]:
// start <= point <= end
ebool inRange = FHE.and(
    FHE.le(startBound, point),  // point >= start
    FHE.le(point, endBound)      // point <= end
);

// Use consistent coordinate system (e.g., 0-1000 for each axis)
```

### Performance Optimization

#### Reduce Loop Iterations

```solidity
// SLOW: Check all requests every time
for (uint32 i = 1; i < requestCounter; i++) {
    // Check compatibility
}

// FAST: Maintain list of unmatched requests
for (uint32 i = 0; i < unmatchedRequestCount; i++) {
    uint32 requestId = unmatchedRequests[i];
    // Check compatibility
}
```

#### Batch Permissions

```solidity
// SLOW: Grant permissions individually
for (uint32 i = 0; i < requests.length; i++) {
    FHE.allow(requests[i], msg.sender);  // Multiple calls
}

// FAST: Grant once after aggregation
euint32 aggregated = requests[0];
for (uint32 i = 1; i < requests.length; i++) {
    aggregated = FHE.add(aggregated, requests[i]);
}
FHE.allow(aggregated, msg.sender);  // Single call
```

### Monitoring and Debugging

#### Log FHE Operations

```solidity
// Include detailed events
event RouteCompatibilityChecked(
    uint32 indexed routeId,
    uint32 indexed requestId,
    uint256 checkTimestamp
);

// Emit after compatibility check
emit RouteCompatibilityChecked(routeId, requestId, block.timestamp);
```

#### Monitor Gas Usage

```typescript
// Get transaction receipt and analyze gas
const receipt = await tx.wait();
console.log('Gas used:', receipt.gasUsed.toString());
console.log('Gas price:', receipt.effectiveGasPrice.toString());
console.log('Total cost:', receipt.gasUsed.mul(receipt.effectiveGasPrice).toString());
```

---

## References and Resources

- **FHEVM Library Documentation**: https://docs.zama.ai/fhevm
- **Encrypted Types in TypeScript**: https://docs.zama.ai/fhevm/fundamentals/encrypted_types
- **Comparison Operations**: https://docs.zama.ai/fhevm/fundamentals/operations#comparison-and-boolean-operations
- **Smart Contract Examples**: https://github.com/zama-ai/fhevm-hardhat-template
- **Zama Academy**: https://zama.ai/blog/

---

**Document Version**: 1.0
**Last Updated**: December 2025
**Status**: Production Ready
