// definimos un type Message,  que tiene 2 prop. from y message
type Message = {
  from: string;
  message: string;
};

import { state } from "../../state";

const currentState = state.getState();

class ChatPage extends HTMLElement {
  // connectedCallback es el cb q tenemos que usar en los custom-elements para escribir de forma segura
  connectedCallback() {
    // nos vamos a suscribir
    state.suscribe(() => {
      //obtenemos la última versión del state
      const currentState = state.getState();
      // vamos a grabarle en this.messages cualquier cosa que esté dentro del state en messages
      // pisamos lo que tengamos dentro de este custom element con lo que esté en el state
      this.messages = currentState.messages;
      // cuando ya tenemos los datos guardados en este custom-element le vamos a decir this.render para que vuelva a mostrar la cosa actualizada
      this.render();
    });
    //aca seteamos al html
    this.render();
  }

  // este custom element tiene una prop interna que se llama messages y ahí voy a tener un array de Message
  // me voy a enganchar al state y cada vez que haya mensajes lo voy a meter en este array
  // hay que aclarar que inicia con un array vacio para que el map no falle
  messages: Message[] = [];
  addListeners() {
    //como ya ejecutamos el render ya tengo todo montado por eso
    //buscamos el formulario del render con la clase submit-message
    const form = this.querySelector(".submit-message");
    //escuchamos el evento submit
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // aca le decimos a ts que trate a e.targe (que es el form )como un dato any
      // le pedimos que reciba el valor del new-message
      const target = e.target as any;
      // le hacemos el pushMessage
      
      state.pushMessage(target["new-message"].value);
    });
  }
  render() {
    // creamos un form para poder escuchar el submit
    this.innerHTML = `
    <section class="container-page-msg">
      <my-text variant="title">Chat</my-text>
      <my-text>Room Id: ${currentState.roomId}</my-text>
      <div class="messages">
        ${
          // le digo que recorra el array de messages y que por cada posición devuelva un div con el nombre y el mensaje
          this.messages
            .map((m) => {
              return `
              ${
                (m.from !== currentState.fullName)
                  ? `<div class="you"><p class="your-from">${m.from}</p><p class="your-message">${m.message}</p></div>`
                  : `<div class="my"><p class="my-message">${m.message}</p></div>`
              }
              `;
            })
            .join("")
        }
      </div>
      
      <form class="submit-message">
        <input class="input" type="text" name="new-message"/>
        <button class="button"><my-text variant="subtitle">Enviar</my-text></button>
      </form>
    </section>
    `;
    // cada vez que se haga un render, se redibuje toda la pantalla le decimos this.addlisteners
    // así mi componente se vuelve a enganchar a ese formulario
    this.addListeners();
  }
}

customElements.define("chat-page", ChatPage);
