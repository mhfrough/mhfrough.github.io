// EthicalNode case-study copy. English only, plain const.
// Facts come from the five EthicalNode repos (admin-portal, investor-portal, guest-portal, ethicalnode-api,
// ethicalnode-contracts; read, never modified) and their git history, Feb to Apr 2023. The owner wrote 50 of the
// admin portal's 51 commits, the investor portal's sign-in rewrite and its staking screens (10 of 66 commits), and
// moved the API to TypeScript (2 of 57); the guest portal, the rest of the API and the Solidity contracts were
// teammates' work and the page says so. The brand writes itself "EthicalNode" (app titles, live site). The client
// behind it and the company the owner built it for are never named. ethicalnode.com is live on a newer build that
// is not the owner's work, so the page shows no screenshots: the portals appear as my own mockups with sample data
// (fake addresses such as 0x1234…abcd, placeholder APYs). No financial claims or advice: the copy describes software.

export const COPY = {
  seo: {
    title: 'EthicalNode case study',
    description:
      'EthicalNode, Shariah-screened crypto staking: the React admin portal where permissions and chain settings are smart-contract transactions, and the investor portal’s wallet sign-in and staking flows. Built in 2023.',
    imageAlt: 'EthicalNode case study cover: the crescent mark and "Shariah-screened staking, run on chain." beside a mockup of the investor portal’s asset list.',
  },
  hero: {
    tag: 'Case study',
    pill: 'Feb to Apr 2023, React and web3 frontend',
    line1: 'EthicalNode.',
    line2: 'Shariah-screened staking, run on chain.',
    lede: 'EthicalNode lets people stake coins on blockchains screened for Shariah compliance. I built the admin portal, where every permission and chain setting is a smart-contract transaction, and the investor portal’s sign-in and staking: stake, claim rewards, unstake, withdraw.',
    back: 'View work',
  },
  meta: [
    { k: 'Role', v: 'React developer, admin portal and staking' },
    { k: 'Timeline', v: 'Feb to Apr 2023, eight weeks' },
    { k: 'Platforms', v: 'Admin portal, investor portal' },
    { k: 'Stack', v: 'React 18, TypeScript, ethers, wagmi' },
  ],
  live: 'ethicalnode.com runs today on a newer build that is not my work. This page comes from the 2023 code; the portals are my own mockups with sample data on testnets.',
  numbers: [
    { value: '50/51', label: 'commits on the admin portal, from the first screen to version 0.1.4' },
    { value: '4', label: 'admin permissions held in a contract, granted and revoked as transactions' },
    { value: '2', label: 'ways in for investors: their own wallet or a social login' },
    { value: '8', label: 'weeks from the first admin commit to staking and withdrawing on testnet' },
  ],
  arch: {
    title: 'Three portals, one API, the chain as the record',
    sub: 'Writes go from the wallet straight to the contracts. The API keeps names and contacts, and reads the contracts to decide who someone is.',
    left: 'Portals',
    core: 'EthicalNode API',
    coreSub: 'Express, TypeORM, MySQL',
    wallet: 'The user’s wallet',
    walletSub: 'Signs every write, straight to the contracts',
    right: 'On chain',
    portals: [
      { icon: 'phosphorGlobe', t: 'Guest portal', s: 'The public face, before sign-in', mine: false },
      { icon: 'phosphorWallet', t: 'Investor portal', s: 'Sign-in, stake, rewards, withdraw', mine: true },
      { icon: 'phosphorShieldCheck', t: 'Admin portal', s: 'Admins, chains, unstake approvals', mine: true },
    ],
    chain: [
      { icon: 'phosphorKey', t: 'AdminControl', s: 'Roles and four permissions' },
      { icon: 'phosphorListChecks', t: 'Chain registry', s: 'APY, commission, unbonding, compliance' },
      { icon: 'phosphorCube', t: 'Staking contracts', s: 'One per chain, holds the stakes' },
      { icon: 'phosphorShareNetwork', t: 'Testnets', s: 'Polygon Mumbai, Goerli' },
    ],
    mine: 'Mine',
    note: 'Mine: the admin portal, the investor portal’s sign-in and staking screens, and the API’s move to TypeScript. The guest portal, the rest of the API and the Solidity contracts were teammates’ work.',
  },
  flow: {
    title: 'The life of a stake',
    sub: 'Five steps across two portals. The investor signs every move from their own wallet; an admin funds rewards and approves each unstake on the chain it belongs to.',
    steps: ['Sign in with a wallet', 'Stake on a chain', 'Claim rewards', 'Unstake and unbond', 'Withdraw once approved'],
    holds: [
      { t: 'Sign in', s: 'The wallet signs a one-time message and the API recovers the address from it, or Web3Auth signs the investor in with a social account.' },
      { t: 'Stake', s: 'Coins go to the chain’s own staking contract. The portal switches the wallet to that network first.' },
      { t: 'Rewards', s: 'An admin funds a chain’s rewards from the admin portal; investors claim them from My Assets.' },
      { t: 'Unbond', s: 'An unstake waits the chain’s withdrawal days and an admin’s approval, then withdraw sends it back.' },
    ],
  },
  perms: {
    title: 'Permissions are transactions',
    sub: 'Granting an admin a permission is a call to the AdminControl contract. The wallet asks, the row shows pending, and the switch flips only when the receipt arrives.',
  },
  chains: {
    title: 'Chains and the unstake queue',
    sub: 'Each chain carries its staking contract, APY, commission, unbonding days and a compliance rating. Approving an unstake runs on that chain’s contract, so the wallet changes network first.',
  },
  stack: {
    title: 'The stack',
    sub: 'React with TypeScript on both portals, two wallet libraries, and a shared Express API over MySQL beside the Solidity contracts.',
    groups: [
      {
        t: 'Portals',
        why: 'React 18 and TypeScript, rsuite tables, forms and modals, and a toast for every failed transaction.',
        items: [
          { name: 'React 18', icon: 'phosphorCode' },
          { name: 'TypeScript', logo: 'typescript' },
          { name: 'React Router', icon: 'phosphorCode' },
          { name: 'rsuite', icon: 'phosphorPackage' },
          { name: 'Bootstrap 5', logo: 'bootstrap' },
          { name: 'Sass', logo: 'sass' },
          { name: 'react-toastify', icon: 'phosphorBell' },
        ],
      },
      {
        t: 'Wallets and chain',
        why: 'Web3 Onboard and ethers in the admin portal; wagmi and Web3Auth in the investor portal.',
        items: [
          { name: 'ethers.js 5', icon: 'phosphorShareNetwork' },
          { name: 'Web3 Onboard', icon: 'phosphorPlugs' },
          { name: 'wagmi', icon: 'phosphorPlugs' },
          { name: 'Web3Auth', icon: 'phosphorLock' },
          { name: 'WalletConnect', icon: 'phosphorPlugs' },
          { name: 'Ledger', icon: 'phosphorShieldCheck' },
        ],
      },
      {
        t: 'API and contracts, shared',
        why: 'An Express API on TypeORM and MySQL, which I moved to TypeScript; Solidity contracts on Hardhat by teammates.',
        items: [
          { name: 'Node.js', logo: 'nodedotjs' },
          { name: 'Express', icon: 'phosphorCode' },
          { name: 'TypeORM', logo: 'typeorm' },
          { name: 'MySQL', icon: 'phosphorPackage' },
          { name: 'JWT', logo: 'jsonwebtokens' },
          { name: 'Solidity', icon: 'phosphorCode' },
          { name: 'Hardhat', icon: 'phosphorPackage' },
          { name: 'OpenZeppelin', icon: 'phosphorShieldCheck' },
        ],
      },
    ],
  },
  decisions: {
    title: 'Decisions and what I’d change',
    sub: 'Money on a chain, admins with different powers, and two portals built at once in eight weeks.',
    items: [
      {
        t: 'The contract decides who is an admin',
        s: 'Roles and the four permissions live in AdminControl. The API reads them at every sign-in and the database keeps only names and contacts, so a revoke on chain needs no second list to update.',
      },
      {
        t: 'A signature, not a password',
        s: 'The portal signs a one-time message and the API recovers the address from it. Nothing to store, reset or leak, and the wallet that signs in is the one that signs the transactions.',
      },
      {
        t: 'Change the table after the receipt',
        s: 'Every grant, chain update and approval waits for the transaction to be mined before the row changes, with a loading state per row and action, so one slow call never freezes the rest.',
      },
      {
        t: 'Switch the network for the user',
        s: 'Rewards and approvals run on the staking contract’s own chain. The portal asks the wallet to switch first and stops with a plain message if the user says no, instead of failing inside the wallet.',
      },
      {
        t: 'Show the transaction, not a spinner',
        s: 'Web3 Onboard connected the wallets, but its notifications were off, so a slow transaction was just a spinner. Today I’d show the hash, pending and confirmed with an explorer link, and keep the hash through a reload.',
      },
      {
        t: 'One wallet stack, one pending state',
        s: 'The admin portal used Web3 Onboard, the investor portal wagmi and Web3Auth: two ways to do one job. Today I’d pick one, and keep pending transactions in one hook instead of a boolean array per button.',
      },
    ],
  },
  next: {
    title: 'Building on a blockchain?',
    sub: 'Wallet sign-in, admin tools over smart contracts, and transaction states people can follow.',
    hire: 'Hire me',
    other: 'Next: Quorum',
  },
} as const;
