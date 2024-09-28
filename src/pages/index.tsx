import React, { useState, useEffect } from "react";
import {
  createSmartAccountClient,
  BiconomySmartAccountV2,
  PaymasterMode,
} from "@biconomy/account";
import { ethers } from "ethers";
import { contractABI } from "../contract/contractABI";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccountV2 | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(
    null
  );
  const [count, setCount] = useState<string | null>(null);
  const [txnHash, setTxnHash] = useState<string | null>(null);
  const [chainSelected, setChainSelected] = useState<number>(0);

  const chains = [
    {
      chainId: 11155111,
      name: "Ethereum Sepolia",
      providerUrl: "https://eth-sepolia.public.blastapi.io",
      incrementCountContractAdd: "0xd9ea570eF1378D7B52887cE0342721E164062f5f",
      biconomyPaymasterApiKey: "gJdVIBMSe.f6cc87ea-e351-449d-9736-c04c6fab56a2",
      explorerUrl: "https://sepolia.etherscan.io/tx/",
    },
    {
      chainId: 80002,
      name: "Polygon Amoy",
      providerUrl: "https://rpc-amoy.polygon.technology/",
      incrementCountContractAdd: "0xcf29227477393728935BdBB86770f8F81b698F1A",
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

      const config = {
        biconomyPaymasterApiKey: chains[chainSelected].biconomyPaymasterApiKey,
        bundlerUrl: `https://bundler.biconomy.io/api/v2/${chains[chainSelected].chainId}/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44`, // <-- Read about this at https://docs.biconomy.io/dashboard#bundler-url
      };

      const smartWallet = await createSmartAccountClient({
        signer: signer,
        biconomyPaymasterApiKey: config.biconomyPaymasterApiKey,
        bundlerUrl: config.bundlerUrl,
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
        value: ethers.utils.parseEther("0.5"),
      };

      // const tx1 = {
      //   to: "0xFe858b41C59C99A86a0569CD5e57c29096f619a2",
      //   data: "0x",
      //   value: ethers.utils.parseEther("5")
      // }

      toast.update(toastId, {
        render: "Sending Transaction",
        autoClose: false,
      });

      const userOp = await smartAccount?.buildUserOp(
        //@ts-ignore
        [tx1],
        {
          paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        }
      );

      console.log("UserOp", userOp);

      //@ts-ignore
      const userOpResponse = await smartAccount?.sendTransaction(tx1, {
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
      });
      //@ts-ignore
      const { transactionHash } = await userOpResponse.waitForTxHash();
      console.log("Transaction Hash", transactionHash);
      console.log("UserOp Response", userOpResponse);
      //@ts-ignore
      const userOpReceipt = await userOpResponse.wait();
      console.log("UserOp receipt", userOpReceipt);
      console.log("Success", userOpReceipt.success);
      if (userOpReceipt.success == "true") {
        console.log("UserOp receipt", userOpReceipt);
        console.log("Transaction receipt", userOpReceipt.receipt);
      }

      if (transactionHash) {
        toast.update(toastId, {
          render: "Transaction Successful",
          type: "success",
          autoClose: 5000,
        });
        setTxnHash(transactionHash);
        await getCountId();
      }
    } catch (error) {
      console.log(error);
      toast.error("Transaction Unsuccessful", { autoClose: 5000 });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-8 p-24">
      <div className="text-[4rem] font-bold text-orange-400">
        Biconomy-EOA
      </div>

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
                  href={`${chains[chainSelected].explorerUrl + txnHash}`}
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
