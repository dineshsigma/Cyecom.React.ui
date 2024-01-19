import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { store } from "./redux/store";
import { Provider } from "react-redux";
import { ApolloProvider } from "@apollo/client";
import { client } from "./environment";
import { PersistGate } from "redux-persist/integration/react";
import persistStore from "redux-persist/es/persistStore";
import "react-datepicker/dist/react-datepicker.css";

// import 'boxicons/css/boxicons.min.css';
{
  /* <script src="https://unpkg.com/boxicons@2.1.4/dist/boxicons.js"></script> */
}

let persiststore = persistStore(store);

ReactDOM.render(
  <Provider store={store}>
    <ApolloProvider client={client}>
      <React.StrictMode>
        <PersistGate persistor={persiststore}>
          <App />
        </PersistGate>
      </React.StrictMode>
    </ApolloProvider>
  </Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(//console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
