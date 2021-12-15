class Header extends HTMLElement {
  constructor() {
    super();
    this.render();
  }
  render() {
    this.style.display = "block";
    this.style.height = "60px";
    this.style.backgroundColor = "#FF8282"
  }
}

customElements.define("my-header", Header);