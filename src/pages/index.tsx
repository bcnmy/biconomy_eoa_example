"use client";
import React, { useState, useEffect } from "react";
import {
  createSmartAccountClient,
  BiconomySmartAccountV2,
  PaymasterMode,
  createBundler,
  getCustomChain,
  Bundler,
} from "@biconomy/account";
import { createWalletClient, http } from "viem";
import { ethers } from "ethers";
import { contractABI } from "../contract/contractABI";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { privateKeyToAccount } from "viem/accounts";

const isDebugMode = !!process.env.NEXT_PUBLIC_BICONOMY_SDK_DEBUG;
console.log("Process env", typeof process.env.NEXT_PUBLIC_BICONOMY_SDK_DEBUG);
console.log(process.env.NEXT_PUBLIC_BICONOMY_SDK_DEBUG);
console.log("Debug Mode", isDebugMode);

export default function Home() {
  // const isDebugMode = process.env.NEXT_PUBLIC_BICONOMY_SDK_DEBUG !!= "true";

  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccountV2 | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(
    null
  );
  const [count, setCount] = useState<string | null>(null);
  const [txnHash, setTxnHash] = useState<string | null>(null);
  const [chainSelected, setChainSelected] = useState<number>(0);

  const chains = [
    // {
    //   chainId: 11155111,
    //   name: "Ethereum Sepolia",
    //   providerUrl: "https://eth-sepolia.public.blastapi.io",
    //   incrementCountContractAdd: "0xd9ea570eF1378D7B52887cE0342721E164062f5f",
    //   biconomyPaymasterApiKey: "gJdVIBMSe.f6cc87ea-e351-449d-9736-c04c6fab56a2",
    //   explorerUrl: "https://sepolia.etherscan.io/tx/",
    // },
    // {
    //   chainId: 713715,
    //   name: "Sei Devnet",
    //   providerUrl: "https://evm-rpc-arctic-1.sei-apis.com",
    //   incrementCountContractAdd: "0xCc0F84A93DB93416eb38bBaC27959a0E325E1C87",
    //   biconomyPaymasterApiKey: "Q0wkKY9iE.0defd30d-e8f3-49cb-a643-b052c0a3d094",
    //   explorerUrl: "https://seitrace.com/",
    // },
    // {
    //   chainId: 995,
    //   name: "5irechain Mainnet",
    //   providerUrl: "https://rpc.5ire.network",
    //   incrementCountContractAdd: "0x006BcC07B3128d72647F49423C4930F8FAb8A6C4",
    //   biconomyPaymasterApiKey: "Ij8PagQGD.e8bcedfd-1763-4f4f-b6a3-b32bd0576c03",
    //   explorerUrl: "https://5irescan.io",
    // },
    // {
    //   chainId: 997,
    //   name: "5irechain Thunder",
    //   providerUrl: "https://rpc.testnet.5ire.network",
    //   incrementCountContractAdd: "0xcf29227477393728935BdBB86770f8F81b698F1A",
    //   biconomyPaymasterApiKey: "IH8Fsr4dq.5d461485-bb44-4b67-bb59-952bcdeb4d73",
    //   explorerUrl: "https://testnet.5irescan.io/",
    // },
    // {
    //   chainId: 28882,
    //   name: "Boba Sepolia",
    //   providerUrl: "https://sepolia.boba.network",
    //   incrementCountContractAdd: "0xcf29227477393728935BdBB86770f8F81b698F1A",
    //   biconomyPaymasterApiKey: "c_ZRZbM_B.c0ad33ae-56ea-44a4-a68e-1848565c4093",
    //   explorerUrl: "https://testnet.bobascan.com",
    // },
    //  {
    //   chainId: 288,
    //   name: "Boba Mainnet",
    //   providerUrl: "https://mainnet.boba.network",
    //   incrementCountContractAdd: "0xcf29227477393728935BdBB86770f8F81b698F1A",
    //   biconomyPaymasterApiKey: "_LKprEnUb.db6d5dc8-daca-4610-a0cb-224bcc14f4b0",
    //   explorerUrl: "https://eth.bobascan.com/",
    // },
    // {
    //   chainId: 1802203764,
    //   name: "Kakorat Sepolia",
    //   providerUrl: "https://sepolia-rpc-priority.kakarot.org",
    //   incrementCountContractAdd: "0x006BcC07B3128d72647F49423C4930F8FAb8A6C4",
    //   biconomyPaymasterApiKey: "R2dBqxHh_.31a6a61d-3bb9-4f5c-ab4d-c3f064115a97",
    //   explorerUrl: "https://sepolia.kakarotscan.org/",
    // },
    {
      chainId: 1329,
      name: "Sei Mainnet",
      providerUrl: "https://evm-rpc.sei-apis.com/",
      incrementCountContractAdd: "0xcf29227477393728935BdBB86770f8F81b698F1A",
      biconomyPaymasterApiKey: "5qf_XJpWY.b73ac4f9-4438-42b5-a4fc-e2460067c350",
      explorerUrl: "https://seitrace.com",
    },
    {
      chainId: 80002,
      name: "Polygon Amoy",
      providerUrl: "https://rpc-amoy.polygon.technology/",
      incrementCountContractAdd: "0xfeec89eC2afD503FF359487967D02285f7DaA9aD",
      biconomyPaymasterApiKey: "TVDdBH-yz.5040805f-d795-4078-9fd1-b668b8817642",
      explorerUrl: "https://www.oklink.com/amoy/tx/",
    },
  ];

  const connect = async () => {
    const ethereum = (window as any).ethereum;
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      // const address = await signer.getAddress();
      // console.log("Address", address);

      // const customChain = getCustomChain(
      //   "Boba Mainnet",
      //   chains[chainSelected].chainId,
      //   chains[chainSelected].providerUrl,
      //   chains[chainSelected].explorerUrl
      // );

      // const pvtkey =
      //   "";
      // const account = privateKeyToAccount(`0x${pvtkey}`);

      // const walletClientWithCustomChain = createWalletClient({
      //   account,
      //   chain: customChain,
      //   transport: http(),
      // });

      const config = {
        biconomyPaymasterApiKey: chains[chainSelected].biconomyPaymasterApiKey,
        // bundlerUrl: `https://bundler.biconomy.io/api/v2/${chains[chainSelected].chainId}/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44`,
        bundlerUrl: `https://bundler.biconomy.io/api/v2/${chains[chainSelected].chainId}/dewj402.wh1289hU-7E49-85b-af80-779ilts88`,
      };

      // const smartAccountCustomChain = await createSmartAccountClient({
      //   signer: walletClientWithCustomChain,
      //   bundlerUrl: `https://bundler.biconomy.io/api/v2/${chains[chainSelected].chainId}/dewj402.wh1289hU-7E49-85b-af80-778ghyuYM`,
      //   // bundlerUrl: config.bundlerUrl,
      //   biconomyPaymasterApiKey: chains[chainSelected].biconomyPaymasterApiKey,
      //   customChain,
      // });

      // console.log("Biconomy Smart Account", smartAccountCustomChain);
      // setSmartAccount(smartAccountCustomChain);
      // const saAddress = await smartAccountCustomChain.getAccountAddress();
      // console.log("Smart Account Address", saAddress);
      // setSmartAccountAddress(saAddress);

      const bundler = await createBundler({
        bundlerUrl: config.bundlerUrl,
        userOpReceiptMaxDurationIntervals: {
          [chains[chainSelected].chainId]: 120000,
        },
        userOpReceiptIntervals: { [chains[chainSelected].chainId]: 3000 },
      });

      const smartWallet = await createSmartAccountClient({
        signer: signer,
        biconomyPaymasterApiKey: config.biconomyPaymasterApiKey,
        bundler: bundler,
        // bundlerUrl: config.bundlerUrl,
        rpcUrl: chains[chainSelected].providerUrl,
        chainId: chains[chainSelected].chainId,
      });

      console.log("Biconomy Smart Account", smartWallet);
      setSmartAccount(smartWallet);
      const saAddress = await smartWallet.getAccountAddress();
      console.log("Smart Account Address", saAddress);
      setSmartAccountAddress(saAddress);
    } catch (error) {
      console.error(error);
    }
  };

  const getCountId = async () => {
    const contractAddress = chains[chainSelected].incrementCountContractAdd;
    const provider = new ethers.providers.JsonRpcProvider(
      chains[chainSelected].providerUrl
    );
    const contractInstance = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );
    const countId = await contractInstance.getCount();
    setCount(countId.toString());
  };

  const incrementCount = async () => {
    try {
      if (isDebugMode) {
        console.log("Debug mode is on");

        const toastId = toast("Populating Transaction", { autoClose: false });

        const contractAddress = chains[chainSelected].incrementCountContractAdd;
        const provider = new ethers.providers.JsonRpcProvider(
          chains[chainSelected].providerUrl
        );
        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          provider
        );
        const minTx = await contractInstance.populateTransaction.increment();
        console.log("Mint Tx Data", minTx.data);
        const tx1 = {
          to: contractAddress,
          data: minTx.data,
        };

        toast.update(toastId, {
          render: "Sending Transaction",
          autoClose: false,
        });

        //@ts-ignore
        // const userOp = await smartAccount?.buildUserOp([tx1], {
        //   paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        // });

        // console.log("User Op", userOp);

        //@ts-ignore
        const userOpResponse = await smartAccount?.sendTransaction(tx1
          //   {
          //   paymasterServiceData: { mode: PaymasterMode.SPONSORED },
          // }
        );
        //@ts-ignore
        const { transactionHash } = await userOpResponse.waitForTxHash();
        console.log("Transaction Hash", transactionHash);

        if (transactionHash) {
          toast.update(toastId, {
            render: "Transaction Successful",
            type: "success",
            autoClose: 5000,
          });
          setTxnHash(transactionHash);
          await getCountId();
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Transaction Unsuccessful", { autoClose: 5000 });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-8 p-24">
      <div className="text-[4rem] font-bold text-orange-400">Biconomy-EOA</div>

      {!smartAccount && (
        <>
          <div className="flex flex-row justify-center items-center gap-4">
            <div
              className={`w-[8rem] h-[3rem] cursor-pointer rounded-lg flex flex-row justify-center items-center text-white ${
                chainSelected == 0 ? "bg-orange-600" : "bg-black"
              } border-2 border-solid border-orange-400`}
              onClick={() => {
                setChainSelected(0);
              }}
            >
              Eth Sepolia
            </div>
            <div
              className={`w-[8rem] h-[3rem] cursor-pointer rounded-lg flex flex-row justify-center items-center text-white ${
                chainSelected == 1 ? "bg-orange-600" : "bg-black"
              } bg-black border-2 border-solid border-orange-400`}
              onClick={() => {
                setChainSelected(1);
              }}
            >
              Poly Amoy
            </div>
          </div>
          <button
            className="w-[10rem] h-[3rem] bg-orange-300 text-black font-bold rounded-lg"
            onClick={connect}
          >
            EOA Sign in
          </button>
        </>
      )}

      {smartAccount && (
        <>
          {" "}
          <span>Smart Account Address</span>
          <span>{smartAccountAddress}</span>
          <span>Network: {chains[chainSelected].name}</span>
          <div className="flex flex-row justify-between items-start gap-8">
            <div className="flex flex-col justify-center items-center gap-4">
              <button
                className="w-[10rem] h-[3rem] bg-orange-300 text-black font-bold rounded-lg"
                onClick={getCountId}
              >
                Get Count Id
              </button>
              <span>{count}</span>
            </div>
            <div className="flex flex-col justify-center items-center gap-4">
              <button
                className="w-[10rem] h-[3rem] bg-orange-300 text-black font-bold rounded-lg"
                onClick={incrementCount}
              >
                Increment Count
              </button>
              {txnHash && (
                <a
                  target="_blank"
                  href={`${chains[chainSelected].explorerUrl + /tx/ + txnHash}`}
                >
                  <span className="text-white font-bold underline">
                    Txn Hash
                  </span>
                </a>
              )}
            </div>
          </div>
          <span className="text-white">Open console to view console logs.</span>
        </>
      )}
    </main>
  );
}
