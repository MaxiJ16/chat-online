// importamos nuestros custom-elements
import "./pages/home/index";
import "./pages/chat/chat";
import "./pages/register/index";
import "./pages/authenticate/index";
import "./components/header";
import "./components/text";

//importamos el router
import "./router";

//importamos el state
import { state } from "./state";

// le decimos init() para que se inicie el state

(function () {
  fetch("/env")
    .then((res) => res.json())
    .then((data) => console.log(data));
  // hacemos el init para rehidratarse del localStorage para saltearme la primera página
  state.init();
})();
