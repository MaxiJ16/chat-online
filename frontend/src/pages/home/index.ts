// importo el Router
import { Router } from "@vaadin/router";

class Home extends HTMLElement {
  // connectedCallback es el cb q tenemos que usar en los custom-elements para escribir de forma segura
  connectedCallback() {
    //aca seteamos al html
    this.render();
    const selectYes = document.querySelector(".yes");
    selectYes.addEventListener("click", () => {
      Router.go("/register");
    });
    const selectNot = document.querySelector(".not");
    selectNot.addEventListener("click", () => {
      Router.go("/auth");
    });

  }
  render() {
    this.innerHTML = `
      <section class="section">
        <my-text variant="title">Bienvenido/a</my-text>
        <my-text variant="subtitle">Eres nuevo?</my-text>
        <div>
          <input type="radio" id="yes" name="select" value="yes" class="yes">
          <label for="yes">Si</label>
        </div>
        <div>
          <input type="radio" id="not" name="select" value="not" class="not">
          <label for="not">No</label>
        </div>
      </section>
    `;
  }
}

customElements.define("home-page", Home);
