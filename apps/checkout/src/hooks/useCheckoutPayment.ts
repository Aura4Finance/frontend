import { useState } from "react";
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction, type TransactionObjectInput } from "@mysten/sui/transactions";
import { toast } from "sonner";
import {
  useGetSupportedNetworksAndTokens,
  type SupportedNetwork,
  type Token
} from "./useGetSupportedNetworksAndTokens";
import type { WalletContextState } from "@suiet/wallet-kit";
import type { PaymentData } from "./useGetPaymentInformationQuery";
import { CetusClmmSDK, type Pool } from "@cetusprotocol/sui-clmm-sdk";
import { bcs } from "@mysten/sui/bcs";
import { normalizeStructTag } from "@mysten/sui/utils";

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

const sqrtPriceLimitA2B = 2000000n;

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
      client: new SuiGrpcClient({
        network,
        baseUrl: network === "mainnet" ? 'https://fullnode.mainnet.sui.io:443' : 'https://fullnode.testnet.sui.io:443',
      }),
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

      const { object } = await client.core.getObject({
        objectId: depositAddress,
        include: {
          content: true,
        }
      });

      const expectedWalletType = `${network === "mainnet" ? matchedNetwork?.smartContractPackageId.mainnet : matchedNetwork?.smartContractPackageId.testnet}::main::Wallet<${network === "mainnet" ? selectedTokenObject?.mainnet.coinType : selectedTokenObject?.testnet.coinType}>`;
      if (normalizeStructTag(object.type) !== normalizeStructTag(expectedWalletType)) {
        throw new Error("Invalid deposit object for selected token and network");
      }

      const WalletBcs = bcs.struct('Wallet', {
        id: bcs.Address,
        merchant: bcs.Address,
        amount: bcs.u64(),
        transaction_id: bcs.string(),
      });

      const WalletObject = WalletBcs.parse(object.content);
      if (!WalletObject) {
        throw new Error("Payment amount not found in deposit object");
      }

      const amount: bigint = BigInt(WalletObject.amount);

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

      let allCoins: any[] = [];
      let cursor: string | null = null;
      let hasNextPage = true;

      while (hasNextPage) {
        const response = await client.core.listCoins({
          owner: wallet.address,
          coinType: tokenCoinType,
          cursor: cursor,
        });

        allCoins.push(...(response.objects || []));
        cursor = response.cursor ?? null;
        hasNextPage = response.hasNextPage;
      }

      if (allCoins.length === 0) {
        toast.error(`No ${selectedTokenObject.symbol} balance`);
        return;
      }

      // 3. Calculate total balance across all fetched coin objects
      // Note: getCoins returns 'balance' on each coin object as a string
      const totalBalance = allCoins.reduce((sum: bigint, c) => sum + BigInt(c.balance), 0n);

      if (totalBalance < amount) {
        toast.error(`Insufficient ${selectedTokenObject.symbol} balance`);
        return;
      }

      // 4. Set up the transaction builder
      const tx = new Transaction();
      let baseCoin: TransactionObjectInput;

      // Find a single coin object that is large enough by itself
      const singleCoin = allCoins.find((c) => BigInt(c.balance) >= amount);

      if (singleCoin) {
        baseCoin = tx.object(singleCoin.coinObjectId);
      } else {
        // If no single coin is big enough, merge them together
        const [target, ...rest] = allCoins;
        const targetObj = tx.object(target.coinObjectId);

        // Create an array of object references for the coins to merge
        const coinsToMerge = rest.map(c => tx.object(c.coinObjectId));

        // Merge all subsequent coins into the first target coin
        tx.mergeCoins(targetObj, coinsToMerge);
        baseCoin = targetObj;
      }

      // 5. Split out the exact amount needed for your transaction
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
        const poolId = await getCetusPoolId(network as "mainnet" | "testnet", tokenCoinType, usdcCoinType!);

        if (!poolId) {
          throw new Error(`No active Cetus pool found for ${selectedTokenObject.symbol}/USDC`);
        }

        [paymentCoin] = tx.moveCall({
          target: `${packageId}::main::pay_swap`,
          typeArguments: [tokenCoinType],
          arguments: [
            tx.object(cetusEnv.globalConfig),
            tx.object(poolId),
            paymentCoin,
            tx.object(depositAddress),
            tx.pure.u128(sqrtPriceLimitA2B),
            tx.object(CLOCK_ADDRESS),
          ],
        });

      } else {

        tx.moveCall({
          target: `${packageId}::main::pay_usdc`,
          arguments: [paymentCoin, tx.object(depositAddress)]
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
      const depositObject = await client.core.getObject({
        objectId: generatedAddresses.depositAddress || "",
      });
      return !!depositObject.object;
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
  network: "mainnet" | "testnet",
  coinTypeA: string,
  coinTypeB: string,
): Promise<string | null> {
  try {
    const sdk = CetusClmmSDK.createSDK({ env: network });
    // 2. Fetch the active pools registry configuration from Cetus
    const pools = await sdk.Pool.getPoolByCoins([coinTypeA, coinTypeB]);

    if (!pools || pools.length === 0) {
      return null;
    }

    const pool = pools.sort((a: Pool, b: Pool) => Number(b.liquidity) - Number(a.liquidity))[0];

    return pool.id || null;
  } catch (error) {
    console.error("Failed to fetch Cetus pool via SDK:", error);
    return null;
  }
}
