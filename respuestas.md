## Pregunta 1 ¿Qué código recibes con MongoDB parado? ¿Qué parte de index.ts ha respondido?

Con MongoDB encendido recibo {"status":"ok","db":"rastro"}, y con MongoDB apagado recibo {"error":"Error interno del servidor"}. Quien responde en ese caso es el middleware de errores de index.ts (líneas 31-39), concretamente las líneas 37-38, que registran el error y devuelven el 500.

## Pregunta 2 ¿Por qué la segunda no encuentra nada? Pista: ¿en qué formato llega todo lo que viene en una URL?

Porque todo lo que llega en una URL es texto. req.query siempre contiene strings, aunque el valor parezca un número.
- ?category=Cars llega como "Cars". En la base de datos category también es texto, así que coincide.
- ?price=380 llega como "380" (string). Si price está guardado como número (380), la consulta compara "380" con 380. 
En MongoDB esa comparación es estricta por tipo, así que no hay coincidencia.

Lo que hace find(req.query) es pasar esos strings tal cual a la consulta, sin convertirlos al tipo del campo.


