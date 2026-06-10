import { useState } from "react";
import { getFullnodeUrl, SuiClient, type MoveValue, type SuiParsedData } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { toast } from "sonner";
import {
  useGetSupportedNetworksAndTokens,
  type SupportedNetwork,
  type Token
} from "./useGetSupportedNetworksAndTokens";
import type { WalletContextState } from "@suiet/wallet-kit";
import type { PaymentData } from "./useGetPaymentInformationQuery";
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
    const network: "mainnet" | "testnet" | "devnet" | "localnet" = paymentData?.mode === "live" ? "mainnet" : "testnet";
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
        client,
        network
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
      let baseCoinId: string;
      const singleCoin = allCoins.find((c) => BigInt(c.balance) >= amount);

      if (singleCoin) {
        baseCoinId = singleCoin.coinObjectId;
      } else {
        const [target, ...rest] = allCoins;
        const targetObj = tx.object(target.coinObjectId);
        for (const c of rest) {
          tx.mergeCoins(targetObj, [tx.object(c.coinObjectId)]);
        }
        baseCoinId = target.coinObjectId;
      }

      const [paymentCoin] = tx.splitCoins(tx.object(baseCoinId), [tx.pure.u64(amount)]);

      const packageId =
        paymentData.mode === "live"
          ? matchedNetwork?.smartContractPackageId.mainnet
          : matchedNetwork?.smartContractPackageId.testnet;

      if (!packageId) {
        throw new Error("Package ID not available for this network");
      }

      const isUsdc = selectedTokenObject.symbol.toUpperCase() === "USDC";

      if (isUsdc) {
        tx.moveCall({
          target: `${packageId}::main::pay_usdc`,
          arguments: [paymentCoin, tx.object(depositAddress)],
          typeArguments: [tokenCoinType],
        });
      } else {
        if (!supportedNetworks) {
          throw new Error("Network configuration metadata is loading. Please try again.");
        }

        // Find the specific network matching our current package configuration context
        const currentNetworkContext = supportedNetworks.find(
          (net) =>
            net.smartContractPackageId.mainnet === matchedNetwork?.smartContractPackageId.mainnet ||
            net.smartContractPackageId.testnet === matchedNetwork?.smartContractPackageId.testnet
        );

        // Find the native USDC token item within that network configuration
        const usdcTokenItem = currentNetworkContext?.supportedTokens.find(
          (token) => token.symbol.toUpperCase() === "USDC"
        );

        if (!usdcTokenItem) {
          throw new Error("USDC configurations not found within the matching supported network payload.");
        }

        const usdcCoinType = paymentData.mode === "live"
          ? usdcTokenItem.mainnet.coinType
          : usdcTokenItem.testnet.coinType;

          const DEEPBOOK_PACKAGE_ID = '0x2c8d603bc51326b8c13cef9dd07031a408a48dddb541963357661df5d3204809';
          const DEEPBOOK_REGISTRY_ID = '0xaf16199a2dff736e9f07a845f23c5da6df6f756eddb631aed9d24a93efc4549d';
          const poolObjectId = tx.moveCall({
            target: `${DEEPBOOK_PACKAGE_ID}::pool::get_pool_id_by_asset`,
            typeArguments: [tokenCoinType, usdcCoinType],
            arguments: [tx.object(DEEPBOOK_REGISTRY_ID)]
            });

        const deepTokenItem = currentNetworkContext?.supportedTokens.find(
          (token) => token.symbol.toUpperCase() === "DEEP"
        );

        if (!deepTokenItem) {
          throw new Error("DEEP configurations not found within the matching supported network payload.");
        }

        const deepCoinType = paymentData.mode === "live"
          ? deepTokenItem.mainnet.coinType
          : deepTokenItem.testnet.coinType;

        if (!deepCoinType) {
          throw new Error(`DEEP token contract address configuration is disabled or null for ${network}.`);
        }

        const [deepFeeCoin] = tx.moveCall({
          target: "0x2::coin::zero",
          typeArguments: [deepCoinType],
        });

        // Execution of swap contract pipeline context
        tx.moveCall({
          target: `${packageId}::main::pay_swap`,
          arguments: [
            paymentCoin,
            tx.object(depositAddress),
            poolObjectId,
            deepFeeCoin,
            tx.object("0x6"), // Shared System Clock Object
          ],
          typeArguments: [tokenCoinType],
        });
      }

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
