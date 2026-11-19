#!/usr/bin/env python3
"""Genera las páginas HTML de sizygia.es (v3, estructura de tienda).
Uso: python3 generar.py  -> escribe en ./site"""
import json
from pathlib import Path

SITE = Path(__file__).parent / "site"
TEST = "https://sizygiatestt.netlify.app/"
WA = "https://wa.me/34638292643"
IG = "https://instagram.com/sizygia_"
MAIL = "sizygia.joyeria@gmail.com"

# Fotos de ambiente. Antes del 6/12/2026 hay que cambiarlas por /img/... (ver README)
FOTOS = {
    "portada": "/img/portada.jpg",
    "sol": "/img/sol.jpg",
    "tierra": "/img/tierra.jpg",
    "luna": "/img/luna.jpg",
}
INSTAGRAM = ["/img/instagram-%d.jpg" % i for i in range(1, 7)]

CATALOGO = json.loads((SITE / "data" / "catalogo.json").read_text(encoding="utf-8"))["piezas"]
TIPOS = [("pendientes", "Pendientes", "Pendientes"), ("colgantes", "Colgantes", "Colgante"),
         ("pulseras", "Pulseras", "Pulsera"), ("anillos", "Anillos", "Anillo")]


def foto_tipo(tipo):
    for p in CATALOGO:
        if p["tipo"] == tipo:
            return p["imagenes"][0]
    return FOTOS["portada"]


MARCA_SVG = ('<svg viewBox="0 0 48 24" aria-hidden="true"><line x1="1" y1="12" x2="47" y2="12" stroke="#b8965a" stroke-width="1"/>'
             '<circle cx="11" cy="12" r="9" fill="#b8965a"/><circle cx="29" cy="12" r="5" fill="#fff" stroke="#08060e" stroke-width="1.2"/>'
             '<circle cx="41" cy="12" r="3" fill="#08060e"/></svg>')


def ico(path, extra=""):
    return f'<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"{extra}>{path}</svg>'


I_MENU = ico('<path d="M4 7h16M4 12h16M4 17h10"/>')
I_BOLSA = ico('<path d="M5 8h14l-1 12H6Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>')
I_CERRAR = ico('<path d="M6 6l12 12M18 6 6 18"/>')
I_IZQ = ico('<path d="M15 5l-7 7 7 7"/>')
I_DER = ico('<path d="M9 5l7 7-7 7"/>')
I_SOL = ico('<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>')
I_TIERRA = ico('<circle cx="12" cy="12" r="8.5"/><path d="M5 9.5c2.5-1.6 5-1.6 7.2 0s4.6 1.6 6.8 0M4.2 14c2.6 1.4 5.2 1.4 7.6 0s4.8-1.4 8 0"/>')
I_LUNA = ico('<path d="M19.5 14.6A8 8 0 1 1 9.4 4.5a6.4 6.4 0 0 0 10.1 10.1Z"/>')
I_ICONO_U = {"sol": I_SOL, "tierra": I_TIERRA, "luna": I_LUNA}
GARANTIAS = [
    (ico('<path d="M12 3c3 3.5 6 6.6 6 10a6 6 0 0 1-12 0c0-3.4 3-6.5 6-10Z"/>'), "Hipoalergénica", "Acero 304L: no se oxida ni destiñe"),
    (ico('<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17.5" cy="17.5" r="1.6"/>'), "Envío 3,95 €", "Gratis desde 2 piezas"),
    (ico('<path d="M4 9h11a5 5 0 0 1 0 10H8"/><path d="M8 5 4 9l4 4"/>'), "30 días", "Para devolverla sin explicaciones"),
    (ico('<path d="M12 3.5 5 6v5.5c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9V6Z"/><path d="M9 12l2 2 4-4"/>'), "Pago seguro", "Con tarjeta (Stripe) o en mano"),
]


def garantias_html():
    return "".join(f"<li>{i}<div><strong>{t}</strong><span>{s}</span></div></li>" for i, t, s in GARANTIAS)


