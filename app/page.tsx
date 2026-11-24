import { AnchorNav } from "@/components/landing/anchor-nav";
import { Architecture } from "@/components/landing/architecture";
import { Genesis } from "@/components/landing/genesis";
import { Hero } from "@/components/landing/hero";
import { Instances } from "@/components/landing/instances";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LivingMachine } from "@/components/landing/living-machine";
import { Manifesto } from "@/components/landing/manifesto";
import { Metabolism } from "@/components/landing/metabolism";
import { ObservatoryCTA } from "@/components/landing/observatory-cta";
import { Proof } from "@/components/landing/proof";
import { getSnapshot } from "@/lib/data";

export default async function LandingPage() {
  const snapshot = await getSnapshot();

  return (
    <div className="landing">
      <div className="shell">
        <AnchorNav />
        <div className="space-y-20 py-12 md:space-y-28 md:py-16">
          <Hero snapshot={snapshot} />
          <Genesis />
          <Instances snapshot={snapshot} />
          <Architecture />
          <Metabolism snapshot={snapshot} />
          <LivingMachine />
          <Proof snapshot={snapshot} />
          <Manifesto />
          <ObservatoryCTA snapshot={snapshot} />
          <LandingFooter snapshot={snapshot} />
        </div>
      </div>
    </div>
  );
}
