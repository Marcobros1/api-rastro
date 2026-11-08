## Pregunta 1 ¿Qué código recibes con MongoDB parado? ¿Qué parte de index.ts ha respondido?

Con MongoDB encendido recibo {"status":"ok","db":"rastro"}, y con MongoDB apagado recibo {"error":"Error interno del servidor"}. Quien responde en ese caso es el middleware de errores de index.ts (líneas 31-39), concretamente las líneas 37-38, que registran el error y devuelven el 500.

## Pregunta 2 ¿Por qué la segunda no encuentra nada? Pista: ¿en qué formato llega todo lo que viene en una URL?

Porque todo lo que llega en una URL es texto. req.query siempre contiene strings, aunque el valor parezca un número.
- ?category=Cars llega como "Cars". En la base de datos category también es texto, así que coincide.
- ?price=380 llega como "380" (string). Si price está guardado como número (380), la consulta compara "380" con 380. 
En MongoDB esa comparación es estricta por tipo, así que no hay coincidencia.

Lo que hace find(req.query) es pasar esos strings tal cual a la consulta, sin convertirlos al tipo del campo.

## Pregunta 3: ¿por qué la API ignora views y status si el cliente los envía? ¿Qué podría hacer alguien si no los ignorara?

El servidor decide qué se guarda, así que la API ignora views y status, porque crea el anuncio campo a campo y esos valores nunca llegan a la base de datos. Si los aceptara, cualquiera podría inflar las visitas, cambiar el estado sin pasar por las reglas del negocio, manipular la fecha o publicar a nombre de otro vendedor, un problema que (tras investigarlo) se llama mass assignment (el cliente escribe campos que no le corresponden) y se evita con una lista blanca de campos.

## Pregunta 4: Ana baja el iPhone de 380 a 350 €. La oferta de Sara guarda una copia: listing.price: 380. ¿Debe tu PATCH cambiar también esa copia? ¿Por qué?

No, el PATCH no debe cambiar la copia de la oferta, porque listing.price: 380 es un dato histórico que guarda el precio que tenía el anuncio cuando Sara hizo su oferta, igual que seller.name guarda el nombre del vendedor en el momento de publicar. Si el PATCH actualizara esa copia a 350, la oferta parecería hecha sobre un precio que nunca existió y se perdería el contexto de la negociación. Además, el ejercicio 5.1 solo modifica la colección listings, y propagar el cambio exigiría una segunda escritura en offers que no está en el enunciado y que, sin transacción, no sería atómica. Si el negocio quisiera que las ofertas mostraran siempre el precio actual, la alternativa sería leer el precio del anuncio al consultar la oferta en lugar de copiarlo, pero es una decisión de diseño que conviene confirmar contigo antes de implementarla.