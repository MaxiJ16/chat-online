// importamos firebase
import firebase from "firebase";

// ir a las docs de firebase > Realtime Database > web > get started > initialize the Realtime Database Javascript SDK

// lo configuramos e inicializamos la app
const app = firebase.initializeApp({
  // la apikey la encontramos en la ruedita de descripcion general > configuracion del proyecto > cuentas de servicio > secretos de la base de datos > y ahi figura creado
  apiKey: "mTHgFa5NQLxni0CFmZn9qhz3pzrmZmx5p2C1CDyh",
  // ruedita > configuracion del proyecto > cuentas  de servicio
  databaseURL: "https://dwf-m6-chat-default-rtdb.firebaseio.com",
  // ruedita > config. del proy > general
  projectId: "dwf-m6-chat",
  // projectId.firebaseapp.com
  authDomain: "dwf-m6-chat.firebaseapp.com",
});

// le pedimos a firebase la database
const rtdb = firebase.database();

//exportamos la db para poder interactuar desde afuera 

export { rtdb };