UNIVERSOS = {
    "sol": {"nombre": "Sol", "lema": "Para quien brilla aunque no lo busque.", "claves": "Calidez, presencia, acento.",
            "retrato": "Alegre, segura y natural. Rompe el hielo sin proponérselo y hace que la gente se sienta vista.",
            "desc": "Universo Sol: joyas doradas de acero 304L para quien brilla aunque no lo busque.",
            "alt": "Colgante Sol irregular entre sombras de hojas"},
    "tierra": {"nombre": "Tierra", "lema": "Para quien lleva el otoño dentro.", "claves": "Cuerpo, raíz, tiempo lento.",
               "retrato": "Transmite hogar. Escucha antes de hablar y da confianza sin explicarse.",
               "desc": "Universo Tierra: joyas de acero 304L con piedra natural y formas de la naturaleza.",
               "alt": "Colgantes con piedra natural colgados de una rama seca"},
    "luna": {"nombre": "Luna", "lema": "Para las noches que importan.", "claves": "Misterio, intimidad, sofisticación.",
             "retrato": "Observadora e independiente. Se fía de su instinto y dice lo que nadie se atreve a decir.",
             "desc": "Universo Luna: joyas plateadas de acero 304L para las noches que importan.",
             "alt": "Pulsera Escamas de luna y pendientes Gotas de luna sobre seda negra"},
}


def pagina(ruta, titulo, descripcion, cuerpo, universo="", actual="", imagen_og="https://sizygia.es/img/portada.jpg", extra=""):
    def a(h, t):
        return f'<a href="{h}"{" aria-current=\"page\"" if h == actual else ""}>{t}</a>'
    nav = (a("/joyas", "Todas las joyas") + a("/sol", "Sol") + a("/tierra", "Tierra") + a("/luna", "Luna")
           + '<span class="sep" aria-hidden="true"></span>'
           + "".join(a(f"/joyas?tipo={s}", n) for s, n, _ in TIPOS)
           + '<span class="sep" aria-hidden="true"></span>' + a("/como-comprar", "Cómo comprar"))
    uni = f' data-universo="{universo}"' if universo else ""
    html = f"""<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{titulo}</title>
  <meta name="description" content="{descripcion}">
  <meta property="og:title" content="{titulo}">
  <meta property="og:description" content="{descripcion}">
  <meta property="og:image" content="{imagen_og}">
  <meta property="og:type" content="website">
  <meta name="theme-color" content="#ffffff">
  <link rel="preload" href="/assets/fonts/jost-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/cormorant-garamond-latin-500-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/estilos.css">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <script src="/assets/js/tienda.js" defer></script>
</head>
<body{uni}>
  <a class="saltar" href="#contenido">Ir al contenido</a>
  <div class="anuncios" role="region" aria-label="Anuncios">
    <p aria-hidden="false">Envío gratis desde 2 piezas</p>
    <p aria-hidden="true">30 días para devolver, sin explicaciones</p>
  </div>
  <header class="cabecera">
    <div class="envoltorio">
      <div class="fila">
        <div class="izq">
          <button class="icono-btn solo-movil" type="button" data-abre="panel-menu" aria-controls="panel-menu" aria-expanded="false" aria-label="Menú">{I_MENU}</button>
          <a class="enlace-test" href="{TEST}">¿Qué universo eres?</a>
        </div>
        <a class="logo" href="/" aria-label="Sizygia, inicio">{MARCA_SVG}<span>Sizygia</span></a>
        <div class="der">
          <button class="icono-btn" type="button" data-abre="panel-bolsa" aria-controls="panel-bolsa" aria-expanded="false" data-etiqueta-bolsa aria-label="Bolsa">{I_BOLSA}<span class="contador" data-n="0" aria-hidden="true">0</span></button>
        </div>
      </div>
      <nav class="nav-escritorio" aria-label="Principal">{nav}</nav>
    </div>
  </header>
  <div class="progreso" role="status">
    <div class="envoltorio"><span data-progreso-texto>Envío gratis desde 2 piezas</span><span class="pista" aria-hidden="true"><span class="lleno" data-progreso-lleno></span></span></div>
  </div>
  <main id="contenido">
{cuerpo}
  </main>
  <footer class="pie">
    <div class="envoltorio">
      <div class="columnas">
        <p class="firma">Joyas seleccionadas una a una, para decir quién eres.</p>
        <div><h2>Comprar</h2><ul>
          <li><a href="/joyas">Todas las joyas</a></li>
          <li><a href="/sol">Sol</a> · <a href="/tierra">Tierra</a> · <a href="/luna">Luna</a></li>
          <li><a href="{TEST}">¿Qué universo eres?</a></li>
        </ul></div>
        <div><h2>Ayuda</h2><ul>
          <li><a href="/como-comprar">Cómo comprar</a></li>
          <li><a href="/como-comprar#envios">Envíos</a></li>
          <li><a href="/como-comprar#devoluciones">Devoluciones</a></li>
          <li><a href="/material-y-cuidado">Material y cuidado</a></li>
          <li><a href="/sobre">Sobre Sizygia</a></li>
        </ul></div>
        <div><h2>Hablemos</h2><ul>
          <li><a href="{WA}">WhatsApp</a></li>
          <li><a href="{IG}">Instagram @sizygia_</a></li>
          <li><a href="mailto:{MAIL}">{MAIL}</a></li>
        </ul></div>
      </div>
      <p class="legal">© 2026 Sizygia · Acero inoxidable 304L hipoalergénico · <a href="/legal">Aviso legal, privacidad y condiciones</a></p>
    </div>
  </footer>
  <div class="velo" aria-hidden="true"></div>
  <aside class="panel-lateral izquierda" id="panel-menu" role="dialog" aria-modal="true" aria-label="Menú" inert>
    <div class="cab-panel"><h2>Menú</h2><button class="icono-btn" type="button" data-cierra aria-label="Cerrar menú">{I_CERRAR}</button></div>
    <div class="cuerpo">
      <p class="menu-titulo">Universos</p>
      <ul class="menu-lista">
        <li><a href="/sol">{I_SOL}Sol</a></li><li><a href="/tierra">{I_TIERRA}Tierra</a></li><li><a href="/luna">{I_LUNA}Luna</a></li>
      </ul>
      <p class="menu-titulo">Joyas</p>
      <ul class="menu-lista">
        <li><a href="/joyas">Todas las joyas</a></li>
        {"".join(f'<li><a href="/joyas?tipo={s}">{n}</a></li>' for s, n, _ in TIPOS)}
      </ul>
      <p class="menu-titulo">Más</p>
      <ul class="menu-lista">
        <li><a href="{TEST}">¿Qué universo eres?</a></li><li><a href="/como-comprar">Cómo comprar</a></li><li><a href="/sobre">Sobre Sizygia</a></li>
      </ul>
    </div>
  </aside>
  <aside class="panel-lateral derecha" id="panel-bolsa" role="dialog" aria-modal="true" aria-label="Tu bolsa" inert>
    <div class="cab-panel"><h2>Tu bolsa</h2><button class="icono-btn" type="button" data-cierra aria-label="Cerrar bolsa">{I_CERRAR}</button></div>
    <div class="cuerpo" data-bolsa-cuerpo></div>
    <div class="pie-panel" data-bolsa-pie hidden>
      <p class="nota-bolsa" data-progreso-texto></p>
      <div class="totales"></div>
      <a class="boton boton--ancho" data-pedir href="{WA}" target="_blank" rel="noopener">Pedir por WhatsApp</a>
      <p class="nota-bolsa">Te confirmamos la disponibilidad y te mandamos el enlace de pago. Respondemos en menos de 24 horas.</p>
    </div>
  </aside>
  <div class="aviso-flotante" role="status" aria-live="polite"></div>
{extra}
</body>
</html>
"""
    destino = SITE / ruta
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(html, encoding="utf-8")


