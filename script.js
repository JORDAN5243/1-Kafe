document.addEventListener("DOMContentLoaded", () => {
  // نمونه داده‌ها — تو می‌تونی آدرس عکس‌ها را با لینک‌های اصلی جایگزین کنی.
  const menuData = [
    {
      id: 1,
      category: "قهوه",
      title: "آمریکانو",
      price: 30000,
      img: "https://via.placeholder.com/800x600?text=Americano",
      desc: "اسپرسو رقیق شده با آب داغ",
    },
    {
      id: 2,
      category: "قهوه",
      title: "کاپوچینو",
      price: 45000,
      img: "https://via.placeholder.com/800x600?text=Cappuccino",
      desc: "کاپوچینو با کف عالی",
    },
    {
      id: 3,
      category: "نوشیدنی سرد",
      title: "آیس لاته",
      price: 55000,
      img: "https://via.placeholder.com/800x600?text=Iced+Latte",
      desc: "قهوه سرد با شیر",
    },
    {
      id: 4,
      category: "دسر",
      title: "براونی",
      price: 40000,
      img: "https://via.placeholder.com/800x600?text=Brownie",
      desc: "براونی شکلاتی دست ساز",
    },
    {
      id: 5,
      category: "چای",
      title: "چای سنتی",
      price: 15000,
      img: "https://via.placeholder.com/800x600?text=Tea",
      desc: "چای خوش رنگ و خوش طعم",
    },
    {
      id: 6,
      category: "نوشیدنی سرد",
      title: "فِرَش لیموناد",
      price: 35000,
      img: "https://via.placeholder.com/800x600?text=Lemonade",
      desc: "لیموناد تازه",
    },
  ];

  // state
  let cart = [];

  // helpers
  const q = (sel) => document.querySelector(sel);
  const qAll = (sel) => Array.from(document.querySelectorAll(sel));

  function formatCurrency(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " تومان";
  }

  // categories
  const categories = Array.from(new Set(menuData.map((i) => i.category)));
  const categoriesWrapper = q("#categoriesWrapper");
  const categoryList = q("#categoryList");

  // render category swiper slides & left list
  function renderCategories() {
    categoriesWrapper.innerHTML = "";
    categoryList.innerHTML = "";

    // "همه"
    const allSlide = document.createElement("div");
    allSlide.className = "swiper-slide text-center";
    allSlide.dataset.cat = "all";
    allSlide.innerHTML = `<div class="c-inner"><i class="bi bi-grid-fill" style="font-size:28px;color:#fff"></i><div style="font-size:13px;margin-top:8px;color:#fff">همه</div></div>`;
    categoriesWrapper.appendChild(allSlide);

    categories.forEach((cat) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide text-center";
      slide.dataset.cat = cat;
      slide.innerHTML = `<div class="c-inner"><i class="bi bi-star-fill" style="font-size:28px;color:#fff"></i><div style="font-size:13px;margin-top:8px;color:#fff">${cat}</div></div>`;
      categoriesWrapper.appendChild(slide);

      // left list
      const li = document.createElement("li");
      li.className = "list-group-item list-group-item-action";
      li.textContent = cat;
      li.style.cursor = "pointer";
      li.addEventListener("click", () => {
        filterByCategory(cat);
        // set active slide in swiper if exists
        const slideIndex = Array.from(categoriesWrapper.children).findIndex(
          (s) => s.dataset.cat === cat
        );
        if (slideIndex >= 0 && categorySwiper)
          categorySwiper.slideTo(slideIndex);
      });
      categoryList.appendChild(li);
    });

    // "همه" in left list
    const liAll = document.createElement("li");
    liAll.className = "list-group-item list-group-item-action";
    liAll.textContent = "همه";
    liAll.style.cursor = "pointer";
    liAll.addEventListener("click", () => {
      renderItems();
      if (categorySwiper) categorySwiper.slideTo(0);
    });
    categoryList.insertBefore(liAll, categoryList.firstChild);
  }

  // render items in swiper and grid
  const itemsWrapper = q("#itemsWrapper");
  const menuGrid = q("#menuGrid");

  function renderItems(filter = null) {
    // sort
    const sort = q("#sortSelect").value;
    let items = menuData.slice();
    if (filter) items = items.filter((i) => i.category === filter);
    if (sort === "price-asc") items.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") items.sort((a, b) => b.price - a.price);

    // swiper slides
    itemsWrapper.innerHTML = "";
    menuGrid.innerHTML = "";

    items.forEach((item) => {
      // slide
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      slide.innerHTML = `
        <div class="d-flex flex-column h-100">
          <img class="item-img" src="${item.img}" alt="${
        item.title
      }" onerror="this.src='https://via.placeholder.com/800x600?text=Img'"/>
          <div class="item-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h5 class="mb-1">${item.title}</h5>
                <p class="small text-muted mb-1">${item.desc}</p>
              </div>
              <div class="text-end">
                <strong class="d-block">${formatCurrency(item.price)}</strong>
                <button class="btn btn-sm btn-outline-primary mt-2 add-btn" data-id="${
                  item.id
                }">افزودن</button>
              </div>
            </div>
          </div>
        </div>
      `;
      itemsWrapper.appendChild(slide);

      // grid card
      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4";
      col.innerHTML = `
        <div class="card h-100">
          <img src="${item.img}" class="card-img-top" alt="${
        item.title
      }" onerror="this.src='https://via.placeholder.com/600x400?text=Img'">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${item.title}</h5>
            <p class="text-muted small mb-2">${item.desc}</p>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <strong>${formatCurrency(item.price)}</strong>
              <div>
                <button class="btn btn-sm btn-outline-secondary me-2 view-btn" data-id="${
                  item.id
                }">جزییات</button>
                <button class="btn btn-sm btn-primary add-btn" data-id="${
                  item.id
                }">افزودن</button>
              </div>
            </div>
          </div>
        </div>
      `;
      menuGrid.appendChild(col);
    });

    // attach add handlers
    qAll(".add-btn").forEach((b) => {
      b.addEventListener("click", (e) => {
        const id = +e.currentTarget.dataset.id;
        addToCart(id);
        animateAddToCart(e.currentTarget);
      });
    });

    // attach view handlers
    qAll(".view-btn").forEach((b) => {
      b.addEventListener("click", (e) => {
        const id = +e.currentTarget.dataset.id;
        openModal(id);
      });
    });

    // refresh swiper
    setTimeout(() => {
      if (window.itemsSwiper) window.itemsSwiper.update();
    }, 100);
  }

  // filter by category (with fade)
  function filterByCategory(cat) {
    // fade out current slides then replace
    const container = q(".mySwiper .swiper-wrapper");
    container.style.transition = "opacity .25s";
    container.style.opacity = 0;
    setTimeout(() => {
      renderItems(cat);
      container.style.opacity = 1;
    }, 260);
  }

  // cart functions
  function addToCart(id) {
    const item = menuData.find((i) => i.id === id);
    if (!item) return;
    const ex = cart.find((c) => c.id === id);
    if (ex) ex.qty += 1;
    else cart.push({ ...item, qty: 1 });
    updateCartUI();
  }

  function updateCartUI() {
    const countEl = q("#cartCount");
    const cartItemsEl = q("#cartItems");
    const totalEl = q("#cartTotal");
    const totalCount = cart.reduce((s, i) => s + i.qty, 0);
    countEl.textContent = totalCount;
    if (cart.length === 0) {
      cartItemsEl.innerHTML =
        '<p class="text-muted">هیچ موردی اضافه نشده است.</p>';
      totalEl.textContent = "۰ تومان";
      return;
    }
    cartItemsEl.innerHTML = "";
    cart.forEach((ci) => {
      const div = document.createElement("div");
      div.className = "d-flex align-items-center mb-2";
      div.innerHTML = `
        <img src="${
          ci.img
        }" style="width:64px;height:48px;object-fit:cover;border-radius:6px;margin-left:8px" onerror="this.src='https://via.placeholder.com/80x60'">
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between">
            <strong class="small">${ci.title}</strong>
            <small class="text-muted">${formatCurrency(ci.price)}</small>
          </div>
          <div class="d-flex gap-2 mt-1 align-items-center">
            <button class="btn btn-sm btn-outline-secondary" data-id="${
              ci.id
            }" data-op="-">−</button>
            <span>${ci.qty}</span>
            <button class="btn btn-sm btn-outline-secondary" data-id="${
              ci.id
            }" data-op="+">+</button>
            <button class="btn btn-sm btn-link text-danger ms-2" data-id="${
              ci.id
            }" data-op="del">حذف</button>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(div);
    });
    qAll("#cartItems [data-op]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = +e.currentTarget.dataset.id;
        const op = e.currentTarget.dataset.op;
        if (op === "+") changeQty(id, 1);
        else if (op === "-") changeQty(id, -1);
        else if (op === "del") removeFromCart(id);
      });
    });
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    totalEl.textContent = formatCurrency(total);
  }

  function changeQty(id, delta) {
    const it = cart.find((c) => c.id === id);
    if (!it) return;
    it.qty += delta;
    if (it.qty <= 0) cart = cart.filter((c) => c.id !== id);
    updateCartUI();
  }
  function removeFromCart(id) {
    cart = cart.filter((c) => c.id !== id);
    updateCartUI();
  }

  // animate add to cart (simple pulse)
  function animateAddToCart(btn) {
    btn.classList.add("adding");
    setTimeout(() => btn.classList.remove("adding"), 400);
    // open cart briefly
    q("#cartSidebar").classList.add("open");
    setTimeout(() => q("#cartSidebar").classList.remove("open"), 1200);
  }

  // modal
  let currentModalItem = null;
  function openModal(id) {
    const item = menuData.find((i) => i.id === id);
    if (!item) return;
    currentModalItem = item;
    q("#modalImg").src = item.img;
    q("#modalTitle").textContent = item.title;
    q("#modalDesc").textContent = item.desc;
    q("#modalPrice").textContent = formatCurrency(item.price);
    const modal = new bootstrap.Modal(q("#itemModal"));
    modal.show();
  }
  q("#modalAdd").addEventListener("click", () => {
    if (currentModalItem) addToCart(currentModalItem.id);
    bootstrap.Modal.getInstance(q("#itemModal")).hide();
  });

  // init swipers
  let categorySwiper = null;
  window.itemsSwiper = null;

  function initSwipers() {
    // category swiper: small slides
    categorySwiper = new Swiper(".categories-swiper", {
      slidesPerView: "auto",
      centeredSlides: false,
      spaceBetween: 12,
      grabCursor: true,
    });

    // items swiper: coverflow
    window.itemsSwiper = new Swiper(".mySwiper", {
      resistanceRatio: 0.85,
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      loop: false,
      coverflowEffect: {
        rotate: 20,
        stretch: 0,
        depth: 160,
        modifier: 1,
        slideShadows: false,
      },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        0: { slidesPerView: 1, centeredSlides: true },
        576: { slidesPerView: 1.3, centeredSlides: true },
        768: { slidesPerView: 1.6 },
        1200: { slidesPerView: 2.2 },
      },
      on: {
        init: () => {
          document.querySelectorAll(".swiper-slide").forEach((slide) => {
            slide.style.height = "auto";
          });
        },
      },
    });

    // clicking category slide filters items
    categorySwiper.on("click", (swiper, e) => {
      const slide = swiper.slides[swiper.clickedIndex];
      if (!slide) return;
      const cat = slide.dataset.cat;
      if (cat === "all") renderItems();
      else filterByCategory(cat);
      // visual active
      Array.from(categorySwiper.slides).forEach((s) =>
        s.classList.remove("active")
      );
      slide.classList.add("active");
    });
  }

  // header cart toggle
  q("#cartBtn").addEventListener("click", () =>
    q("#cartSidebar").classList.toggle("open")
  );
  q("#closeCart").addEventListener("click", () =>
    q("#cartSidebar").classList.remove("open")
  );
  q("#checkoutBtn").addEventListener("click", () =>
    alert("نمونه: هدایت به درگاه پرداخت")
  );

  // sort select
  q("#sortSelect").addEventListener("change", () => renderItems());

  // order form
  q("#orderForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("لطفاً حداقل یک آیتم به سبد اضافه کنید.");
      return;
    }
    const payload = {
      name: q("#name").value,
      phone: q("#phone").value,
      address: q("#address").value,
      items: cart.map((i) => ({
        id: i.id,
        title: i.title,
        qty: i.qty,
        price: i.price,
      })),
      total: cart.reduce((s, i) => s + i.price * i.qty, 0),
    };
    console.log("سفارش (نمونه):", payload);
    alert("سفارش ثبت شد (نمونه). در کنسول لاگ ببینید.");
    // اینجا fetch POST به سرور قرار می‌گیرد
  });

  // initial render + init
  renderCategories();
  renderItems();
  initSwipers();
  updateCartUI();
});
