const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log("==========================================");
  console.log("ProofOfApproval Deployment");
  console.log("==========================================");
  console.log("Network Name:    ", network.name);
  console.log("Chain ID:        ", network.chainId.toString());
  console.log("Deployer Address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer Balance:", hre.ethers.formatEther(balance), "BOT");

  console.log("\nDeploying ProofOfApproval contract...");
  const ProofOfApprovalFactory = await hre.ethers.getContractFactory("ProofOfApproval");
  const proofOfApproval = await ProofOfApprovalFactory.deploy();
  await proofOfApproval.waitForDeployment();

  const contractAddress = await proofOfApproval.getAddress();
  console.log("ProofOfApproval deployed at:", contractAddress);

  // Export contract deployment info for frontend
  const deploymentInfo = {
    address: contractAddress,
    chainId: Number(network.chainId),
    network: network.name,
    deployedAt: new Date().toISOString(),
  };

  const outputDir = path.join(__dirname, "../src/contracts");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, "deployedAddress.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Also update .env file if it exists
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf-8");
    if (envContent.includes("VITE_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /VITE_CONTRACT_ADDRESS=.*/,
        `VITE_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nVITE_CONTRACT_ADDRESS=${contractAddress}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log("Updated VITE_CONTRACT_ADDRESS in .env");
  }

  console.log("Deployment information saved to src/contracts/deployedAddress.json");
  console.log("==========================================");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

