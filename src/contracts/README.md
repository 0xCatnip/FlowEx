Run the Hardhat
```bash
npx hardhat node
```

```bash
npx hardhat compile
npx hardhat run scripts/deployFactory.ts --network <your_network>
```

Config the local env after deployed the contracts
```
NEXT_PUBLIC_FACTORY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

```pgsql
TypeError: Unknown file extension ".ts"
```
remove `"module": "ESNext",`