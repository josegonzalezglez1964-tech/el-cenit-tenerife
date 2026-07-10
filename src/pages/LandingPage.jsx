import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Tesis from "../components/Tesis";
import Timeline from "../components/Timeline";
import Modelo from "../components/Modelo";
import Tenerife from "../components/Tenerife";
import FinalCta from "../components/FinalCta";
import Footer from "../components/Footer";
import { signInWithGoogle, signOut, getSession, onAuthChange, isSupabaseConfigured } from "../lib/supabaseClient";

export default function LandingPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSession().then(setSession);
    const unsubscribe = onAuthChange(setSession);
    return unsubscribe;
  }, []);

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle("/");
    if (error) {
      console.log("Acceder con Google:", error.message);
      // Mientras Supabase no esté conectado, llevamos igualmente al wizard
      // para que se pueda probar el flujo del testamento digital.
      navigate("/testamento");
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const scrollTo = (hash) => {
    document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="App grain min-h-screen bg-cream text-ink">
      <Navbar onGoogleLogin={handleGoogleLogin} user={session?.user} onSignOut={handleSignOut} />
      <main>
        <Hero
          onStart={() => navigate("/testamento")}
          onReadThesis={() => scrollTo("#tesis")}
        />
        <Tesis />
        <Timeline />
        <Modelo />
        <Tenerife />
        <FinalCta onGoogleLogin={handleGoogleLogin} />
      </main>
      <Footer />
    </div>
  );
}
