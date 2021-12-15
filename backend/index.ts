// importamos express
import * as express from "express";

const path = require("path");

//importamos firestore y rtdb de db.ts
import { firestore, rtdb } from "./db";

// importamos la librería que genera ids complejos (nanoid)
import { nanoid } from "nanoid";

//importamos cors, genera unos headers especiales para poder entrar a la api desde el cliente
import * as cors from "cors";

// definimos un puerto
const port = process.env.PORT || 3000;

//configuramos express
const app = express();

//middlewares

app.use(express.static("dist"));

//para poder recibir el body del método post
app.use(express.json());

// para no tener problemas de cors y que pueda llamar desde mi cliente a locahost:3000 (mi api)
app.use(cors());

// Referencia a la collection de usuarios de firebase
const userCollection = firestore.collection("users");

// Referencia a la collection de rooms de firebase
const roomCollection = firestore.collection("rooms");

app.get("/env", (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
  });
});

// signup, para dar de alta el user en la base de datos
// este signup recibe un mail y un nombre
// si existe el user le devolvemos que ya existe no se puede volver a registrar
// si no existe le vamos a devolver el id
app.post("/signup", (req, res) => {
  const email = req.body.email;
  const nombre = req.body.nombre;
  // chequeamos dentro de la userCollection si existe un documento con un mail como el que me acaban de pasar
  userCollection
    // where busca todos los documentos que correspondan a esta condición, en la primer parte ponemos el campo que queremos buscar, en este caso email
    // (dentro de todos los documentos quiero buscar el campo email y se fija que valor tiene), el segundo valor sería la condición (si es igual, distinto, etc)
    // y en el tercer campo si es igual a este email que me acaban de pasar
    .where("email", "==", email)
    // finalmente esta búsqueda se ejecuta con un get() y devuelve una promesa
    .get()
    .then((searchResponse) => {
      // empty quiere decir "no existe"
      if (searchResponse.empty) {
        // si no existe, con add agregamos un obj. nuevo a la userCollection
        userCollection
          .add({
            email,
            nombre,
          })
          // una vez creado también responde una promesa, en la cual obtenemos la referencia del nuevo usuario que es un id
          .then((newUserRef) => {
            res.json({
              // le decimos que tu id es newUserRef.id
              // con ese id después nos vamos a poder identificar
              id: newUserRef.id,
              // le ponemos new:true para ver la dif. de cuando nos responde con un user creado a un user que ya existe
              new: true,
              message: "Usuario registrado con éxito!",
            });
          });
      }
      // si existe y no está vacío le voy a decir que devuelva el id de ese usuario que encontró
      else {
        // si el usuario existe le respondemos con un error 400 agregandole un texto
        res.status(400).json({
          message: "Este usuario ya existe.",
        });
      }
    });
});

// una vez dado de alta en la db, hacemos el método auth para que el usuario se logee

// auth,  si existe el mail lo devolvemos y si no existe le decimos que no está que se tiene que registrar

app.post("/auth", (req, res) => {
  // recibimos el email del body
  // esto es = a => const email = req.body.email
  const { email } = req.body;
  // una vez que lo tenemos buscamos nuevamente en la userCollection
  userCollection
    .where("email", "==", email)
    .get()
    .then((searchResponse) => {
      // si la respuesta está vacía quiere decir que no hay un usuario registrado y no encontró el email
      if (searchResponse.empty) {
        // respondemos el error 404
        res.status(404).json({
          message: "user not found",
        });
      } else {
        // si no está vacío y encontró el email le mostramos el registro que encontró en la búsqueda
        res.json({
          //searchResponse devuelve un array, entonces debemos buscarlo en la posición 0
          id: searchResponse.docs[0].id,
        });
      }
    });
});

// /rooms: este endpoint va a crear un room en Firestore y en la Realtime Database y nos devuelve un id mas sencillo.
// En la primera va a guardar el id corto (AAFF, por ejemplo) y lo va a asociar a un id complejo que estará en la Realtime DB.

