## Pregunta 1 ¿Qué código recibes con MongoDB parado? ¿Qué parte de index.ts ha respondido?

Con MongoDB encendido recibo {"status":"ok","db":"rastro"}, y con MongoDB apagado recibo {"error":"Error interno del servidor"}. Quien responde en ese caso es el middleware de errores de `index.ts` (líneas 31-39), concretamente las líneas 37-38, que registran el error y devuelven el 500.



