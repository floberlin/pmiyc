# pmiyc

Pay me if you can - EthGlobal Paris 2023

## Description

Introducing zkPaymaster: A Revolutionary Account Abstraction Paymaster utilising Sismo zero knowledge proofs to conditionally sponsor transactions for users.

---

In the realm of the ETHGlobal Paris Hackathon, we've developed zkPaymaster, an innovative solution that redefines the mechanics of cross-chain transactions. Leveraging the potential of account abstraction and zero-knowledge proofs, our platform introduces novel paymasters designed to serve unique purposes.

At the heart of our MVP is a zero-knowledge proof system that verifies the ownership of MakerDAO tokens across any wallet on any blockchain. Once this proof is established, our specially-designed paymaster covers all the transaction fees when swapping or trading Savings DAI (sDAI). This system eliminates the hassle and expense of fees for the user, providing a seamless and cost-effective trading experience and rewarding MakerDAO holders!

The foundation of our account abstraction system is built on Biconomy. The zero-knowledge proofs are generated using Sismo.

While zkPaymaster is currently tailored to support the sDAI ecosystem as a way to reward MakerDAO holders, its framework is versatile and extendable. It can be adapted to any DAO or other provable constructs, thus laying the groundwork for a more interconnected and seamless decentralized ecosystem.

We believe zkPaymaster will reshape the landscape of blockchain transactions, lowering barriers, enhancing utility, strengthening privacy, and democratizing access to decentralized financial services. Our project marks a significant step forward in the blockchain sphere, promising an efficient and cost-effective solution for users while fostering a more inclusive and interconnected DeFi landscape.

## How it's made

The UI is built using Next.js and the Biconomy account abstraction packages. For the zk proof generation we are using Sismos' Vaults. The Paymaster is a 4337-complaint paymaster, which verifies the data given from Sismo.