app.post("/rooms", (req, res) => {
  // obtenemos del body el userId, este es requerido para poder crear un room
  // si no tenemos un userId no podemos crear una nueva room
  const { userId } = req.body;
  // dentro de la userCollection buscamos un doc que tenga el userId que nos acaban de pasar
  // el get termina yendo a la base de datos a buscar ese documento y devuelve una promesa
  userCollection
    // para que no haya errores vamos a parsear a un string lo que nos pasen como userId
    .doc(userId.toString())
    .get()
    .then((doc) => {
      // si ese documento que buscamos existe
      if (doc.exists) {
        // creamos dentro de la rtdb una referencia a rooms/(idcomplejo)
        const roomRef = rtdb.ref("rooms/" + nanoid());
        // este set inicializa una room con una propiedad messages(que es un array vacio) y owner(que tiene el userid que nos acaban de mandar de un user válido)
        roomRef
          .set({
            messages: "",
            owner: userId,
          })
          .then(() => {
            // guardamos el id complejo del room que se creo en la rtdb
            const roomLongId = roomRef.key;
            // después de haber creado la room en la rtdb, cramos un doc en la roomCollection que va a tener un id mas sencillo que el otro
            // generación del id:
            // para que sea de 4 cifras le ponemos el num 1000, y le sumamos un numero entre el 1 y el 999
            // math.random nos da un num entre 0 y 1, entonces lo vamos a multiplicar * 999
            // y todo eso lo vamos a redondear con math.floor
            const roomId = 1000 + Math.floor(Math.random() * 999);
            // ese roomId es el id del doc que voy a crear en la roomCollection
            roomCollection
              .doc(roomId.toString())
              .set({
                // y dentro le ponemos el id complejo asociado
                rtdbRoomId: roomLongId,
              })
              .then(() => {
                res.json({
                  // respondemos con el id cortito de firestore
                  id: roomId.toString(),
                });
              });
          });
      }
      // si no existe el userId
      else {
        res.status(401).json({
          message: "no existis en la base de datos",
        });
      }
    });
});

// /room/:id

// /rooms/:roomId?userid=1234: por último, este endpoint va a recibir el id “amigable” (AAFF)
// y va devolver el id complejo (el de la RTDB).
// Además va a exigir que un userId válido acompañe el request.

app.get("/rooms/:roomId", (req, res) => {
  // recibe un roomid amigable de params
  const { roomId } = req.params;
  // además va a recibir un parametro adicional que va a ser el id del usuario que quiere obtener eso para que sea seguro
  // recibe una queryparams, de req.query obtenemos el userId
  const { userId } = req.query;

  userCollection
    // para que no haya errores vamos a parsear a un string lo que nos pasen como userId
    .doc(userId.toString())
    .get()
    .then((doc) => {
      // si ese documento que buscamos existe
      if (doc.exists) {
        // buscamos en firestore en la roomCollection
        // le decimos a la roomCollection que queremos el doc que tenga este id
        roomCollection
          .doc(roomId)
          .get()
          .then((snap) => {
            // obtenemos la data del snap con el método data
            const data = snap.data();
            // le decimos que responda con ese data
            res.json(data);
          });
      }
      // si no existe el userId
      else {
        res.status(401).json({
          message: "no existis en la base de datos",
        });
      }
    });
});

app.post("/messages/:rtdbId", (req, res) => {
  const { rtdbId } = req.params;
  //construimos una referencia a nuestro room
  const chatRoomRef = rtdb.ref(`/rooms/${rtdbId}/messages`);
  // le hacemos un push, q tiene una segunda f que nos informa cuando está completado
  // el push te genera un id nuevo en la rtdb, como primer parámetro le mandamos el req.body que son los datos que le enviamos desde el state
  chatRoomRef.push(req.body, () => {
    res.json("todo ok");
  });
});

// esto es un handler, un manejador
//usamos get porque es el método que usa el navegador
// configuramos para que cualquier ruta que no sean estas de las api, ni las rutas que están en dist
// también sea el index.html, * es igual a cualquier ruta

app.get("*", (req, res) => {
  // le indicamos una ruta especial al archivo
  // __dirname es la carpeta donde estoy parado ahora, sería room-dos y le concatenamos /dist/index.html que es el archivo que maneja todas mis rutas
  const pathResolve = path.resolve("", "dist/index.html");
  res.sendFile(pathResolve);
});

//escuchamos el puerto
app.listen(port, () => {
  console.log(`Servidor on: http://localhost:${port}`);
});
