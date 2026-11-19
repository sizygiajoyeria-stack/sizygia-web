// Sizygia · tienda: catálogo, bolsa, menú, ficha y carruseles
(function () {
  "use strict";

  var WHATSAPP = "34638292643";
  var ENVIO = 3.95;
  var GRATIS_DESDE = 2; // piezas
  var CLAVE = "sizygia-bolsa";
  var NOMBRES = { sol: "Sol", tierra: "Tierra", luna: "Luna" };
  var FRASES = { sol: "Para quien brilla aunque no lo busque.", tierra: "Para quien lleva el otoño dentro.", luna: "Para las noches que importan." };
  var TIPOS = { Colgante: "colgantes", Pulsera: "pulseras", Pendientes: "pendientes", Anillo: "anillos" };
  var I = {
    bolsa: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
    mas: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8M12 11.5v5M9.5 14h5"/></svg>',
    ok: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    wa: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.7Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.6-2-1-1 .8c-.9-.4-1.8-1.3-2.2-2.2l.8-1-1-2Z"/></svg>'
  };

  var piezas = [];
  function porId(id) { return piezas.filter(function (p) { return p.id === id; })[0]; }
  function euros(n) { return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" }); }
  function foto(src, w) { return /cdn\.shopify\.com/.test(src) && src.indexOf("?") < 0 ? src + "?width=" + w : src; }
  function stock(p) { return p.variantes.reduce(function (s, v) { return s + (v.stock || 0); }, 0); }
  function el(tag, a, hijos) {
    var e = document.createElement(tag);
    if (a) Object.keys(a).forEach(function (k) {
      if (k === "texto") e.textContent = a[k]; else if (k === "html") e.innerHTML = a[k]; else e.setAttribute(k, a[k]);
    });
    (hijos || []).forEach(function (h) { if (h) e.appendChild(h); });
    return e;
  }
  function fotoVariante(p, nombre) { var v = p.variantes.filter(function (x) { return x.nombre === nombre; })[0]; return p.imagenes[(v && v.foto) || 0] || p.imagenes[0]; }
  function material(p) { return "Acero 304L" + (p.acabado ? " · " + p.acabado.toLowerCase() : ""); }

  // ——— Bolsa (guardada en este navegador) ———
  var bolsa = [];
  function leer() { try { bolsa = JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { bolsa = []; } }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(bolsa)); } catch (e) { /* sin almacenamiento: la bolsa dura lo que la página */ } }
  function numPiezas() { return bolsa.reduce(function (s, l) { return s + l.cantidad; }, 0); }
  function subtotal() { return bolsa.reduce(function (s, l) { var p = porId(l.id); return s + (p ? p.precio * l.cantidad : 0); }, 0); }
  function envio() { return numPiezas() >= GRATIS_DESDE || numPiezas() === 0 ? 0 : ENVIO; }

  function anadir(id, variante) {
    var p = porId(id);
    if (!p) return;
    var v = variante || (p.variantes.filter(function (x) { return x.stock; })[0] || {}).nombre;
    var l = bolsa.filter(function (x) { return x.id === id && x.variante === v; })[0];
    if (l) l.cantidad += 1; else bolsa.push({ id: id, variante: v, cantidad: 1 });
    guardar(); pintarBolsa();
    var c = document.querySelector(".contador");
    if (c) { c.classList.remove("salto"); void c.offsetWidth; c.classList.add("salto"); setTimeout(function () { c.classList.remove("salto"); }, 300); }
    avisar(p.nombre + " está en tu bolsa");
  }

  function avisar(texto) {
    var a = document.querySelector(".aviso-flotante");
    if (!a) return;
    a.textContent = texto; a.classList.add("visible");
    clearTimeout(avisar.t); avisar.t = setTimeout(function () { a.classList.remove("visible"); }, 2400);
  }

  function pintarProgreso() {
    var n = numPiezas();
    var txt = n === 0 ? "Envío gratis desde 2 piezas" : n < GRATIS_DESDE ? "Añade 1 pieza más y el envío es gratis" : "Tu envío es gratis";
    document.querySelectorAll("[data-progreso-texto]").forEach(function (t) { t.textContent = txt; });
    document.querySelectorAll("[data-progreso-lleno]").forEach(function (b) { b.style.width = Math.min(100, (n / GRATIS_DESDE) * 100) + "%"; });
    document.querySelectorAll(".contador").forEach(function (c) { c.textContent = n; c.setAttribute("data-n", n); });
    document.querySelectorAll("[data-etiqueta-bolsa]").forEach(function (b) { b.setAttribute("aria-label", "Bolsa, " + n + (n === 1 ? " pieza" : " piezas")); });
  }

  function pintarBolsa() {
    pintarProgreso();
    var cuerpo = document.querySelector("[data-bolsa-cuerpo]");
    var pie = document.querySelector("[data-bolsa-pie]");
    if (!cuerpo) return;
    cuerpo.innerHTML = "";
    bolsa = bolsa.filter(function (l) { return porId(l.id); });
    if (!bolsa.length) {
      cuerpo.appendChild(el("div", { "class": "bolsa-vacia" }, [
        el("p", { texto: "Tu bolsa está vacía." }),
        el("a", { "class": "boton boton--contorno", href: "/joyas", texto: "Ver las joyas" })
      ]));
      pie.hidden = true;
      return;
    }
    pie.hidden = false;
    bolsa.forEach(function (l, i) {
      var p = porId(l.id);
      var cant = el("div", { "class": "cantidad" }, [
        el("button", { type: "button", "aria-label": "Quitar una", texto: "−" }),
        el("output", { "aria-live": "polite", texto: String(l.cantidad) }),
        el("button", { type: "button", "aria-label": "Añadir una", texto: "+" })
      ]);
      var bs = cant.querySelectorAll("button");
      bs[0].addEventListener("click", function () { l.cantidad -= 1; if (l.cantidad < 1) bolsa.splice(i, 1); guardar(); pintarBolsa(); });
      bs[1].addEventListener("click", function () { l.cantidad += 1; guardar(); pintarBolsa(); });
      var quitar = el("button", { type: "button", "class": "quitar", texto: "Quitar" });
      quitar.addEventListener("click", function () { bolsa.splice(i, 1); guardar(); pintarBolsa(); });
      cuerpo.appendChild(el("div", { "class": "linea" }, [
        el("img", { src: foto(fotoVariante(p, l.variante), 200), alt: "", width: "72", height: "90" }),
        el("div", {}, [
          el("a", { "class": "n", href: "/pieza?p=" + p.id, texto: p.nombre }),
          p.variantes.length > 1 ? el("div", { "class": "v", texto: l.variante }) : null,
          cant, quitar
        ]),
        el("div", { "class": "p", texto: euros(p.precio * l.cantidad) })
      ]));
    });
    var e = envio();
    var tot = pie.querySelector(".totales");
    tot.innerHTML = "";
    [["Subtotal", euros(subtotal())], ["Envío", e ? euros(e) : "Gratis"], ["Total", euros(subtotal() + e)]].forEach(function (f, j) {
      tot.appendChild(el("span", { "class": j === 2 ? "total" : "", texto: f[0] }));
      tot.appendChild(el("span", { "class": j === 2 ? "total" : "", texto: f[1] }));
    });
    var lineas = bolsa.map(function (l) { var p = porId(l.id); return "· " + l.cantidad + " × " + p.nombre + (p.variantes.length > 1 ? " (" + l.variante + ")" : "") + " · " + euros(p.precio * l.cantidad); });
    var msg = "Hola, tengo una pregunta sobre estas piezas:\n" + lineas.join("\n");
    pie.querySelector("[data-pedir]").href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
  }

  // ——— Pago con Stripe ———
  // El servidor recalcula precios y envío con el catálogo; aquí solo mandamos qué piezas y cuántas.
  function pagar(lineas, boton, aviso, respaldo) {
    if (boton.disabled) return;
    var texto = boton.innerHTML;
    boton.disabled = true;
    boton.setAttribute("aria-busy", "true");
    boton.textContent = "Preparando el pago…";
    if (aviso) aviso.hidden = true;
    function fallo(m) {
      boton.disabled = false;
      boton.removeAttribute("aria-busy");
      boton.innerHTML = texto;
      if (respaldo) { location.href = respaldo; return; }
      if (aviso) { aviso.textContent = m; aviso.hidden = false; }
    }
    fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: lineas.map(function (l) { return { id: l.id, variante: l.variante, cantidad: l.cantidad }; }) })
    }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (r) {
        if (r.ok && r.d.url) { location.href = r.d.url; return; }
        var m = r.d && r.d.error && r.d.error !== "No se pudo iniciar el pago" ? r.d.error + ". Quítala de la bolsa o escríbenos por WhatsApp." : "No hemos podido abrir el pago. Inténtalo de nuevo en un momento o escríbenos por WhatsApp.";
        fallo(m);
      })
      .catch(function () { fallo("Sin conexión con el pago. Revisa tu conexión e inténtalo de nuevo."); });
  }
  function prepararPagoBolsa() {
    var b = document.querySelector("[data-pagar]");
    if (!b) return;
    b.addEventListener("click", function () {
      if (!bolsa.length) return;
      // Con una sola pieza, si el servidor falla, usamos su enlace de pago directo.
      var respaldo = null;
      if (bolsa.length === 1 && bolsa[0].cantidad === 1) {
        var p = porId(bolsa[0].id), v = p && p.variantes.filter(function (x) { return x.nombre === bolsa[0].variante; })[0];
        respaldo = (v && v.stripe) || (p && p.stripe) || null;
      }
      pagar(bolsa, b, document.querySelector("[data-aviso-pago]"), respaldo);
    });
  }
  // Volver con el navegador desde Stripe no debe dejar el botón bloqueado.
  window.addEventListener("pageshow", function () {
    document.querySelectorAll("[data-pagar], [data-comprar]").forEach(function (b) {
      if (b.getAttribute("aria-busy")) { b.disabled = false; b.removeAttribute("aria-busy"); b.innerHTML = b.getAttribute("data-texto") || b.innerHTML; }
    });
  });

  // ——— Paneles laterales ———
  var abierto = null, origen = null;
  function abrir(id, desde) {
    var p = document.getElementById(id);
    if (!p) return;
    cerrar(true);
    abierto = p; origen = desde || document.activeElement;
    p.classList.add("abierto"); p.removeAttribute("inert");
    document.querySelector(".velo").classList.add("abierto");
    document.body.classList.add("bloqueado");
    document.querySelectorAll('[aria-controls="' + id + '"]').forEach(function (b) { b.setAttribute("aria-expanded", "true"); });
    setTimeout(function () { var f = p.querySelector("button, a"); if (f) f.focus(); }, 60);
  }
  function cerrar(silencioso) {
    if (!abierto) return;
    var id = abierto.id;
    abierto.classList.remove("abierto"); abierto.setAttribute("inert", "");
    document.querySelector(".velo").classList.remove("abierto");
    document.body.classList.remove("bloqueado");
    document.querySelectorAll('[aria-controls="' + id + '"]').forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    abierto = null;
    if (!silencioso && origen) origen.focus();
  }
  function paneles() {
    document.querySelectorAll("[data-abre]").forEach(function (b) { b.addEventListener("click", function () { abrir(b.getAttribute("data-abre"), b); }); });
    document.querySelectorAll("[data-cierra]").forEach(function (b) { b.addEventListener("click", function () { cerrar(); }); });
    var velo = document.querySelector(".velo");
    if (velo) velo.addEventListener("click", function () { cerrar(); });
    document.addEventListener("keydown", function (e) {
      if (!abierto) return;
      if (e.key === "Escape") cerrar();
      if (e.key === "Tab") {
        var f = abierto.querySelectorAll("a[href], button:not([disabled]), input");
        if (!f.length) return;
        var primero = f[0], ultimo = f[f.length - 1];
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
      }
    });
  }

  // ——— Tarjeta de producto ———
  function tarjeta(p) {
    var agotada = stock(p) === 0;
    var url = "/pieza?p=" + encodeURIComponent(p.id);
    var tira = el("div", { "class": "tira" });
    p.imagenes.forEach(function (src, i) {
      tira.appendChild(el("a", { href: url, tabindex: i ? "-1" : "0", "aria-label": i ? null : p.nombre }, [el("img", { src: foto(src, 700), alt: i ? "" : p.alt, loading: "lazy", width: "560", height: "700" })]));
    });
    tira.querySelectorAll("a").forEach(function (a) { if (!a.getAttribute("aria-label")) a.removeAttribute("aria-label"); });
    var segunda = p.imagenes[1] ? el("img", { "class": "segunda", src: foto(p.imagenes[1], 700), alt: "", loading: "lazy", width: "560", height: "700" }) : null;
    var puntos = null;
    if (p.imagenes.length > 1) {
      puntos = el("div", { "class": "puntos", "aria-hidden": "true" });
      p.imagenes.forEach(function (_, i) { puntos.appendChild(el("i", { "class": i ? "" : "activo" })); });
      tira.addEventListener("scroll", function () {
        var i = Math.round(tira.scrollLeft / tira.clientWidth);
        puntos.querySelectorAll("i").forEach(function (d, j) { d.className = i === j ? "activo" : ""; });
      }, { passive: true });
    }
    var boton = null;
    if (!agotada) {
      if (p.variantes.length > 1) {
        boton = el("a", { "class": "anadir", href: url, "aria-label": "Elegir acabado de " + p.nombre, html: I.mas });
      } else {
        boton = el("button", { "class": "anadir", type: "button", "aria-label": "Añadir " + p.nombre + " a la bolsa", html: I.mas });
        boton.addEventListener("click", function () {
          anadir(p.id);
          boton.classList.add("ok"); boton.innerHTML = I.ok;
          setTimeout(function () { boton.classList.remove("ok"); boton.innerHTML = I.mas; }, 1500);
        });
      }
    }
    return el("li", { "class": "tarjeta" + (agotada ? " agotada" : "") }, [
      el("div", { "class": "fotos" }, [
        el("span", { "class": "etiqueta", texto: agotada ? "Agotada" : NOMBRES[p.universo] }),
        tira, segunda, puntos, boton
      ]),
      el("div", { "class": "info" }, [
        el("a", { "class": "nombre", href: url, texto: p.nombre }),
        el("p", { "class": "material", texto: material(p) }),
        el("p", { "class": "precio", texto: euros(p.precio) })
      ])
    ]);
  }

  function pintarListas() {
    var q = new URLSearchParams(location.search);
    document.querySelectorAll("[data-piezas]").forEach(function (ul) {
      var uni = ul.getAttribute("data-universo") || "";
      var tipo = ul.hasAttribute("data-tipo-url") ? (q.get("tipo") || "") : (ul.getAttribute("data-tipo") || "");
      var limite = parseInt(ul.getAttribute("data-limite") || "0", 10);
      var excluir = ul.getAttribute("data-excluir");
      var lista = piezas.filter(function (p) {
        return (!uni || p.universo === uni) && (!tipo || TIPOS[p.tipo] === tipo) && p.id !== excluir;
      });
      lista.sort(function (a, b) { return (stock(b) ? 1 : 0) - (stock(a) ? 1 : 0) || (b.destacada ? 1 : 0) - (a.destacada ? 1 : 0); });
      if (limite) lista = lista.slice(0, limite);
      ul.innerHTML = "";
      lista.forEach(function (p) { ul.appendChild(tarjeta(p)); });
      var r = document.querySelector('[data-recuento="' + (ul.id || "") + '"]');
      if (r) r.textContent = lista.length === 1 ? "1 pieza" : lista.length + " piezas";
      if (!lista.length) ul.replaceWith(el("div", { "class": "vacio" }, [el("p", { texto: "No hay piezas de este tipo todavía." }), el("a", { "class": "boton boton--contorno", href: "/joyas", texto: "Ver todas las joyas" })]));
    });
    // chips de tipo activos
    var t = q.get("tipo") || "";
    document.querySelectorAll("[data-chip]").forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("data-chip") === t ? "true" : "false"); });
    var tit = document.querySelector("[data-titulo-tipo]");
    if (tit && t) { var nom = { pendientes: "Pendientes", colgantes: "Colgantes", pulseras: "Pulseras", anillos: "Anillos" }[t]; if (nom) { tit.textContent = nom; document.title = nom + " · Sizygia"; } }
  }

  // ——— Ficha ———
  function fila(dt, dd) { if (!dd) return null; var f = document.createDocumentFragment(); f.appendChild(el("dt", { texto: dt })); f.appendChild(el("dd", { texto: dd })); return f; }
  function ficha() {
    var cont = document.getElementById("ficha");
    if (!cont) return;
    var p = porId(new URLSearchParams(location.search).get("p"));
    if (!p) {
      cont.innerHTML = "";
      cont.appendChild(el("div", { "class": "vacio" }, [el("h1", { texto: "No encontramos esta pieza" }), el("p", { texto: "Puede que ya no esté en el catálogo." }), el("a", { "class": "boton", href: "/joyas", texto: "Ver todas las joyas" })]));
      return;
    }
    document.body.setAttribute("data-universo", p.universo);
    document.title = p.nombre + " · Sizygia";
    var m = document.querySelector('meta[name="description"]');
    if (m) m.setAttribute("content", p.nombre + ". " + p.tipo + " de acero 304L hipoalergénico, universo " + NOMBRES[p.universo] + ". " + euros(p.precio) + ". Envío gratis desde 2 piezas.");
    var miga = document.querySelector("[data-miga-pieza]");
    if (miga) { miga.textContent = p.nombre; var mu = document.querySelector("[data-miga-universo]"); if (mu) { mu.textContent = NOMBRES[p.universo]; mu.href = "/" + p.universo; } }

    var gal = el("div", { "class": "galeria" });
    p.imagenes.forEach(function (src, i) { gal.appendChild(el("figure", {}, [el("img", { src: foto(src, 1400), alt: i ? p.alt + ", foto " + (i + 1) : p.alt, width: "900", height: "1125", loading: i ? "lazy" : "eager" })])); });
    var puntos = el("div", { "class": "puntos", "aria-hidden": "true" });
    p.imagenes.forEach(function (_, i) { puntos.appendChild(el("i", { "class": i ? "" : "activo" })); });
    gal.addEventListener("scroll", function () { var i = Math.round(gal.scrollLeft / gal.clientWidth); puntos.querySelectorAll("i").forEach(function (d, j) { d.className = i === j ? "activo" : ""; }); }, { passive: true });

    var agotada = stock(p) === 0;
    var elegida = (p.variantes.filter(function (v) { return v.stock; })[0] || {}).nombre;
    var variantes = null, leyenda = null;
    if (p.variantes.length > 1) {
      leyenda = el("legend", { html: "Acabado: <b>" + (elegida || "") + "</b>" });
      variantes = el("fieldset", { "class": "variantes" }, [leyenda]);
      p.variantes.forEach(function (v) {
        var r = el("input", { type: "radio", name: "variante", value: v.nombre });
        if (!v.stock) r.disabled = true;
        if (v.nombre === elegida) r.checked = true;
        r.addEventListener("change", function () { elegida = v.nombre; leyenda.innerHTML = "Acabado: <b>" + v.nombre + "</b>"; actualizarWa(); mostrarVariante(v); });
        variantes.appendChild(el("label", {}, [r, el("span", { texto: v.nombre + (v.stock ? "" : " · agotado") })]));
      });
    }
    function mostrarVariante(v) {
      if (v.foto === undefined) return;
      var principal = gal.querySelector("figure img");
      if (principal) { principal.src = foto(p.imagenes[v.foto], 1400); principal.alt = p.alt + ", acabado " + v.nombre.toLowerCase(); }
      gal.scrollTo({ left: 0, behavior: "smooth" });
    }
    var anadirBtn = el("button", { "class": "boton boton--ancho", type: "button", html: agotada ? "Agotada" : I.bolsa + "<span>Añadir a la bolsa · " + euros(p.precio) + "</span>" });
    if (agotada) anadirBtn.disabled = true;
    anadirBtn.addEventListener("click", function () { anadir(p.id, elegida); abrir("panel-bolsa", anadirBtn); });
    var wa = el("a", { "class": "boton boton--contorno boton--ancho", target: "_blank", rel: "noopener" });
    function actualizarWa() {
      var t = agotada ? "Hola, ¿me avisáis cuando vuelva " + p.nombre + "?" : "Hola, tengo una pregunta sobre " + p.nombre + (p.variantes.length > 1 ? " (" + elegida + ")" : "") + ".";
      wa.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(t);
      wa.innerHTML = I.wa + "<span>" + (agotada ? "Avísame cuando vuelva" : "Pregúntanos por WhatsApp") + "</span>";
    }
    actualizarWa();
    function enlacePago() { var v = p.variantes.filter(function (x) { return x.nombre === elegida; })[0]; return (v && v.stripe) || p.stripe || ""; }
    var avisoFicha = el("p", { "class": "aviso-pago", role: "alert", hidden: "" });
    var comprar = agotada ? null : el("button", { "class": "boton boton--contorno boton--ancho", type: "button", "data-comprar": "", "data-texto": "Comprar ahora con tarjeta", texto: "Comprar ahora con tarjeta" });
    if (comprar) comprar.addEventListener("click", function () { pagar([{ id: p.id, variante: elegida, cantidad: 1 }], comprar, avisoFicha, enlacePago() || null); });

    var dl = el("dl");
    [fila("Material", "Acero inoxidable 304L"), fila("Acabado", p.acabado), fila("Medidas", p.medidas), fila("Cierre", p.cierre), fila("Universo", NOMBRES[p.universo])].forEach(function (f) { if (f) dl.appendChild(f); });

    var garantias = document.getElementById("plantilla-garantias");
    var compra = el("div", { "class": "compra" }, [
      el("a", { "class": "etiqueta-u", href: "/" + p.universo, texto: "Universo " + NOMBRES[p.universo] }),
      el("h1", { texto: p.nombre }),
      el("p", { "class": "lema", texto: FRASES[p.universo] }),
      el("p", { "class": "precio", texto: euros(p.precio) }),
      el("p", { "class": "material", texto: p.tipo + " · " + material(p) }),
      p.descripcion ? el("p", { "class": "desc", texto: p.descripcion }) : null,
      variantes,
      el("div", { "class": "acciones" }, [anadirBtn, comprar, avisoFicha, wa]),
      el("p", { "class": "aviso-envio", "data-progreso-texto": "" }),
      garantias ? garantias.content.cloneNode(true) : null,
      el("details", { "class": "desplegable", open: "" }, [el("summary", { texto: "Características" }), el("div", { "class": "cont" }, [dl])]),
      el("details", { "class": "desplegable" }, [el("summary", { texto: "Por qué cuesta lo que cuesta" }), el("div", { "class": "cont" }, [el("p", { texto: "Es de acero 304L: no se oxida, no destiñe y es apto para pieles sensibles. Por eso cuesta algo más que la bisutería de aleación y bastante menos que la plata. No la fabricamos: la seleccionamos entre muchas porque encaja con su universo y con el material que exigimos." })])]),
      el("details", { "class": "desplegable" }, [el("summary", { texto: "Envíos y devoluciones" }), el("div", { "class": "cont" }, [el("p", { html: "Envío a toda España por 3,95 €, gratis desde 2 piezas. La preparamos en 1 o 2 días y llega en 3 a 5 días laborables más. Tienes 30 días para devolverla. <a href=\"/como-comprar\">Todos los detalles</a>." })])]),
      el("details", { "class": "desplegable" }, [el("summary", { texto: "Cómo cuidarla" }), el("div", { "class": "cont" }, [el("p", { html: "Agua tibia con jabón neutro y sécala enseguida. Evita el cloro, el agua salada y el perfume directo. <a href=\"/material-y-cuidado\">Guía completa</a>." })])])
    ]);
    cont.innerHTML = "";
    cont.appendChild(el("div", { "class": "galeria-envoltorio" }, [gal, p.imagenes.length > 1 ? puntos : null]));
    cont.appendChild(compra);

    // Barra fija en móvil cuando el botón principal sale de pantalla
    var barra = document.querySelector(".barra-movil");
    if (barra && !agotada) {
      barra.querySelector("[data-barra-precio]").textContent = euros(p.precio);
      barra.querySelector("button").addEventListener("click", function () { anadir(p.id, elegida); abrir("panel-bolsa"); });
      if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { barra.classList.toggle("visible", !en[0].isIntersecting && en[0].boundingClientRect.top < 0); }).observe(anadirBtn);
    }
    var rel = document.querySelector("[data-relacionadas]");
    if (rel) { rel.setAttribute("data-universo", p.universo); rel.setAttribute("data-excluir", p.id); var t = document.getElementById("t-relacionadas"); if (t) t.textContent = "Más de " + NOMBRES[p.universo]; }
  }

  // ——— Carruseles y anuncios ———
  function carruseles() {
    document.querySelectorAll("[data-carril]").forEach(function (b) {
      var lista = b.querySelector(".carril");
      b.querySelectorAll("[data-mover]").forEach(function (x) {
        x.addEventListener("click", function () { lista.scrollBy({ left: lista.clientWidth * .9 * parseInt(x.getAttribute("data-mover"), 10), behavior: "smooth" }); });
      });
    });
  }
  function anuncios() {
    var cont = document.querySelector(".anuncios");
    if (!cont) return;
    var ps = cont.querySelectorAll("p"), i = 0, pausa = false;
    if (ps.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cont.addEventListener("mouseenter", function () { pausa = true; });
    cont.addEventListener("mouseleave", function () { pausa = false; });
    setInterval(function () {
      if (pausa || document.hidden) return;
      ps[i].setAttribute("aria-hidden", "true"); i = (i + 1) % ps.length; ps[i].setAttribute("aria-hidden", "false");
    }, 5000);
  }

  leer();
  // Página de pedido confirmado: el pago ya está hecho, vaciamos la bolsa.
  if (document.querySelector("[data-vaciar-bolsa]")) { bolsa = []; guardar(); }
  paneles();
  carruseles();
  anuncios();
  pintarProgreso();
  prepararPagoBolsa();
  // El test pide repintar sus piezas cuando ya sabe el universo.
  document.addEventListener("sizygia:pintar", function () { if (piezas.length) pintarListas(); });
  fetch("/data/catalogo.json")
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) { piezas = d.piezas; ficha(); pintarListas(); pintarBolsa(); })
    .catch(function () {
      document.querySelectorAll("[data-piezas], #ficha").forEach(function (n) { n.innerHTML = ""; n.appendChild(el("p", { "class": "vacio", texto: "No se ha podido cargar el catálogo. Recarga la página o escríbenos por WhatsApp." })); });
    });
})();
