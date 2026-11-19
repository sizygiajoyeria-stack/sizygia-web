# sizygia-web

Web de Sizygia (sizygia.es). Es una web estática y sin coste: el código vive en GitHub y la publica Cloudflare Pages.

## Estructura

- `site/`: la web que se publica.
  - `data/catalogo.json`: **el catálogo**. Es el único archivo que hay que tocar para añadir, cambiar o quitar piezas.
  - `assets/`: estilos, tipografías, script del catálogo e icono.
  - `_redirects`: lleva los enlaces antiguos de Shopify a las páginas nuevas.
- `generar.py`: genera las páginas HTML (cabecera, pie y textos). Solo hace falta si se cambian los textos de las páginas.

## Publicación

Está publicada en Cloudflare como **Worker** con archivos estáticos: `wrangler.jsonc` indica que la web está en `site`. Cada cambio guardado en GitHub se publica solo. Dirección provisional: https://sizygia-web.sizygia-joyeria.workers.dev

## Instrucciones antiguas (Cloudflare Pages)

1. Cloudflare › Workers & Pages › Create › Pages › Connect to Git.
2. Elegir el repositorio `sizygia-web`.
3. Framework preset: **None**. Build command: **(vacío)**. Build output directory: **site**.
4. Save and Deploy. Desde entonces, cada cambio que se guarde en GitHub se publica solo en un minuto.

## Añadir una pieza

1. En GitHub, abrir `site/data/catalogo.json` y pulsar el lápiz (Edit).
2. Copiar un bloque `{ ... }` entero de una pieza, pegarlo debajo (separado por una coma) y cambiar los datos.
3. Subir las fotos a `site/img/` y poner su ruta en `imagenes`, por ejemplo `"/img/nombre-pieza-1.jpg"`.
4. Pulsar «Commit changes». En un minuto está en la web.

Campos: `id` (minúsculas y guiones; es la dirección de la ficha), `universo` (`sol`, `tierra` o `luna`), `precio` (con punto: `17.99`), `variantes` (nombre y stock; stock 0 = agotada), `stripe` (enlace de pago; si está vacío, solo sale el botón de WhatsApp).

## Pendiente antes de apuntar el dominio

- [ ] NIF y domicilio del titular en `generar.py` (página legal) y volver a generar.

- [ ] Enlaces de pago de Stripe por pieza en `stripe`.
- [ ] «Rayos de luz»: acabado, medidas, talla y descripción.
- [ ] Confirmar el número de WhatsApp (en `assets/js/tienda.js` y `generar.py`).

## Pago con Stripe (desde el 19/11/2026)

- `worker/index.js` atiende `POST /api/checkout`: recibe la bolsa (id, variante, cantidad), recalcula precios con `site/data/catalogo.json` y crea una sesión de Stripe Checkout. Envío: 3,95 € con una pieza, gratis desde 2. Solo España.
- El resto de rutas las sirven los archivos de `site/` (binding `ASSETS`).
- La clave va como secreto `STRIPE_SECRET_KEY` en Cloudflare (Workers > sizygia-web > Configuración > Variables y secretos). Nunca en el código.
- Tras pagar, Stripe vuelve a `/pedido-confirmado`, que vacía la bolsa. Si el servicio falla y la bolsa tiene una sola pieza, la web usa el enlace de pago de esa pieza (`stripe` en el catálogo).
- Prueba en local: crea `.dev.vars` con `STRIPE_SECRET_KEY=sk_test_...` y ejecuta `npx wrangler dev`. `.dev.vars` no se sube.
