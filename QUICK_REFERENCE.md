# Quick Reference Guide

## Essential Commands

### Setup
```bash
npm install                    # Install dependencies
npm run compile               # Compile contracts
npm run test                  # Run all tests
npm run deploy               # Deploy to Sepolia
```

### Development
```bash
npm run test -- --reporter spec       # Detailed test output
npm run test -- --grep "Route"        # Run specific tests
npm run test -- --coverage            # Generate coverage report
npx hardhat clean                     # Clean artifacts
npx hardhat node                      # Start local network
```

### Deployment
```bash
npx hardhat run scripts/deploy.ts --network sepolia
npm run deploy -- --network hardhat   # Local deployment
npm run deploy -- --network sepolia   # Testnet deployment
```

---

## Key Contract Functions

### For Carriers

**Register a Route**
```solidity
registerRoute(
    uint16 startX,
    uint16 startY,
    uint16 endX,
    uint16 endY,
    uint32 capacity,
    uint16 priority
) external
```
Gas: ~180,000 | Event: RouteRegistered

**Optimize Schedule**
```solidity
optimizeSchedule(uint32 _routeId) external onlyCarrier(_routeId)
```
Gas: ~300,000-400,000 | Event: ScheduleOptimized

**Match Request**
```solidity
matchRequest(
    uint32 _requestId,
    uint32 _routeId
) external onlyCarrier(_routeId)
```
Gas: ~50,000 | Event: TransportMatched

**Manage Route**
```solidity
deactivateRoute(uint32 _routeId) external
reactivateRoute(uint32 _routeId) external
```

### For Requesters

**Submit Request**
```solidity
submitTransportRequest(
    uint16 pickupX,
    uint16 pickupY,
    uint16 dropX,
    uint16 dropY,
    uint32 weight,
    uint16 urgency,
    uint32 maxCost
) external
```
Gas: ~220,000 | Event: RequestSubmitted

### For Everyone

**Get Route Info**
```solidity
getRouteInfo(uint32 routeId) external view
returns (bool isActive, address carrier, uint256 timestamp)
```

**Get Request Status**
```solidity
getRequestStatus(uint32 requestId) external view
returns (bool isMatched, address requester, uint32 assignedRoute, uint256 requestTime)
```

**Get Your Routes**
```solidity
getCarrierRoutes(address carrier) external view
returns (uint32[] memory)
```

**Get Your Requests**
```solidity
getUserRequests(address user) external view
returns (uint32[] memory)
```

---

## FHE Operations Cheat Sheet

### Type Conversions
```solidity
euint16 value16 = FHE.asEuint16(uint16Value);
euint32 value32 = FHE.asEuint32(uint32Value);
euint8 value8 = FHE.asEuint8(uint8Value);
```

### Comparisons
```solidity
ebool isLess = FHE.lt(a, b);
ebool isEqual = FHE.eq(a, b);
ebool isGreater = FHE.gt(a, b);
```

### Arithmetic
```solidity
euint32 sum = FHE.add(a, b);
euint32 diff = FHE.sub(a, b);
euint32 product = FHE.mul(a, b);
// Note: Division not supported
```

### Boolean Logic
```solidity
ebool result = FHE.and(a, b);      // AND
ebool result = FHE.or(a, b);       // OR
ebool result = FHE.not(a);         // NOT
```

### Conditional Selection
```solidity
euint32 result = FHE.select(condition, ifTrue, ifFalse);
```

### Permissions (Always Required!)
```solidity
FHE.allowThis(encryptedValue);        // Contract permission
FHE.allow(encryptedValue, msg.sender); // User permission
```

---

## Common Patterns

### Range Check
```solidity
ebool inRange = FHE.and(
    FHE.le(minValue, variable),
    FHE.le(variable, maxValue)
);
```

### Accumulation Loop
```solidity
euint32 total = FHE.asEuint32(0);
for (uint32 i = 0; i < count; i++) {
    total = FHE.add(total, values[i]);
}
FHE.allowThis(total);
FHE.allow(total, msg.sender);
```

### Conditional Operation
```solidity
ebool condition = FHE.gt(value, threshold);
euint32 result = FHE.select(
    condition,
    boostedValue,
    normalValue
);
```

### Multi-Condition Check
```solidity
ebool check1 = FHE.le(a, b);
ebool check2 = FHE.ge(c, d);
ebool allPass = FHE.and(check1, check2);
```

---

## Contract Address & Info

**Network**: Ethereum Sepolia Testnet (Chain ID: 11155111)

**RPC URL Options**:
- Infura: `https://sepolia.infura.io/v3/YOUR_KEY`
- Alchemy: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`
- Public: `https://sepolia.drpc.org`

**Contract Deployment**:
```bash
# After deployment, get address from:
npm run deploy -- --network sepolia

# Format for verification:
npx hardhat verify --network sepolia DEPLOYED_ADDRESS
```

---

## Testing Examples

