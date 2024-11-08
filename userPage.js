"use strict";

//#region ▼ Defining elements for DOM processes ▼
const loader = document.querySelector(".loader");
const productCardContainer = document.querySelector(".product-card-container");
const categories = document.querySelector(".filter-checkboxes.category");
const priceRangeValue = document.querySelector("#slider-price-value");
const shoppingCardCount = document.querySelector("#cart-count");
const shoppingCartIcon = document.querySelector("#shopping-cart");
//#endregion

//#region ▼ I will manage my requests on fakestoreapi here with class aproach ▼
export class FakeStoreApi {
  constructor() {
    this.baseUrl = "https://fakestoreapi.com/"; // -> For next possible api operations I defined baseurl
  }

  // ▼ Getting products asynchronous ▼
  async getProducts() {
    try {
      const response = await fetch(this.baseUrl + "products");
      if (!response.ok) {
        throw new Error(`There is error at response :${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error.message);
    }
  }
}
//#endregion

//# ▼ Creating instance of fakestoreapi and fetching products ▼
const api = new FakeStoreApi();
const products = await api.getProducts();

//#region ▼ Array for HTMLinners (For using DOM manipulation once, performance purpose)
let productCardsHtml = [];
let filterCategoryHtml = [];
let productPrices = [];
//#endregion

//#region ▼ Render processes below -> in this case product cards and filter area for now, I made this with callback way cause of I will use this function as another js file as well ▼
export function renderProducts(...renderCalbacks) {
  renderCalbacks.forEach((renderCallback) => {
    if (typeof renderCallback === "function") {
      renderCallback();
    }
  });
}
//#endregion

//#region ▼ This is function for creating product card views ▼
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
        <button class="button-add-to-cart" type="submit">Add to cart</button>
      </div>`);
    });
    productCardContainer.innerHTML = productCardsHtml;
    removeActive(loader);
    try {
      if(shoppingCartIcon!=null){
      setupShoppingCart(); //-> I m calling this here cause of I will use button elements so I cant call before creation
      }
    } catch (error) {
      console.log("testcatch");
    }
  }
}
//#endregion

//#region ▼ This is function for creating filter side at left on page ▼
export function domFilterArea(productArray) {
  productArray.forEach((product) => {
    if (
      !filterCategoryHtml.includes(
        `<label class="category-label"><input class="category-checkbox" type="checkbox"/>${product.category}</label>`
      )
    ) {
      filterCategoryHtml += `<label class="category-label"><input class="category-checkbox" type="checkbox"/>${product.category}</label>`;
    }

    productPrices.push(product.price); // -> For price slider setup
  });

  // ▼ Category field setup ▼
  categories.innerHTML = "<h3>Category</h3>" + filterCategoryHtml;

  // ▼ Price Slider Settings ▼
  priceRange.min = Math.min(...productPrices);
  priceRange.max = Math.max(...productPrices);

  priceRange.value = Math.round(Math.max(...productPrices) / 2);
  // priceRangeValue.innerText = "$" + Math.round(Math.max(...productPrices) / 2);

  priceRange.addEventListener("input", () => {
    priceRangeValue.innerText = "$" + priceRange.value;
  });
}
//#endregion

//#region ▼ Shopping Cart Processes ▼
const setupShoppingCart = () => {
  let count = 0;
  let addedProduct = [];
  let productCount = {};

  

  // -> Geting add chart buttons
  const addChartButtons = document.querySelectorAll(".button-add-to-cart");

  // -> With click record product name and count for viewing in cart at navbar
  addChartButtons.forEach((addChartButton) =>
    addChartButton.addEventListener("click", (event) => {
      
      const cartCount = document.querySelector("#cart-count")
      cartCount.style.display="block";

      const parentElementTitle =
        event.currentTarget.parentElement.querySelector("h1").innerText; //-> I took this for showing on cart view

      // -> Checking product added or not, if added raise count
      if (!addedProduct.includes(parentElementTitle)) {
        addedProduct.push(parentElementTitle);
        productCount[parentElementTitle] = 1;
      } else {
        productCount[parentElementTitle] += 1;
      }

      count += 1;
      shoppingCardCount.innerText = count; // For showing total product count in cart at navbar
    })
  );

  // -> Cart modal (with click to navbar) elements
  const cartModal = document.querySelector("#cartModal");
  const cartView = document.querySelector(".cart-details");
  const closingSpan = document.querySelector(".close");
  

  // -> With click navbar cart
  shoppingCartIcon.addEventListener("click", (event) => {
    event.preventDefault();

    // -> Setup inner html of model content with I recorded add to chart actions above
    let cartContent = "<ul>";
    addedProduct.forEach((product) => {
      cartContent += `<li>${product}, Count: ${productCount[product]}</li>`;
    });
    cartContent +=
      "</ul> <input class='cart-button' type='button' value='Go to payment'>";

    cartView.innerHTML = cartContent;

    cartModal.style.display = "block";


  });

  // -> Closing the modal with click 'x'
  closingSpan.onclick = function () {
    cartModal.style.display = "none";
  };

  // -> Closing the modal if user clicks outside of it
  window.onclick = function (event) {
    if (event.target == cartModal) {
      cartModal.style.display = "none";
    }
  };
};
//#endregion

