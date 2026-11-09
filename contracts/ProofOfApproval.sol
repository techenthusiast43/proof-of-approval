// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ProofOfApproval
 * @dev Modern, gas-efficient decentralized proposal approval platform for BOT Chain.
 * Users can create proposals and vote to approve or reject them.
 * Decisions are permanently recorded on BOT Chain.
 */
contract ProofOfApproval {
    enum VoteDecision {
        None,
        Approved,
        Rejected
    }

    struct Proposal {
        bytes32 id;
        address creator;
        string title;
        string description;
        bool isOpen;
        uint256 approvals;
        uint256 rejections;
        uint256 createdAt;
    }

    // Storage
    mapping(bytes32 => Proposal) private proposals;
    mapping(bytes32 => mapping(address => VoteDecision)) private voteRecords;
    mapping(bytes32 => address[]) private proposalVoters;
    bytes32[] private proposalIds;

    // Events
    event ProposalCreated(
        bytes32 indexed proposalId,
        address indexed creator,
        string title,
        string description,
        uint256 createdAt
    );

    event ProposalApproved(
        bytes32 indexed proposalId,
        address indexed voter
    );

    event ProposalRejected(
        bytes32 indexed proposalId,
        address indexed voter
    );

    event ProposalClosed(
        bytes32 indexed proposalId,
        address indexed creator
    );

    // Errors for gas efficiency and clear reverts
    error ProposalAlreadyExists(bytes32 proposalId);
    error ProposalDoesNotExist(bytes32 proposalId);
    error EmptyTitleNotAllowed();
    error ProposalIsClosed(bytes32 proposalId);
    error AlreadyVoted(bytes32 proposalId, address voter);
    error OnlyCreatorCanClose(bytes32 proposalId, address caller);
    error InvalidProposalId();

    /**
     * @notice Creates a new proposal.
     * @param proposalId Unique identifier for the proposal.
     * @param title Title of the proposal (cannot be empty).
     * @param description Detailed summary of the proposal.
     */
    function createProposal(
        bytes32 proposalId,
        string calldata title,
        string calldata description
    ) external {
        if (proposalId == bytes32(0)) {
            revert InvalidProposalId();
        }
        if (bytes(title).length == 0) {
            revert EmptyTitleNotAllowed();
        }
        if (proposals[proposalId].creator != address(0)) {
            revert ProposalAlreadyExists(proposalId);
        }

        proposals[proposalId] = Proposal({
            id: proposalId,
            creator: msg.sender,
            title: title,
            description: description,
            isOpen: true,
            approvals: 0,
            rejections: 0,
            createdAt: block.timestamp
        });

        proposalIds.push(proposalId);

        emit ProposalCreated(
            proposalId,
            msg.sender,
            title,
            description,
            block.timestamp
        );
    }

    /**
     * @notice Casts an approval vote on an open proposal.
     * @param proposalId The ID of the proposal.
     */
    function approveProposal(bytes32 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.creator == address(0)) {
            revert ProposalDoesNotExist(proposalId);
        }
        if (!proposal.isOpen) {
            revert ProposalIsClosed(proposalId);
        }
        if (voteRecords[proposalId][msg.sender] != VoteDecision.None) {
            revert AlreadyVoted(proposalId, msg.sender);
        }

        voteRecords[proposalId][msg.sender] = VoteDecision.Approved;
        proposal.approvals += 1;
        proposalVoters[proposalId].push(msg.sender);

        emit ProposalApproved(proposalId, msg.sender);
    }

    /**
     * @notice Casts a rejection vote on an open proposal.
     * @param proposalId The ID of the proposal.
     */
    function rejectProposal(bytes32 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.creator == address(0)) {
            revert ProposalDoesNotExist(proposalId);
        }
        if (!proposal.isOpen) {
            revert ProposalIsClosed(proposalId);
        }
        if (voteRecords[proposalId][msg.sender] != VoteDecision.None) {
            revert AlreadyVoted(proposalId, msg.sender);
        }

        voteRecords[proposalId][msg.sender] = VoteDecision.Rejected;
        proposal.rejections += 1;
        proposalVoters[proposalId].push(msg.sender);

        emit ProposalRejected(proposalId, msg.sender);
    }

    /**
     * @notice Closes an active proposal. Only the creator can close.
     * @param proposalId The ID of the proposal.
     */
    function closeProposal(bytes32 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.creator == address(0)) {
            revert ProposalDoesNotExist(proposalId);
        }
        if (msg.sender != proposal.creator) {
            revert OnlyCreatorCanClose(proposalId, msg.sender);
        }
        if (!proposal.isOpen) {
            revert ProposalIsClosed(proposalId);
        }

        proposal.isOpen = false;

        emit ProposalClosed(proposalId, msg.sender);
    }

    /**
     * @notice Retrieves full proposal details.
     * @param proposalId The ID of the proposal.
     */
    function getProposal(bytes32 proposalId)
        external
        view
        returns (
            bytes32 id,
            address creator,
            string memory title,
            string memory description,
            bool isOpen,
            uint256 approvals,
            uint256 rejections,
            uint256 createdAt
        )
    {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.creator == address(0)) {
            revert ProposalDoesNotExist(proposalId);
        }

        return (
            proposal.id,
            proposal.creator,
            proposal.title,
            proposal.description,
            proposal.isOpen,
            proposal.approvals,
            proposal.rejections,
            proposal.createdAt
        );
    }

    /**
     * @notice Retrieves voting results and status for a proposal.
     * @param proposalId The ID of the proposal.
     */
    function getResults(bytes32 proposalId)
        external
        view
        returns (
            uint256 approvals,
            uint256 rejections,
            bool isOpen
        )
    {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.creator == address(0)) {
            revert ProposalDoesNotExist(proposalId);
        }

        return (proposal.approvals, proposal.rejections, proposal.isOpen);
    }

    /**
     * @notice Retrieves the total number of proposals created.
     */
    function getProposalCount() external view returns (uint256) {
        return proposalIds.length;
    }

    /**
     * @notice Retrieves all proposal IDs.
     */
    function getAllProposalIds() external view returns (bytes32[] memory) {
        return proposalIds;
    }

    /**
     * @notice Checks whether a wallet has voted on a proposal.
     */
    function hasVoted(bytes32 proposalId, address voter) external view returns (bool) {
        return voteRecords[proposalId][voter] != VoteDecision.None;
    }

    /**
     * @notice Retrieves the vote decision of a wallet for a proposal.
     * 0 = None, 1 = Approved, 2 = Rejected
     */
    function getVoteDecision(bytes32 proposalId, address voter)
        external
        view
        returns (uint8)
    {
        return uint8(voteRecords[proposalId][voter]);
    }

    /**
     * @notice Retrieves the list of all voters and their decisions for a proposal.
     */
    function getProposalVoters(bytes32 proposalId)
        external
        view
        returns (address[] memory voters, uint8[] memory decisions)
    {
        address[] storage voterList = proposalVoters[proposalId];
        uint256 length = voterList.length;

        voters = new address[](length);
        decisions = new uint8[](length);

        for (uint256 i = 0; i < length; i++) {
            address v = voterList[i];
            voters[i] = v;
            decisions[i] = uint8(voteRecords[proposalId][v]);
        }
    }
}

