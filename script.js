const storage = {
	products: 'te_products',
	users: 'te_users',
	cart: 'te_cart',
	session: 'te_session'
};

const state = {
	products: [],
	users: [],
	cart: [],
	sessionUser: null,
	filterAvailable: false
};

const seedProducts = [
	{
		id: 'p1',
		name: 'Buzo premium',
		price: 59.99,
		image: 'assets/buzo.jpg',
		description: 'Algodon pesado, corte relajado, ideal para clima fresco.',
		available: true
	},
	{
		id: 'p2',
		name: 'Sneakers neon',
		price: 89.9,
		image: 'assets/sneakers.jpg',
		description: 'Suela liviana, acabado mate y detalles en contraste.',
		available: true
	},
	{
		id: 'p3',
		name: 'Mochila urbana',
		price: 42.5,
		image: 'assets/mochila.jpg',
		description: 'Espacio para laptop y bolsillos rapidos. Ideal para diario.',
		available: true
	}
];

const seedUsers = [
	{ id: 'u1', name: 'Admin', email: 'admin@tienda.com', password: 'admin123', role: 'admin' }
];

// DOM refs
const grid = document.getElementById('productGrid');
const productModal = document.getElementById('productModal');
const productModalBody = document.getElementById('productModalBody');
const modalOverlay = document.getElementById('modalOverlay');
const closeProductModalBtn = document.getElementById('closeProductModal');
const cartPanel = document.getElementById('cartPanel');
const cartToggle = document.getElementById('cartToggle');
const cartBadge = document.getElementById('cartBadge');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const hero = document.getElementById('hero');
const filterAvailableBtn = document.getElementById('filterAvailable');
const resetFilterBtn = document.getElementById('resetFilter');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const ctaLogin = document.getElementById('ctaLogin');
const authOverlay = document.getElementById('authOverlay');
const closeAuth = document.getElementById('closeAuth');
const authTabs = document.querySelectorAll('.tab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const adminPanelBtn = document.getElementById('adminPanelBtn');
const adminOverlay = document.getElementById('adminOverlay');
const closeAdmin = document.getElementById('closeAdmin');
const productForm = document.getElementById('productForm');
const adminProductList = document.getElementById('adminProductList');
const checkoutOverlay = document.getElementById('checkoutOverlay');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const sessionActions = document.getElementById('sessionActions');

// Utilities
const uid = () => crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random()}`;
const money = (n) => `$${n.toFixed(2)}`;

function loadState() {
	state.products = JSON.parse(localStorage.getItem(storage.products) || 'null') || seedProducts;
	state.users = JSON.parse(localStorage.getItem(storage.users) || 'null') || seedUsers;
	state.cart = JSON.parse(localStorage.getItem(storage.cart) || 'null') || [];
	state.sessionUser = JSON.parse(localStorage.getItem(storage.session) || 'null');
}

function persist() {
	localStorage.setItem(storage.products, JSON.stringify(state.products));
	localStorage.setItem(storage.users, JSON.stringify(state.users));
	localStorage.setItem(storage.cart, JSON.stringify(state.cart));
	if (state.sessionUser) {
		localStorage.setItem(storage.session, JSON.stringify(state.sessionUser));
	} else {
		localStorage.removeItem(storage.session);
	}
}

function renderProducts() {
	grid.innerHTML = '';
	const products = state.filterAvailable ? state.products.filter(p => p.available) : state.products;
	if (!products.length) {
		grid.innerHTML = '<div class="empty">No hay productos cargados todavia.</div>';
		return;
	}

	products.forEach((p) => {
		const card = document.createElement('article');
		card.className = 'product-card';
		card.dataset.id = p.id;
		card.innerHTML = `
			${p.available ? '' : '<span class="badge-out">Agotado</span>'}
			<img src="${p.image}" alt="${p.name}">
			<div class="product-info">
				<div class="product-meta">
					<strong>${p.name}</strong>
					<span class="price">${money(p.price)}</span>
				</div>
				<p class="muted">${p.description || 'Detalle no asignado aun.'}</p>
				<div class="product-meta">
					<span class="tag">Vista previa</span>
					<span class="btn-inline">Ver detalle</span>
				</div>
			</div>
		`;
		card.addEventListener('click', () => openProductModal(p.id));
		grid.appendChild(card);
	});
}

function openProductModal(id) {
	const product = state.products.find(p => p.id === id);
	if (!product) return;
	productModalBody.innerHTML = `
		<div class="modal-grid">
			<div class="modal-media">
				<img src="${product.image}" alt="${product.name}">
			</div>
			<div class="modal-info">
				<p class="pill">${product.available ? 'Disponible' : 'Agotado'}</p>
				<h3>${product.name}</h3>
				<p class="muted">${product.description || 'Sin descripcion. Edita en el panel admin.'}</p>
				<div class="modal-price">${money(product.price)}</div>
				<div class="modal-actions">
					<button class="ghost" id="modalCloseInline">Cerrar</button>
					<button class="primary" id="addToCartModal" ${product.available ? '' : 'disabled'}>Agregar al carrito</button>
				</div>
			</div>
		</div>
	`;
	modalOverlay.classList.add('show');
	productModal.classList.add('show');

	document.getElementById('modalCloseInline').onclick = closeProductModal;
	const addBtn = document.getElementById('addToCartModal');
	if (addBtn) addBtn.onclick = () => {
		addToCart(product.id);
		closeProductModal();
	};
}

function closeProductModal() {
	modalOverlay.classList.remove('show');
	productModal.classList.remove('show');
}

function toggleCart(open) {
	cartPanel.classList[open ? 'add' : 'remove']('open');
}

function addToCart(productId) {
	const product = state.products.find(p => p.id === productId);
	if (!product || !product.available) return;
	const found = state.cart.find(i => i.productId === productId);
	if (found) {
		found.qty += 1;
	} else {
		state.cart.push({ id: uid(), productId, qty: 1 });
	}
	persist();
	renderCart();
}

function renderCart() {
	cartItems.innerHTML = '';
	let total = 0;
	state.cart.forEach((item) => {
		const product = state.products.find(p => p.id === item.productId);
		if (!product) return;
		const line = product.price * item.qty;
		total += line;
		const div = document.createElement('div');
		div.className = 'cart-item';
		div.innerHTML = `
			<img src="${product.image}" alt="${product.name}">
			<div>
				<div class="cart-line">
					<strong>${product.name}</strong>
					<button class="icon-btn" data-action="remove" data-id="${item.id}">✕</button>
				</div>
				<div class="cart-line">
					<div class="qty">
						<button data-action="dec" data-id="${item.id}">-</button>
						<span>${item.qty}</span>
						<button data-action="inc" data-id="${item.id}">+</button>
					</div>
					<span class="price">${money(line)}</span>
				</div>
			</div>
		`;
		cartItems.appendChild(div);
	});

	if (!state.cart.length) {
		cartItems.innerHTML = '<div class="empty">Carrito vacio</div>';
	}

	cartTotal.textContent = money(total);
	cartBadge.textContent = state.cart.reduce((acc, item) => acc + item.qty, 0);
	persist();
}

function updateCartItem(id, action) {
	const item = state.cart.find(i => i.id === id);
	if (!item) return;
	if (action === 'inc') item.qty += 1;
	if (action === 'dec') item.qty = Math.max(1, item.qty - 1);
	if (action === 'remove') state.cart = state.cart.filter(i => i.id !== id);
	persist();
	renderCart();
}

function openAuth(tab = 'login') {
	authOverlay.classList.add('show');
	switchTab(tab);
}

function closeAuthModal() {
	authOverlay.classList.remove('show');
}

function switchTab(tab) {
	authTabs.forEach((btn) => {
		const isActive = btn.dataset.tab === tab;
		btn.classList.toggle('active', isActive);
	});
	loginForm.classList.toggle('hidden', tab !== 'login');
	registerForm.classList.toggle('hidden', tab !== 'register');
}

function login(email, password) {
	const user = state.users.find(u => u.email === email && u.password === password);
	if (!user) throw new Error('Credenciales invalidas');
	state.sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role };
	persist();
	syncSessionUI();
}

function register(name, email, password) {
	const exists = state.users.some(u => u.email === email);
	if (exists) throw new Error('Este correo ya existe');
	state.users.push({ id: uid(), name, email, password, role: 'user' });
	persist();
	login(email, password);
}

function logout() {
	state.sessionUser = null;
	persist();
	syncSessionUI();
}

function syncSessionUI() {
	const isLogged = Boolean(state.sessionUser);
	const adminVisible = isLogged && state.sessionUser.role === 'admin';
	loginBtn.classList.toggle('hidden', isLogged);
	registerBtn.classList.toggle('hidden', isLogged);
	ctaLogin.classList.toggle('hidden', isLogged);
	adminPanelBtn.classList.toggle('hidden', !adminVisible);

	// Show user chip
	const existingChip = document.getElementById('userChip');
	if (existingChip) existingChip.remove();
	if (isLogged) {
		const chip = document.createElement('button');
		chip.id = 'userChip';
		chip.className = 'ghost';
		chip.textContent = `${state.sessionUser.name} (${state.sessionUser.role}) - salir`;
		chip.onclick = logout;
		sessionActions.appendChild(chip);
	}
}

function openAdmin() {
	if (!state.sessionUser || state.sessionUser.role !== 'admin') {
		alert('Solo admin puede entrar. Usa admin@tienda.com / admin123');
		return;
	}
	adminOverlay.classList.add('show');
	renderAdminList();
}

function closeAdminModal() {
	adminOverlay.classList.remove('show');
	productForm.reset();
	productForm.querySelector('input[name="id"]').value = '';
}

function renderAdminList() {
	adminProductList.innerHTML = '';
	if (!state.products.length) {
		adminProductList.innerHTML = '<div class="empty">No hay productos, agrega uno.</div>';
		return;
	}
	state.products.forEach((p) => {
		const card = document.createElement('div');
		card.className = 'admin-card';
		card.innerHTML = `
			<div class="product-meta">
				<strong>${p.name}</strong>
				<span class="price">${money(p.price)}</span>
			</div>
			<p class="muted">${p.description || 'Sin descripcion'}</p>
			<p class="muted">Img: ${p.image}</p>
			<div class="admin-actions">
				<button class="ghost" data-action="edit" data-id="${p.id}">Editar</button>
				<button class="ghost" data-action="toggle" data-id="${p.id}">${p.available ? 'Marcar agotado' : 'Marcar disponible'}</button>
				<button class="ghost" data-action="delete" data-id="${p.id}">Eliminar</button>
			</div>
		`;
		adminProductList.appendChild(card);
	});
}

function handleAdminAction(action, id) {
	const product = state.products.find(p => p.id === id);
	if (!product) return;
	if (action === 'delete') {
		state.products = state.products.filter(p => p.id !== id);
	}
	if (action === 'toggle') {
		product.available = !product.available;
	}
	if (action === 'edit') {
		productForm.querySelector('input[name="id"]').value = product.id;
		productForm.name.value = product.name;
		productForm.price.value = product.price;
		productForm.image.value = product.image;
		productForm.description.value = product.description || '';
		productForm.scrollIntoView({ behavior: 'smooth' });
	}
	persist();
	renderProducts();
	renderAdminList();
}

function upsertProduct(formData) {
	const payload = {
		id: formData.get('id') || uid(),
		name: formData.get('name'),
		price: parseFloat(formData.get('price')) || 0,
		image: formData.get('image'),
		description: formData.get('description') || '',
		available: true
	};
	const exists = state.products.some(p => p.id === payload.id);
	if (exists) {
		state.products = state.products.map(p => (p.id === payload.id ? { ...p, ...payload } : p));
	} else {
		state.products.push(payload);
	}
	persist();
	renderProducts();
	renderAdminList();
	productForm.reset();
	productForm.querySelector('input[name="id"]').value = '';
}

function requireAuth(action) {
	if (!state.sessionUser) {
		openAuth('login');
		throw new Error('Sesion requerida');
	}
	action();
}

function openCheckout() {
	if (!state.cart.length) return alert('Agrega productos al carrito primero.');
	requireAuth(() => {
		checkoutOverlay.classList.add('show');
	});
}

function closeCheckoutModal() {
	checkoutOverlay.classList.remove('show');
	checkoutForm.reset();
}

function completeCheckout(data) {
	alert(`Pedido confirmado para ${data.get('buyer')} (${data.get('buyerEmail')}).\nDireccion: ${data.get('address')}\nArticulos: ${state.cart.length}`);
	state.cart = [];
	persist();
	renderCart();
	closeCheckoutModal();
}

// Event bindings
window.addEventListener('scroll', () => {
	hero.classList.toggle('shrink', window.scrollY > 80);
});

filterAvailableBtn.addEventListener('click', () => {
	state.filterAvailable = true;
	renderProducts();
});

resetFilterBtn.addEventListener('click', () => {
	state.filterAvailable = false;
	renderProducts();
});

closeProductModalBtn.addEventListener('click', closeProductModal);
modalOverlay.addEventListener('click', (e) => {
	if (e.target === modalOverlay) closeProductModal();
});

cartToggle.addEventListener('click', () => toggleCart(true));
closeCart.addEventListener('click', () => toggleCart(false));

cartItems.addEventListener('click', (e) => {
	const btn = e.target.closest('button');
	if (!btn) return;
	const action = btn.dataset.action;
	const id = btn.dataset.id;
	if (!action || !id) return;
	updateCartItem(id, action);
});

checkoutBtn.addEventListener('click', openCheckout);

loginBtn.addEventListener('click', () => openAuth('login'));
registerBtn.addEventListener('click', () => openAuth('register'));
ctaLogin.addEventListener('click', () => openAuth('login'));
closeAuth.addEventListener('click', closeAuthModal);

authTabs.forEach((btn) => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

loginForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const data = new FormData(loginForm);
	try {
		login(data.get('email'), data.get('password'));
		closeAuthModal();
	} catch (err) {
		alert(err.message);
	}
});

registerForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const data = new FormData(registerForm);
	try {
		register(data.get('name'), data.get('email'), data.get('password'));
		closeAuthModal();
	} catch (err) {
		alert(err.message);
	}
});

adminPanelBtn.addEventListener('click', openAdmin);
closeAdmin.addEventListener('click', closeAdminModal);

adminProductList.addEventListener('click', (e) => {
	const btn = e.target.closest('button');
	if (!btn) return;
	handleAdminAction(btn.dataset.action, btn.dataset.id);
});

productForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const data = new FormData(productForm);
	upsertProduct(data);
});

checkoutForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const data = new FormData(checkoutForm);
	completeCheckout(data);
});

closeCheckout.addEventListener('click', closeCheckoutModal);

// Init
loadState();
renderProducts();
renderCart();
syncSessionUI();
