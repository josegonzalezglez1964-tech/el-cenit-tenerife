import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Tesis from "./components/Tesis";
import Timeline from "./components/Timeline";
import Modelo from "./components/Modelo";
import Tenerife from "./components/Tenerife";
import FinalCta from "./components/FinalCta";
import Footer from "./components/Footer";

function App() {
  // TODO: conecta este handler a tu proveedor de auth real
  // (Firebase Auth, Supabase Auth o Auth0) cuando lo integres.
  const handleGoogleLogin = () => {
    console.log("Acceder con Google → conecta aquí tu proveedor de auth");
  };

  const scrollTo = (hash) => {
    document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="App grain min-h-screen bg-cream text-ink">
      <Navbar onGoogleLogin={handleGoogleLogin} />
      <main>
        <Hero
          onStart={handleGoogleLogin}
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

export default App;
