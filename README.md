# ProofOfApproval – BOT Chain Decentralized Governance dApp

ProofOfApproval is a modern, responsive, non-custodial decentralized proposal approval platform built natively for **BOT Chain**. Users can create governance proposals and invite wallet addresses to approve or reject them. All proposals, votes, and final decisions are permanently recorded on the BOT Chain smart contract.

---

## 🌐 Official BOT Chain Network Configuration

Configuration details derived strictly from official BOT Chain developer documentation:

### BOT Chain Testnet
- **Network Name:** BOT Chain Testnet
- **Chain ID:** `968` (`0x3c8`)
- **RPC Endpoint:** `https://rpc.bohr.life`
- **Native Currency:** `BOT` (18 decimals)
- **Total Supply:** 150 Million
- **Block Explorer:** [https://scan.bohr.life](https://scan.bohr.life)
- **Faucet:** [https://faucet.botchain.ai/basic](https://faucet.botchain.ai/basic)

### BOT Chain Mainnet
- **Network Name:** BOT Chain
- **Chain ID:** `677` (`0x2a5`)
- **RPC Endpoint:** `https://rpc.botchain.ai`
- **Native Currency:** `BOT` (18 decimals)
- **Block Explorer:** [https://scan.botchain.ai](https://scan.botchain.ai)

---

## 🛠️ Technology Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (Dark governance dashboard theme)
- **Web3 Wallet Integration:** Reown AppKit (`@reown/appkit`, `@reown/appkit-adapter-wagmi`), Wagmi v2, Viem
- **Smart Contract:** Solidity `0.8.24`
- **Development & Testing:** Hardhat, Mocha, Chai, Ethers.js v6

---

## 📜 Smart Contract Specification (`ProofOfApproval.sol`)

The smart contract implements all required functionality:

- `createProposal(bytes32 proposalId, string title, string description)`: Creates a new proposal. Reverts if title is empty, proposalId is zero, or if the ID is already taken.
- `approveProposal(bytes32 proposalId)`: Records an approval vote for `msg.sender`. Prevents voting twice or changing a vote.
- `rejectProposal(bytes32 proposalId)`: Records a rejection vote for `msg.sender`. Prevents voting twice or changing a vote.
- `closeProposal(bytes32 proposalId)`: Closes an active proposal. Only the original creator can execute this function.
- `getProposal(bytes32 proposalId)`: Returns full proposal details (id, creator, title, description, isOpen, approvals, rejections, createdAt).
- `getResults(bytes32 proposalId)`: Returns approval count, rejection count, and whether the proposal is still open.
- `getProposalVoters(bytes32 proposalId)`: Returns the audit list of all voting wallet addresses and their respective decisions (Approved or Rejected) in a single read call, ensuring high reliability on RPCs with `eth_getLogs` restrictions.
- `getAllProposalIds()`: Returns all registered proposal IDs.

---

## 🛡️ Security & Integrity Highlights

1. **Non-Custodial Architecture:** The dApp never touches or asks for users' private keys or seed phrases.
2. **Double-Voting Prevention:** Each wallet address can cast only a single vote per proposal (cannot vote twice or approve then reject).
3. **Strict Confirmation:** The dApp strictly awaits block receipts before confirming any transaction or vote.
4. **Creator Authorization:** Only the original proposal creator has permission to close their proposal.
5. **Post-Closure Protection:** Once closed, proposals reject any further votes.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Smart Contract Tests
Run the automated test suite covering all security constraints, authorization checks, duplicate votes, and edge cases:
```bash
npm run test
```

### 3. Compile Smart Contracts
```bash
npm run compile
```

### 4. Deploy to BOT Chain Testnet
Set your deployer private key (requires testnet BOT from the faucet):
```bash
export PRIVATE_KEY="your_private_key" # or in .env
npm run deploy:testnet
```

### 5. Launch the Frontend
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

