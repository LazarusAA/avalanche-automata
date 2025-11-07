"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { BoltIcon, CpuChipIcon, BanknotesIcon, PhotoIcon } from "@heroicons/react/24/outline";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <div className="hero min-h-[600px] bg-gradient-to-br from-base-100 to-base-200">
          <div className="hero-content text-center">
            <div className="max-w-3xl">
              <h1 className="text-6xl font-bold mb-6">
                Zapier for Web3
              </h1>
              <p className="text-xl mb-8 text-base-content/80 leading-relaxed">
                Build powerful blockchain automation workflows without code. 
                Connect on-chain events, AI decision-making, token transfers, 
                and NFT minting in a visual interface.
              </p>
              <Link href="/automata" className="btn btn-primary btn-lg px-8">
                Launch App
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 px-8 bg-base-100">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              Build Workflows with Powerful Nodes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* On-Chain Event Card */}
              <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="card-body items-center text-center">
                  <BoltIcon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="card-title text-lg">On-Chain Event</h3>
                  <p className="text-sm text-base-content/70">
                    Trigger workflows from smart contract events on Avalanche
                  </p>
                </div>
              </div>

              {/* AI Decision Card */}
              <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="card-body items-center text-center">
                  <CpuChipIcon className="h-12 w-12 text-secondary mb-4" />
                  <h3 className="card-title text-lg">AI Decision</h3>
                  <p className="text-sm text-base-content/70">
                    Make intelligent decisions using AI-powered logic nodes
                  </p>
                </div>
              </div>

              {/* Send USDT Card */}
              <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="card-body items-center text-center">
                  <BanknotesIcon className="h-12 w-12 text-accent mb-4" />
                  <h3 className="card-title text-lg">Send USDT</h3>
                  <p className="text-sm text-base-content/70">
                    Transfer stablecoins seamlessly as part of your workflow
                  </p>
                </div>
              </div>

              {/* Mint NFT Card */}
              <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="card-body items-center text-center">
                  <PhotoIcon className="h-12 w-12 text-success mb-4" />
                  <h3 className="card-title text-lg">Mint NFT</h3>
                  <p className="text-sm text-base-content/70">
                    Create and mint NFTs automatically based on workflow conditions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-base-200">
          <div className="max-w-4xl mx-auto text-center px-8">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Automate Your Web3 Workflows?
            </h2>
            <p className="text-lg text-base-content/70 mb-8">
              Connect your wallet and start building automation workflows in minutes.
            </p>
            <Link href="/automata" className="btn btn-primary btn-lg px-8">
              Get Started Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
