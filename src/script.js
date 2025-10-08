
// Get all variables needed.
const cartContainer = document.querySelector(".cart-items-wrapper");
const productsContainer = document.querySelector(".products");
const cartEmpty = document.querySelector(".empty-cart");
const cartFilled = document.querySelector(".filled-cart");
const confirmedSection = document.querySelector(".confirmed-section");
let confirmedItems = document.querySelector(".confirmed-items");

let basket = JSON.parse(localStorage.getItem("CART")) || [];

// FetchData
const fetchData = async ()=> {
    const response = await fetch("./data.json");
    const data = await response.json();
    let products = [];
    let count = 0;

    data.map((x)=> {
        count ++;
        products.push({
            ...x,
            id: count,
        })
    })

    return products;
};
fetchData();

// Render products
let renderProducts = async ()=> {
    let data = await fetchData();
    productsContainer.innerHTML = "";
    if(data !== undefined){
        data.forEach((x)=> {
            let { name, category, image, price, id } = x;
            let search = basket.find((y)=> y.id === id) || [];
            productsContainer.innerHTML += `
            <div class="product" id="${id}">
            <div class="image-wrapper">
                <img src="${image.desktop}" alt="">
                <button class="addToCartBtn" onClick="addToCart(${id})">
                    <span><img src="./assets/images/icon-add-to-cart.svg" alt=""></span>
                    Add to Cart
                </button>
                <div class="product-qty-btns">
                    <img src="./assets/images/icon-decrement-quantity.svg" alt="" class="decrement-btn" onClick="decrement(${id})">
                    <span class="product-qty">${search === undefined ? 0 : search.units}</span>
                    <img src="./assets/images/icon-increment-quantity.svg" alt="" class="increment-btn" onClick="increment(${id})">
                </div>
            </div>
            <div class="details-wrapper">
            <div class="name">${category}</div>
            <div class="desc">${name}</div>
            <div class="price">$<span>${price}</span></div>
        </div>
            `
        })
    }

     bntsToggle();

}
renderProducts()

// Cart Toggle
let cartToggle = ()=> {
    if(basket.length !== 0){
        cartFilled.style.display = "block";
        cartEmpty.style.display = "none";
    } else {
        cartFilled.style.display = "none";
        cartEmpty.style.display = "block";
    }
}

// Quantity buttons Toggle
let bntsToggle = ()=> {
    basket.map((x)=> {
        if(x.active === true){
        let product = document.getElementById(x.id);
        let qtyBtns = product.querySelector(".product-qty-btns");
        let addToCartBtn = product.querySelector(".addToCartBtn");
        let imageWrapper = addToCartBtn.parentElement;

        imageWrapper.classList.add("border");
        addToCartBtn.style.display = "none";
        qtyBtns.style.display = "flex";
        }
    })
}

// Add To Cart
let addToCart = async (id)=> {
    const products = await fetchData();
    let item = products.find((x)=> x.id === id);
    let search = basket.find((x)=> x.id === id);
    
    if(search === undefined){
        basket.push({
            ...item,
            units: 1,
            active: true,
        });

        let product = document.getElementById(item.id);
        let qtyBtns = product.querySelector(".product-qty-btns");
        let addToCartBtn = product.querySelector(".addToCartBtn");

        let imageWrapper = addToCartBtn.parentElement;
        imageWrapper.classList.add("border");
        addToCartBtn.style.display = "none";
        qtyBtns.style.display = "flex";
        
        update(id);
        bntsToggle();
        calculateTotalCount();
        renderCartProducts();
        localStorage.setItem("CART", JSON.stringify(basket));
    } else {
        bntsToggle();
    }
}

// Increment.
let increment = (id)=> {
    let search = basket.find((x)=> x.id === id);
    if(search !== undefined){
        search.units += 1;

    }
    update(id);
    calculateTotalCount();
    localStorage.setItem("CART", JSON.stringify(basket));
}

