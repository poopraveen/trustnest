import type { Metadata } from "next";
import ProposalClient from "@/components/proposal/ProposalClient";

export const metadata: Metadata = {
  title: "Client Proposal | TrustNest",
  description: "TrustNest — Smart Digital Solutions for Nutrition Clubs & Smart Spaces",
};

export default function ProposalPage() {
  return <ProposalClient />;
}
