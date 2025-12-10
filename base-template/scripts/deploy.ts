import { ethers } from "hardhat";

/**
 * Deploy script for FHEVM Example contracts
 * Usage: npx hardhat run scripts/deploy.ts --network sepolia
 */

async function main() {
    console.log("Starting deployment...\n");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

    // Deploy Example contract
    console.log("Deploying Example contract...");
    const ExampleFactory = await ethers.getContractFactory("Example");
    const exampleContract = await ExampleFactory.deploy();

    const exampleAddress = await exampleContract.getAddress();
    console.log("✓ Example contract deployed to:", exampleAddress);

    // Verify deployment
    console.log("\nVerifying deployment...");
    const owner = await exampleContract.owner();
    console.log("✓ Contract owner:", owner);

    const [contractOwner, timestamp] = await exampleContract.getInfo();
    console.log("✓ Contract deployed at block timestamp:", timestamp);

    // Print summary
    console.log("\n" + "=".repeat(50));
    console.log("Deployment Summary");
    console.log("=".repeat(50));
    console.log("Example Contract:", exampleAddress);
    console.log("Deployer:", deployer.address);
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    console.log("=".repeat(50) + "\n");

    return {
        example: exampleAddress,
    };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
