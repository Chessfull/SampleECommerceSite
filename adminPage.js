"use strict";

import {
  FilterOperations,
  FakeStoreApi,
  renderProducts,
  domFilterArea,
  getActive,
  removeActive,
} from "/userPage.js";

//#region ▼ Defining elements for DOM processes ▼
const loader = document.querySelector(".loader");
const productCardContainer = document.querySelector(".product-card-container");
//#endregion

// ▼ Creating instance of fakestoreapi(import from another js file) and fetching products ▼
const api = new FakeStoreApi();
const products = await api.getProducts();

//#region ▼ Array for HTMLinners (For using DOM manipulation once, performance purpose)
let productCardsHtml = [];
//#endregion

//#region ▼ This is function for creating product card views ( at admin part no cart button, edit and delete buttons added) ▼
function domProductCards(productArray) {
  productCardsHtml = [];

  getActive(loader);

  setTimeout(createProductCards, 1000);

  function createProductCards() {
    productArray.forEach((product) => {
      productCardsHtml.push(`<div class="product-card">
        <img class="product-image"
          src=${product.image}
          alt="Product Image"
        />
        <h1 class="product-title">${product.title}</h1>
        <p class="product-description">${product.description}</p>
        <p class="product-rating">Rating: <span class="fa fa-star checked"></span> ${
          product.rating.rate
        } (${product.rating.count})</p>
        <p class="product-price">Price: $${product.price.toFixed(2)}</p>
        <div class="edit-delete-buttons">
        <button id="edit-button" type="submit">Edit</button>
        <button id="delete-button" type="submit">Delete</button>
        </div>
      </div>`);
    });

    productCardContainer.innerHTML = productCardsHtml;
    removeActive(loader);
    editDeleteButtonActions();
  }
}
//#endregion

//#region ▼ Update-Delete button actions ▼
function editDeleteButtonActions() {
  const editButtons = document.querySelectorAll("#edit-button");
  const deleteButtons = document.querySelectorAll("#delete-button");

  editButtons.forEach((editButton) => {
    editButton.addEventListener("click", clickEditButton);
  });

  deleteButtons.forEach((deleteButton) => {
    deleteButton.addEventListener("click", clickDeleteButton);
  });

  function clickEditButton(event) {
    const productCard = event.target.parentElement.parentElement; // => Reaching parent-parent element of edit button

    const editModal = document.querySelector(".edit-modal");
    const modalImage = document.querySelector("#form-modal-image");
    const modalTitle = document.querySelector("#form-modal-title");
    const modalDescription = document.querySelector("#form-modal-description");
    const modalRating = document.querySelector("#form-modal-rating");
    const modalPrice = document.querySelector("#form-modal-price");
    const modalSaveButton = document.querySelector("#form-modal-save-button");
    const closeButton = document.querySelector(".close");

    modalImage.src = productCard.querySelector("img").src;
    modalTitle.value = productCard.querySelector("h1").innerText;
    modalDescription.value = productCard.querySelectorAll("p")[0].innerText;
    modalRating.value = productCard.querySelector(
      "p:nth-child(4) span"
    ).parentElement.innerText;
    modalPrice.value = productCard.querySelector("p:nth-child(5)").innerText;

    editModal.style.display = "block";

    // ▼ Find product that will be updated
    let findProductIndex = products.findIndex(
      (product) => product.image === productCard.querySelector("img").src
    );
    let findProduct = products[findProductIndex];

    modalSaveButton.addEventListener("click", saveEdit);

    // ▼ Changing product values according to modal values
    function saveEdit() {
      findProduct.title = modalTitle.value;
      findProduct.description = modalDescription.value;
      findProduct.price = modalPrice.value;

      editModal.style.display = "none";
    }

    closeButton.onclick = () => {
      editModal.style.display = "none";
    };

    window.onclick = function (event) {
      if (event.target == editModal) {
        editModal.style.display = "none";
      }
    };
  }

  function clickDeleteButton(event) {
    const deleteModal = document.querySelector(".delete-button-modal");
    const productCard = event.target.parentElement.parentElement;
    deleteModal.style.display = "flex";

    const answerYes = document.querySelector("#delete-modal-yes");
    const answerNo = document.querySelector("#delete-modal-no");

    let findProductIndex = products.findIndex(
      (product) => product.image === productCard.querySelector("img").src
    );
    let findProduct = products[findProductIndex];

    answerYes.onclick = () => {
      products.splice(findProductIndex, 1);

      domProductCards(products);

      deleteModal.style.display = "none";
    };

    answerNo.onclick = () => {
      deleteModal.style.display = "none";
    };
  }
}
//#endregion

// ▼ Initialize ▼
renderProducts(domProductCards(products), domFilterArea(products));
const filter = new FilterOperations(domProductCards);
filter.actions();
