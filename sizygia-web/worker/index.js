// Sizygia · API de pago. Crea una sesión de Stripe Checkout con la bolsa de la clienta.
// Los precios salen de site/data/catalogo.json (no del navegador). La clave secreta
// llega por el secreto STRIPE_SECRET_KEY, nunca por el código.

const MAX_PIEZAS = 20;
const ENVIO_CENTIMOS = 395;     // 3,95 € con una pieza
const ENVIO_GRATIS_DESDE = 2;   // gratis desde 2 piezas

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

async function catalogo(env, origen) {
  const res = await env.ASSETS.fetch(new URL("/data/catalogo.json", origen));
  const { piezas } = await res.json();
  return piezas;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/checkout") {
      return env.ASSETS.fetch(request);
    }
    if (request.method !== "POST") {
      return json({ error: "Método no permitido" }, 405);
    }
    if (!env.STRIPE_SECRET_KEY) {
      return json({ error: "Pago no configurado" }, 500);
    }

    let entrada;
    try {
      entrada = await request.json();
    } catch {
      return json({ error: "Bolsa no válida" }, 400);
    }
    const lineas = Array.isArray(entrada?.items) ? entrada.items : [];
    if (!lineas.length) return json({ error: "La bolsa está vacía" }, 400);

    const piezas = await catalogo(env, url.origin);
    const total = lineas.reduce((s, l) => s + (Number(l.cantidad) || 0), 0);
    if (total < 1 || total > MAX_PIEZAS) return json({ error: "Cantidad no válida" }, 400);

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("locale", "es");
    params.set("success_url", `${url.origin}/pedido-confirmado`);
    params.set("cancel_url", `${url.origin}/joyas`);
    params.set("shipping_address_collection[allowed_countries][0]", "ES");
    params.set("phone_number_collection[enabled]", "true");
    params.set("billing_address_collection", "auto");

    const validas = lineas.map((l) => ({
      pieza: piezas.find((p) => p.id === l.id),
      variante: l.variante,
      cantidad: Math.floor(Number(l.cantidad)),
    }));
    if (validas.some((v) => !v.pieza || !(v.cantidad >= 1))) {
      return json({ error: "Pieza no válida" }, 400);
    }
    const agotada = validas.find(({ pieza, variante }) => {
      const v = pieza.variantes?.find((x) => x.nombre === variante) || pieza.variantes?.[0];
      return v && typeof v.stock === "number" && v.stock < 1;
    });
    if (agotada) return json({ error: `${agotada.pieza.nombre} está agotada` }, 409);

    validas.forEach(({ pieza, variante: varianteElegida, cantidad }, i) => {
      const variante = varianteElegida && pieza.variantes?.length > 1 ? ` (${varianteElegida})` : "";
      params.set(`line_items[${i}][quantity]`, String(cantidad));
      params.set(`line_items[${i}][price_data][currency]`, "eur");
      params.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round(pieza.precio * 100)));
      params.set(`line_items[${i}][price_data][product_data][name]`, pieza.nombre + variante);
    });

    const gratis = total >= ENVIO_GRATIS_DESDE;
    params.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
    params.set("shipping_options[0][shipping_rate_data][display_name]", gratis ? "Envío gratis" : "Envío estándar");
    params.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", gratis ? "0" : String(ENVIO_CENTIMOS));
    params.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "eur");

    let res, sesion;
    try {
      res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: params,
      });
      sesion = await res.json();
    } catch (e) {
      console.error("Stripe sin respuesta", e);
      return json({ error: "No se pudo iniciar el pago" }, 502);
    }
    if (!res.ok || !sesion.url) {
      console.error("Stripe rechazó la sesión", res.status, sesion?.error?.message);
      return json({ error: "No se pudo iniciar el pago" }, 502);
    }
    return json({ url: sesion.url });
  },
};
