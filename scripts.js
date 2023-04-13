const productsData = [
    [
        { id: 1, name: "Large Grade Brown Eggs (12 ct)", price: 6, img: 'products/eggs.png' },
        { id: 2, name: "2% Milk (2 L)", price: 5, img: "products/milk.png" },
        { id: 3, name: "1% Milk (2 L)", price: 5, img: "products/milk1.png" },
        { id: 4, name: "Almond Milk", price: 4, img: "products/almondMilk.png" },
        { id: 5, name: "Original Balkan Natural Yogurt (750 g)", price: 5, img: "products/yugert.png" },

      // ...
    ],
    [
      { id: 6, name: "Thickly Sliced Italian-Style White Bread ", price: 4 , img: "products/wbread.png" },
      { id: 7, name: "Bagel Everything (480 g)", price: 3.25 , img: "products/bagel.png" },
    ],
    [
      { id: 8, name: "Extra Lean Ground Sirloin (454 g)", price: 10, img: "products/gmeat.png" },
      { id: 9, name: "Free From Shoulder Chops Lamb (ct)", price: 12 , img: "products/lamb.png" },
      { id: 10, name: "Breast Boneless Chicken (1 ct)", price: 13.5 , img: "products/cbreast.png"},
      { id: 11, name: "kinless Boneless Chicken Thighs (1 ct)", price: 13.5 , img: "products/cshop.png" },
      { id: 12, name: "Skinless Boneless Seasoned Chicken Breast Fillets (1 ct)", price: 13.5 , img: "products/cbreastS.png" },
      
      
      // ...
    ],
    [
      { id: 13, name: "Natural Spring Water 24 Pack (500 ml)", price: 5 , img: "products/water.png" },
      { id: 14, name: "PJuice Orange Without Pulp (1.54 L)", price: 6 , img: "products/orangej.png" },

      // ...
    ]
    ];

  
  function changeCategory(categoryIndex) {
    console.log('Changing category to:', categoryIndex); // Debugging: log the categoryIndex
  
    const productsDiv = document.getElementById("products");
    productsDiv.innerHTML = "";
  
    const products = productsData[categoryIndex];
    console.log('Products for this category:', products); // Debugging: log the products array
  
    products.forEach(product => {
      const productDiv = document.createElement("div");
      productDiv.className = "product";
      productDiv.innerHTML = `
          <h3>${product.name}</h3>
          <img src="${product.img}" alt="${product.name}" />
          <p>Price: $${product.price}</p>
          <button onclick="addToPackage(${product.id}, '${product.name}', ${product.price})">Add to Package</button>
      `;
      productsDiv.appendChild(productDiv);
    });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    changeCategory(0);
  
    // Add event listener for category buttons
    document.getElementById("categories").addEventListener("click", function (event) {
      const target = event.target;
  
      const categoryIndex = target.getAttribute("data-category");
  
      if (categoryIndex !== null) {
        changeCategory(parseInt(categoryIndex));
      }
    });
  
    // Add event listeners for done and order buttons
    document.getElementById("done").addEventListener("click", done);
    document.getElementById("order").addEventListener("click", order);
  });
  
  let packageItems = [];
  let totalPrice = 0;
  let packages = [];
  
  function addToPackage(id, name, price) {
    if (totalPrice + price > 35) {
      alert("Adding this product will exceed the $35 limit.");
      return;
    }
  
    const packageDiv = document.getElementById("package");
    const packageItem = document.createElement("div");
    packageItem.className = "package-item";
    packageItem.innerHTML = `${name} - $${price} `;
  
    let removeButton = document.createElement('button');
    removeButton.classList.add('button', 'remove-from-package');
    removeButton.setAttribute('onclick', `removeFromPackage(${id}, '${name}', ${price}, this, ${packageItems.length})`);
    removeButton.textContent = '';
    packageItem.appendChild(removeButton);
  
    packageDiv.appendChild(packageItem);
  
    // Create a new object with the product data
    const product = { id, name, price };
  
    packageItems.push(product);
    totalPrice += price;
  
    // Update total price display
    document.getElementById("totalPrice").textContent = totalPrice;
  }

  function removeFromPackage(id, name, price, element, index) {
    element.parentElement.remove();
    packageItems.splice(index, 1); // Use splice to remove the product at the specified index
    totalPrice -= price;
  
    document.getElementById("totalPrice").textContent = totalPrice;
  }
  
  function done() {
    if (totalPrice < 30 || totalPrice > 35) {
      alert("The total price must be between $30 and $35.");
      return;
    }
  
    if (packages.length >= 3) {
      alert("You can only order a maximum of three packages.");
      return;
    }
  
    const cartDiv = document.getElementById("cart");
    const packageDiv = document.createElement("div");
    packageDiv.className = "package";
    packageItems.forEach(item => {
      const packageItem = document.createElement("div");
      packageItem.className = "package-item small";
      packageItem.innerHTML = `${item.name} - $${item.price}`;
      packageDiv.appendChild(packageItem);
    });
  
    const removeButton = document.createElement("button");
    removeButton.classList.add('button', 'remove-from-package');
    removeButton.addEventListener("click", () => {
      cartDiv.removeChild(packageDiv);
      packages = packages.filter(p => p !== packageItems);
      // Update the number of packages in the array
      packages.length--;
    });
    packageDiv.appendChild(removeButton);
  
    cartDiv.appendChild(packageDiv);
  
    packages.push(packageItems);
    packageItems = [];
    totalPrice = 0;
  
    document.getElementById("package").innerHTML = "";
    document.getElementById("totalPrice").textContent = 0;
  }
  
  function order() {
    if (packages.length < 1 || packages.length > 3) {
      alert("You must have between 1 and 3 packages to submit an order.");
      return;
    }
  
    // Send packages to the backend
    fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ packages })
    })
    .then(response => {
        if (response.ok) {
          // Download the image of the cart
          window.open("/api/orders/image");
        } else {
          response.text().then(text => {
            alert("Error: " + text);
          });
        }
      })
  
      .catch(err => {
        console.error("Fetch error:", err); // Add this line
        alert("There was an error submitting your order.");
      });
  
  }
  