//#region ▼ Functions for adding elements active-deactive class (display or not status )  ▼
export const getActive = (element) => {
  element.classList.add("active");
};

export const removeActive = (element) => {
  element.classList.remove("active");
};
//#endregion

//#region ▼ I manage my filter operations below with class approach ▼
export class FilterOperations {
  constructor(domProductCardsCallback){ // -> I did this for another js file import actions. I m using different domproduct process in another {
    this.domProductCards=domProductCardsCallback;
    this.categoryCheckBoxLabels = document.querySelectorAll(".category-label");
    this.ratingCheckBoxes = document.querySelectorAll(".rating-checkbox");
    this.priceRange = document.querySelector("#priceRange");

    // -> For combining filter actions
    this.filteredByCategory = [...products];
    this.filteredByRating = [...products];
    this.filteredByPrice = [...products];
  }

  filterHandler = () => {
    this.filterCategory();
    this.filterRating();
    this.filterPrice();
    this.combineFilters();
  };

  // -> In this class group all action events
  actions = () => {
    this.categoryCheckBoxLabels.forEach((label) => {
      let checkbox = label.querySelector(".category-checkbox");
      checkbox.addEventListener("change", this.filterHandler);
    });

    this.ratingCheckBoxes.forEach((checkbox) => {
      checkbox.addEventListener("change", this.filterHandler);
    });

    this.priceRange.addEventListener("change", this.filterHandler);
  };

  filterCategory = () => {
    const selectedCategories = Array.from(this.categoryCheckBoxLabels)
      .filter((label) => label.querySelector(".category-checkbox").checked)
      .map((label) => label.textContent);

    // console.log("Selected Categories:", selectedCategories);
    // // -> For debugging

    if (selectedCategories.length > 0) {
      this.filteredByCategory = products.filter((product) =>
        selectedCategories.includes(product.category)
      );
    }
    else{
      this.filteredByCategory=[...products]
    }

    // console.log("Filtered by Category:", this.filteredByCategory); // -> For debugging
  };

  filterRating = () => {
    const fiveStarCheckBox = document.querySelector("#five-star");
    const fourStarCheckBox = document.querySelector("#four-star");
    const threeStarCheckBox = document.querySelector("#three-star");
    const twoStarCheckBox = document.querySelector("#two-star");
    const oneStarCheckBox = document.querySelector("#one-star");

    let stars = []; // I will manage rating filter from here

    if (fiveStarCheckBox.checked) {
      if (!stars.includes(5)) {
        stars.push(5);
      }
    }
    if (fourStarCheckBox.checked) {
      if (!stars.includes(4)) {
        stars.push(4);
      }
    }
    if (threeStarCheckBox.checked) {
      if (!stars.includes(3)) {
        stars.push(3);
      }
    }
    if (twoStarCheckBox.checked) {
      if (!stars.includes(2)) {
        stars.push(2);
      }
    }
    if (oneStarCheckBox.checked) {
      if (!stars.includes(1)) {
        stars.push(1);
      }
    }

    // console.log("Selected Stars:", stars); -> For debugging

    // -> Filtered products according to rating checkboxes from using stars array
    if (stars.length > 0) {
      this.filteredByRating = products.filter(
        (product) => product.rating.rate >= Math.min(...stars)
      );
    }

    else{
      this.filteredByRating=[...products]
    }
    // console.log("Filtered by Rating:", this.filteredByRating); -> For debugging
  };

  filterPrice = () => {
    const maxPrice = this.priceRange.value;
    this.filteredByPrice = products.filter(
      (product) => product.price <= maxPrice
    );

    // console.log("Filtered by Price:", this.filteredByPrice); -> For debugging
  };

  // -> This function for multiple filter operations like category & Rating & Price
  combineFilters = () => {
    const combinedFilteredProducts = products.filter(
      (product) =>
        this.filteredByCategory.includes(product) &&
        this.filteredByRating.includes(product) &&
        this.filteredByPrice.includes(product)
    );

    // console.log("Combined Filtered Products:", combinedFilteredProducts); -> For debugging

    this.domProductCards(combinedFilteredProducts); // -> Create product cards according to combine filter operations
  };
}
//#endregion

// ▼ Initialize ▼
renderProducts(domProductCards(products), domFilterArea(products));
const filter = new FilterOperations(domProductCards);
filter.actions();
