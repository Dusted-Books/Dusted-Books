import { useEffect, useState } from "react"; // 1. Import useEffect
import Workflow from "../components/customer/Workflow";
import Hero from "../components/customer/Hero";
import Nav from "../components/Nav";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import Admin from "./AdminLayout/Admin";
import Books from "../components/Books";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

function Home() {
  const [role] = useState("customer");

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
    <div id="smooth-wrapper">
      {role === "customer" && <Nav />}

      <div id="smooth-content">
      {
        role === "admin" ? (
          <section id="admin-interface">
            <Admin />
          </section>
        ) : (
          <section id="customer-interface">
            <Hero />
            <Books />
            <Workflow />
          </section>
        )
        
      }
      </div>
    </div>
  );
}

export default Home;
