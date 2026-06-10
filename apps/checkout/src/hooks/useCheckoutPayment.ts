import { useState } from "react";
import { getFullnodeUrl, SuiClient, type MoveValue, type SuiParsedData } from "@mysten/sui/client";
import { coinWithBalance, Transaction, type TransactionObjectInput } from "@mysten/sui/transactions";
import { toast } from "sonner";
import {
  useGetSupportedNetworksAndTokens,
  type SupportedNetwork,
  type Token
} from "./useGetSupportedNetworksAndTokens";
import type { WalletContextState } from "@suiet/wallet-kit";
import type { PaymentData } from "./useGetPaymentInformationQuery";
import { MetaAg } from "@7kprotocol/sdk-ts";

interface UseCheckoutPaymentProps {
  wallet: WalletContextState;
  paymentData?: PaymentData;
  generatedAddresses: { depositAddress?: string };
  selectedTokenObject?: Token;
  matchedNetwork?: SupportedNetwork;
  txId?: string;
  hasNoRedirect: boolean;
  redirectUrl?: string;
}

export const useCheckoutPayment = ({
  wallet,
  paymentData,
  generatedAddresses,
  selectedTokenObject,
  matchedNetwork,
  txId,
  hasNoRedirect,
  redirectUrl,
}: UseCheckoutPaymentProps) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeClient = () => {
    const network = paymentData?.mode === "live" ? "mainnet" : "testnet";
    return {
      client: new SuiClient({ url: getFullnodeUrl(network) }),
      network
    }
  }
  // Fetch supported networks and tokens data via your react-query hook
  const { data: supportedNetworks } = useGetSupportedNetworksAndTokens();
  const executePayment = async () => {
    if (!wallet.connected || !paymentData || !wallet.address) {
      toast.error("Wallet not connected");
      return;
    }

    const depositAddress = generatedAddresses.depositAddress;
    if (!depositAddress) {
      toast.error("Deposit address not available");
      return;
    }

    setProcessing(true);
    setError(null);

    if (txId) {
      localStorage.setItem(`orafi-tx-session-active-${txId}`, "true");
    }

    try {
      const {
        client
      } = initializeClient();

      const depositObject = await client.getObject({
        id: depositAddress,
        options: {
          showContent: true,
          showType: true
        },
      });

      if (depositObject.data?.content?.dataType !== "moveObject") {
        throw new Error("Invalid deposit object");
      }

      const rawAmount = ((depositObject.data?.content as Extract<SuiParsedData, { dataType: "moveObject" }>)
        ?.fields as { [key: string]: MoveValue })?.amount as string;

      const amount: bigint = BigInt(rawAmount);

      if (amount <= 0n) {
        throw new Error("Invalid payment amount");
      }

      if (!selectedTokenObject) {
        throw new Error("No token selected");
      }

      const tokenCoinType =
        paymentData.mode === "live"
          ? selectedTokenObject.mainnet.coinType
          : selectedTokenObject.testnet.coinType;

      const usdcCoinType = paymentData.mode === "live"
        ? supportedNetworks?.find(n => n.symbol === paymentData.network)?.supportedTokens.find(t => t.symbol.toUpperCase() === "USDC")?.mainnet.coinType
        : supportedNetworks?.find(n => n.symbol === paymentData.network)?.supportedTokens.find(t => t.symbol.toUpperCase() === "USDC")?.testnet.coinType;
      if (!tokenCoinType) {
        throw new Error(`${selectedTokenObject.symbol} is not supported on this network environment.`);
      }

      const coins = await client.getCoins({
        owner: wallet.address,
        coinType: tokenCoinType,
      });

      const allCoins = coins.data || [];
      if (allCoins.length === 0) {
        toast.error(`No ${selectedTokenObject.symbol} balance`);
        return;
      }
      const totalBalance = allCoins.reduce((sum: bigint, c) => sum + BigInt(c.balance), 0n);
      if (totalBalance < amount) {
        toast.error(`Insufficient ${selectedTokenObject.symbol} balance`);
        return;
      }

      const tx = new Transaction();
      let baseCoin: TransactionObjectInput;
      const singleCoin = allCoins.find((c) => BigInt(c.balance) >= amount);

      if (singleCoin) {
        baseCoin = tx.object(singleCoin.coinObjectId);
      } else {
        const [target, ...rest] = allCoins;
        const targetObj = tx.object(target.coinObjectId);
        for (const c of rest) {
          tx.mergeCoins(targetObj, [tx.object(c.coinObjectId)]);
        }
        baseCoin = tx.object(target.coinObjectId);
      }

      let [paymentCoin] = tx.splitCoins(baseCoin, [tx.pure.u64(amount)]);

      const packageId =
        paymentData.mode === "live"
          ? matchedNetwork?.smartContractPackageId.mainnet
          : matchedNetwork?.smartContractPackageId.testnet;

      if (!packageId) {
        throw new Error("Package ID not available for this network");
      }

      const isUsdc = selectedTokenObject.symbol.toUpperCase() === "USDC";
      if (!isUsdc) {
        const metaAg = new MetaAg();
        const quotes = await metaAg.quote({
          amountIn: amount.toString(),
          coinTypeIn: tokenCoinType,
          coinTypeOut: usdcCoinType!,
        });

        const bestQuote = quotes.sort(
          (a, b) => Number(b.simulatedAmountOut || b.amountOut) - Number(a.simulatedAmountOut || a.amountOut),
        )[0];

        paymentCoin = (await metaAg.swap(
          {
            quote: bestQuote!,
            signer: wallet.address,
            coinIn: coinWithBalance({
              balance: amount,
              type: tokenCoinType,
            }),
            tx,
          },
          100,
        )) as {
          $kind: "NestedResult";
          NestedResult: [number, number];
        };
      }

      tx.moveCall({
        target: `${packageId}::main::pay_usdc`,
        arguments: [paymentCoin, tx.object(depositAddress)]
      });

      await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any,
      });

      toast.success("Payment successful");

      if (txId) {
        localStorage.setItem(`orafi-tx-status-${txId}`, "completed");
        localStorage.removeItem(`orafi-tx-session-active-${txId}`);
      }

      if (!hasNoRedirect && redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  const checkDepositAddressOnChain = async (): Promise<boolean> => {
    try {
      const { client } = initializeClient();
      const depositObject = await client.getObject({
        id: generatedAddresses.depositAddress || "",
        options: { showContent: true }
      });
      return !!depositObject.data;
    } catch (error: any) {
      if (
        error.message?.includes("not find") ||
        error.message?.includes("deleted")
      ) {
        return false;
      }

      return false; // Placeholder
    };
  }

  return { executePayment, checkDepositAddressOnChain, processing, error, setError };
};