def portada():
    tiles = "".join(f'<li><a href="/{k}"><div class="foto"><img src="{FOTOS[k]}" alt="{u["alt"]}" loading="lazy" width="400" height="500"></div><span>{u["nombre"]}</span></a></li>' for k, u in UNIVERSOS.items())
    tiles += "".join(f'<li><a href="/joyas?tipo={s}"><div class="foto"><img src="{foto_tipo(t)}" alt="" loading="lazy" width="400" height="500"></div><span>{n}</span></a></li>' for s, n, t in TIPOS)
    trip = "".join(f'<a href="/{k}"><img src="{FOTOS[k]}" alt="{u["alt"]}" loading="lazy" width="900" height="1260"><span class="texto-t"><span class="nombre-u">{u["nombre"]}</span><span class="lema-u">{u["lema"]}</span></span></a>' for k, u in UNIVERSOS.items())
    mosaico = "".join(f'<a href="{IG}" aria-label="Ver en Instagram"><img src="{src}" alt="" loading="lazy" width="300" height="300"></a>' for src in INSTAGRAM)
    cuerpo = f"""    <section class="hero" aria-labelledby="t-hero">
      <img src="{FOTOS['portada']}" alt="Tres personas charlando sentadas al sol en unas escaleras" width="2200" height="1467" fetchpriority="high">
      <div class="envoltorio">
        <h1 id="t-hero">Elige qué dice de ti.</h1>
        <p>Joyas de acero hipoalergénico, seleccionadas una a una y ordenadas en tres universos.</p>
        <div class="botones"><a class="boton boton--claro" href="/joyas">Ver las joyas</a><a class="boton boton--sobre-foto" href="{TEST}">¿Qué universo eres?</a></div>
      </div>
    </section>

    <section class="bloque" aria-labelledby="t-cat">
      <div class="envoltorio">
        <div class="cab-bloque"><h2 id="t-cat">Busca por universo o por pieza</h2></div>
        <ul class="categorias">{tiles}</ul>
      </div>
    </section>

    <section class="bloque bloque--surface" data-carril aria-labelledby="t-fav">
      <div class="envoltorio">
        <div class="cab-bloque">
          <div><h2 id="t-fav">Las que más se llevan</h2><p>Pásalas el dedo: cada una tiene más fotos.</p></div>
          <div class="flechas"><button type="button" data-mover="-1" aria-label="Anteriores">{I_IZQ}</button><button type="button" data-mover="1" aria-label="Siguientes">{I_DER}</button></div>
        </div>
        <ul class="carril" data-piezas></ul>
        <p class="pie-bloque"><a class="boton boton--contorno" href="/joyas">Ver todas las joyas</a></p>
      </div>
    </section>

    <section class="bloque" aria-labelledby="t-uni">
      <div class="envoltorio">
        <div class="cab-bloque"><div><h2 id="t-uni">Tres universos. ¿Cuál es el tuyo?</h2><p>No son colecciones de temporada: son tres formas de ser.</p></div></div>
        <div class="triptico">{trip}</div>
      </div>
    </section>

    <section class="bloque bloque--surface" aria-label="Garantías">
      <div class="envoltorio"><ul class="garantias">{garantias_html()}</ul></div>
    </section>

    <section class="bloque" aria-labelledby="t-ig">
      <div class="envoltorio">
        <div class="cab-bloque"><div><h2 id="t-ig">Llevadas de verdad</h2><p>Así quedan puestas. Más en <a class="enlace" href="{IG}">@sizygia_</a>.</p></div></div>
        <div class="mosaico">{mosaico}</div>
      </div>
    </section>

    <section class="banda-test" aria-labelledby="t-test">
      <div class="envoltorio">
        <svg viewBox="0 0 120 60" aria-hidden="true"><line x1="0" y1="30" x2="120" y2="30" stroke="#b8965a"/><circle cx="34" cy="30" r="22" fill="#b8965a"/><circle cx="72" cy="30" r="12" fill="#fff" stroke="#08060e" stroke-width="1.5"/><circle cx="102" cy="30" r="7" fill="#08060e"/></svg>
        <div><h2 id="t-test">¿Sol, Tierra o Luna?</h2><p>Cinco preguntas y dos minutos para saber qué universo eres y qué piezas van contigo.</p></div>
        <a class="boton" href="{TEST}">Haz el test</a>
      </div>
    </section>"""
    pagina("index.html", "Sizygia · Joyas de acero hipoalergénico por universo: Sol, Tierra y Luna",
           "Tienda de joyas de acero 304L hipoalergénico, seleccionadas una a una en tres universos: Sol, Tierra y Luna. Envío gratis desde 2 piezas.",
           cuerpo)


