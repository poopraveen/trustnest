import WardElectionHeader from "@/components/ward-election/WardElectionHeader";
import WardElectionFooter from "@/components/ward-election/WardElectionFooter";
import WardElectionChatFab from "@/components/ward-election/WardElectionChatFab";

export default function WardElectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WardElectionHeader />
      {children}
      <WardElectionFooter />
      <WardElectionChatFab />
    </>
  );
}
