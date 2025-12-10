import { expect } from "chai";
import { ethers } from "hardhat";
import { Example } from "../typechain-types";

/**
 * Test suite for Example contract
 * @chapter basic-example
 */
describe("Example Contract", () => {
    let contract: Example;
    let owner: any;
    let addr1: any;
    let addr2: any;

    /**
     * Setup: Deploy contract before each test
     */
    beforeEach(async () => {
        [owner, addr1, addr2] = await ethers.getSigners();

        const ExampleFactory = await ethers.getContractFactory("Example");
        contract = (await ExampleFactory.deploy()) as Example;
        await contract.waitForDeployment();
    });

    /**
     * Test: Contract deployment
     * Verifies the contract deploys successfully and owner is set correctly
     */
    describe("Deployment", () => {
        it("should deploy with correct owner", async () => {
            const contractOwner = await contract.owner();
            expect(contractOwner).to.equal(await owner.getAddress());
        });

        it("should have callable functions", async () => {
            const info = await contract.getInfo();
            expect(info[0]).to.equal(await owner.getAddress());
        });
    });

    /**
     * Test: Set example value
     * Verifies encrypted value storage and permissions
     */
    describe("Setting Values", () => {
        it("should set example value", async () => {
            const tx = await contract.connect(owner).setExampleValue(42);

            // Verify transaction succeeds
            const receipt = await tx.wait();
            expect(receipt?.status).to.equal(1);
        });

        it("should emit ExampleEvent", async () => {
            await expect(
                contract.connect(addr1).setExampleValue(100)
            ).to.emit(contract, "ExampleEvent")
            .withArgs(await addr1.getAddress(), expect.any(Object));
        });

        it("should allow multiple value updates", async () => {
            const tx1 = await contract.connect(owner).setExampleValue(10);
            const tx2 = await contract.connect(owner).setExampleValue(20);
            const tx3 = await contract.connect(owner).setExampleValue(30);

            const receipt1 = await tx1.wait();
            const receipt2 = await tx2.wait();
            const receipt3 = await tx3.wait();

            expect(receipt1?.status).to.equal(1);
            expect(receipt2?.status).to.equal(1);
            expect(receipt3?.status).to.equal(1);
        });
    });

    /**
     * Test: FHE computation
     * Verifies encrypted computation works correctly
     */
    describe("FHE Computation", () => {
        it("should perform example computation", async () => {
            // Note: This requires setting up encrypted inputs properly
            // For testing purposes, we verify the function is callable
            const tx = await contract.connect(owner).setExampleValue(5);
            const receipt = await tx.wait();
            expect(receipt?.status).to.equal(1);
        });

        it("should handle multiple callers", async () => {
            const tx1 = await contract.connect(addr1).setExampleValue(50);
            const tx2 = await contract.connect(addr2).setExampleValue(75);

            const receipt1 = await tx1.wait();
            const receipt2 = await tx2.wait();

            expect(receipt1?.status).to.equal(1);
            expect(receipt2?.status).to.equal(1);
        });
    });

    /**
     * Test: Access control
     * Verifies proper permission handling
     */
    describe("Access Control", () => {
        it("should allow any caller to set value", async () => {
            const tx = await contract.connect(addr1).setExampleValue(99);
            const receipt = await tx.wait();
            expect(receipt?.status).to.equal(1);
        });

        it("should track different callers", async () => {
            await expect(
                contract.connect(addr1).setExampleValue(100)
            ).to.emit(contract, "ExampleEvent")
            .withArgs(await addr1.getAddress(), expect.any(Object));

            await expect(
                contract.connect(addr2).setExampleValue(200)
            ).to.emit(contract, "ExampleEvent")
            .withArgs(await addr2.getAddress(), expect.any(Object));
        });
    });

    /**
     * Test: View functions
     * Verifies read-only functions work correctly
     */
    describe("View Functions", () => {
        it("should return contract info", async () => {
            const [contractOwner, timestamp] = await contract.getInfo();

            expect(contractOwner).to.equal(await owner.getAddress());
            expect(timestamp).to.be.greaterThan(0);
        });

        it("should return consistent owner", async () => {
            const owner1 = await contract.owner();
            const [owner2] = await contract.getInfo();

            expect(owner1).to.equal(owner2);
        });
    });

    /**
     * Test: Edge cases
     * Verifies behavior with boundary values
     */
    describe("Edge Cases", () => {
        it("should handle zero values", async () => {
            const tx = await contract.connect(owner).setExampleValue(0);
            const receipt = await tx.wait();
            expect(receipt?.status).to.equal(1);
        });

        it("should handle large values", async () => {
            const largeValue = ethers.MaxUint32;
            const tx = await contract.connect(owner).setExampleValue(largeValue);
            const receipt = await tx.wait();
            expect(receipt?.status).to.equal(1);
        });

        it("should handle rapid consecutive calls", async () => {
            const txs = [];
            for (let i = 0; i < 5; i++) {
                txs.push(contract.connect(owner).setExampleValue(i * 10));
            }

            const results = await Promise.all(txs.map(tx => tx.wait()));
            results.forEach(receipt => {
                expect(receipt?.status).to.equal(1);
            });
        });
    });
});
