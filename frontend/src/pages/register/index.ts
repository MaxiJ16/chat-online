// Guardamos la dirección de nuestra API
const API_BASE_URL = "https://chat-xc4h.onrender.com";

// importo el Router
import { Router } from "@vaadin/router";

class RegisterPage extends HTMLElement {
  // connectedCallback es el cb q tenemos que usar en los custom-elements para escribir de forma segura
  connectedCallback() {
    //aca seteamos al html
    this.render();
  }
  register() {
    //como ya ejecutamos el render ya tengo todo montado por eso
    //buscamos el formulario del render
    const form = this.querySelector(".form");

    form.addEventListener("submit", (e) => {
      const messageFromRegister = this.querySelector(".messageFromRegister");

      e.preventDefault();
      // aca le decimos a ts que trate a e.targe (que es el form )como un dato any
      const target = e.target as any;
      const name = target.nombre.value;
      const email = target.email.value;

      fetch(API_BASE_URL + "/signup", {
        // lo configuramos para hacer el método post
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email: `${email}`, nombre: `${name}` }),
      })
        .then((res) => {
          // esto es una resp. de fetch así que hay que hacer un return de res.json
          // y recién ahí puedo hacer un .then más con la data que queremos
          return res.json();
        })
        .then((data) => {
          messageFromRegister.textContent = data.message;
          setTimeout(() => {
            Router.go("/auth");
          }, 3000);
        });
    });
  }
  render() {
    this.innerHTML = `
      <section class="section">
        <my-text variant="title">Register</my-text>
        <form class="form">

          <div>
            <my-text variant="subtitle">Nombre</my-text>
            <input class="input" type="text" name="nombre" required/>
          </div>
          
          <div>
            <my-text variant="subtitle">Email</my-text>
            <input class="input" type="text" name="email" required />
          </div>

          <button class="button"><my-text variant="subtitle">Comenzar</my-text></button>
        </form>
        <span class="messageFromRegister"></span>
      </section>
    `;
    this.register();
  }
}

customElements.define("register-page", RegisterPage);
