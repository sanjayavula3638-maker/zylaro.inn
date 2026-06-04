import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
apiKey: "AIzaSyBf2L33i2vcY4Yu6jPPv8OpiFema2AO4a0",
authDomain: "zylaro-952ae.firebaseapp.com",
databaseURL: "https://zylaro-952ae-default-rtdb.firebaseio.com",
projectId: "zylaro-952ae",
storageBucket: "zylaro-952ae.firebasestorage.app",
messagingSenderId: "414260819623",
appId: "1:414260819623:web:2d4d9d86cd1f242a04cd82",
measurementId: "G-2RCGB883QH"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const BOT_TOKEN = '8870004272:AAF_HLIvLkr0MxDVT4USFDerS34aRA1Xc-M';
const CHAT_ID = '6637183131';

const isCreator = true;

let cart = [];
let selectedProducts = [];
let total = 0;

if(!isCreator){
document.getElementById('adminUpload').style.display='none';
}

window.openPage2 = function(){
document.getElementById('page1').style.display='none';
document.getElementById('page2').style.display='flex';
}

window.openProducts = function(type){

document.getElementById('page2').style.display='none';
document.getElementById('page3').style.display='flex';

if(type === 'tshirts'){
document.getElementById('categoryTitle').innerText='T-SHIRTS';
}

if(type === 'printed'){
document.getElementById('categoryTitle').innerText='PRINTED T-SHIRTS';
}

}

const uploadInput = document.getElementById('uploadInput');

uploadInput.addEventListener('change', function(){

const files = this.files;

if(files.length > 0){

const productPrice = prompt("Enter T-Shirt Price");
const productName = prompt("Enter Product Name");
const productsize = prompt("Enter product size");
const productDescription = prompt("Enter Product Description");
const productColor = prompt("Enter Product Color");
const productMaterial = prompt("Enter Material");

if(productPrice === null || productPrice === ''){
alert("Price Required");
return;
}

const container = document.getElementById('productContainer');

const product = document.createElement('div');
product.classList.add('product-card');

let imageArray = [];

function loadImage(index){

const reader = new FileReader();

reader.onload = function(e){

imageArray[index] = e.target.result;

if(index === files.length - 1){
showProduct();
}

}

reader.readAsDataURL(files[index]);

}

for(let i = 0; i < files.length; i++){
loadImage(i);
}

function showProduct(){

product.innerHTML = `
<img src="${imageArray[0]}" class="main-product-image" onclick="openFullImage(this)">

<div class="product-info">

<h2>${productName}</h2>

<p>₹${productPrice}</p>

<div class="product-size">
<p><strong>Size:</strong> ${productsize}</p>
</div>

<div class="product-description">
<p>${productDescription}</p>
<p><strong>Color:</strong> ${productColor}</p>
<p><strong>Material:</strong> ${productMaterial}</p>
</div>

<p>₹${productPrice}</p>

<div class="thumbnail-container">

${imageArray.map((img,index)=>`
<img src="${img}" onclick="changeThumbnail(this,'${img}')">
`).join('')}

</div>

<button
class="small-btn"
onclick="addToCart(
'${productName}',
${productPrice},
'${productsize}',
'${productColor}',
'${productMaterial}',
'${productDescription}',
'${imageArray[0]}'
)">
ADD TO CART
</button>

</div>
`;

container.prepend(product);

}

}

});

window.changeThumbnail = function(element,image){

const productCard = element.closest('.product-card');
const mainImage = productCard.querySelector('.main-product-image');

mainImage.src = image;

}

window.openFullImage = function(img){

const imageWindow = window.open("");

imageWindow.document.write(`
<html>
<head>
<title>Product Image</title>

<style>
body{
margin:0;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
background:black;
}

img{
max-width:100%;
max-height:100%;
object-fit:contain;
}
</style>

</head>

<body>
<img src="${img.src}">
</body>

</html>
`);

}

window.addToCart = function(
productName,
price,
size,
color,
material,
description,
image
){

selectedProducts.push({
productName,
price,
size,
color,
material,
description,
image
});

cart.push(productName);

total += Number(price);

const cartButton = document.getElementById('cartButton');

cartButton.style.display = 'block';

cartButton.innerHTML = `CART<br>(${cart.length})`;

}

window.openPayment = function(){

if(cart.length === 0){
alert('Cart Empty');
return;
}

document.getElementById('paymentPopup').style.display = 'flex';

}

