"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

interface DemoModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModeModal = ({ isOpen, onClose }: DemoModeModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-2xl">🚀 Demo Mode Architecture</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Current Demo Setup */}
        <div className="mb-6">
          <div className="badge badge-success badge-lg mb-3">Current: Hackathon Demo</div>
          <div className="bg-success/10 border border-success/30 rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-2">✅ Relayer-Sponsored Transactions</h4>
            <p className="text-sm mb-3">
              For the best demo experience, our relayer acts as a "USDT bank" that sponsors all transactions.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-success">1️⃣</span>
                <span>Relayer holds pool of USDT tokens</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-success">2️⃣</span>
                <span>Users trigger workflows with simple Transfer events</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-success">3️⃣</span>
                <span>AI makes decisions instantly</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-success">4️⃣</span>
                <span>Relayer automatically distributes rewards from its pool</span>
              </div>
            </div>
            <div className="alert alert-info mt-4">
              <span className="text-xs">
                <strong>Perfect for:</strong> Airdrops, loyalty rewards, promotional campaigns, hackathon demos
              </span>
            </div>
          </div>
        </div>

        {/* Production Architecture */}
        <div className="mb-6">
          <div className="badge badge-primary badge-lg mb-3">Production: Gasless Meta-Transactions</div>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-2">🔐 True Gasless Transfers</h4>
            <p className="text-sm mb-3">
              In production, users maintain full custody of their tokens while enjoying gasless transactions.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-primary">1️⃣</span>
                <span>Users hold their own USDT in their wallets</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">2️⃣</span>
                <span>Users approve AutomataUsdt contract once (one-time gas cost)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">3️⃣</span>
                <span>Users sign EIP-712 permits off-chain (no gas, instant)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">4️⃣</span>
                <span>Relayer submits transactions (pays gas, not tokens)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">5️⃣</span>
                <span>USDT transfers from user's wallet to recipient</span>
              </div>
            </div>
            <div className="alert mt-4">
              <span className="text-xs">
                <strong>Perfect for:</strong> P2P payments, DeFi protocols, user-to-user transfers, production dApps
              </span>
            </div>
          </div>
        </div>

        {/* Key Differences */}
        <div className="overflow-x-auto mb-6">
          <table className="table table-sm">
            <thead>
              <tr>
                <th></th>
                <th className="text-success">Demo Mode</th>
                <th className="text-primary">Production</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold">Who holds USDT?</td>
                <td>Relayer</td>
                <td>User</td>
              </tr>
              <tr>
                <td className="font-semibold">User setup</td>
                <td>✅ None required</td>
                <td>Approve contract once</td>
              </tr>
              <tr>
                <td className="font-semibold">Gas paid by</td>
                <td>Relayer</td>
                <td>Relayer</td>
              </tr>
              <tr>
                <td className="font-semibold">Tokens paid by</td>
                <td>Relayer pool</td>
                <td>User's wallet</td>
              </tr>
              <tr>
                <td className="font-semibold">Scalability</td>
                <td>Limited by pool</td>
                <td>Unlimited</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tech Stack Info */}
        <div className="bg-base-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">🛠️ Technical Implementation</h4>
          <div className="space-y-1 text-sm">
            <p>• <strong>Smart Contract:</strong> AutomataUsdt (EIP-712 meta-transactions)</p>
            <p>• <strong>AI Decision Engine:</strong> Google Gemini 2.5 Flash</p>
            <p>• <strong>Event Monitoring:</strong> 5-second polling with ethers.js v6</p>
            <p>• <strong>Network:</strong> Avalanche C-Chain (local/Fuji/Mainnet)</p>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-primary" onClick={onClose}>
            Got it! 🚀
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
};

