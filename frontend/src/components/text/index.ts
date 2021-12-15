class TextComponent extends HTMLElement {
  constructor() {
    super();
    this.render();
  }
  render() {
    const shadow = this.attachShadow({ mode: "open" });
    const variant = this.getAttribute("variant") || "body";

    const div = document.createElement("div");
    div.className = variant;
    div.textContent = this.textContent;

    const style = document.createElement("style");
    style.innerHTML = `
      * {
        box-sizing:border-box;
      } 

      .title {
        font-size: 52px;
        font-weight: 700;
      }
      .subtitle {
        font-size: 24px;
        font-weight: 500;
      }
      .body {
        font-size: 18px;
      }
    `;

    shadow.appendChild(div);
    shadow.appendChild(style);
  }
}

customElements.define("my-text", TextComponent);
