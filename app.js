const produtos = [
  { id: 1, nome: "Pastel de queijo", categoria: "pastel", descricao: "Queijo derretido e massa crocante.", preco: 8.5, arte: "art-queijo", imagem: "assets/products/pastel-queijo.png" },
  { id: 2, nome: "Pastel de carne", categoria: "pastel", descricao: "Carne temperada no ponto certo.", preco: 9.5, arte: "art-carne", imagem: "assets/products/pastel-carne.png" },
  { id: 3, nome: "Pastel de frango", categoria: "pastel", descricao: "Frango cremoso com tempero da casa.", preco: 9.5, arte: "art-frango", imagem: "assets/products/pastel-frango.png" },
  { id: 4, nome: "Pastel especial", categoria: "pastel", descricao: "Queijo, carne e um toque especial.", preco: 12.5, arte: "art-pastel", imagem: "assets/products/pastel-especial.png" },
  { id: 5, nome: "Coca-Cola lata", categoria: "bebida", descricao: "Lata gelada de 350 ml.", preco: 6, arte: "art-coca", imagem: "assets/products/coca-cola.png" },
  { id: 6, nome: "Suco de laranja", categoria: "bebida", descricao: "Suco natural e bem geladinho.", preco: 7, arte: "art-suco", imagem: "assets/products/suco-laranja.png" },
  { id: 7, nome: "Guaraná lata", categoria: "bebida", descricao: "Lata gelada de 350 ml.", preco: 5.5, arte: "art-guarana", imagem: "assets/products/guarana.png" },
  { id: 8, nome: "Água mineral", categoria: "bebida", descricao: "Água mineral sem gás, 500 ml.", preco: 3.5, arte: "art-agua", imagem: "assets/products/agua-mineral.png" }
];

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const money = value => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const getCart = () => JSON.parse(localStorage.getItem("pastel-cart") || "[]");
const saveCart = cart => localStorage.setItem("pastel-cart", JSON.stringify(cart));
const normalizeEmail = email => String(email || "").trim().toLowerCase();
const getUsers = () => {
  const saved = JSON.parse(localStorage.getItem("pastel-users") || "[]");
  if (saved.length) return saved;
  const legacy = JSON.parse(localStorage.getItem("pastel-user") || "null");
  return legacy?.email ? [legacy] : [];
};
const saveUsers = users => localStorage.setItem("pastel-users", JSON.stringify(users));
const getSession = () => JSON.parse(localStorage.getItem("pastel-session") || "null");
const getUser = () => {
  const session = getSession();
  if (!session?.email) return null;
  return getUsers().find(user => normalizeEmail(user.email) === normalizeEmail(session.email)) || null;
};
const orderStorageKey = () => {
  const user = getUser();
  return user ? `pastel-orders-${normalizeEmail(user.email)}` : null;
};
const getOrders = () => { const key = orderStorageKey(); return key ? JSON.parse(localStorage.getItem(key) || "[]") : []; };
const saveOrders = orders => { const key = orderStorageKey(); if (key) localStorage.setItem(key, JSON.stringify(orders)); };

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("pastel-theme", theme);
  const toggle = $("#theme-toggle");
  if (toggle) { toggle.textContent = theme === "dark" ? "Modo claro" : "Modo escuro"; toggle.setAttribute("aria-label", theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"); }
}

function initTheme() {
  setTheme(localStorage.getItem("pastel-theme") || "light");
  $("#theme-toggle")?.addEventListener("click", () => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
}

function initNavigation() {
  const menu = $("#mobile-menu");
  const nav = $("#main-nav");
  menu?.addEventListener("click", () => {
    nav?.classList.toggle("open");
    menu.textContent = nav?.classList.contains("open") ? "×" : "☰";
  });
  $$(".main-nav a").forEach(link => link.addEventListener("click", () => nav?.classList.remove("open")));
}

function initModal() {
  const modal = $("#login-modal");
  const openButtons = $$("[data-open-login]");
  const close = () => { modal?.classList.remove("show"); document.body.classList.remove("modal-aberto"); };
  const open = () => { modal?.classList.add("show"); document.body.classList.add("modal-aberto"); $("#login-email")?.focus(); };
  openButtons.forEach(button => button.addEventListener("click", open));
  $$("[data-close-modal]").forEach(button => button.addEventListener("click", close));
  modal?.addEventListener("click", event => { if (event.target === modal) close(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
  $("#login-form")?.addEventListener("submit", event => {
    event.preventDefault();
    const email = normalizeEmail($("#login-email").value);
    const senha = $("#login-password").value.trim();
    if (!email || !senha) return showToast("Preencha seu e-mail e sua senha.");
    const saved = getUsers().find(user => normalizeEmail(user.email) === email && user.senha === senha);
    if (!saved) return showToast("E-mail ou senha inválidos.");
    localStorage.setItem("pastel-session", JSON.stringify({ nome: saved.nome, email: saved.email }));
    close();
    showToast(`Pronto, ${saved.nome.split(" ")[0]}! Login realizado.`);
    setTimeout(() => window.location.reload(), 500);
  });
}

function initSessionUi() {
  const user = getUser();
  $$('[data-open-login]').forEach(button => {
    if (!user) return;
    button.textContent = `Sair (${user.nome.split(" ")[0]})`;
    button.removeAttribute("data-open-login");
    button.addEventListener("click", () => { localStorage.removeItem("pastel-session"); window.location.href = "index.html"; });
  });
}

function onlyNumbers(input) { input.value = input.value.replace(/\D/g, ""); }
function maskCPF(value) { return value.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"); }
function maskPhone(value) { return value.replace(/\D/g, "").slice(0, 11).replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2"); }
function maskCEP(value) { return value.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2"); }

function initMasks() {
  $$('[data-mask="cpf"]').forEach(input => input.addEventListener("input", () => input.value = maskCPF(input.value)));
  $$('[data-mask="phone"]').forEach(input => input.addEventListener("input", () => input.value = maskPhone(input.value)));
  $$('[data-mask="cep"]').forEach(input => input.addEventListener("input", () => input.value = maskCEP(input.value)));
  $$('[data-numeric="true"]').forEach(input => input.addEventListener("input", () => onlyNumbers(input)));
}

function initSignup() {
  const form = $("#signup-form");
  if (!form) return;
  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.nome || !data.email || !data.senha || data.senha.length < 6) return showToast("Preencha os campos obrigatórios. A senha deve ter 6 caracteres.");
    data.email = normalizeEmail(data.email);
    const users = getUsers();
    if (users.some(user => normalizeEmail(user.email) === data.email)) return showToast("Este e-mail já possui uma conta.");
    users.push(data);
    saveUsers(users);
    localStorage.setItem("pastel-session", JSON.stringify({ nome: data.nome, email: data.email }));
    showToast("Cadastro realizado! Seu perfil está pronto.");
    setTimeout(() => window.location.href = "perfil.html", 700);
  });
}

function fillUserForm(user, form) {
  Object.entries(user).forEach(([key, value]) => { const field = form.elements[key]; if (field) field.value = value || ""; });
}

function productCard(product) {
  return `<article class="product-card"><div class="product-visual ${product.arte}"><img class="product-image" src="${product.imagem}" alt="${product.nome}" loading="lazy"></div><div class="product-info"><h3>${product.nome}</h3><p>${product.descricao}</p><div class="product-bottom"><span class="price">${money(product.preco)}</span><button class="btn btn-primary btn-small" data-add-product="${product.id}">Adicionar</button></div></div></article>`;
}

function addToCart(id) {
  const cart = getCart();
  const item = cart.find(product => product.id === id);
  if (item) item.quantidade += 1;
  else cart.push({ id, quantidade: 1 });
  saveCart(cart);
  showToast("Item adicionado ao carrinho.");
}

function initProducts() {
  const grid = $("#product-grid");
  if (!grid) return;
  let category = "todos";
  const render = () => {
    const query = ($("#product-search")?.value || "").toLowerCase().trim();
    const filtered = produtos.filter(product => (category === "todos" || product.categoria === category) && `${product.nome} ${product.descricao}`.toLowerCase().includes(query));
    grid.innerHTML = filtered.length ? filtered.map(productCard).join("") : '<div class="empty-state">Não encontramos esse sabor. Tente outra busca.</div>';
    $$('[data-add-product]', grid).forEach(button => button.addEventListener("click", () => addToCart(Number(button.dataset.addProduct))));
  };
  $("#product-search")?.addEventListener("input", render);
  $$("[data-filter]").forEach(button => button.addEventListener("click", () => { category = button.dataset.filter; $$("[data-filter]").forEach(item => item.classList.remove("active")); button.classList.add("active"); render(); }));
  render();
}

function cartDetails() {
  return getCart().map(item => ({ ...item, product: produtos.find(product => product.id === item.id) })).filter(item => item.product);
}

function initCart() {
  const list = $("#cart-list");
  if (!list) return;
  const render = () => {
    const items = cartDetails();
    list.innerHTML = items.length ? items.map(({ product, quantidade }) => `<article class="cart-item"><div class="cart-thumb ${product.arte}"><img class="cart-product-image" src="${product.imagem}" alt="${product.nome}"></div><div><h3>${product.nome}</h3><p>${money(product.preco)} cada</p><div class="quantity"><button data-minus="${product.id}" aria-label="Diminuir">−</button><strong>${quantidade}</strong><button data-plus="${product.id}" aria-label="Aumentar">+</button></div></div><div class="cart-actions"><strong class="price">${money(product.preco * quantidade)}</strong><button class="remove-link" data-remove="${product.id}">Remover</button></div></article>`).join("") : '<div class="empty-state">Seu carrinho ainda está vazio.<br><a class="text-link" href="produtos.html">Ver cardápio</a></div>';
    const total = items.reduce((sum, item) => sum + item.product.preco * item.quantidade, 0);
    $("#cart-subtotal").textContent = money(total);
    $("#cart-total").textContent = money(total);
    $$('[data-plus]', list).forEach(button => button.addEventListener("click", () => changeQuantity(Number(button.dataset.plus), 1, render)));
    $$('[data-minus]', list).forEach(button => button.addEventListener("click", () => changeQuantity(Number(button.dataset.minus), -1, render)));
    $$('[data-remove]', list).forEach(button => button.addEventListener("click", () => { saveCart(getCart().filter(item => item.id !== Number(button.dataset.remove))); render(); showToast("Item removido do carrinho."); }));
  };
  $("#checkout-button")?.addEventListener("click", () => {
    const items = cartDetails();
    if (!items.length) return showToast("Adicione pelo menos um item antes de finalizar.");
    if (!getUser()) return showToast("Entre na sua conta antes de finalizar o pedido.");
    const orders = getOrders();
    const total = items.reduce((sum, item) => sum + item.product.preco * item.quantidade, 0);
    orders.unshift({ numero: `#PE${String(Date.now()).slice(-5)}`, data: new Date().toLocaleDateString("pt-BR"), itens: items.map(item => `${item.quantidade}x ${item.product.nome}`).join(", "), total, status: "Em preparo" });
    saveOrders(orders);
    saveCart([]);
    showToast("Pedido recebido! Acompanhe em Meus pedidos.");
    setTimeout(() => window.location.href = "pedidos.html", 700);
  });
  render();
}

function changeQuantity(id, amount, callback) {
  const cart = getCart();
  const item = cart.find(product => product.id === id);
  if (!item) return;
  item.quantidade += amount;
  saveCart(cart.filter(product => product.quantidade > 0));
  callback();
}

function exportOrdersJson() {
  if (!getUser()) return showToast("Entre na sua conta para exportar os pedidos.");
  const orders = getOrders();
  if (!orders.length) return showToast("Ainda não existe nenhum pedido para exportar.");
  const payload = orders.map(order => ({
    numero: order.numero,
    data: order.data,
    itens: order.itens,
    total: Number(order.total),
    status: order.status
  }));
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "pedidos.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Arquivo pedidos.json baixado com sucesso.");
}

function initOrders() {
  const list = $("#order-list");
  if (!list) return;
  $("#export-orders-json")?.addEventListener("click", exportOrdersJson);
  const user = getUser();
  if (!user) { list.innerHTML = '<div class="empty-state">Entre na sua conta para visualizar seus pedidos.<br><button class="btn btn-primary" data-open-login type="button">Entrar</button></div>'; $$('[data-open-login]', list).forEach(button => button.addEventListener("click", () => $("#login-modal")?.classList.add("show"))); return; }
  const orders = getOrders();
  list.innerHTML = orders.length ? orders.map((order, index) => `<article class="order-card"><div class="order-top"><h3>Pedido ${order.numero}</h3><span class="status ${order.status === "Cancelado" ? "cancelado" : ""}">${order.status}</span></div><p><strong>Data:</strong> ${order.data}</p><p><strong>Itens:</strong> ${order.itens}</p><div class="order-bottom"><strong class="price">${money(order.total)}</strong>${order.status !== "Cancelado" ? `<button class="btn btn-outline btn-small" style="color:var(--marrom);border-color:var(--borda)" data-cancel-order="${index}">Cancelar pedido</button>` : ""}</div></article>`).join("") : '<div class="empty-state">Você ainda não fez nenhum pedido.<br><a class="text-link" href="produtos.html">Explorar cardápio</a></div>';
  $$('[data-cancel-order]', list).forEach(button => button.addEventListener("click", () => { const current = getOrders(); current[Number(button.dataset.cancelOrder)].status = "Cancelado"; saveOrders(current); showToast("Pedido cancelado."); initOrders(); }));
}

function initProfile() {
  const form = $("#profile-form");
  if (!form) return;
  const user = getUser();
  if (!user) { showToast("Entre na sua conta para acessar o perfil."); return; }
  fillUserForm(user, form);
  const name = user.nome || "Cliente Pastel Express";
  $("#profile-name").textContent = name;
  $("#profile-email").textContent = user.email || "cliente@email.com";
  $("#profile-avatar").textContent = name.split(" ").map(word => word[0]).slice(0, 2).join("").toUpperCase();
  form.addEventListener("submit", event => { event.preventDefault(); const updated = Object.fromEntries(new FormData(form).entries()); const users = getUsers().map(item => normalizeEmail(item.email) === normalizeEmail(user.email) ? { ...item, ...updated, email: user.email } : item); saveUsers(users); showToast("Alterações salvas com sucesso."); });
  $("#delete-account")?.addEventListener("click", () => { if (confirm("Tem certeza que deseja excluir sua conta?")) { saveUsers(getUsers().filter(item => normalizeEmail(item.email) !== normalizeEmail(user.email))); localStorage.removeItem(`pastel-orders-${normalizeEmail(user.email)}`); localStorage.removeItem("pastel-session"); showToast("Conta excluída."); setTimeout(() => window.location.href = "index.html", 700); } });
}

function init() {
  initTheme(); initNavigation(); initModal(); initSessionUi(); initMasks(); initSignup(); initProducts(); initCart(); initOrders(); initProfile();
}

document.addEventListener("DOMContentLoaded", init);
