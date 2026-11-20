// Sizygia · test «¿Qué universo eres?»
// Siete preguntas; cada respuesta suma puntos a Sol, Tierra o Luna.
// El resultado no guarda ni pide datos personales: la imagen para compartir se dibuja en el navegador.
(function () {
  "use strict";

  var PREGUNTAS = [
    { tema: "Entorno", texto: "¿Qué luz te hace sentir más tú?", opciones: [
      { t: "Luz de mediodía", d: "Directa, intensa, que lo ilumina todo", p: { sol: 3 } },
      { t: "Luz de tarde dorada", d: "Cálida, lenta, que alarga las sombras", p: { tierra: 3 } },
      { t: "Luz de noche fría", d: "La que deja ver las estrellas", p: { luna: 3 } },
      { t: "Luz de vela", d: "Íntima, cambiante, imperfecta", p: { sol: 1, tierra: 2, luna: 1 } }
    ] },
    { tema: "Tiempo", texto: "¿Cómo disfrutas más del tiempo libre?", opciones: [
      { t: "En movimiento", d: "Planes, gente, energía constante", p: { sol: 3 } },
      { t: "En la naturaleza", d: "Sin prisa, con los pies en la tierra", p: { tierra: 3 } },
      { t: "En silencio", d: "Leyendo, pensando, observando", p: { luna: 3 } },
      { t: "Con gente elegida", d: "Conversaciones largas, sin mirar el móvil", p: { sol: 2, tierra: 1, luna: 1 } }
    ] },
    { tema: "Objetos", texto: "¿Qué objeto no soltarías nunca?", opciones: [
      { t: "Uno heredado", d: "Con historia y calor humano", p: { sol: 3 } },
      { t: "Uno encontrado", d: "Una piedra, una rama, algo de la tierra", p: { tierra: 3 } },
      { t: "Uno que nadie más entiende", d: "Con un significado solo tuyo", p: { luna: 3 } },
      { t: "Uno que guarda momentos", d: "Que conserva lo que el tiempo se lleva", p: { sol: 1, tierra: 1, luna: 2 } }
    ] },
    { tema: "Estación", texto: "¿En qué época del año tienes más energía?", opciones: [
      { t: "Verano", d: "Calor, mar, noches largas, sin horarios", p: { sol: 3 } },
      { t: "Otoño", d: "El primer frío, los bosques, la calma", p: { tierra: 3 } },
      { t: "Invierno", d: "Cielos limpios, noches largas, interior", p: { luna: 3 } },
      { t: "Primavera", d: "Cambio, apertura, lo que empieza", p: { sol: 1, tierra: 2, luna: 1 } }
    ] },
    { tema: "Identidad", texto: "¿Qué destaca de ti la gente que mejor te conoce?", opciones: [
      { t: "Tu magnetismo", d: "Cuando llegas a un sitio, se nota", p: { sol: 3 } },
      { t: "Tu solidez", d: "Acuden a ti cuando algo va mal", p: { tierra: 3 } },
      { t: "Tu profundidad", d: "Hay mucho más bajo la superficie", p: { luna: 3 } },
      { t: "Tu mirada", d: "Ves más de lo que dices", p: { sol: 1, tierra: 2, luna: 1 } }
    ] },
    { tema: "Estética", texto: "Cuando compras algo, ¿qué te convence primero?", opciones: [
      { t: "El color y el brillo", d: "Que capte la luz y llame la atención", p: { sol: 3 } },
      { t: "La textura y el peso", d: "Que se note que está hecho para durar", p: { tierra: 3 } },
      { t: "La forma y la delicadeza", d: "Que tenga algo que casi nadie ve", p: { luna: 3 } },
      { t: "La historia que hay detrás", d: "De dónde viene y por qué existe", p: { tierra: 1, luna: 2 } }
    ] },
    { tema: "Ahora", texto: "¿Qué necesitas más en este momento?", opciones: [
      { t: "Energía y movimiento", d: "Salir, crecer, que pasen cosas", p: { sol: 3 } },
      { t: "Estabilidad y raíz", d: "Algo sólido bajo los pies", p: { tierra: 3 } },
      { t: "Silencio y profundidad", d: "Tiempo para entender lo que sientes", p: { luna: 3 } },
      { t: "Conexión real", d: "Alguien que te vea de verdad", p: { sol: 2, tierra: 1, luna: 1 } }
    ] }
  ];

  var UNIVERSOS = {
    sol: {
      nombre: "Sol", frase: "Para quien brilla aunque no lo busque.", color: "#f2e6c6", tinta: "#6b4e16",
      texto: "Llevas la luz dentro aunque no la busques. Te mueves con energía, presencia y calor, y la gente lo nota antes de que hables.",
      piezas: "Piezas doradas de acero 304L con forma de sol, para llevar puesta la luz que ya tienes."
    },
    tierra: {
      nombre: "Tierra", frase: "Para quien lleva el otoño dentro.", color: "#efe6d6", tinta: "#5a4128",
      texto: "Tienes raíz. Eres la persona sólida, la que dura y no sigue modas porque no le hacen falta. Tus objetos cuentan historias reales.",
      piezas: "Acero 304L con piedra natural y formas de la naturaleza, como hojas y piedras: piezas hechas para durar."
    },
    luna: {
      nombre: "Luna", frase: "Para las noches que importan.", color: "#e8e4dd", tinta: "#3d3a36",
      texto: "Hay mucho más en ti de lo que se ve. Te mueves entre el misterio y la delicadeza, y eliges los objetos por lo que significan, no por lo que cuestan.",
      piezas: "Piezas plateadas de acero 304L con formas de luna y de agua, para las noches que importan."
    }
  };

  var raiz = document.querySelector("[data-test]");
  if (!raiz) return;
  var pasos = { intro: raiz.querySelector("[data-paso='intro']"), pregunta: raiz.querySelector("[data-paso='pregunta']"), resultado: raiz.querySelector("[data-paso='resultado']") };
  var respuestas = [];
  var actual = 0;
  var resultado = null;

  function mostrar(paso) {
    Object.keys(pasos).forEach(function (k) { pasos[k].hidden = k !== paso; });
    var foco = pasos[paso].querySelector("[data-foco]");
    if (foco) { foco.setAttribute("tabindex", "-1"); foco.focus({ preventScroll: true }); }
    raiz.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  function pintarPregunta() {
    var q = PREGUNTAS[actual];
    pasos.pregunta.querySelector("[data-progreso]").textContent = "Pregunta " + (actual + 1) + " de " + PREGUNTAS.length;
    pasos.pregunta.querySelector("[data-barra]").style.transform = "scaleX(" + (actual / PREGUNTAS.length) + ")";
    pasos.pregunta.querySelector("[data-tema]").textContent = q.tema;
    pasos.pregunta.querySelector("[data-enunciado]").textContent = q.texto;
    var lista = pasos.pregunta.querySelector("[data-opciones]");
    lista.innerHTML = "";
    q.opciones.forEach(function (o, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "test-opcion";
      b.setAttribute("aria-pressed", respuestas[actual] === i ? "true" : "false");
      b.innerHTML = "<span class=\"t\"></span><span class=\"d\"></span>";
      b.querySelector(".t").textContent = o.t;
      b.querySelector(".d").textContent = o.d;
      b.addEventListener("click", function () { elegir(i, b); });
      lista.appendChild(b);
    });
    pasos.pregunta.querySelector("[data-atras]").hidden = actual === 0;
  }

  function elegir(i, boton) {
    respuestas[actual] = i;
    pasos.pregunta.querySelectorAll(".test-opcion").forEach(function (b) { b.setAttribute("aria-pressed", b === boton ? "true" : "false"); });
    // Pausa corta para que se vea la elección antes de pasar.
    setTimeout(function () {
      if (actual < PREGUNTAS.length - 1) { actual += 1; pintarPregunta(); mostrar("pregunta"); }
      else calcular();
    }, 220);
  }

  function calcular() {
    var s = { sol: 0, tierra: 0, luna: 0 };
    respuestas.forEach(function (r, i) { var p = PREGUNTAS[i].opciones[r].p; Object.keys(p).forEach(function (k) { s[k] += p[k]; }); });
    var total = s.sol + s.tierra + s.luna;
    var pct = { sol: Math.round(s.sol / total * 100), tierra: Math.round(s.tierra / total * 100) };
    pct.luna = 100 - pct.sol - pct.tierra;
    var max = Math.max(s.sol, s.tierra, s.luna);
    var empatados = Object.keys(s).filter(function (k) { return s[k] === max; });
    var dominante = empatados[0];
    if (empatados.length > 1) {
      // En empate decide la última pregunta: es la que habla de ahora.
      var ultima = PREGUNTAS[PREGUNTAS.length - 1].opciones[respuestas[PREGUNTAS.length - 1]].p;
      dominante = empatados.sort(function (a, b) { return (ultima[b] || 0) - (ultima[a] || 0); })[0];
    }
    resultado = { dominante: dominante, pct: pct };
    pintarResultado();
    mostrar("resultado");
  }

  function pintarResultado() {
    var u = UNIVERSOS[resultado.dominante];
    var r = pasos.resultado;
    r.setAttribute("data-u", resultado.dominante);
    r.querySelector("[data-nombre]").textContent = u.nombre;
    r.querySelector("[data-frase]").textContent = u.frase;
    r.querySelector("[data-texto]").textContent = u.texto;
    r.querySelector("[data-piezas-texto]").textContent = u.piezas;
    ["sol", "tierra", "luna"].forEach(function (k) {
      var fila = r.querySelector("[data-reparto='" + k + "']");
      fila.querySelector("output").textContent = resultado.pct[k] + " %";
      fila.querySelector(".lleno").style.transform = "scaleX(" + (resultado.pct[k] / 100) + ")";
    });
    var ver = r.querySelector("[data-ver]");
    ver.href = "/" + resultado.dominante;
    ver.textContent = "Ver el universo " + u.nombre;
    var ul = r.querySelector("[data-piezas]");
    ul.setAttribute("data-universo", resultado.dominante);
    document.dispatchEvent(new CustomEvent("sizygia:pintar"));
    r.querySelector("[data-aviso-compartir]").hidden = true;
  }

  // ——— Imagen para compartir (1080 × 1920, formato historia) ———
  var logo = null;
  function cargarLogo() {
    if (logo) return Promise.resolve(logo);
    return new Promise(function (ok) {
      var img = new Image();
      img.onload = function () { logo = img; ok(img); };
      img.onerror = function () { ok(null); };
      img.src = "/assets/marca/logo-marron.svg";
    });
  }
  function dibujar() {
    var u = UNIVERSOS[resultado.dominante];
    return Promise.all([
      cargarLogo(),
      document.fonts ? Promise.all([document.fonts.load("500 200px 'Cormorant Garamond'"), document.fonts.load("italic 400 60px 'Cormorant Garamond'"), document.fonts.load("400 40px Jost"), document.fonts.load("500 40px Jost")]) : null
    ]).then(function (r) {
      var W = 1080, H = 1920, c = document.createElement("canvas");
      c.width = W; c.height = H;
      var x = c.getContext("2d");
      x.fillStyle = u.color; x.fillRect(0, 0, W, H);
      // marco fino
      x.strokeStyle = "rgba(46,35,24,.35)"; x.lineWidth = 2; x.strokeRect(60, 60, W - 120, H - 120);
      var img = r[0];
      if (img) { var lw = 360, lh = lw * (img.naturalHeight / img.naturalWidth || 0.507); x.drawImage(img, (W - lw) / 2, 170, lw, lh); }
      x.textAlign = "center"; x.fillStyle = "#2e2318";
      x.font = "400 44px Jost, sans-serif"; x.fillText("Mi universo es", W / 2, 640);
      x.font = "500 250px 'Cormorant Garamond', Georgia, serif"; x.fillText(u.nombre, W / 2, 880);
      x.font = "italic 400 62px 'Cormorant Garamond', Georgia, serif"; x.fillStyle = u.tinta; x.fillText(u.frase, W / 2, 990);
      // reparto
      var y = 1180;
      ["sol", "tierra", "luna"].forEach(function (k) {
        x.textAlign = "left"; x.fillStyle = "#2e2318"; x.font = (k === resultado.dominante ? "500" : "400") + " 44px Jost, sans-serif";
        x.fillText(UNIVERSOS[k].nombre, 180, y);
        x.textAlign = "right"; x.fillText(resultado.pct[k] + " %", W - 180, y);
        x.fillStyle = "rgba(46,35,24,.15)"; x.fillRect(180, y + 28, W - 360, 10);
        x.fillStyle = k === resultado.dominante ? "#2e2318" : "rgba(46,35,24,.55)";
        x.fillRect(180, y + 28, (W - 360) * resultado.pct[k] / 100, 10);
        y += 150;
      });
      x.textAlign = "center"; x.fillStyle = "#2e2318";
      x.font = "400 42px Jost, sans-serif"; x.fillText("¿Y tú? Descúbrelo en", W / 2, 1700);
      x.font = "500 46px Jost, sans-serif"; x.fillText("sizygia.es/test", W / 2, 1765);
      return new Promise(function (ok) { c.toBlob(ok, "image/png"); });
    });
  }
  function aviso(texto) { var a = pasos.resultado.querySelector("[data-aviso-compartir]"); a.textContent = texto; a.hidden = false; }
  function descargar(blob) {
    var url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = "mi-universo-sizygia.png"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }
  function ocupado(b, si) { b.disabled = si; b.setAttribute("aria-busy", si ? "true" : "false"); }

  pasos.resultado.querySelector("[data-compartir]").addEventListener("click", function () {
    var b = this; ocupado(b, true);
    dibujar().then(function (blob) {
      ocupado(b, false);
      var archivo = new File([blob], "mi-universo-sizygia.png", { type: "image/png" });
      var u = UNIVERSOS[resultado.dominante];
      if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
        return navigator.share({ files: [archivo], title: "Mi universo Sizygia", text: "Mi universo es " + u.nombre + ". ¿Y el tuyo? https://sizygia.es/test" })
          .catch(function (e) { if (e && e.name !== "AbortError") aviso("No se ha podido compartir. Descarga la imagen y súbela tú."); });
      }
      descargar(blob);
      aviso("Imagen descargada. Súbela a tu historia de Instagram o envíala por WhatsApp.");
    }).catch(function () { ocupado(b, false); aviso("No se ha podido crear la imagen. Inténtalo de nuevo."); });
  });
  pasos.resultado.querySelector("[data-descargar]").addEventListener("click", function () {
    var b = this; ocupado(b, true);
    dibujar().then(function (blob) { ocupado(b, false); descargar(blob); aviso("Imagen descargada."); })
      .catch(function () { ocupado(b, false); aviso("No se ha podido crear la imagen. Inténtalo de nuevo."); });
  });

  pasos.intro.querySelector("[data-empezar]").addEventListener("click", function () { actual = 0; respuestas = []; pintarPregunta(); mostrar("pregunta"); });
  pasos.pregunta.querySelector("[data-atras]").addEventListener("click", function () { if (actual > 0) { actual -= 1; pintarPregunta(); mostrar("pregunta"); } });
  pasos.resultado.querySelector("[data-repetir]").addEventListener("click", function () { actual = 0; respuestas = []; mostrar("intro"); });
  document.addEventListener("keydown", function (e) {
    if (pasos.pregunta.hidden || !/^[1-4]$/.test(e.key) || e.target.closest("input, textarea")) return;
    var b = pasos.pregunta.querySelectorAll(".test-opcion")[+e.key - 1];
    if (b) b.click();
  });
})();
