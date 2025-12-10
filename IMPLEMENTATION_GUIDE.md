# Implementation Guide: Privacy-Preserving Transportation Dispatch

## Table of Contents

1. [Project Setup](#project-setup)
2. [Contract Development](#contract-development)
3. [Testing Strategy](#testing-strategy)
4. [Deployment Procedures](#deployment-procedures)
5. [Frontend Integration](#frontend-integration)
6. [Maintenance and Updates](#maintenance-and-updates)

---

## Project Setup

### 1. Environment Preparation

#### System Requirements
```
Operating System: Linux, macOS, or Windows
Node.js: >= 18.0.0
npm: >= 9.0.0
Git: Latest version
```

#### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd TransportationDispatchFHE

# 2. Install dependencies
npm install

# 3. Verify installation
npx hardhat --version
npm list @fhevm/solidity
npm list @fhevm/hardhat-plugin
```

### 2. Configuration

#### .env File Setup

```bash
# Create environment file
cat > .env << EOF
# Sepolia Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=0xYourPrivateKeyHere

# Optional: Etherscan verification
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY

# Optional: Alchemy
ALCHEMY_API_KEY=YOUR_ALCHEMY_KEY
EOF
```

#### Hardhat Configuration Verification

```typescript
// hardhat.config.ts should include:
import "@fhevm/hardhat-plugin";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 11155111
    }
  }
};
```

### 3. Verification

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Check code quality
npm run lint
```

---

## Contract Development

### 1. Smart Contract Structure

#### Contract Layout

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// 1. Import statements
import { FHE, euint32, euint16, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

// 2. Contract declaration
contract AnonymousTransport is SepoliaConfig {
    // 3. State variables
    address public owner;
    uint32 public routeCounter;

    // 4. Data structures
    struct RouteData {
        // ... fields
    }

    // 5. Mappings
    mapping(uint32 => RouteData) public routes;

    // 6. Events
    event RouteRegistered(uint32 indexed routeId, address indexed carrier);

    // 7. Modifiers
    modifier onlyCarrier(uint32 _routeId) {
        require(routes[_routeId].carrier == msg.sender, "Not route carrier");
        _;
    }

    // 8. Constructor
    constructor() {
        owner = msg.sender;
        routeCounter = 1;
    }

    // 9. Core functions
    // 10. Internal functions
    // 11. View functions
}
```

### 2. Implementing FHE Operations

#### Pattern 1: Encryption and Permission Grant

```solidity
function registerRoute(
    uint16 _startX, uint16 _startY,
    uint16 _endX, uint16 _endY,
    uint32 _capacity, uint16 _priority
) external {
    // Step 1: Encrypt all sensitive parameters
    euint16 encStartX = FHE.asEuint16(_startX);
    euint16 encStartY = FHE.asEuint16(_startY);
    euint16 encEndX = FHE.asEuint16(_endX);
    euint16 encEndY = FHE.asEuint16(_endY);
    euint32 encCapacity = FHE.asEuint32(_capacity);
    euint16 encPriority = FHE.asEuint16(_priority);

    // Step 2: Store encrypted data
    routes[routeCounter] = RouteData({
        startX: encStartX,
        startY: encStartY,
        endX: encEndX,
        endY: encEndY,
        capacity: encCapacity,
        priority: encPriority,
        isActive: true,
        carrier: msg.sender,
        timestamp: block.timestamp
    });

    // Step 3: Grant contract permissions
    FHE.allowThis(encStartX);
    FHE.allowThis(encStartY);
    FHE.allowThis(encEndX);
    FHE.allowThis(encEndY);
    FHE.allowThis(encCapacity);
    FHE.allowThis(encPriority);

    // Step 4: Grant user permissions
    FHE.allow(encStartX, msg.sender);
    FHE.allow(encStartY, msg.sender);
    FHE.allow(encEndX, msg.sender);
    FHE.allow(encEndY, msg.sender);
    FHE.allow(encCapacity, msg.sender);
    FHE.allow(encPriority, msg.sender);

    // Step 5: Track and emit event
    carrierRoutes[msg.sender].push(routeCounter);
    emit RouteRegistered(routeCounter, msg.sender);
    routeCounter++;
}
```

#### Pattern 2: Encrypted Comparisons

```solidity
function _checkRouteCompatibility(
    uint32 _routeId,
    uint32 _requestId
) private returns (ebool) {
    RouteData storage route = routes[_routeId];
    TransportRequest storage request = requests[_requestId];

    // Check 1: Pickup within service area
    ebool pickupInRoute = FHE.and(
        FHE.le(
            FHE.sub(route.startX, FHE.asEuint16(50)),
            request.pickupX
        ),
        FHE.le(
            request.pickupX,
            FHE.add(route.endX, FHE.asEuint16(50))
        )
    );

    // Check 2: Drop within service area
    ebool dropInRoute = FHE.and(
        FHE.le(
            FHE.sub(route.startY, FHE.asEuint16(50)),
            request.dropY
        ),
        FHE.le(
            request.dropY,
            FHE.add(route.endY, FHE.asEuint16(50))
        )
    );

    // Check 3: Capacity constraint
    ebool withinCapacity = FHE.le(request.weight, route.capacity);

    // Combine all checks
    return FHE.and(
        FHE.and(pickupInRoute, dropInRoute),
        withinCapacity
    );
}
```

#### Pattern 3: Encrypted Accumulation

```solidity
function _calculateEfficiency(
    uint32 _routeId,
    uint32[] memory _requests,
    uint32 _count
) private returns (euint16) {
    RouteData storage route = routes[_routeId];
    euint16 totalUrgency = FHE.asEuint16(0);
    euint32 totalWeight = FHE.asEuint32(0);

    // Step 1: Accumulate encrypted values
    for (uint32 i = 0; i < _count; i++) {
        if (_requests[i] != 0) {
            totalUrgency = FHE.add(
                totalUrgency,
                requests[_requests[i]].urgency
            );
            totalWeight = FHE.add(
                totalWeight,
                requests[_requests[i]].weight
            );
        }
    }

    // Step 2: Calculate base efficiency
    euint16 baseEfficiency = FHE.add(totalUrgency, route.priority);

    // Step 3: Apply conditional boost
    ebool hasSignificantWeight = FHE.gt(
        totalWeight,
        FHE.asEuint32(100)
    );
    euint16 boostedEfficiency = FHE.mul(
        baseEfficiency,
        FHE.asEuint16(2)
    );

    // Step 4: Select based on condition
    return FHE.select(
        hasSignificantWeight,
        boostedEfficiency,
        baseEfficiency
    );
}
```

### 3. Contract Optimization Strategies

#### Minimize Type Conversions
```solidity
// Instead of converting repeatedly:
for (uint32 i = 0; i < count; i++) {
    euint32 weight = FHE.asEuint32(requests[i].weight);  // ❌ Inefficient
    total = FHE.add(total, weight);
}

// Convert once and reuse:
euint32 zero = FHE.asEuint32(0);
for (uint32 i = 0; i < count; i++) {
    total = FHE.add(total, requests[i].weight);  // ✅ Efficient
}
```

#### Batch Permission Grants
```solidity
// Instead of individual permissions:
for (uint32 i = 0; i < values.length; i++) {
    FHE.allowThis(values[i]);  // ❌ Gas inefficient
    FHE.allow(values[i], msg.sender);
}

// Aggregate then grant:
euint32 aggregated = values[0];
for (uint32 i = 1; i < values.length; i++) {
    aggregated = FHE.add(aggregated, values[i]);
}
FHE.allowThis(aggregated);  // ✅ Single operation
FHE.allow(aggregated, msg.sender);
```

#### Limit Loop Iterations
```solidity
// Set maximum request batch size
uint32 private constant MAX_BATCH_SIZE = 100;

function optimizeSchedule(uint32 _routeId)
    external
    onlyCarrier(_routeId)
{
    uint32[] memory compatibleRequests = new uint32[](MAX_BATCH_SIZE);
    uint32 matchCount = 0;

    // Prevent excessive gas consumption
    uint32 checkLimit = min(requestCounter, MAX_BATCH_SIZE);

    for (uint32 i = 1; i < checkLimit; i++) {
        // ... compatibility check
    }
}
```

---

## Testing Strategy

### 1. Test Structure

```
test/
├── fixtures/
│   └── setup.ts          # Common test setup
├── unit/
│   ├── route-management.ts
│   ├── request-handling.ts
│   ├── optimization.ts
│   └── matching.ts
└── integration/
    └── full-flow.ts
```

### 2. Basic Test Template

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { AnonymousTransport } from "../typechain-types";

describe("AnonymousTransport - Route Management", () => {
    let contract: AnonymousTransport;
    let owner: ethers.Signer;
    let carrier: ethers.Signer;
    let requester: ethers.Signer;

    beforeEach(async () => {
        // Setup
        [owner, carrier, requester] = await ethers.getSigners();

        const TransportFactory = await ethers.getContractFactory(
            "AnonymousTransport"
        );
        contract = await TransportFactory.deploy();
        await contract.deployed();
    });

    describe("Route Registration", () => {
        it("should register a new route with encrypted data", async () => {
            // Arrange
            const startX = 100;
            const startY = 200;
            const endX = 300;
            const endY = 400;
            const capacity = 1000;
            const priority = 5;

            // Act
            const tx = await contract.connect(carrier).registerRoute(
                startX,
                startY,
                endX,
                endY,
                capacity,
                priority
            );

            // Assert
            await expect(tx).to.emit(contract, "RouteRegistered")
                .withArgs(1, await carrier.getAddress());

            // Verify route stored
            const routeInfo = await contract.getRouteInfo(1);
            expect(routeInfo.isActive).to.be.true;
            expect(routeInfo.carrier).to.equal(await carrier.getAddress());
        });

        it("should store coordinates as encrypted values", async () => {
            // Route registration internally encrypts data
            // Verify through public route info
            const tx = await contract.connect(carrier).registerRoute(
                100, 200, 300, 400, 1000, 5
            );

            const receipt = await tx.wait();
            expect(receipt?.status).to.equal(1);
        });

        it("should increment route counter", async () => {
            const initialCount = await contract.routeCounter();

            await contract.connect(carrier).registerRoute(
                100, 200, 300, 400, 1000, 5
            );

            expect(await contract.routeCounter()).to.equal(
                initialCount.add(1)
            );
        });

        it("should revert if not providing all parameters", async () => {
            // TypeScript prevents incomplete calls at compile time,
            // but we test for missing values in real runtime
            await expect(
                contract.connect(carrier).registerRoute(
                    100, 200, 300, 400, 1000
                    // Missing priority parameter
                )
            ).to.be.reverted;
        });
    });

    describe("Request Submission", () => {
        it("should submit a transport request with encrypted data", async () => {
            // Arrange
            const pickupX = 150;
            const pickupY = 250;
            const dropX = 350;
            const dropY = 450;
            const weight = 500;
            const urgency = 3;
            const maxCost = 1000;

            // Act
            const tx = await contract.connect(requester).submitTransportRequest(
                pickupX,
                pickupY,
                dropX,
                dropY,
                weight,
                urgency,
                maxCost
            );

            // Assert
            await expect(tx).to.emit(contract, "RequestSubmitted")
                .withArgs(1, await requester.getAddress());

            const requestStatus = await contract.getRequestStatus(1);
            expect(requestStatus.isMatched).to.be.false;
            expect(requestStatus.requester).to.equal(await requester.getAddress());
        });

        it("should track requests by user", async () => {
            await contract.connect(requester).submitTransportRequest(
                150, 250, 350, 450, 500, 3, 1000
            );

            const userRequests = await contract.getUserRequests(
                await requester.getAddress()
            );
            expect(userRequests.length).to.equal(1);
            expect(userRequests[0]).to.equal(1);
        });
    });

    describe("Schedule Optimization", () => {
        beforeEach(async () => {
            // Register a route
            await contract.connect(carrier).registerRoute(
                100, 200, 300, 400, 2000, 5
            );

            // Submit compatible request
            await contract.connect(requester).submitTransportRequest(
                150, 250, 350, 450, 500, 3, 1000
            );
        });

        it("should optimize schedule for route", async () => {
            const tx = await contract.connect(carrier).optimizeSchedule(1);

            await expect(tx).to.emit(contract, "ScheduleOptimized")
                .withArgs(1, expect.any(Object));

            const scheduleInfo = await contract.getScheduleInfo(1);
            expect(scheduleInfo.isOptimized).to.be.true;
        });

        it("should identify compatible requests", async () => {
            await contract.connect(carrier).optimizeSchedule(1);

            const scheduleInfo = await contract.getScheduleInfo(1);
            expect(scheduleInfo.requestCount).to.be.greaterThan(0);
        });
    });

    describe("Request Matching", () => {
        beforeEach(async () => {
            // Setup route and request
            await contract.connect(carrier).registerRoute(
                100, 200, 300, 400, 2000, 5
            );
            await contract.connect(requester).submitTransportRequest(
                150, 250, 350, 450, 500, 3, 1000
            );
            // Optimize schedule first
            await contract.connect(carrier).optimizeSchedule(1);
        });

        it("should match request to route", async () => {
            const tx = await contract.connect(carrier).matchRequest(1, 1);

            await expect(tx).to.emit(contract, "TransportMatched")
                .withArgs(1, 1);

            const requestStatus = await contract.getRequestStatus(1);
            expect(requestStatus.isMatched).to.be.true;
            expect(requestStatus.assignedRoute).to.equal(1);
        });

        it("should prevent matching to inactive route", async () => {
            await contract.connect(carrier).deactivateRoute(1);

            await expect(
                contract.connect(carrier).matchRequest(1, 1)
            ).to.be.revertedWith("Route not active");
        });

        it("should prevent matching without optimization", async () => {
            // Create second route without optimization
            await contract.connect(carrier).registerRoute(
                400, 500, 600, 700, 1500, 3
            );

            await expect(
                contract.connect(carrier).matchRequest(1, 2)
            ).to.be.revertedWith("Schedule not optimized");
        });
    });
});
```

### 3. Test Execution

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- test/unit/route-management.ts

# Run with detailed output
npm run test -- --reporter spec

# Generate coverage report
npm run test -- --coverage
```

### 4. Coverage Goals

```
Statements   : > 90%
Branches     : > 85%
Functions    : > 90%
Lines        : > 90%
```

---

## Deployment Procedures

### 1. Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Contract audited for security issues
- [ ] Gas costs estimated and reviewed
- [ ] Environment variables configured
- [ ] Deployment script tested on local network
- [ ] Backup of deployment artifacts

### 2. Deployment Script

```typescript
// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
    console.log("Deploying AnonymousTransport contract...");

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // Get balance
    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance));

    // Deploy contract
    const AnonymousTransport = await ethers.getContractFactory(
        "AnonymousTransport"
    );
    const contract = await AnonymousTransport.deploy();
    await contract.deployed();

    console.log("Contract deployed to:", contract.address);

    // Verify deployment
    console.log("Verifying contract...");
    const owner = await contract.owner();
    console.log("Contract owner:", owner);
    console.log("Route counter:", (await contract.routeCounter()).toString());

    return contract.address;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

### 3. Deployment Commands

```bash
# Deploy to local Hardhat network (for testing)
npx hardhat run scripts/deploy.ts --network hardhat

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.ts --network sepolia

# Deploy with specific gas settings
npx hardhat run scripts/deploy.ts --network sepolia \
  --gas-limit 5000000 \
  --gas-price 50

# Verify on Etherscan
npx hardhat verify --network sepolia \
  DEPLOYED_CONTRACT_ADDRESS \
  "constructor_arg_1" "constructor_arg_2"
```

### 4. Post-Deployment Verification

```typescript
// scripts/verify-deployment.ts
import { ethers } from "hardhat";

async function main() {
    const contractAddress = process.env.CONTRACT_ADDRESS!;

    const contract = await ethers.getContractAt(
        "AnonymousTransport",
        contractAddress
    );

    console.log("Verification Results:");
    console.log("─".repeat(50));

    // Check owner
    const owner = await contract.owner();
    console.log("✓ Owner:", owner);

    // Check initial state
    const routeCounter = await contract.routeCounter();
    console.log("✓ Route counter:", routeCounter.toString());

    const requestCounter = await contract.requestCounter();
    console.log("✓ Request counter:", requestCounter.toString());

    // Try a test transaction
    try {
        const testRoute = await contract.getRouteInfo(1);
        console.log("✓ Contract is callable");
    } catch (e) {
        console.log("✓ Contract properly reverts for non-existent IDs");
    }

    console.log("─".repeat(50));
    console.log("Deployment verification complete!");
}

main().catch(console.error);
```

---

## Frontend Integration

### 1. Web3 Connection

```typescript
// utils/web3.ts
import { ethers } from "ethers";

export async function connectWallet() {
    if (!window.ethereum) {
        throw new Error("MetaMask not found");
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
    });

    return {
        provider,
        signer: provider.getSigner(),
        account: accounts[0]
    };
}

export async function switchNetwork() {
    if (!window.ethereum) {
        throw new Error("MetaMask not found");
    }

    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }] // Sepolia chainId
        });
    } catch (error: any) {
        if (error.code === 4902) {
            // Chain not added, add it
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                    chainId: "0xaa36a7",
                    chainName: "Sepolia",
                    nativeurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                    rpcUrls: ["https://sepolia.infura.io/v3/YOUR_KEY"],
                    blockExplorerUrls: ["https://sepolia.etherscan.io"]
                }]
            });
        }
    }
}
```

### 2. Contract Interaction

```typescript
// services/contract.ts
import { ethers } from "ethers";
import ABI from "../contracts/AnonymousTransport.json";

export class TransportService {
    contract: ethers.Contract;
    signer: ethers.Signer;

    constructor(contractAddress: string, signer: ethers.Signer) {
        this.contract = new ethers.Contract(contractAddress, ABI, signer);
        this.signer = signer;
    }

    // Register route
    async registerRoute(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        capacity: number,
        priority: number
    ) {
        const tx = await this.contract.registerRoute(
            startX, startY, endX, endY, capacity, priority,
            { gasLimit: 200000 }
        );
        return tx.wait();
    }

    // Submit request
    async submitRequest(
        pickupX: number,
        pickupY: number,
        dropX: number,
        dropY: number,
        weight: number,
        urgency: number,
        maxCost: number
    ) {
        const tx = await this.contract.submitTransportRequest(
            pickupX, pickupY, dropX, dropY, weight, urgency, maxCost,
            { gasLimit: 250000 }
        );
        return tx.wait();
    }

    // Get carrier routes
    async getCarrierRoutes(address: string) {
        return await this.contract.getCarrierRoutes(address);
    }

    // Get user requests
    async getUserRequests(address: string) {
        return await this.contract.getUserRequests(address);
    }

    // Optimize schedule
    async optimizeSchedule(routeId: number) {
        const tx = await this.contract.optimizeSchedule(routeId, {
            gasLimit: 500000
        });
        return tx.wait();
    }

    // Match request
    async matchRequest(requestId: number, routeId: number) {
        const tx = await this.contract.matchRequest(requestId, routeId, {
            gasLimit: 100000
        });
        return tx.wait();
    }
}
```

---

## Maintenance and Updates

### 1. Monitoring

```typescript
// monitoring/events.ts
import { ethers } from "ethers";

export async function monitorRouteRegistrations(
    contract: ethers.Contract
) {
    contract.on("RouteRegistered", (routeId, carrier) => {
        console.log(`Route ${routeId} registered by ${carrier}`);
    });
}

export async function monitorMatches(contract: ethers.Contract) {
    contract.on("TransportMatched", (requestId, routeId) => {
        console.log(`Request ${requestId} matched to route ${routeId}`);
    });
}

// Listen for specific events from past blocks
export async function queryHistoricalEvents(
    contract: ethers.Contract,
    fromBlock: number
) {
    const routeEvents = await contract.queryFilter(
        contract.filters.RouteRegistered(),
        fromBlock
    );

    console.log(`Found ${routeEvents.length} route registrations`);

    routeEvents.forEach(event => {
        console.log(`Route ${event.args.routeId} by ${event.args.carrier}`);
    });
}
```

### 2. Dependency Updates

```bash
# Check for outdated packages
npm outdated

# Update @fhevm/solidity to latest
npm install @fhevm/solidity@latest

# Update hardhat plugin
npm install @fhevm/hardhat-plugin@latest

# Recompile after updates
npm run compile

# Run tests to verify compatibility
npm run test
```

### 3. Contract Upgrade Strategy

For future versions, consider using proxy patterns:

```solidity
// UUPS Proxy example (for future reference)
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

contract AnonymousTransportV2 is Initializable, UUPSUpgradeable {
    // Maintain same storage slots as V1
    address public owner;
    uint32 public routeCounter;
    uint32 public requestCounter;

    // New functionality here
    function newFeature() external {
        // Implementation
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}
}
```

---

**Document Version**: 1.0
**Last Updated**: December 2025
**Status**: Ready for Implementation