def chips(base, actual_tipo_url=True):
    out = f'<ul class="chips"><li><a href="{base}" data-chip="">Todas</a></li>'
    out += "".join(f'<li><a href="{base}?tipo={s}" data-chip="{s}">{n}</a></li>' for s, n, _ in TIPOS)
    return out + "</ul>"


def joyas():
    cuerpo = f"""    <div class="envoltorio">
      <nav class="migas" aria-label="Estás en"><a href="/">Inicio</a> / Joyas</nav>
      <div class="cab-categoria"><h1 data-titulo-tipo>Todas las joyas</h1><p class="lema">Acero 304L hipoalergénico. Elige por pieza o por universo.</p></div>
      {chips("/joyas")}
      <p class="recuento" data-recuento="lista"></p>
      <ul class="rejilla" id="lista" data-piezas data-tipo-url></ul>
    </div>
    <section class="bloque" aria-labelledby="t-uni2">
      <div class="envoltorio">
        <div class="cab-bloque"><h2 id="t-uni2">O elige por universo</h2></div>
        <div class="triptico">{"".join(f'<a href="/{k}"><img src="{FOTOS[k]}" alt="{u["alt"]}" loading="lazy" width="900" height="1260"><span class="texto-t"><span class="nombre-u">{u["nombre"]}</span><span class="lema-u">{u["lema"]}</span></span></a>' for k, u in UNIVERSOS.items())}</div>
      </div>
    </section>"""
    pagina("joyas.html", "Todas las joyas · Sizygia", "Pendientes, colgantes, pulseras y anillos de acero 304L hipoalergénico. Envío gratis desde 2 piezas.", cuerpo, actual="/joyas")


