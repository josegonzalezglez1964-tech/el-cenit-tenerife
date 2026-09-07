import { useState } from "react";

function ComunicarFallecimiento() {
  const [codigoReferencia, setCodigoReferencia] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    // A1 todavía no envía datos al servidor.
    // La API se incorporará en la siguiente capa.
    console.log("Comunicación A1 preparada:", codigoReferencia);
  }

  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-16">
        <div className="w-full">
          <div className="mb-10 max-w-2xl">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-clay">
              El Cénit · Protocolo de legado
            </p>

            <h1 className="font-display text-5xl leading-tight md:text-6xl">
              Comunicar un posible fallecimiento
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 opacity-75 md:text-lg">
              Si necesitas comunicar a El Cénit el posible fallecimiento de
              una persona titular de un legado digital, puedes iniciar aquí el
              proceso de comunicación.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-[1.4fr_0.8fr]">
            <form
              onSubmit={handleSubmit}
              className="border border-line bg-white/40 p-6 md:p-8"
            >
              <div>
                <label
                  htmlFor="codigo-referencia"
                  className="block text-sm font-medium"
                >
                  Código de referencia de legado
                </label>

                <p className="mt-2 text-sm leading-6 opacity-65">
                  Si la persona titular te proporcionó un código de referencia,
                  introdúcelo aquí. Si no dispones de él, podrás continuar con
                  el proceso de comunicación.
                </p>

                <input
                  id="codigo-referencia"
                  name="codigoReferencia"
                  type="text"
                  value={codigoReferencia}
                  onChange={(event) =>
                    setCodigoReferencia(event.target.value.toUpperCase())
                  }
                  placeholder="CENIT-7K4P-92XM"
                  autoComplete="off"
                  className="mt-5 w-full border border-line bg-cream px-4 py-3 font-mono text-sm outline-none transition focus:border-clay"
                />
              </div>

              <button
                type="submit"
                className="mt-6 inline-flex items-center justify-center bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:opacity-85"
              >
                Continuar
              </button>
            </form>

            <aside className="border border-line p-6 md:p-8">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-clay">
                Importante
              </p>

              <div className="mt-5 space-y-4 text-sm leading-6 opacity-75">
                <p>
                  Comunicar un posible fallecimiento no significa que El Cénit
                  haya confirmado el fallecimiento.
                </p>

                <p>
                  Esta comunicación no proporciona acceso al testamento, a la
                  Bóveda ni a ningún contenido privado.
                </p>

                <p>
                  La comunicación será revisada dentro del protocolo
                  correspondiente.
                </p>
              </div>
            </aside>
          </div>

          <div className="mt-10 border-t border-line pt-6">
            <p className="max-w-2xl text-xs leading-5 opacity-55">
              El Cénit no determina derechos sucesorios mediante esta
              comunicación. La comunicación inicia un proceso de verificación
              independiente.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ComunicarFallecimiento;