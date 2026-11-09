export const PROOF_OF_APPROVAL_ABI = [
  {
    "type": "function",
    "name": "createProposal",
    "inputs": [
      { "name": "proposalId", "type": "bytes32", "internalType": "bytes32" },
      { "name": "title", "type": "string", "internalType": "string" },
      { "name": "description", "type": "string", "internalType": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "approveProposal",
    "inputs": [
      { "name": "proposalId", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "rejectProposal",
    "inputs": [
      { "name": "proposalId", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "closeProposal",
    "inputs": [
      { "name": "proposalId", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getProposal",
    "inputs": [
      { "name": "proposalId", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [
      { "name": "id", "type": "bytes32", "internalType": "bytes32" },
      { "name": "creator", "type": "address", "internalType": "address" },
      { "name": "title", "type": "string", "internalType": "string" },
      { "name": "description", "type": "string", "internalType": "string" },
      { "name": "isOpen", "type": "bool", "internalType": "bool" },
      { "name": "approvals", "type": "uint256", "internalType": "uint256" },
      { "name": "rejections", "type": "uint256", "internalType": "uint256" },
      { "name": "createdAt", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getResults",
    "inputs": [
      { "name": "proposalId", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [
      { "name": "approvals", "type": "uint256", "internalType": "uint256" },
      { "name": "rejections", "type": "uint256", "internalType": "uint256" },
      { "name": "isOpen", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getProposalCount",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAllProposalIds",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "bytes32[]", "internalType": "bytes32[]" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasVoted",
    "inputs": [
      { "name": "proposalId", "type": "bytes32", "internalType": "bytes32" },
      { "name": "voter", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getVoteDecision",
    "inputs": [
      { "name": "proposalId", "type": "bytes32", "internalType": "bytes32" },
      { "name": "voter", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "", "type": "uint8", "internalType": "uint8" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getProposalVoters",
    "inputs": [
      { "name": "proposalId", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [
      { "name": "voters", "type": "address[]", "internalType": "address[]" },
      { "name": "decisions", "type": "uint8[]", "internalType": "uint8[]" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "ProposalCreated",
    "inputs": [
      { "name": "proposalId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "creator", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "title", "type": "string", "indexed": false, "internalType": "string" },
      { "name": "description", "type": "string", "indexed": false, "internalType": "string" },
      { "name": "createdAt", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ProposalApproved",
    "inputs": [
      { "name": "proposalId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "voter", "type": "address", "indexed": true, "internalType": "address" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ProposalRejected",
    "inputs": [
      { "name": "proposalId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "voter", "type": "address", "indexed": true, "internalType": "address" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ProposalClosed",
    "inputs": [
      { "name": "proposalId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "creator", "type": "address", "indexed": true, "internalType": "address" }
    ],
    "anonymous": false
  }
] as const;