def universo(k):
    u = UNIVERSOS[k]
    otros = "".join(f'<a href="/{o}"><img src="{FOTOS[o]}" alt="{UNIVERSOS[o]["alt"]}" loading="lazy" width="900" height="1260"><span class="texto-t"><span class="nombre-u">{UNIVERSOS[o]["nombre"]}</span><span class="lema-u">{UNIVERSOS[o]["lema"]}</span></span></a>' for o in UNIVERSOS if o != k)
    cuerpo = f"""    <section class="cab-universo">
      <div class="envoltorio">
        <div class="texto-u">
          <nav class="migas" aria-label="Estás en"><a href="/">Inicio</a> / <a href="/joyas">Joyas</a> / {u['nombre']}</nav>
          <h1>{u['nombre']}</h1>
          <p class="lema">{u['lema']} {u['claves']}</p>
          <p class="retrato">{u['retrato']}</p>
        </div>
        <div class="foto-u"><img src="{FOTOS[k]}" alt="{u['alt']}" width="900" height="1125" fetchpriority="high"></div>
      </div>
    </section>
    <div class="envoltorio listado">
      {chips("/" + k)}
      <p class="recuento" data-recuento="lista"></p>
      <ul class="rejilla" id="lista" data-piezas data-universo="{k}" data-tipo-url></ul>
    </div>
    <section class="bloque" aria-labelledby="t-otros">
      <div class="envoltorio">
        <div class="cab-bloque"><div><h2 id="t-otros">¿No eres {u['nombre']}?</h2><p>Mira los otros universos o <a class="enlace" href="{TEST}">haz el test</a>.</p></div></div>
        <div class="triptico triptico--dos">{otros}</div>
      </div>
    </section>"""
    pagina(f"{k}.html", f"Universo {u['nombre']} · Sizygia", u["desc"], cuerpo, universo=k, actual=f"/{k}", imagen_og="https://sizygia.es" + FOTOS[k])


def pieza():
    cuerpo = f"""    <div class="envoltorio">
      <nav class="migas" aria-label="Estás en"><a href="/">Inicio</a> / <a href="/joyas" data-miga-universo>Joyas</a> / <span data-miga-pieza>Pieza</span></nav>
      <div class="ficha" id="ficha"><p>Cargando la pieza…</p></div>
    </div>
    <section class="bloque bloque--surface" data-carril aria-labelledby="t-relacionadas">
      <div class="envoltorio">
        <div class="cab-bloque"><h2 id="t-relacionadas">Del mismo universo</h2>
          <div class="flechas"><button type="button" data-mover="-1" aria-label="Anteriores">{I_IZQ}</button><button type="button" data-mover="1" aria-label="Siguientes">{I_DER}</button></div></div>
        <ul class="carril" data-piezas data-relacionadas></ul>
      </div>
    </section>
    <div class="barra-movil"><span data-barra-precio></span><button class="boton" type="button">Añadir a la bolsa</button></div>"""
    extra = f'  <template id="plantilla-garantias"><ul class="garantias">{garantias_html()}</ul></template>'
    pagina("pieza.html", "Pieza · Sizygia", "Joya de acero 304L hipoalergénico seleccionada por Sizygia.", cuerpo, extra=extra)


PASOS = """        <ol class="pasos">
          <li><h3>Elige tu pieza</h3><p>Por universo, o porque te ha mirado ella a ti. Si dudas, haz el test.</p></li>
          <li><h3>Añádela a la bolsa</h3><p>Puedes juntar varias piezas: desde 2 el envío es gratis.</p></li>
          <li><h3>Pide por WhatsApp</h3><p>El botón de la bolsa nos manda tu pedido con el total. Te confirmamos la disponibilidad y te enviamos el enlace de pago en menos de 24 horas.</p></li>
          <li><h3>Te llega a casa</h3><p>La preparamos en 1 o 2 días laborables y llega en 3 a 5 días más, con seguimiento.</p></li>
        </ol>"""


