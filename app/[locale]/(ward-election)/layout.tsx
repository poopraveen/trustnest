import WardElectionHeader from "@/components/ward-election/WardElectionHeader";
import WardElectionFooter from "@/components/ward-election/WardElectionFooter";

export default function WardElectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WardElectionHeader />
      {children}
      <WardElectionFooter />
    </>
  );
}
