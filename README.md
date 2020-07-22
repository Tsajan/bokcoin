# BOKCOIN
#### This is a CBDC web application project which has been built using the Quorum blockchain (also applicable in Ethereum). This CBDC application is aimed at the retail level with the offering of financial services (e.g., interest on deposit) as well as provisioning of whitelisting and blacklisting of account addresses, and controlled transfer of funds between account addresses.

Follow the steps below to setup the CBDC application

1. Run a Quorum blockchain network with at least two nodes. Details for setting up Quorum blockchain can be found at https://docs.goquorum.com/en/latest/Getting%20Started/Creating-A-Network-From-Scratch/ Alternately, you can also use Ganache (https://www.trufflesuite.com/docs/ganache/quickstart) for easy setup of an Ethereum blockchain.

2. Install NPM (https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

3. Install Truffle (```npm install -g truffle```).

4. Clone this repository into your choice of directory and edit the `truffle-config.js` file accordingly to setup correct values for host, port and type fields
```
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 22000,            // Quorum Node 1
      network_id: "*",       // Any network (default: none)
      gasPrice: 0,
      gas: 4500000,
      type: "quorum" // needed for Truffle to support Quorum
    },
  
    nodetwo:  {
      host: "127.0.0.1",
      port: 22001,
      network_id: "*", // Match any network id
      gasPrice: 0,
      gas: 4500000,
      type: "quorum" // needed for Truffle to support Quorum
    }
  },
```
(P.S. The port field in the network tag has been used in correspondence with Quorum network, change it to 7545 if you are using Ganache).

5. Install lite-server package using npm (https://www.npmjs.com/package/lite-server).

6. Install Metamask add-on for your web-browser (https://metamask.io/) and import the created account addresses of the nodes from Ganache workspace or Quorum blockchain.

7. Navigate to the folder `bokcoin/` and start the web-application by using the following command-
            ``` npm run dev ```