def como_comprar():
    cuerpo = f"""    <div class="texto">
      <section class="seccion">
        <div class="contenedor">
          <h1>Cómo comprar</h1>
          <p>Sin registro y sin contraseñas: llenas la bolsa, nos mandas el pedido y te la enviamos.</p>
{PASOS}
        </div>
      </section>
      <section class="seccion" id="pago">
        <div class="contenedor">
          <h2>Pago</h2>
          <ul>
            <li><strong>Por WhatsApp:</strong> nos llega tu bolsa, te confirmamos que todo está disponible y te enviamos un enlace de pago seguro con tarjeta. No vemos ni guardamos los datos de tu tarjeta.</li>
            <li><strong>Con tarjeta desde la ficha:</strong> en las piezas que lo tienen, el botón «Pagar solo esta pieza con tarjeta» abre un pago seguro de Stripe.</li>
            <li><strong>En nuestros mercados y pop-ups:</strong> con tarjeta o en efectivo.</li>
          </ul>
          <p>Los precios incluyen IVA.</p>
        </div>
      </section>
      <section class="seccion" id="envios">
        <div class="contenedor">
          <h2>Envíos</h2>
          <ul>
            <li>Enviamos a toda España: península, Baleares, Canarias, Ceuta y Melilla.</li>
            <li><strong>3,95 €</strong> por pedido. <strong>Gratis desde 2 piezas.</strong></li>
            <li>Preparamos el pedido en 1 o 2 días laborables y llega en 3 a 5 días laborables más.</li>
            <li>Te mandamos el número de seguimiento en cuanto sale.</li>
          </ul>
        </div>
      </section>
      <section class="seccion" id="devoluciones">
        <div class="contenedor">
          <h2>Devoluciones</h2>
          <ul>
            <li>Tienes <strong>30 días</strong> desde que la recibes para devolverla, sin dar explicaciones.</li>
            <li>Escríbenos por WhatsApp o a <a href="mailto:{MAIL}">{MAIL}</a> y te decimos cómo enviarla.</li>
            <li>La pieza tiene que volver sin usar y en su embalaje.</li>
            <li>El envío de vuelta lo pagas tú, salvo que la pieza llegue defectuosa o nos hayamos equivocado: entonces lo pagamos nosotros.</li>
            <li>Te devolvemos el dinero por el mismo medio de pago en un máximo de 14 días desde que nos avisas, una vez recibida la pieza.</li>
          </ul>
        </div>
      </section>
      <section class="seccion fondo-lino" id="preguntas">
        <div class="contenedor">
          <h2>Preguntas frecuentes</h2>
          <h3>¿Qué significan Sol, Tierra y Luna?</h3>
          <p>No son colecciones decorativas: son tres formas de ser. Sol es calidez y presencia; Tierra, raíz y tiempo lento; Luna, misterio e intimidad. No eliges un diseño: eliges qué dice de ti. Si dudas, <a href="{TEST}">haz el test</a>.</p>
          <h3>¿De qué están hechas las piezas?</h3>
          <p>De acero inoxidable 304L. Es hipoalergénico, no se oxida y no destiñe. <a href="/material-y-cuidado">Más sobre el material</a>.</p>
          <h3>¿Puedo llevarlas en la ducha, el mar o la piscina?</h3>
          <p>Aguantan bien el agua de vez en cuando. Para que conserven el brillo, sécalas después y evita el cloro y el agua salada durante mucho rato.</p>
          <h3>¿Hacéis envíos fuera de España?</h3>
          <p>De momento, no.</p>
          <h3>¿Diseñáis vosotros las joyas?</h3>
          <p>No. Las seleccionamos: buscamos cada pieza y solo se queda si encaja con uno de los tres universos y está hecha en acero 304L.</p>
        </div>
      </section>
      <section class="seccion" id="contacto">
        <div class="contenedor">
          <h2>Contacto</h2>
          <p>Respondemos en menos de 24 horas.</p>
          <div class="botones">
            <a class="boton" href="{WA}">Escríbenos por WhatsApp</a>
            <a class="boton boton--contorno" href="{IG}">Instagram</a>
            <a class="boton boton--contorno" href="mailto:{MAIL}">Correo</a>
          </div>
        </div>
      </section>
    </div>"""
    pagina("como-comprar.html", "Cómo comprar · Sizygia",
           "Cómo comprar en Sizygia: pago con tarjeta o por WhatsApp, envío a España por 3,95 € (gratis desde 2 piezas) y 30 días para devolver.",
           cuerpo, actual="/como-comprar")


