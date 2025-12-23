# FHEVM Examples Hub

## Zama Bounty Track December 2025 Submission

A comprehensive, production-ready implementation of standalone Hardhat-based FHEVM example repositories with automated scaffolding tools, documentation generation, and complete test coverage. This project demonstrates best practices for building privacy-preserving smart contracts using Fully Homomorphic Encryption.

[video](https://youtu.be/Me510J3hjAw)

---

## 🎯 Project Overview

This submission provides a complete solution for the FHEVM Example Hub bounty challenge, including:

### Deliverables

✅ **Base Template** - Complete Hardhat setup with FHEVM configuration
✅ **Automation Scripts** - TypeScript CLI tools for scaffolding and documentation
✅ **Example Repositories** - Three standalone examples (basic, intermediate, advanced)
✅ **Auto-Generated Documentation** - GitBook-compatible docs from code annotations
✅ **Developer Guide** - Complete guide for adding new examples
✅ **Comprehensive Tests** - >90% code coverage with extensive test suites

### Key Features

- **One-command scaffolding** - Generate complete example repositories instantly
- **Automated documentation** - Extract and format documentation from code
- **Progressive difficulty** - Examples from beginner to advanced level
- **Production-ready** - Tested, secure, and gas-optimized implementations
- **Real-world application** - Privacy-preserving transportation logistics system

---

## 📦 Repository Structure

```
TransportationDispatchFHE/
├── base-template/              # Foundation for all examples
│   ├── contracts/              # Example contracts (FHECounter, AccessControl)
│   ├── test/                   # Comprehensive test suites
│   ├── scripts/                # Deployment scripts
│   ├── hardhat.config.ts       # Hardhat configuration
│   └── package.json            # Dependencies
│
├── contracts/                  # Main example: AnonymousTransport.sol
├── test/                       # Main example tests
├── scripts/                    # Automation tools
│   ├── create-fhevm-example.ts # Repository scaffolding tool
│   └── generate-docs.ts        # Documentation generator
│
├── docs/                       # Generated documentation
│   ├── SUMMARY.md              # GitBook index
│   ├── GETTING_STARTED.md      # Setup guide
│   ├── transportation-dispatch/
│   ├── fhe-counter/
│   └── access-control/
│
├── DEVELOPER_GUIDE.md          # Adding new examples
├── AUTOMATION_TOOLS.md         # Tool documentation
└── examples-registry.json      # Example metadata
```

---

## 🚀 Quick Start

### Installation

```bash
# Clone repository
git clone <repository-url>
cd TransportationDispatchFHE

# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test
```

### Generate a Standalone Example

```bash
# Create transportation dispatch example
npm run create-example transportation-dispatch ./my-example

# Create FHE counter example
npm run create-example fhe-counter ./my-counter

# Create access control example
npm run create-example access-control ./my-access

# Navigate and test
cd my-example
npm install
npm run compile
npm run test
```

### Generate Documentation

```bash
# Generate documentation for all examples
npm run generate-all-docs

# Generate for specific example
npm run docs:transportation
npm run docs:counter
npm run docs:access

# View generated docs in docs/ directory
```

---

## 📚 Examples Included

### 1. Transportation Dispatch (Advanced)

**Contract**: `contracts/AnonymousTransport.sol` (330 lines)

A real-world privacy-preserving logistics optimization system demonstrating advanced FHEVM patterns.

**Features**:
- Encrypted route registration with coordinates and capacity
- Private transport request submission
- FHE-based schedule optimization
- Anonymous request-to-route matching
- Route lifecycle management

**FHE Operations**:
- `FHE.asEuint16`, `FHE.asEuint32` - Encryption
- `FHE.add`, `FHE.sub`, `FHE.mul` - Arithmetic
- `FHE.le`, `FHE.gt`, `FHE.and` - Comparisons
- `FHE.select` - Conditional selection
- `FHE.allowThis`, `FHE.allow` - Permissions

**Test Coverage**: 450+ lines, 15+ test suites

### 2. FHE Counter (Basic)

**Contract**: `base-template/contracts/FHECounter.sol`

Fundamental FHEVM concepts through a simple encrypted counter.

**Features**:
- Encrypted counter increment/decrement
- Basic FHE arithmetic operations
- Permission management patterns
- Event logging

**Learning Outcomes**:
- Understanding encrypted types (euint32)
- Basic FHE operations (add, sub)
- Permission system (allowThis, allow)

### 3. Access Control (Intermediate)

**Contract**: `base-template/contracts/AccessControl.sol`

Advanced permission management with encrypted values.

**Features**:
- User-specific encrypted balances
- Shared value access control
- Multi-party encrypted transfers
- Transient permission patterns

**Learning Outcomes**:
- Advanced permission patterns
- Multi-user access control
- Encrypted state management

---

## 🛠️ Automation Tools

### Scaffolding Tool: create-fhevm-example.ts

Generate complete standalone Hardhat repositories with one command.

**Usage**:
```bash
npm run create-example <example-name> <output-directory>
```

**What it does**:
1. Clones base Hardhat template
2. Inserts example contract and tests
3. Generates README documentation
4. Creates configuration files
5. Initializes git repository
6. Sets up for immediate development

**Example**:
```bash
npm run create-example transportation-dispatch ./my-project
cd my-project
npm install && npm run compile && npm run test
```

### Documentation Generator: generate-docs.ts

Automatically generate GitBook-compatible documentation from code.

**Usage**:
```bash
npm run generate-all-docs
npm run docs:transportation
```

**Generates**:
- Individual example READMEs with code samples
- GitBook SUMMARY.md index
- Getting started guides
- API documentation
- Cross-referenced examples

**Features**:
- Extracts JSDoc/TSDoc comments
- Formats code examples
- Creates navigation structure
- GitBook compatible format

---

## 📋 Bounty Requirements Checklist

### ✅ Project Structure & Simplicity

- ✅ Uses only Hardhat for all examples
- ✅ One repo per example (scaffolding generates standalone repos)
- ✅ Minimal structure: contracts/, test/, hardhat.config.ts
- ✅ Shared base-template for all examples
- ✅ Documentation generated automatically

### ✅ Scaffolding / Automation

- ✅ CLI tool: `create-fhevm-example.ts`
- ✅ Clones and customizes base Hardhat template
- ✅ Inserts specific contracts and tests
- ✅ Auto-generates documentation
- ✅ Written in TypeScript

### ✅ Examples Implemented

**Basic Examples**:
- ✅ FHE Counter (arithmetic operations)
- ✅ Encryption examples (single and multiple values)
- ✅ Permission management (allowThis, allow)

**Intermediate Examples**:
- ✅ Access control patterns
- ✅ Input proof handling
- ✅ Multi-user permissions

**Advanced Examples**:
- ✅ Transportation dispatch (real-world application)
- ✅ FHE-based optimization
- ✅ Complex encrypted operations

### ✅ Documentation Strategy

- ✅ JSDoc/TSDoc comments in code
- ✅ Auto-generated markdown READMEs
- ✅ GitBook-compatible SUMMARY.md
- ✅ Chapter tags for organization
- ✅ Getting started guide

### ✅ Additional Deliverables

- ✅ Developer guide for adding examples
- ✅ Automation tools documentation
- ✅ Complete test coverage (>90%)
- ✅ Example registry with metadata
- ✅ Maintenance documentation

---

## 🎥 Demonstration Video

**File**: `FHEVM Privacy-Preserving Examples.mp4`

The demonstration video showcases:
- Project overview and structure
- Automation tools in action
- Example repository generation
- Contract deployment process
- Test execution
- Documentation generation
- Live demonstration of all features

**Duration**: ~5-10 minutes

---

## 🧪 Testing

### Run All Tests

```bash
npm run test
```

### Test Coverage

- **AnonymousTransport**: 450+ lines of tests
- **FHECounter**: Comprehensive basic tests
- **AccessControl**: Permission management tests
- **Overall Coverage**: >90%

### Test Features

- ✅ Contract deployment verification
- ✅ All functionality tested
- ✅ Edge cases covered
- ✅ Security scenarios
- ✅ Permission management
- ✅ Error handling
- ✅ Integration workflows

---

## 🔐 Security & Privacy

### Privacy Guarantees

- **End-to-End Encryption**: All sensitive data encrypted with FHE
- **Zero-Knowledge Operations**: Computations on encrypted data
- **No Data Leakage**: Encrypted values never exposed
- **Cryptographic Binding**: Values bound to [contract, user] pairs

### Permission Model

- **Dual Permissions**: Contract + user permissions required
- **FHE.allowThis()**: Grants permission to contract
- **FHE.allow()**: Grants permission to specific addresses
- **FHE.allowTransient()**: Temporary permissions for transactions

### Best Practices Demonstrated

- ✅ Proper permission management
- ✅ Secure encrypted operations
- ✅ Input proof validation
- ✅ Access control patterns
- ✅ Anti-patterns documented

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Smart Contracts | 3 complete examples |
| Test Suites | 3 comprehensive suites |
| Lines of Code | 1,630+ |
| Lines of Tests | 900+ |
| Lines of Documentation | 5,000+ |
| Test Coverage | >90% |
| Automation Scripts | 2 TypeScript tools |
| Documentation Files | 15+ |

---

## 🏗️ Technical Details

### Technology Stack

- **Solidity**: ^0.8.24
- **FHEVM**: v0.9.1 (@fhevm/solidity)
- **Hardhat**: v2.26.3
- **TypeScript**: v5.9.2
- **Testing**: Mocha + Chai
- **Network**: Ethereum Sepolia Testnet

### Smart Contract Functions

**AnonymousTransport.sol**:
- `registerRoute()` - Register encrypted routes (180k gas)
- `submitTransportRequest()` - Submit encrypted requests (220k gas)
- `optimizeSchedule()` - FHE-based optimization (350k gas)
- `matchRequest()` - Anonymous matching (60k gas)
- Route lifecycle management functions

### FHE Operations Used

- **Encryption**: `FHE.asEuint16`, `FHE.asEuint32`
- **Arithmetic**: `FHE.add`, `FHE.sub`, `FHE.mul`
- **Comparison**: `FHE.le`, `FHE.gt`, `FHE.eq`
- **Logical**: `FHE.and`, `FHE.or`
- **Selection**: `FHE.select`
- **Permissions**: `FHE.allowThis`, `FHE.allow`, `FHE.allowTransient`

---

## 🚢 Deployment

### Local Testing

```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network (in another terminal)
npm run deploy:localhost
```

### Sepolia Testnet

```bash
# Set environment variables
export SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
export PRIVATE_KEY=0xYourPrivateKey

# Deploy to Sepolia
npm run deploy
```

### Environment Setup

Create `.env` file:
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=0xYourPrivateKeyHere
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
```

---

## 📖 Documentation

### For Beginners

1. **GETTING_STARTED.md** - Setup and first steps
2. **FHE Counter Example** - Learn basic FHE operations
3. **QUICK_REFERENCE.md** - Common commands and patterns

### For Developers

1. **DEVELOPER_GUIDE.md** - Adding new examples
2. **AUTOMATION_TOOLS.md** - Using scaffolding tools
3. **TECHNICAL_DOCUMENTATION.md** - Deep dive into FHE

### For Advanced Users

1. **Transportation Dispatch** - Real-world application
2. **Access Control** - Advanced patterns
3. **IMPLEMENTATION_GUIDE.md** - Best practices

---

## 🌟 Innovation Highlights

### Real-World Application

The Transportation Dispatch system demonstrates practical FHE usage in logistics:
- Privacy-preserving route coordination
- Encrypted capacity planning
- Anonymous request matching
- Production-ready implementation

### Complete Automation

- **One-command scaffolding** - Generate complete repositories
- **Automated documentation** - Extract docs from code
- **Easy maintenance** - Update all examples efficiently
- **Developer-friendly** - Clear, documented tools

### Educational Value

- **Progressive difficulty** - Basic → Intermediate → Advanced
- **Comprehensive examples** - Cover all FHEVM concepts
- **Best practices** - Demonstrated throughout
- **Anti-patterns** - Common mistakes documented

---

## 🔗 Resources

- **FHEVM Documentation**: https://docs.zama.ai/fhevm
- **Hardhat Documentation**: https://hardhat.org/
- **Solidity Documentation**: https://docs.soliditylang.org/
- **Zama Community**: https://www.zama.ai/community
- **Discord**: https://discord.com/invite/zama

---

## 🤝 Contributing

Contributions are welcome! See **DEVELOPER_GUIDE.md** for:

- How to add new examples
- Documentation standards
- Testing requirements
- Automation tool usage
- Code style guidelines

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🏆 Bounty Submission Summary

This project provides a **complete, production-ready implementation** of the FHEVM Example Hub requirements:

✅ Standalone Hardhat-based examples
✅ Automated scaffolding and documentation tools
✅ Comprehensive test coverage (>90%)
✅ GitBook-compatible documentation
✅ Developer guide and maintenance tools
✅ Real-world advanced example
✅ Progressive difficulty levels
✅ Complete automation system

**Status**: ✅ **Ready for Review**

**Submission Date**: December 2025

---

**Built with Zama FHEVM to demonstrate privacy-preserving smart contract development.**

