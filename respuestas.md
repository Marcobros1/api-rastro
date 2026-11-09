## Ejercicio 0: push directo a main

`remote: error: GH013: Repository rule violations found for refs/heads/main.`
- `Changes must be made through a pull request.`
- `2 of 2 required status checks are expected.`

Perdón, revisando el ejercicio he visto que me falto añadir esto.

## Pregunta 1 ¿Qué código recibes con MongoDB parado? ¿Qué parte de index.ts ha respondido?

Con MongoDB encendido recibo {"status":"ok","db":"rastro"} y con MongoDB apagado {"error":"Error interno del servidor"}. Responde el middleware de errores de index.ts (líneas 59-66), concretamente las líneas 65-66, que registran el error y devuelven el 500.

## Pregunta 2 ¿Por qué la segunda no encuentra nada? Pista: ¿en qué formato llega todo lo que viene en una URL?

Porque todo lo que llega en una URL es texto: ?price=380 llega como "380", y MongoDB no lo considera igual al número 380 guardado, porque compara por tipo.

## Pregunta 3: ¿por qué la API ignora views y status si el cliente los envía? ¿Qué podría hacer alguien si no los ignorara?

La API construye el anuncio campo a campo, así que ignora views y status; si los aceptara, cualquiera podría inflar visitas o cambiar el estado sin pasar por las reglas, un problema llamado mass assignment que se evita con una lista blanca de campos.

## Pregunta 4: Ana baja el iPhone de 380 a 350 €. La oferta de Sara guarda una copia: listing.price: 380. ¿Debe tu PATCH cambiar también esa copia? ¿Por qué?

No, la copia debe quedarse como estaba, porque listing.price es el precio que tenía el anuncio cuando Sara hizo su oferta, igual que seller.name guarda el nombre en el momento de publicar. Si el negocio quiere ver siempre el precio actual, habría que leerlo del anuncio en lugar de copiarlo, una decisión de diseño que conviene confirmar antes.

## Pregunta 5: ¿por qué ofertar por un anuncio vendido es 409 y no 400?

 Es 409 porque la petición está bien formada y el problema es el estado actual del anuncio, que ya no está disponible. Repetir la misma petición fallaría igual, así que el conflicto está en el recurso y no en lo que envía el cliente.

## Pregunta 6: ¿qué comprueba MongoDB por ti en esta API? ¿Y qué has tenido que comprobar tú en el código? Pon un ejemplo de cada.

MongoDB garantiza que _id sea único (rechaza un segundo documento con el mismo _id) y que el $inc de views sume de forma atómica aunque lleguen peticiones a la vez. No comprueba que listingId apunte a un anuncio real ni que un anuncio vendido no admita ofertas: en offers.ts compruebo el formato de los ids con una expresión regular, que amount sea mayor que 0, que anuncio y comprador existan con findOne y que listing.status sea "AVAILABLE".