def material():
    cuerpo = """    <div class="texto">
      <section class="seccion">
        <div class="contenedor">
          <h1>Material y cuidado</h1>
          <p>Todas nuestras piezas son de <strong>acero inoxidable 304L</strong>. Lo elegimos por tres razones:</p>
          <ul>
            <li><strong>Es hipoalergénico.</strong> Apto para pieles sensibles.</li>
            <li><strong>No se oxida ni destiñe.</strong> No se oscurece como la plata ni deja ver el metal de debajo con el roce.</li>
            <li><strong>Dura.</strong> Apenas se raya y aguanta el uso diario.</li>
          </ul>
          <p class="destacado">Por eso cuesta algo más que la bisutería de aleación y bastante menos que la plata. Es el precio de una joya pensada para llevarse, no para guardarse.</p>
        </div>
      </section>
      <section class="seccion">
        <div class="contenedor">
          <h2>Cómo cuidarla</h2>
          <h3>Limpieza de siempre</h3>
          <ol>
            <li>Agua tibia con unas gotas de jabón neutro.</li>
            <li>Déjala 5 a 10 minutos.</li>
            <li>Frota con un paño suave, o con un cepillo de cerdas blandas en los eslabones.</li>
            <li>Aclara con agua limpia.</li>
            <li>Sécala enseguida con un paño de microfibra: si se seca al aire, quedan marcas.</li>
          </ol>
          <h3>Si ha perdido brillo</h3>
          <p><strong>Vinagre blanco:</strong> una parte por tres de agua tibia, con un paño suave, y aclara bien. <strong>Bicarbonato:</strong> una pasta con unas gotas de agua sobre la zona, unos minutos, y aclara. Sécala siempre al terminar.</p>
          <h3>Qué evitar</h3>
          <ul>
            <li>Lejía, productos abrasivos y estropajos metálicos.</li>
            <li>Cloro y agua salada durante mucho rato: quítatela antes de la piscina o el mar.</li>
            <li>Perfume y cremas directamente sobre la pieza: póntelos primero y espera unos minutos.</li>
          </ul>
          <h3>Cómo guardarla</h3>
          <p>Cada pieza por separado, en su bolsa o estuche. Sueltas y juntas es como aparecen los arañazos.</p>
          <p>Y la regla de oro: cuanto más la uses, mejor. Está hecha para acompañarte, no para quedarse en un cajón.</p>
        </div>
      </section>
    </div>"""
    pagina("material-y-cuidado.html", "Material y cuidado · Sizygia",
           "Por qué usamos acero inoxidable 304L y cómo limpiar y cuidar tus joyas para que duren años.", cuerpo)


def sobre():
    cuerpo = f"""    <div class="texto">
      <section class="seccion">
        <div class="contenedor">
          <h1>Sobre Sizygia</h1>
          <p>En astronomía, una sizigia es el momento exacto en que tres cuerpos celestes se alinean: el Sol, la Tierra y la Luna en una misma línea. Pasa con cada luna llena y cada luna nueva. Cuando la alineación es perfecta, hay eclipse.</p>
          <p>Nos quedamos con la palabra porque describe lo que queríamos: tres elementos distintos que, alineados, forman algo con sentido. Y porque una sizigia solo se ve mirando hacia arriba, no a una pantalla.</p>
        </div>
      </section>
      <section class="seccion fondo-lino">
        <div class="contenedor">
          <h2>Qué hacemos</h2>
          <p><strong>Seleccionamos.</strong> No fabricamos ni diseñamos las joyas: las buscamos, las elegimos una a una y solo se quedan las que encajan con un universo y están hechas en acero 304L.</p>
          <p>Sol, Tierra y Luna no son colecciones de temporada, son tres formas de ser. Por eso no sacamos novedades cada semana ni perseguimos tendencias: preferimos pocas piezas que duren.</p>
        </div>
      </section>
      <section class="seccion">
        <div class="contenedor">
          <h2>Quiénes somos</h2>
          <p>Somos Alba y Fer. Empezamos Sizygia en 2026 juntando lo que mejor se nos da: a Alba, las joyas y la comunicación; a Fer, la parte creativa. A los dos nos tira la astronomía.</p>
          <p>Nos encontrarás en <a href="{IG}">Instagram</a> y en los mercados y pop-ups donde montamos mesa.</p>
        </div>
      </section>
    </div>"""
    pagina("sobre.html", "Sobre Sizygia", "Qué es una sizigia, por qué seleccionamos las joyas una a una y quiénes estamos detrás.",
           cuerpo, actual="/sobre")


