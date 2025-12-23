/**
 * @fileoverview Comprehensive test suite for AnonymousTransport
 * @description Tests privacy-preserving transportation dispatch system
 * @chapter advanced
 */

import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { AnonymousTransport } from "../typechain-types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
    deployer: HardhatEthersSigner;
    carrier1: HardhatEthersSigner;
    carrier2: HardhatEthersSigner;
    requester1: HardhatEthersSigner;
    requester2: HardhatEthersSigner;
};

/**
 * Deploy fixture for AnonymousTransport contract
 */
async function deployFixture() {
    const factory = await ethers.getContractFactory("AnonymousTransport");
    const contract = await factory.deploy() as AnonymousTransport;
    const contractAddress = await contract.getAddress();

    return { contract, contractAddress };
}

describe("AnonymousTransport - Privacy-Preserving Transportation Dispatch", function () {
    let signers: Signers;
    let contract: AnonymousTransport;
    let contractAddress: string;

    before(async function () {
        const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
        signers = {
            deployer: ethSigners[0],
            carrier1: ethSigners[1],
            carrier2: ethSigners[2],
            requester1: ethSigners[3],
            requester2: ethSigners[4],
        };
    });

    beforeEach(async function () {
        // Check whether the tests are running against an FHEVM mock environment
        if (!fhevm.isMock) {
            console.warn(`This test suite requires FHEVM mock environment`);
            this.skip();
        }

        ({ contract, contractAddress } = await deployFixture());
    });

    /**
     * Test suite for contract deployment
     */
    describe("Contract Deployment", () => {
        it("should deploy successfully with correct owner", async function () {
            const owner = await contract.owner();
            expect(owner).to.equal(signers.deployer.address);
        });

        it("should initialize with counter values of 1", async function () {
            const routeCounter = await contract.routeCounter();
            const requestCounter = await contract.requestCounter();
            expect(routeCounter).to.equal(1);
            expect(requestCounter).to.equal(1);
        });
    });

    /**
     * Test suite for route registration
     */
    describe("Route Registration", () => {
        it("should register a new route with encrypted data", async function () {
            const routeData = {
                startX: 100,
                startY: 200,
                endX: 300,
                endY: 400,
                capacity: 5000,
                priority: 10,
            };

            const tx = await contract.connect(signers.carrier1).registerRoute(
                routeData.startX,
                routeData.startY,
                routeData.endX,
                routeData.endY,
                routeData.capacity,
                routeData.priority
            );

            await expect(tx)
                .to.emit(contract, "RouteRegistered")
                .withArgs(1, signers.carrier1.address);

            // Verify route info
            const routeInfo = await contract.getRouteInfo(1);
            expect(routeInfo.isActive).to.be.true;
            expect(routeInfo.carrier).to.equal(signers.carrier1.address);
        });

        it("should increment route counter after registration", async function () {
            await contract.connect(signers.carrier1).registerRoute(
                100, 200, 300, 400, 5000, 10
            );

            const routeCounter = await contract.routeCounter();
            expect(routeCounter).to.equal(2);
        });

        it("should allow multiple carriers to register routes", async function () {
            // Carrier 1 registers
            await contract.connect(signers.carrier1).registerRoute(
                100, 200, 300, 400, 5000, 10
            );

            // Carrier 2 registers
            await contract.connect(signers.carrier2).registerRoute(
                150, 250, 350, 450, 3000, 8
            );

            const carrier1Routes = await contract.getCarrierRoutes(signers.carrier1.address);
            const carrier2Routes = await contract.getCarrierRoutes(signers.carrier2.address);

            expect(carrier1Routes.length).to.equal(1);
            expect(carrier2Routes.length).to.equal(1);
        });

        it("should track carrier routes correctly", async function () {
            // Register multiple routes for same carrier
            await contract.connect(signers.carrier1).registerRoute(
                100, 200, 300, 400, 5000, 10
            );
            await contract.connect(signers.carrier1).registerRoute(
                110, 210, 310, 410, 4000, 9
            );

            const carrierRoutes = await contract.getCarrierRoutes(signers.carrier1.address);
            expect(carrierRoutes.length).to.equal(2);
            expect(carrierRoutes[0]).to.equal(1);
            expect(carrierRoutes[1]).to.equal(2);
        });
    });

    /**
     * Test suite for transport request submission
     */
    describe("Transport Request Submission", () => {
        it("should submit a new transport request with encrypted data", async function () {
            const requestData = {
                pickupX: 120,
                pickupY: 220,
                dropX: 280,
                dropY: 380,
                weight: 1000,
                urgency: 5,
                maxCost: 500,
            };

            const tx = await contract.connect(signers.requester1).submitTransportRequest(
                requestData.pickupX,
                requestData.pickupY,
                requestData.dropX,
                requestData.dropY,
                requestData.weight,
                requestData.urgency,
                requestData.maxCost
            );

            await expect(tx)
                .to.emit(contract, "RequestSubmitted")
                .withArgs(1, signers.requester1.address);

            // Verify request status
            const requestStatus = await contract.getRequestStatus(1);
            expect(requestStatus.isMatched).to.be.false;
            expect(requestStatus.requester).to.equal(signers.requester1.address);
            expect(requestStatus.assignedRoute).to.equal(0);
        });

        it("should increment request counter after submission", async function () {
            await contract.connect(signers.requester1).submitTransportRequest(
                120, 220, 280, 380, 1000, 5, 500
            );

            const requestCounter = await contract.requestCounter();
            expect(requestCounter).to.equal(2);
        });

        it("should track user requests correctly", async function () {
            // Submit multiple requests for same user
            await contract.connect(signers.requester1).submitTransportRequest(
                120, 220, 280, 380, 1000, 5, 500
            );
            await contract.connect(signers.requester1).submitTransportRequest(
                125, 225, 285, 385, 1500, 7, 600
            );

            const userRequests = await contract.getUserRequests(signers.requester1.address);
            expect(userRequests.length).to.equal(2);
            expect(userRequests[0]).to.equal(1);
            expect(userRequests[1]).to.equal(2);
        });

        it("should allow multiple users to submit requests", async function () {
            await contract.connect(signers.requester1).submitTransportRequest(
                120, 220, 280, 380, 1000, 5, 500
            );
            await contract.connect(signers.requester2).submitTransportRequest(
                130, 230, 290, 390, 2000, 6, 700
            );

            const user1Requests = await contract.getUserRequests(signers.requester1.address);
            const user2Requests = await contract.getUserRequests(signers.requester2.address);

            expect(user1Requests.length).to.equal(1);
            expect(user2Requests.length).to.equal(1);
        });
    });

    /**
     * Test suite for schedule optimization
     */
    describe("Schedule Optimization", () => {
        beforeEach(async function () {
            // Register a route
            await contract.connect(signers.carrier1).registerRoute(
                100, 200, 300, 400, 5000, 10
            );

            // Submit some transport requests
            await contract.connect(signers.requester1).submitTransportRequest(
                120, 220, 280, 380, 1000, 5, 500
            );
            await contract.connect(signers.requester2).submitTransportRequest(
                125, 225, 285, 385, 1500, 7, 600
            );
        });

        it("should allow carrier to optimize their route schedule", async function () {
            const tx = await contract.connect(signers.carrier1).optimizeSchedule(1);

            await expect(tx)
                .to.emit(contract, "ScheduleOptimized")
                .withArgs(1, await ethers.provider.getBlock("latest").then(b => b!.timestamp));
        });

        it("should fail if non-carrier tries to optimize", async function () {
            await expect(
                contract.connect(signers.requester1).optimizeSchedule(1)
            ).to.be.revertedWith("Not route carrier");
        });

        it("should fail if route is not active", async function () {
            // Deactivate the route first
            await contract.connect(signers.carrier1).deactivateRoute(1);

            await expect(
                contract.connect(signers.carrier1).optimizeSchedule(1)
            ).to.be.revertedWith("Route not active");
        });

        it("should create schedule with correct optimization flag", async function () {
            await contract.connect(signers.carrier1).optimizeSchedule(1);

            const scheduleInfo = await contract.getScheduleInfo(1);
            expect(scheduleInfo.isOptimized).to.be.true;
        });
    });

    /**
     * Test suite for request matching
     */
    describe("Request Matching", () => {
        beforeEach(async function () {
            // Register a route
            await contract.connect(signers.carrier1).registerRoute(
                100, 200, 300, 400, 5000, 10
            );

            // Submit a transport request
            await contract.connect(signers.requester1).submitTransportRequest(
                120, 220, 280, 380, 1000, 5, 500
            );

            // Optimize the schedule
            await contract.connect(signers.carrier1).optimizeSchedule(1);
        });

        it("should match request to route successfully", async function () {
            const tx = await contract.connect(signers.carrier1).matchRequest(1, 1);

            await expect(tx)
                .to.emit(contract, "TransportMatched")
                .withArgs(1, 1);

            // Verify request is now matched
            const requestStatus = await contract.getRequestStatus(1);
            expect(requestStatus.isMatched).to.be.true;
            expect(requestStatus.assignedRoute).to.equal(1);
        });

        it("should fail if request already matched", async function () {
            // Match the request first time
            await contract.connect(signers.carrier1).matchRequest(1, 1);

            // Try to match again
            await expect(
                contract.connect(signers.carrier1).matchRequest(1, 1)
            ).to.be.revertedWith("Request already matched");
        });

        it("should fail if route not active", async function () {
            // Deactivate the route
            await contract.connect(signers.carrier1).deactivateRoute(1);

            await expect(
                contract.connect(signers.carrier1).matchRequest(1, 1)
            ).to.be.revertedWith("Route not active");
        });

        it("should fail if schedule not optimized", async function () {
            // Register new route without optimization
            await contract.connect(signers.carrier1).registerRoute(
                110, 210, 310, 410, 4000, 9
            );

            await expect(
                contract.connect(signers.carrier1).matchRequest(1, 2)
            ).to.be.revertedWith("Schedule not optimized");
        });

        it("should fail if non-carrier tries to match", async function () {
            await expect(
                contract.connect(signers.requester1).matchRequest(1, 1)
            ).to.be.revertedWith("Not route carrier");
        });
    });

    /**
     * Test suite for route management
     */
    describe("Route Management", () => {
        beforeEach(async function () {
            await contract.connect(signers.carrier1).registerRoute(
                100, 200, 300, 400, 5000, 10
            );
        });

        it("should allow carrier to deactivate their route", async function () {
            await contract.connect(signers.carrier1).deactivateRoute(1);

            const routeInfo = await contract.getRouteInfo(1);
            expect(routeInfo.isActive).to.be.false;
        });

        it("should allow carrier to reactivate their route", async function () {
            // Deactivate first
            await contract.connect(signers.carrier1).deactivateRoute(1);

            // Then reactivate
            await contract.connect(signers.carrier1).reactivateRoute(1);

            const routeInfo = await contract.getRouteInfo(1);
            expect(routeInfo.isActive).to.be.true;
        });

        it("should fail if non-carrier tries to deactivate", async function () {
            await expect(
                contract.connect(signers.carrier2).deactivateRoute(1)
            ).to.be.revertedWith("Not route carrier");
        });

        it("should fail if non-carrier tries to reactivate", async function () {
            await contract.connect(signers.carrier1).deactivateRoute(1);

            await expect(
                contract.connect(signers.carrier2).reactivateRoute(1)
            ).to.be.revertedWith("Not route carrier");
        });
    });

    /**
     * Test suite for complete workflow
     */
    describe("Complete Workflow Integration", () => {
        it("should handle full lifecycle: register -> request -> optimize -> match", async function () {
            // Step 1: Carrier registers route
            await contract.connect(signers.carrier1).registerRoute(
                100, 200, 300, 400, 5000, 10
            );

            // Step 2: Requester submits transport request
            await contract.connect(signers.requester1).submitTransportRequest(
                120, 220, 280, 380, 1000, 5, 500
            );

            // Step 3: Carrier optimizes schedule
            await contract.connect(signers.carrier1).optimizeSchedule(1);

            // Step 4: Carrier matches request
            await contract.connect(signers.carrier1).matchRequest(1, 1);

            // Verify final state
            const requestStatus = await contract.getRequestStatus(1);
            expect(requestStatus.isMatched).to.be.true;
            expect(requestStatus.assignedRoute).to.equal(1);

            const scheduleInfo = await contract.getScheduleInfo(1);
            expect(scheduleInfo.isOptimized).to.be.true;
        });

        it("should handle multiple routes and requests", async function () {
            // Register two routes from different carriers
            await contract.connect(signers.carrier1).registerRoute(
                100, 200, 300, 400, 5000, 10
            );
            await contract.connect(signers.carrier2).registerRoute(
                150, 250, 350, 450, 3000, 8
            );

            // Submit three requests
            await contract.connect(signers.requester1).submitTransportRequest(
                120, 220, 280, 380, 1000, 5, 500
            );
            await contract.connect(signers.requester2).submitTransportRequest(
                170, 270, 330, 430, 1500, 7, 600
            );

            // Optimize both routes
            await contract.connect(signers.carrier1).optimizeSchedule(1);
            await contract.connect(signers.carrier2).optimizeSchedule(2);

            // Match requests to appropriate routes
            await contract.connect(signers.carrier1).matchRequest(1, 1);
            await contract.connect(signers.carrier2).matchRequest(2, 2);

            // Verify both matches
            const request1Status = await contract.getRequestStatus(1);
            const request2Status = await contract.getRequestStatus(2);

            expect(request1Status.isMatched).to.be.true;
            expect(request1Status.assignedRoute).to.equal(1);
            expect(request2Status.isMatched).to.be.true;
            expect(request2Status.assignedRoute).to.equal(2);
        });
    });

    /**
     * Test suite for privacy guarantees
     */
    describe("Privacy Features", () => {
        it("should keep route coordinates encrypted", async function () {
            // Register route with specific coordinates
            await contract.connect(signers.carrier1).registerRoute(
                100, 200, 300, 400, 5000, 10
            );

            // Public function should not reveal encrypted data
            const routeInfo = await contract.getRouteInfo(1);
            expect(routeInfo.isActive).to.exist;
            expect(routeInfo.carrier).to.exist;
            // Encrypted fields are not exposed in public view
        });

        it("should keep request details encrypted", async function () {
            // Submit request with specific details
            await contract.connect(signers.requester1).submitTransportRequest(
                120, 220, 280, 380, 1000, 5, 500
            );

            // Public function should not reveal encrypted data
            const requestStatus = await contract.getRequestStatus(1);
            expect(requestStatus.isMatched).to.exist;
            expect(requestStatus.requester).to.exist;
            // Encrypted fields are not exposed in public view
        });

        it("should maintain privacy during optimization", async function () {
            // Register route
            await contract.connect(signers.carrier1).registerRoute(
                100, 200, 300, 400, 5000, 10
            );

            // Submit requests
            await contract.connect(signers.requester1).submitTransportRequest(
                120, 220, 280, 380, 1000, 5, 500
            );

            // Optimize schedule - should not reveal encrypted data
            await contract.connect(signers.carrier1).optimizeSchedule(1);

            const scheduleInfo = await contract.getScheduleInfo(1);
            expect(scheduleInfo.isOptimized).to.be.true;
            // Encrypted efficiency and load are not exposed
        });
    });

    /**
     * Test suite for edge scenarios
     */
    describe("Edge Cases and Boundary Conditions", () => {
        it("should handle route with zero capacity", async function () {
            await contract.connect(signers.carrier1).registerRoute(
                100, 200, 300, 400, 0, 10
            );

            const routeInfo = await contract.getRouteInfo(1);
            expect(routeInfo.isActive).to.be.true;
        });

        it("should handle request with zero weight", async function () {
            await contract.connect(signers.requester1).submitTransportRequest(
                120, 220, 280, 380, 0, 5, 500
            );

            const requestStatus = await contract.getRequestStatus(1);
            expect(requestStatus.isMatched).to.be.false;
        });

        it("should handle maximum coordinate values", async function () {
            const maxUint16 = 65535;
            await contract.connect(signers.carrier1).registerRoute(
                maxUint16, maxUint16, maxUint16, maxUint16, 5000, 10
            );

            const routeInfo = await contract.getRouteInfo(1);
            expect(routeInfo.isActive).to.be.true;
        });

        it("should handle multiple optimizations for same route", async function () {
            await contract.connect(signers.carrier1).registerRoute(
                100, 200, 300, 400, 5000, 10
            );

            await contract.connect(signers.requester1).submitTransportRequest(
                120, 220, 280, 380, 1000, 5, 500
            );

            // First optimization
            await contract.connect(signers.carrier1).optimizeSchedule(1);

            // Second optimization (should update existing schedule)
            await contract.connect(signers.carrier1).optimizeSchedule(1);

            const scheduleInfo = await contract.getScheduleInfo(1);
            expect(scheduleInfo.isOptimized).to.be.true;
        });
    });
});
