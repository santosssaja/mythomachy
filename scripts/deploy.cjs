const fs = require('fs');
const path = require('path');
const { createWalletClient, createPublicClient, http } = require('viem');
const { privateKeyToAccount, generatePrivateKey } = require('viem/accounts');

// Monad Testnet config
const MONAD_TESTNET = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] }
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' }
  }
};

async function main() {
  const artifactPath = path.resolve(__dirname, '../src/config/contractArtifact.json');
  if (!fs.existsSync(artifactPath)) {
    console.error('Artifact not found! Run "node scripts/compile.cjs" first.');
    process.exit(1);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  let privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.log('No PRIVATE_KEY env provided.');
    console.log('To deploy to live Monad Testnet, set PRIVATE_KEY=0x... or pass as first argument.');
    const argKey = process.argv[2];
    if (argKey && argKey.startsWith('0x')) {
      privateKey = argKey;
    } else {
      console.log('Generating a temporary burner key for inspection:');
      privateKey = generatePrivateKey();
      console.log('Generated address:', privateKeyToAccount(privateKey).address);
      console.log('Fund this address with Monad Testnet faucet tokens and run again.');
      return;
    }
  }

  const account = privateKeyToAccount(privateKey);
  console.log('Deployer Address:', account.address);

  const publicClient = createPublicClient({
    chain: MONAD_TESTNET,
    transport: http('https://testnet-rpc.monad.xyz')
  });

  const walletClient = createWalletClient({
    account,
    chain: MONAD_TESTNET,
    transport: http('https://testnet-rpc.monad.xyz')
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Current Balance: ${balance.toString()} wei (${Number(balance) / 1e18} MON)`);

  if (balance === 0n) {
    console.error('Account has 0 MON. Please fund via faucet at https://testnet.monad.xyz');
    process.exit(1);
  }

  console.log('Deploying MythomachyArena to Monad Testnet...');
  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    gas: 4_500_000n
  });

  console.log('Deployment Tx Hash:', hash);
  console.log(`Tracking on Explorer: https://testnet.monadexplorer.com/tx/${hash}`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log('Contract successfully deployed to:', receipt.contractAddress);
  console.log(`Verified Explorer URL: https://testnet.monadexplorer.com/address/${receipt.contractAddress}`);

  // Write contract address to config
  const envContent = `VITE_MONAD_CONTRACT_ADDRESS=${receipt.contractAddress}\n`;
  fs.writeFileSync(path.resolve(__dirname, '../.env'), envContent);
  console.log('Updated .env with VITE_MONAD_CONTRACT_ADDRESS');
}

main().catch(err => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
