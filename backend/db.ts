// importamos firebase-admin
import * as admin from "firebase-admin";
// importamos la key que bajamos de cuentas de servicio > SDK firebase admin > generar nueva clave privada
const serviceAccount = require("./key.json");
//inicializamos con los certificados 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  databaseURL: "https://dwf-m6-chat-default-rtdb.firebaseio.com"
});
// exportamos la respuesta de admin.firestore
// esta nos da acceso a la base de datos noSQL
const firestore = admin.firestore();
//admin.database nos da acceso a la realTimeDatabase
const rtdb = admin.database();
//exportamos las dos
export { firestore, rtdb };
