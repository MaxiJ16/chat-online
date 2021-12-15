// importo el Router
import { Router } from "@vaadin/router";

//importamos el state
import { state } from "../../state";

class AuthPage extends HTMLElement {
  // connectedCallback es el cb q tenemos que usar en los custom-elements para escribir de forma segura
  connectedCallback() {
    //aca seteamos al html
    this.render();

    const cs = state.getState();
    //recupera el state del localStorage
    state.init();

    if (cs.rtdbRoomId && cs.userId) {
      Router.go("/chat");
    }

    const selectInput = this.querySelector(".select-value") as any;
    const roomExist = this.querySelector(".inputRoomExistente") as any;

    selectInput.addEventListener("change", () => {
      const optionValue = selectInput.options[selectInput.selectedIndex].value;
      if (optionValue == "existente") {
        roomExist.style.display = "initial";
      } else if (optionValue == "nuevo") {
        roomExist.style.display = "none";
      }
    });

    //como ya ejecutamos el render ya tengo todo montado por eso
    //buscamos el formulario del render
    const form = this.querySelector(".form");
    //escuchamos el evento submit
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const target = e.target as any;
      const email = target.email.value;
      const nombre = target.nombre.value;
      const roomId = target.roomId.value;
      const optionValue = selectInput.options[selectInput.selectedIndex].value;

      state.setEmailAndFullName(email, nombre);

      if (optionValue == "existente") {
        state.signIn((err) => {
          if (err) console.error("hubo un error en el signIn");
          cs.roomId = roomId;
          state.accessToRoom();
        });
      } else if (optionValue == "nuevo") {
        state.signIn((err) => {
          if (err) console.error("hubo un error en el signIn");
          state.askNewRoom(() => {
            state.accessToRoom();
          });
        });
      }

      Router.go("/chat");
    });
  }
  render() {
    this.innerHTML = `
      <section class="section">
        <my-text variant="title">Hola!</my-text>
        <my-text variant="subtitle">Completa estos datos</my-text>
        <form class="form">
          <div>
            <my-text variant="subtitle">Email</my-text>
            <input class="input" type="text" name="email"/>
          </div>
          <div>
            <my-text variant="subtitle">Nombre</my-text>
            <input class="input" type="text" name="nombre"/>
          </div>
          <div>
            <my-text variant="subtitle">Room</my-text>
            <select name="select" class="input select-value">
              <option value="nuevo">Nuevo room</option>
              <option value="existente">Room existente</option>
            </select>
          </div>
          <div class="inputRoomExistente">
            <my-text variant="subtitle">Room id</my-text>
            <input class="input" type="text" name="roomId"/>
          </div>
          <button class="button"><my-text variant="subtitle">Comenzar</my-text></button>
        </form>
      </section>
      `;
  }
}

customElements.define("auth-page", AuthPage);