### Setup Test Environment
```typescript
import { ethers } from "hardhat";
import { expect } from "chai";

describe("AnonymousTransport", () => {
    let contract;
    let owner, carrier, requester;

    beforeEach(async () => {
        [owner, carrier, requester] = await ethers.getSigners();
        const factory = await ethers.getContractFactory("AnonymousTransport");
        contract = await factory.deploy();
        await contract.deployed();
    });
});
```

### Test Route Registration
```typescript
it("should register route", async () => {
    const tx = await contract.connect(carrier).registerRoute(
        100, 200, 300, 400, 1000, 5
    );
    await expect(tx).to.emit(contract, "RouteRegistered");
});
```

### Test Request Submission
```typescript
it("should submit request", async () => {
    const tx = await contract.connect(requester).submitTransportRequest(
        150, 250, 350, 450, 500, 3, 1000
    );
    await expect(tx).to.emit(contract, "RequestSubmitted");
});
```

---

## Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| "Permission Denied" | Add `FHE.allowThis()` and `FHE.allow()` |
| "Out of Gas" | Increase gas limit or reduce loop iterations |
| "Type Mismatch" | Convert types before FHE operations |
| "Route not found" | Check route ID is valid (starts at 1) |
| "Not authorized" | Verify correct address and modifier requirements |
| "Transaction reverted" | Check state requirements (e.g., route must be active) |

---

## Important Reminders

⚠️ **Always Remember**:
- Routes and requests are 1-indexed (counter starts at 1)
- Both `FHE.allowThis()` AND `FHE.allow()` required
- Optimization must complete before matching
- Only route carrier can optimize and match
- Coordinate ranges should be consistent (e.g., 0-1000)
- Weight and capacity should use same units

🔐 **Privacy Points**:
- No sensitive data in events
- All coordinates encrypted
- All weights encrypted
- All capacity values encrypted
- All costs encrypted
- Only view functions return unencrypted data

⚡ **Gas Optimization**:
- Batch permissions when possible
- Minimize loop iterations
- Use appropriate uint sizes
- Reuse converted values
- Check gas limits before deployment

---

## Documentation Files

| File | Purpose |
|------|---------|
| COMPETITION_SUBMISSION.md | Project overview and deliverables |
| TECHNICAL_DOCUMENTATION.md | Detailed technical specifications |
| IMPLEMENTATION_GUIDE.md | Setup, testing, and deployment |
| PROJECT_REQUIREMENTS.md | Complete requirements checklist |
| QUICK_REFERENCE.md | This file - quick lookup |
| README.md | User-facing project documentation |

---

## Useful Links

- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **Hardhat**: https://hardhat.org/
- **Ethers.js**: https://docs.ethers.org/v5/
- **Solidity**: https://docs.soliditylang.org/
- **Sepolia Faucet**: https://sepoliafaucet.com/

---

## Environment Variables

```env
# Required
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0xYourPrivateKeyHere

# Optional
ETHERSCAN_API_KEY=YOUR_KEY
ALCHEMY_API_KEY=YOUR_KEY
```

**Never commit .env file!**

---

## File Locations

```
TransportationDispatchFHE/
├── contracts/AnonymousTransport.sol
├── test/AnonymousTransport.test.ts
├── scripts/deploy.ts
├── docs/
│   ├── COMPETITION_SUBMISSION.md
│   ├── TECHNICAL_DOCUMENTATION.md
│   ├── IMPLEMENTATION_GUIDE.md
│   └── PROJECT_REQUIREMENTS.md
├── hardhat.config.ts
├── package.json
└── README.md
```

---

## Test Execution Times

| Command | Typical Time |
|---------|-------------|
| `npm run compile` | 5-10 seconds |
| `npm run test` | 30-60 seconds |
| `npm run deploy` | 30-90 seconds |
| Full coverage test | 60-90 seconds |

---

## Contract Events

```solidity
// Emitted when route registered
event RouteRegistered(uint32 indexed routeId, address indexed carrier);

// Emitted when request submitted
event RequestSubmitted(uint32 indexed requestId, address indexed requester);

// Emitted when schedule optimized
event ScheduleOptimized(uint32 indexed routeId, uint256 timestamp);

// Emitted when request matched to route
event TransportMatched(uint32 indexed requestId, uint32 indexed routeId);
```

---

## Gas Estimates

| Operation | Gas | Time |
|-----------|-----|------|
| registerRoute | 180,000 | ~30 sec |
| submitTransportRequest | 220,000 | ~40 sec |
| optimizeSchedule | 350,000 | ~60 sec |
| matchRequest | 60,000 | ~10 sec |

*Estimates on Sepolia. Actual varies with network conditions.*

---

## Next Steps

1. ✅ Read COMPETITION_SUBMISSION.md
2. ✅ Review TECHNICAL_DOCUMENTATION.md
3. ✅ Follow IMPLEMENTATION_GUIDE.md
4. ✅ Deploy contract to Sepolia
5. ✅ Run test suite
6. ✅ Verify on Etherscan
7. ✅ Demo on testnet

---

**Last Updated**: December 2025
**Version**: 1.0
**Status**: Production Ready

For detailed information, refer to the comprehensive documentation files.
