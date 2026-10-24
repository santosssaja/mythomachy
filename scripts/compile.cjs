const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractPath = path.resolve(__dirname, '../contracts/MythomachyArena.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'MythomachyArena.sol': {
      content: source
    }
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode']
      }
    }
  }
};

console.log('Compiling MythomachyArena.sol with solc...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let hasErrors = false;
  output.errors.forEach(err => {
    if (err.severity === 'error') {
      console.error(err.formattedMessage);
      hasErrors = true;
    } else {
      console.warn(err.formattedMessage);
    }
  });
  if (hasErrors) {
    process.exit(1);
  }
}

const contract = output.contracts['MythomachyArena.sol']['MythomachyArena'];
const artifact = {
  contractName: 'MythomachyArena',
  abi: contract.abi,
  bytecode: '0x' + contract.evm.bytecode.object,
  deployedBytecode: '0x' + contract.evm.deployedBytecode.object
};

const outDir = path.resolve(__dirname, '../src/config');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outPath = path.resolve(outDir, 'contractArtifact.json');
fs.writeFileSync(outPath, JSON.stringify(artifact, null, 2));

console.log('Artifact saved successfully to:', outPath);
console.log('ABI functions count:', artifact.abi.length);
console.log('Bytecode size (bytes):', artifact.bytecode.length / 2);
