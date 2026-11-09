import { PROOF_OF_APPROVAL_ABI } from './ProofOfApprovalABI';
import deployedAddressData from './deployedAddress.json';

export const PROOF_OF_APPROVAL_ADDRESS: `0x${string}` =
  ((import.meta as any).env?.VITE_CONTRACT_ADDRESS as `0x${string}`) ||
  ((deployedAddressData as any)?.address as `0x${string}`) ||
  '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const PROOF_OF_APPROVAL_CONFIG = {
  address: PROOF_OF_APPROVAL_ADDRESS,
  abi: PROOF_OF_APPROVAL_ABI,
} as const;
