import { useEffect } from "react";
import Workflow from "../../components/customer/Workflow";
import Hero from "../../components/customer/Hero";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import Books from "../../components/Books";
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);


function Home() {
  useEffect(() => {
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1,
      effects: true,
      smoothTouch: 0.1,
    });

    // Clean up the smoother if the user navigates away from this page
    return () => {
      smoother.kill();
    };
  }, []);

  

  return (
    <div id="smooth-wrapper" className="bg-paper dark:bg-gray-950 text-amber-950 dark:text-amber-100 font-sans selection:bg-amber-900 selection:text-white min-h-screen overflow-x-hidden w-full max-w-full">
      <Nav />

      <div id="smooth-content">
        <section id="customer-interface">
            <Hero />
            <Books />
            <Workflow />
          </section>
        <Footer />
      </div>
    </div>
  );
}

export default Home;
