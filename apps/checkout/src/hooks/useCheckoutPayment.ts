import { useState } from "react";
import { getFullnodeUrl, SuiClient, type MoveValue, type SuiParsedData } from "@mysten/sui/client";
import { Transaction, type TransactionObjectInput } from "@mysten/sui/transactions";
import { toast } from "sonner";
import {
  useGetSupportedNetworksAndTokens,
  type SupportedNetwork,
  type Token
} from "./useGetSupportedNetworksAndTokens";
import type { WalletContextState } from "@suiet/wallet-kit";
import type { PaymentData } from "./useGetPaymentInformationQuery";

// Import Cetus SDK classes
import { SDK, SUI_MINT_TYPE } from "@cetusprotocol/cetus-sui-clmm-sdk";

// Cetus CLMM constants
const CETUS_CONSTANTS = {
  mainnet: {
    globalConfig: "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f",
    aggregatorPackage: "0x11451575c775a3e633437b827ecbc1eb51a5964b0302210b28f5b89880be21a2",
    partner: "0x639b5e433da31739e800cd085f356e64cae222966d0f1b11bd9dc76b322ff58b",
    poolsRegistry: "0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0",
  },
  testnet: {
    globalConfig: "0xc6273f844b4bc258952c4e477697aa12c918c8e08106fac6b934811298c9820a",
    aggregatorPackage: "0x11451575c775a3e633437b827ecbc1eb51a5964b0302210b28f5b89880be21a2",
    partner: "0x1f5fa5c820f40d43fc47815ad06d95e40a1942ff72a732a92e8ef4aa8cde70a5",
    poolsRegistry: "0x20a086e6fa0741b3ca77d033a65faf0871349b986ddbdde6fa1d85d78a5f4222",
  },
} as const;

const CLOCK_ADDRESS = "0x6";

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
      const { client, network } = initializeClient();

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
        const cetusEnv = paymentData.mode === "live" ? CETUS_CONSTANTS.mainnet : CETUS_CONSTANTS.testnet;

        // Fetch Cetus pool object ID using the new Cetus SDK function
        const poolId = await getCetusPoolId(client, network, tokenCoinType, usdcCoinType!);
        if (!poolId) {
          throw new Error(`No active Cetus pool found for ${selectedTokenObject.symbol}/USDC`);
        }

        // Use the Cetus aggregator swap_a2b: swaps all of paymentCoin (token → USDC)
        [paymentCoin] = tx.moveCall({
          target: `${cetusEnv.aggregatorPackage}::cetus::swap_a2b`,
          typeArguments: [tokenCoinType, usdcCoinType!],
          arguments: [
            tx.object(cetusEnv.globalConfig),
            tx.object(poolId),
            tx.object(cetusEnv.partner),
            paymentCoin,
            tx.object(CLOCK_ADDRESS),
          ],
        });
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
      return false;
    };
  }

  return { executePayment, checkDepositAddressOnChain, processing, error, setError };
};

/**
 * Looks up a Cetus CLMM pool object ID for a given token pair using the official Cetus SDK.
 */
async function getCetusPoolId(
  client: SuiClient,
  network: "mainnet" | "testnet",
  coinTypeA: string,
  coinTypeB: string,
): Promise<string | null> {
  try {
    // 1. Initialize Cetus SDK instance
    const sdk = new SDK({
      fullNodeUrl: network === "mainnet" ? getFullnodeUrl("mainnet") : getFullnodeUrl("testnet"),
      simulationAccount: "0x0000000000000000000000000000000000000000000000000000000000000001", // Dummy address for read-only config load
    });

    // 2. Fetch the active pools registry configuration from Cetus
    await sdk.Pool.getPools();

    // 3. Request pool address using the internal Cetus SDK method
    // Note: The SDK automatically alphabetizes/sorts coin types to look up the correct address.
    const poolAddress = await sdk.Pool.getPoolAddressByCoins(coinTypeA, coinTypeB);
    
    return poolAddress || null;
  } catch (error) {
    console.error("Failed to fetch Cetus pool via SDK:", error);
    return null;
  }
    }
