const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProofOfApproval Contract", function () {
  let proofOfApproval;
  let owner;
  let voter1;
  let voter2;
  let voter3;
  let nonCreator;

  // Sample proposal ID helper
  function generateProposalId(label) {
    return ethers.keccak256(ethers.toUtf8Bytes(label));
  }

  beforeEach(async function () {
    [owner, voter1, voter2, voter3, nonCreator] = await ethers.getSigners();
    const ProofOfApprovalFactory = await ethers.getContractFactory("ProofOfApproval");
    proofOfApproval = await ProofOfApprovalFactory.deploy();
    await proofOfApproval.waitForDeployment();
  });

  describe("Proposal Creation", function () {
    it("should successfully create a proposal and emit ProposalCreated event", async function () {
      const pid = generateProposalId("proposal-1");
      const title = "Allocate 5,000 BOT for Security Audit";
      const desc = "Hire top security firm for smart contract auditing.";

      const tx = await proofOfApproval.createProposal(pid, title, desc);
      await expect(tx)
        .to.emit(proofOfApproval, "ProposalCreated")
        .withArgs(pid, owner.address, title, desc, (await ethers.provider.getBlock(tx.blockNumber)).timestamp);

      const prop = await proofOfApproval.getProposal(pid);
      expect(prop.id).to.equal(pid);
      expect(prop.creator).to.equal(owner.address);
      expect(prop.title).to.equal(title);
      expect(prop.description).to.equal(desc);
      expect(prop.isOpen).to.equal(true);
      expect(prop.approvals).to.equal(0);
      expect(prop.rejections).to.equal(0);

      const count = await proofOfApproval.getProposalCount();
      expect(count).to.equal(1);

      const ids = await proofOfApproval.getAllProposalIds();
      expect(ids[0]).to.equal(pid);
    });

    it("should reject proposals with empty titles", async function () {
      const pid = generateProposalId("proposal-empty-title");
      await expect(
        proofOfApproval.createProposal(pid, "", "Description text")
      ).to.be.revertedWithCustomError(proofOfApproval, "EmptyTitleNotAllowed");
    });

    it("should reject proposals with invalid zero proposal ID", async function () {
      await expect(
        proofOfApproval.createProposal(ethers.ZeroHash, "Title", "Description")
      ).to.be.revertedWithCustomError(proofOfApproval, "InvalidProposalId");
    });

    it("should prevent duplicate proposal IDs", async function () {
      const pid = generateProposalId("proposal-duplicate");
      await proofOfApproval.createProposal(pid, "First proposal", "Desc 1");

      await expect(
        proofOfApproval.createProposal(pid, "Duplicate proposal", "Desc 2")
      ).to.be.revertedWithCustomError(proofOfApproval, "ProposalAlreadyExists");
    });
  });

  describe("Voting - Approvals and Rejections", function () {
    let pid;

    beforeEach(async function () {
      pid = generateProposalId("proposal-vote-test");
      await proofOfApproval.createProposal(
        pid,
        "Upgrade Bridge Relayer",
        "Improve throughput of the cross-chain relayer"
      );
    });

    it("should allow a wallet to approve a proposal", async function () {
      await expect(proofOfApproval.connect(voter1).approveProposal(pid))
        .to.emit(proofOfApproval, "ProposalApproved")
        .withArgs(pid, voter1.address);

      const results = await proofOfApproval.getResults(pid);
      expect(results.approvals).to.equal(1);
      expect(results.rejections).to.equal(0);
      expect(results.isOpen).to.equal(true);

      expect(await proofOfApproval.hasVoted(pid, voter1.address)).to.equal(true);
      expect(await proofOfApproval.getVoteDecision(pid, voter1.address)).to.equal(1); // 1 = Approved
    });

    it("should allow a wallet to reject a proposal", async function () {
      await expect(proofOfApproval.connect(voter2).rejectProposal(pid))
        .to.emit(proofOfApproval, "ProposalRejected")
        .withArgs(pid, voter2.address);

      const results = await proofOfApproval.getResults(pid);
      expect(results.approvals).to.equal(0);
      expect(results.rejections).to.equal(1);
      expect(results.isOpen).to.equal(true);

      expect(await proofOfApproval.hasVoted(pid, voter2.address)).to.equal(true);
      expect(await proofOfApproval.getVoteDecision(pid, voter2.address)).to.equal(2); // 2 = Rejected
    });

    it("should prevent duplicate votes from the same wallet (double approve)", async function () {
      await proofOfApproval.connect(voter1).approveProposal(pid);

      await expect(
        proofOfApproval.connect(voter1).approveProposal(pid)
      ).to.be.revertedWithCustomError(proofOfApproval, "AlreadyVoted");
    });

    it("should prevent a wallet from voting both ways (approve then reject)", async function () {
      await proofOfApproval.connect(voter1).approveProposal(pid);

      await expect(
        proofOfApproval.connect(voter1).rejectProposal(pid)
      ).to.be.revertedWithCustomError(proofOfApproval, "AlreadyVoted");
    });

    it("should prevent a wallet from voting both ways (reject then approve)", async function () {
      await proofOfApproval.connect(voter2).rejectProposal(pid);

      await expect(
        proofOfApproval.connect(voter2).approveProposal(pid)
      ).to.be.revertedWithCustomError(proofOfApproval, "AlreadyVoted");
    });

    it("should correctly record voters and their decisions", async function () {
      await proofOfApproval.connect(voter1).approveProposal(pid);
      await proofOfApproval.connect(voter2).rejectProposal(pid);
      await proofOfApproval.connect(voter3).approveProposal(pid);

      const [voters, decisions] = await proofOfApproval.getProposalVoters(pid);
      expect(voters.length).to.equal(3);
      expect(decisions.length).to.equal(3);

      expect(voters[0]).to.equal(voter1.address);
      expect(decisions[0]).to.equal(1);

      expect(voters[1]).to.equal(voter2.address);
      expect(decisions[1]).to.equal(2);

      expect(voters[2]).to.equal(voter3.address);
      expect(decisions[2]).to.equal(1);
    });

    it("should revert if voting on non-existent proposal", async function () {
      const nonExistentPid = generateProposalId("unknown");
      await expect(
        proofOfApproval.connect(voter1).approveProposal(nonExistentPid)
      ).to.be.revertedWithCustomError(proofOfApproval, "ProposalDoesNotExist");

      await expect(
        proofOfApproval.connect(voter1).rejectProposal(nonExistentPid)
      ).to.be.revertedWithCustomError(proofOfApproval, "ProposalDoesNotExist");
    });
  });

  describe("Proposal Closure & Unauthorized Access", function () {
    let pid;

    beforeEach(async function () {
      pid = generateProposalId("proposal-close-test");
      await proofOfApproval.connect(owner).createProposal(
        pid,
        "Proposal to Close",
        "Testing closing mechanics"
      );
    });

    it("should allow creator to close the proposal", async function () {
      await expect(proofOfApproval.connect(owner).closeProposal(pid))
        .to.emit(proofOfApproval, "ProposalClosed")
        .withArgs(pid, owner.address);

      const prop = await proofOfApproval.getProposal(pid);
      expect(prop.isOpen).to.equal(false);
    });

    it("should reject closure attempts by non-creator", async function () {
      await expect(
        proofOfApproval.connect(nonCreator).closeProposal(pid)
      ).to.be.revertedWithCustomError(proofOfApproval, "OnlyCreatorCanClose");
    });

    it("should reject closing an already closed proposal", async function () {
      await proofOfApproval.connect(owner).closeProposal(pid);

      await expect(
        proofOfApproval.connect(owner).closeProposal(pid)
      ).to.be.revertedWithCustomError(proofOfApproval, "ProposalIsClosed");
    });

    it("should reject votes after proposal is closed", async function () {
      await proofOfApproval.connect(owner).closeProposal(pid);

      await expect(
        proofOfApproval.connect(voter1).approveProposal(pid)
      ).to.be.revertedWithCustomError(proofOfApproval, "ProposalIsClosed");

      await expect(
        proofOfApproval.connect(voter2).rejectProposal(pid)
      ).to.be.revertedWithCustomError(proofOfApproval, "ProposalIsClosed");
    });
  });
});

