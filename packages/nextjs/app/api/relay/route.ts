import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { automataUsdtAbi, loyaltyBadgeAbi } from "../../../lib/abis";

// Helper function for env var checking
function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export async function POST(req: Request) {
  try {
    const { action, params } = await req.json();

    // --- 1. Initialization ---
    const relayerPk = getEnv("RELAYER_PK");
    const rpcUrl = getEnv("FUJI_RPC_URL");
    const automataUsdtAddress = getEnv("NEXT_PUBLIC_AUTOMATA_USDT_ADDRESS");
    const loyaltyBadgeAddress = getEnv("NEXT_PUBLIC_LOYALTY_BADGE_ADDRESS");

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(relayerPk, provider);

    const automataUsdtContract = new ethers.Contract(automataUsdtAddress, automataUsdtAbi, wallet);
    const loyaltyBadgeContract = new ethers.Contract(loyaltyBadgeAddress, loyaltyBadgeAbi, wallet);

    // --- 2. Action Switch ---
    switch (action) {
      case "sendUsdt": {
        const { to, amount } = params;
        if (!to || !amount) {
          throw new Error("Missing 'to' or 'amount' for sendUsdt");
        }

        const from = wallet.address;
        const { chainId } = await provider.getNetwork();
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour
        const nonce = await automataUsdtContract.nonces(from);
        // Assuming MockUSDT has 6 decimals, like many USDT tokens
        const parsedAmount = ethers.parseUnits(amount.toString(), 6);

        // EIP-712 Domain
        const domain = {
          name: "AutomataUsdt",
          version: "1",
          chainId: chainId,
          verifyingContract: automataUsdtAddress,
        };

        // EIP-712 Types
        const types = {
          Permit: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "deadline", type: "uint256" },
            { name: "nonce", type: "uint256" },
          ],
        };

        // EIP-712 Value (The Permit)
        const permit = { from, to, amount: parsedAmount, deadline, nonce };

        // Sign the EIP-712 typed data
        const signature = await wallet.signTypedData(domain, types, permit);
        const { v, r, s } = ethers.Signature.from(signature);

        // Execute the meta-transaction
        const tx = await automataUsdtContract.sendPaymentMeta(from, to, parsedAmount, deadline, v, r, s);
        const receipt = await tx.wait();

        return NextResponse.json({ success: true, txHash: receipt.hash });
      }

      case "mintBadge": {
        const { to } = params;
        if (!to) {
          throw new Error("Missing 'to' for mintBadge");
        }

        // Generate a "hackathon-grade" unique token ID
        const tokenId = BigInt(Date.now() + Math.floor(Math.random() * 1000));

        // Execute the mint
        const tx = await loyaltyBadgeContract.safeMint(to, tokenId);
        const receipt = await tx.wait();

        return NextResponse.json({ success: true, txHash: receipt.hash });
      }

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Relay API Error:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}