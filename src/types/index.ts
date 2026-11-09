export enum VoteDecision {
  None = 0,
  Approved = 1,
  Rejected = 2,
}

export interface Proposal {
  id: `0x${string}`;
  creator: `0x${string}`;
  title: string;
  description: string;
  isOpen: boolean;
  approvals: bigint;
  rejections: bigint;
  createdAt: bigint;
}

export interface VoterRecord {
  address: `0x${string}`;
  decision: VoteDecision;
}

export interface ProposalWithDetails extends Proposal {
  userVote?: VoteDecision;
  voters?: VoterRecord[];
  deadline?: string;
}