window.startPayment = function(){

const name = document.getElementById('customerName').value;
const phone = document.getElementById('customerPhone').value;
const address = document.getElementById('customerAddress').value;
const size = document.getElementById('customersize').value;

if(
name === '' ||
phone === '' ||
address === '' ||
size === ''
){
alert('Please Fill All Details');
return;
}

const payBtn = document.getElementById('payBtn');

payBtn.innerText = 'OPENING PHONEPE...';

const orderId = "ORD" + Date.now();

let orderItems = '';

cart.forEach((item,index)=>{

orderItems += `${index + 1}. ${item}\n`;

});

// Fire and forget to Firebase

set(
ref(db,'orders/' + orderId),
{
customerName:name,
phone:phone,
address:address,
size:size,
items:orderItems,
total:total,
status:'PENDING',
orderId:orderId,
time:new Date().toLocaleString()
}
);

const message = `
🛒 NEW ORDER RECEIVED

👤 Customer Name:
${name}

📞 Phone Number:
${phone}

📍 Delivery Address:
${address}

👔 size:
${size}

🧥 Items Ordered:
${orderItems}

💰 Total Amount:
₹${total}

🆔 Order ID:
${orderId}
`;

selectedProducts.forEach(product => {

const productMessage = `
🧥 PRODUCT DETAILS

📦 Product:
${product.productName}

💰 Price:
₹${product.price}

📏 Size:
${product.size}

🎨 Color:
${product.color}

🧵 Material:
${product.material}

📝 Description:
${product.description}
`;

fetch(
`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
chat_id:CHAT_ID,
photo:product.image,
caption:productMessage
})
}
);

});

// Fire and forget to Telegram

fetch(
`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
{
method:'POST',
headers:{
'Content-Type':'application/json'
},
body:JSON.stringify({
chat_id:CHAT_ID,
text:message,
reply_markup:{
inline_keyboard:[
[
{
text:"✅ CONFIRM",
callback_data:`success_${orderId}`
},
{
text:"❌ REJECT",
callback_data:`reject_${orderId}`
}
]
]
}
})
}
);

const upiLink =
`upi://pay?pa=7386291338@ybl&pn=SANJU&am=${total}&cu=INR`;

// Launch PhonePe

window.location.href =
`phonepe://pay?pa=7386291338@ybl&pn=SANJU&am=${total}&cu=INR`;

// Fallback button behavior

payBtn.innerText = 'payment process';

payBtn.onclick = function() {
window.location.href = upiLink;
};

document.getElementById('successText').style.display = 'block';

document.getElementById('successText').innerHTML = 'THANK YOU';

const paymentRef = ref(db,'orders/' + orderId);

onValue(paymentRef,(snapshot)=>{

if(snapshot.exists()){

const data = snapshot.val();

if(data.status === 'SUCCESS'){

document.getElementById('successText').innerHTML =
'✅ PAYMENT SUCCESSFUL ✔';

payBtn.innerText = 'PAYMENT SUCCESSFUL ✔';

payBtn.onclick = null;

payBtn.disabled = true;

}

selectedProducts.forEach(product => {

const productMessage = `
🧥 PRODUCT DETAILS

📦 Product:
${product.productName}

💰 Price:
₹${product.price}

📏 Size:
${product.size}

🎨 Color:
${product.color}

🧵 Material:
${product.material}

📝 Description:
${product.description}
`;

fetch(
`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
chat_id:CHAT_ID,
photo:product.image,
caption:productMessage
})
}
);

});

// Fire and forget to Telegram

fetch(
`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
{
method:'POST',
headers:{
'Content-Type':'application/json'
},
body:JSON.stringify({
chat_id:CHAT_ID,
text:message,
reply_markup:{
inline_keyboard:[
[
{
text:"✅ CONFIRM",
callback_data:`success_${orderId}`
},
{
text:"❌ REJECT",
callback_data:`reject_${orderId}`
}
]
]
}
})
}
);

const upiLink =
`upi://pay?pa=7386291338@ybl&pn=SANJU&am=${total}&cu=INR`;

// Launch PhonePe

window.location.href =
`phonepe://pay?pa=7386291338@ybl&pn=SANJU&am=${total}&cu=INR`;

// Fallback button behavior

payBtn.innerText = 'payment process';

payBtn.onclick = function() {
window.location.href = upiLink;
};

document.getElementById('successText').style.display = 'block';

document.getElementById('successText').innerHTML = 'THANK YOU';

const paymentRef = ref(db,'orders/' + orderId);

onValue(paymentRef,(snapshot)=>{

if(snapshot.exists()){

const data = snapshot.val();

if(data.status === 'SUCCESS'){

document.getElementById('successText').innerHTML =
'✅ PAYMENT SUCCESSFUL ✔';

payBtn.innerText = 'PAYMENT SUCCESSFUL ✔';

payBtn.onclick = null;

payBtn.disabled = true;

}

if(data.status === 'REJECTED'){

document.getElementById('successText').innerHTML =
'❌ PAYMENT REJECTED';

payBtn.innerText = 'PAYMENT FAILED';

payBtn.onclick = function() {
window.startPayment();
};

}

}

});

}