// Decrement
let decrement = (id)=> {
    let search = basket.find((x)=> x.id === id);
    if(search !== undefined){
        if(search.units > 1){
            search.units -= 1;
        } else {
            return;
        }
    }

    update(id);
    calculateTotalCount();
    localStorage.setItem("CART", JSON.stringify(basket));
}

// Update the qty element.
let update = (id)=> {
    let search = basket.find((x)=> x.id === id);
    let product = document.getElementById(id);
    let qtyElement = product.querySelector(".product-qty");
    qtyElement.innerText = search.units;
    renderCartProducts();
    calculateBill();
}

let calculateTotalCount = ()=> {
    let totalQtyElement = document.querySelector(".cart-amount");
    let count = basket.map((x)=> x.units).reduce((x,y)=> x+y, 0);
    totalQtyElement.innerText = `(${count})`;
}
calculateTotalCount();

// CART 
let renderCartProducts = ()=> {
    cartContainer.innerHTML = "";
    if(basket.length !== 0){
        basket.forEach((x)=> {
            let { name, units, price, id, category } = x;
            cartContainer.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-content">
                    <div class="cart-item-name">${name}</div>
                    <div class="cart-item-details">
                        <span class="cart-item-qty">${units}x</span>
                        <span class="cart-item-single-price">@ <span>$${price}</span></span>
                        <span class="cart-item-full-price">$${price * units}</span>
                    </div>
                </div> 
                 
                <img src="./assets/images/icon-remove-item.svg" alt="" class="delete-btn" onClick="removeItem(${id})">
            </div>
            `
        })
    } 
    calculateTotalCount();
    cartToggle();
}
renderCartProducts();

// Calculate Total Bill Amount.
let calculateBill = ()=> {
    let grandTotal = document.querySelector(".grand-total");
    let confirmedGrandTotal = document.querySelector(".confirmed-grand-total");
    if(basket.length !== 0){
        let count = basket.map((x)=> {
            return x.price * x.units;
        }).reduce((x,y)=> x+y, 0);

        grandTotal.innerText = `$${count}`;
        confirmedGrandTotal.innerText = `$${count}`;
    }
}
calculateBill();

// Remove cart Item
let removeItem = (id)=> {
    let selectedItem = id;
    basket = basket.filter((x)=> x.id !== selectedItem);

    calculateTotalCount();
    renderCartProducts();
    renderProducts();
    calculateBill();
    localStorage.setItem("CART", JSON.stringify(basket));
}

// Confirm Order.
let confirmOrder = ()=> {
    let confirmOrderBtn = document.querySelector('.confirm-order-btn');
    confirmedItems.innerHTML = "";

    confirmOrderBtn.addEventListener("click", ()=> {
          if(basket.length !== 0) {
            basket.forEach((x)=> {
            let { name, category, id, price, units, image } = x;
            confirmedItems.innerHTML += `
            <div class="confirmed-item">
            <img src="${image.thumbnail}" alt="">
            <div class="confirmed-item-details">
              <span class="confirmed-item-name">${name}</span>
              </br>
              <span class="confirmed-item-qty">${units}x</span>
              <span class="confirmed-item-price">@ $${price}</span>
            </div>
            <div class="confirmed-item-full-price">$${price * units}</div>
          </div>
            `;
          })
          }

        calculateTotalCount();
        calculateBill();
        startNewOrder();
        confirmedSection.classList.add("show");
        localStorage.setItem("CART", JSON.stringify(basket));
    })
}
confirmOrder();

// Start New Order
let startNewOrder = ()=> {
    let startNewOrderBtn = document.querySelector('.new-order-btn');
    startNewOrderBtn.addEventListener("click", ()=> {
        basket = [];
        cartToggle();
        calculateTotalCount();
        renderProducts();
        confirmedSection.classList.remove("show");
        localStorage.setItem("CART", JSON.stringify(basket));
    })
}
