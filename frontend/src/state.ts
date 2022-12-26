// importamos firebase desde rtdb
import { rtdb } from "./rtdb";

// Guardamos la dirección de nuestra API
const API_BASE_URL = "https://chat-xc4h.onrender.com";

//usamos la función map de lodash que hace lo mismo que el map pero cuando le pasas un objeto de objetos lo trata como si fuera un array
import map from "lodash/map";

const state = {
  data: {
    email: "",
    fullName: "",
    userId: "",
    roomId: "",
    rtdbRoomId: "",
    messages: [],
  },
  listeners: [],
  init() {
    // en el init para que esto se rehidrate
    const lastStorageState = localStorage.getItem("state");
    // y este state que obtuvimos si ya había alguien autenticado ya tiene un email, un fullName, un userId, etc. entonces podemos recuperar de ahí la data y evitar conectarnos de nuevo
  },
  getState() {
    return this.data;
  },
  setState(newState) {
    this.data = newState;
    for (const cb of this.listeners) {
      cb();
    }
    // para guardar constantemente el state en el localStorage, esto hace que haya un item en el local que este guardando la última versión siempre
    localStorage.setItem("state", JSON.stringify(newState));
    console.log("Soy el state, he cambiado", this.data);
  },
  // para conectarnos a ese room y empezar a recibir mensajes
  listenRoom() {
    const cs = this.getState();
    // de la rtdb quiero escuchar una sección dentro de rooms/${rtdbRoomId} y ahí vamos a escribir los msj en el backend
    const chatroomsRef = rtdb.ref("/rooms/" + cs.rtdbRoomId);
    chatroomsRef.on("value", (snapshot) => {
      // cada vez que cambia obtenemos la última versión del estado
      const currentState = this.getState();
      // cuando message recibe un nuevo valor recibimos el snapshot y lo guardamos en messagesFromServer
      const messagesFromServer = snapshot.val();
      // cada vez que haya un cambio vamos a traernos del server solo la parte de messages y la vamos a guardar en el state
      // primero lo tenemos que mapear
      const messagesList = map(messagesFromServer.messages);
      currentState.messages = messagesList;
      this.setState(currentState);
    });
  },
  // recibimos el email y el fullname y lo seteamos
  setEmailAndFullName(email: string, fullname: string) {
    const cs = this.getState();
    cs.fullName = fullname;
    cs.email = email;
    this.setState(cs);
  },
  signIn(callback) {
    const cs = this.getState();
    // si el current State tiene un email vamos a authenticarlo
    if (cs.email) {
      // el auth nos devuelve el id que tiene ese email
      fetch(API_BASE_URL + "/auth", {
        // lo configuramos para hacer el método post
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email: cs.email }),
      })
        .then((res) => {
          // esto es una resp. de fetch así que hay que hacer un return de res.json
          // y recién ahí puedo hacer un .then más con la data que queremos
          return res.json();
        })
        .then((data) => {
          // data nos va a traer el id que nos devuelve /auth cuando el user está registrado
          cs.userId = data.id;
          this.setState(cs);
          // cuando se termine de setear el state voy a invocar al callback, sin error
          callback();
        });
    } else {
      // si no existe el email
      console.error("No hay un email en el state");
      // invoco el callback cuando hubo un error
      callback();
    }
  },
  // va a hacer el método del nuevo room y nosotros tenemos que hacer el de room existente porque es basicamente igual
  //nuestro estado le pide al server un nuevo room
  askNewRoom(callback?) {
    const cs = this.getState();
    // si tiene userId
    if (cs.userId) {
      fetch(API_BASE_URL + "/rooms", {
        // lo configuramos para hacer el método post
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ userId: cs.userId }),
      })
        .then((res) => {
          // pasamos la res de la api a json, sino es un texto
          return res.json();
        })
        .then((data) => {
          // data nos va a traer el id sencillo que nos devuelve /rooms
          cs.roomId = data.id;
          this.setState(cs);
          // tmb recibimos un callback porque queremos avisar que el newRoom está creado para que vaya otra vez a la APi a pedirle el id complejo
          if (callback) {
            callback();
          }
        });
    }
    // si no tiene userId
    else {
      console.error("no hay userId");
    }
  },
  // el callback es porque le vamos a tener que avisar al exterior que esto ya terminó para que después pueda empezar a intercambiar mensajes
  accessToRoom(callback?) {
    const cs = this.getState();
    const roomId = cs.roomId;
    // invocamos el fetch a la api /room/ (lo que me pasen como parametro) y ademas nos pide que le agreguemos el userId
    // el método get es por defecto así que no hace falta aclarar el method
    fetch(API_BASE_URL + "/rooms/" + roomId + "?userId=" + cs.userId)
      .then((res) => {
        // pasamos la res de la api a json, sino es un texto
        return res.json();
      })
      .then((data) => {
        // data nos va a traer el id largo de la rtdb, lo guardamos en el state
        cs.rtdbRoomId = data.rtdbRoomId;
        this.setState(cs);
        // y nos conectamos a ese room
        this.listenRoom();
        if (callback) callback();
      });
  },
  // pushMessage recibe un msj nuevo y lo manda al backend
  pushMessage(message: string) {
    const cs = this.getState();
    // guardamos el nombre que acabamos de poner en el state
    const nombreDelState = cs.fullName;
    // este msj viaja a nuestro backend así que debemos hacer fetch
    fetch(API_BASE_URL + "/messages/" + cs.rtdbRoomId, {
      // usamos el post para crear algo en la db
      method: "post",
      //agregamos los headers
      headers: {
        "content-type": "application/json",
      },
      // el body siempre hay que stringifyarlo
      // le mandamos un objeto que tiene from(nombre) y message
      // entonces mezclamos un dato nuevo (message) con un dato viejo del state (nombre)
      body: JSON.stringify({
        from: nombreDelState,
        message,
      }),
    });
  },
  suscribe(callback: (any) => any) {
    this.listeners.push(callback);
  },
};

export { state };