def legal():
    cuerpo = f"""    <div class="texto">
      <section class="seccion">
        <div class="contenedor">
          <h1>Aviso legal, privacidad y condiciones</h1>
          <p>Última actualización: noviembre de 2026.</p>
        </div>
      </section>
      <section class="seccion" id="aviso-legal">
        <div class="contenedor">
          <h2>Aviso legal</h2>
          <p>Este sitio web, sizygia.es, pertenece a <strong>Fernando de la Sota Escriche</strong>, que vende joyas con el nombre comercial Sizygia.</p>
          <ul>
            <li>NIF: 50577203L</li>
            <li>Domicilio: C/ Modistas, 18, 28037 Madrid</li>
            <li>Correo electrónico: <a href="mailto:{MAIL}">{MAIL}</a></li>
          </ul>
          <p>Los textos, fotografías y elementos gráficos de este sitio pertenecen a Sizygia o se usan con permiso de sus autores. No pueden copiarse sin autorización.</p>
        </div>
      </section>
      <section class="seccion" id="privacidad">
        <div class="contenedor">
          <h2>Privacidad</h2>
          <p><strong>Esta web no usa cookies</strong> ni formularios. Para contar visitas usamos Cloudflare Web Analytics, que no instala cookies ni sigue a las personas entre sitios.</p>
          <p>Si nos escribes por WhatsApp, Instagram o correo, o nos compras, usamos tu nombre, contacto y dirección solo para atenderte, enviarte el pedido y cumplir nuestras obligaciones legales y fiscales. Los pagos con tarjeta los gestiona Stripe: no vemos ni guardamos los datos de la tarjeta.</p>
          <p>Responsable: Fernando de la Sota Escriche ({MAIL}). Base legal: la compra o tu consulta, y el cumplimiento de obligaciones legales. Guardamos los datos el tiempo que exige la ley y solo los compartimos con la empresa de transporte y la plataforma de pago para completar tu pedido.</p>
          <p>Puedes pedirnos ver tus datos, corregirlos, borrarlos u oponerte a su uso escribiendo a {MAIL}. Si crees que no los tratamos bien, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>
        </div>
      </section>
      <section class="seccion" id="condiciones">
        <div class="contenedor">
          <h2>Condiciones de venta</h2>
          <ul>
            <li>Los precios están en euros e incluyen IVA. El envío cuesta 3,95 € por pedido y es gratis desde 2 piezas.</li>
            <li>Enviamos solo a España: 1 o 2 días laborables de preparación y 3 a 5 días laborables de entrega.</li>
            <li>La compra se cierra cuando confirmamos tu pedido y recibimos el pago.</li>
            <li><strong>Devoluciones:</strong> tienes 30 días naturales desde la entrega para devolver la pieza sin dar explicaciones (más de los 14 días que exige la ley). El envío de vuelta lo pagas tú, salvo defecto o error nuestro. Te devolvemos el dinero por el mismo medio de pago en un máximo de 14 días desde que nos avisas, una vez recibida la pieza.</li>
            <li><strong>Garantía:</strong> si una pieza tiene un defecto de origen, tienes la garantía que marca la ley de consumo.</li>
            <li>Para cualquier reclamación: {MAIL}.</li>
          </ul>
        </div>
      </section>
    </div>"""
    pagina("legal.html", "Aviso legal, privacidad y condiciones · Sizygia",
           "Aviso legal, política de privacidad y condiciones de venta de Sizygia.", cuerpo)


def error404():
    cuerpo = """    <div class="texto"><section class="seccion">
      <div class="contenedor">
        <h1>Esta página no existe</h1>
        <p>Puede que el enlace sea antiguo. Las joyas siguen aquí:</p>
        <div class="botones">
          <a class="boton" href="/">Ir a la portada</a>
          <a class="boton boton--contorno" href="/sol">Sol</a>
          <a class="boton boton--contorno" href="/tierra">Tierra</a>
          <a class="boton boton--contorno" href="/luna">Luna</a>
        </div>
      </div>
    </section></div>"""
    pagina("404.html", "Página no encontrada · Sizygia", "Esta página no existe.", cuerpo)



if __name__ == "__main__":
    portada()
    joyas()
    for k in UNIVERSOS:
        universo(k)
    pieza()
    como_comprar()
    material()
    sobre()
    legal()
    error404()
    print("Páginas generadas en", SITE)
