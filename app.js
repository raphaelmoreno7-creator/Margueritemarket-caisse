let cart=[];let selectedMethod=null;let saleNumber=Number(localStorage.getItem("mm_sale_number")||0)+1;

const $=id=>document.getElementById(id);
const money=n=>n.toLocaleString("fr-FR",{style:"currency",currency:"EUR"});
function findProduct(code){return PRODUCTS.find(p=>p.code===String(code).trim())}
function render(){
  const el=$("cart");
  if(!cart.length){el.className="cart empty";el.textContent="Aucun article dans le panier."}
  else{
    el.className="cart";
    el.innerHTML=cart.map((x,i)=>`<div class="cart-row">
      <div><div class="product-name">${x.name}</div><div class="code">Code ${x.code}</div></div>
      <div class="qty"><button onclick="changeQty(${i},-1)">−</button><b>${x.qty}</b><button onclick="changeQty(${i},1)">+</button></div>
      <div class="price">${money(x.price*x.qty)}</div>
      <button class="remove" onclick="removeItem(${i})">Supprimer</button>
    </div>`).join("");
  }
  const count=cart.reduce((s,x)=>s+x.qty,0), total=cart.reduce((s,x)=>s+x.price*x.qty,0);
  $("itemCount").textContent=count;$("subtotal").textContent=money(total);$("total").textContent=money(total);
  $("payBtn").disabled=total<=0;
}
function addProduct(){
  const code=$("codeInput").value.trim();
  const p=findProduct(code);
  if(!p){$("message").textContent="❌ Code inconnu. Vérifie le code produit.";return}
  const existing=cart.find(x=>x.code===p.code);
  if(existing) existing.qty++; else cart.push({...p,qty:1});
  $("message").textContent=`✅ ${p.name} ajouté — ${money(p.price)}`;
  $("codeInput").value="";$("codeInput").focus();render();
}
function changeQty(i,d){cart[i].qty+=d;if(cart[i].qty<=0)cart.splice(i,1);render()}
function removeItem(i){cart.splice(i,1);render()}
function total(){return cart.reduce((s,x)=>s+x.price*x.qty,0)}
function openPayment(){
  $("paymentTotal").textContent=money(total());$("paymentModal").classList.remove("hidden");
  selectedMethod=null;document.querySelectorAll(".methods button").forEach(b=>b.classList.remove("selected"));
  $("cashArea").classList.add("hidden");$("confirmPay").disabled=true;$("paymentStatus").textContent="";
}
function selectMethod(method,button){
  selectedMethod=method;document.querySelectorAll(".methods button").forEach(b=>b.classList.remove("selected"));button.classList.add("selected");
  $("cashArea").classList.toggle("hidden",method!=="Espèces");
  $("confirmPay").disabled=method==="Espèces";
  if(method!=="Espèces")$("confirmPay").disabled=false;
}
function confirmPayment(){
  if(!selectedMethod)return;
  if(selectedMethod==="Espèces"){
    const received=Number($("cashInput").value||0), t=total();
    if(received<t){$("paymentStatus").textContent="❌ Montant insuffisant.";return}
  }
  $("paymentStatus").textContent="⏳ Transaction en cours…";
  $("confirmPay").disabled=true;
  setTimeout(()=>{
    const received=Number($("cashInput").value||0), t=total();
    const change=selectedMethod==="Espèces"?Math.max(0,received-t):0;
    $("paymentModal").classList.add("hidden");
    showReceipt(change);
  },900);
}
function showReceipt(change){
  const now=new Date();
  const lines=cart.map(x=>`<div class="receipt-line"><span>${x.qty} × ${x.name}</span><span>${money(x.qty*x.price)}</span></div>`).join("");
  $("receipt").innerHTML=`<div class="receipt">
    <h2>🌼 MARGUERITEMARKET</h2><div class="center">PAPETERIE · CAISSE 01</div>
    <div class="center">${now.toLocaleDateString("fr-FR")} ${now.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
    <hr>${lines}<div class="receipt-line receipt-total"><span>TOTAL</span><span>${money(total())}</span></div>
    <div class="receipt-line"><span>Paiement</span><span>${selectedMethod}</span></div>
    ${selectedMethod==="Espèces"?`<div class="receipt-line"><span>Monnaie</span><span>${money(change)}</span></div>`:""}
    <p class="center"><b>PAIEMENT ACCEPTÉ</b></p><p class="center">Merci de votre visite 🌼<br>Ticket n° MM-${String(saleNumber).padStart(5,"0")}</p>
  </div>`;
  localStorage.setItem("mm_sale_number",saleNumber);saleNumber++;
  $("receiptModal").classList.remove("hidden");
}
$("addBtn").onclick=addProduct;
$("codeInput").addEventListener("keydown",e=>{if(e.key==="Enter")addProduct()});
$("payBtn").onclick=openPayment;
$("cancelBtn").onclick=()=>{if(confirm("Annuler la vente en cours ?")){cart=[];render();$("message").textContent="Vente annulée."}};
$("closePayment").onclick=()=>$("paymentModal").classList.add("hidden");
document.querySelectorAll(".methods button").forEach(b=>b.onclick=()=>selectMethod(b.dataset.method,b));
$("cashInput").oninput=()=>{const diff=Number($("cashInput").value||0)-total();$("change").textContent=diff>=0?`Monnaie : ${money(diff)}`:"Montant insuffisant";$("confirmPay").disabled=diff<0};
$("confirmPay").onclick=confirmPayment;
$("newSale").onclick=()=>{$("receiptModal").classList.add("hidden");cart=[];render();$("message").textContent="Nouvelle vente prête.";$("codeInput").focus()};
function clock(){const d=new Date();$("clock").textContent=d.toLocaleDateString("fr-FR")+" · "+d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
setInterval(clock,1000);clock();render();
