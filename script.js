/* script.js — بهبود یافته و اصلاح شده
   نگهداری چارچوب اصلی: categories swiper, items swiper (coverflow), modal, cart, filter, sort, search
*/

document.addEventListener("DOMContentLoaded", () => {
  // ---------- داده نمونه ----------
  const menuData = [
    {
      id: 1,
      category: "قهوه",
      title: "آمریکانو",
      price: 30000,
      img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
      desc: "اسپرسو رقیق شده با آب داغ",
    },
    {
      id: 2,
      category: "قهوه",
      title: "کاپوچینو",
      price: 45000,
      img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop",
      desc: "کاپوچینو با کف عالی",
    },
    {
      id: 3,
      category: "نوشیدنی سرد",
      title: "آیس لاته",
      price: 55000,
      img: "https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400&h=300&fit=crop",
      desc: "قهوه سرد با شیر",
    },
    {
      id: 4,
      category: "دسر",
      title: "براونی",
      price: 40000,
      img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
      desc: "براونی شکلاتی دست ساز",
    },
    {
      id: 5,
      category: "چای",
      title: "چای سنتی",
      price: 15000,
      img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop",
      desc: "چای خوش رنگ و خوش طعم",
    },
    {
      id: 6,
      category: "نوشیدنی سرد",
      title: "فِرَش لیموناد",
      price: 35000,
      img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop",
      desc: "لیموناد تازه",
    },
  ];

  // ---------- state ----------
  let cart = [];
  let categorySwiper = null;
  window.itemsSwiper = null; // در window نگه داشته شده برای سازگاری با کد اصلی که از window.itemsSwiper استفاده می‌کند
  let currentModalItem = null;

  // ---------- helperها ----------
  const q = (sel) => document.querySelector(sel);
  const qAll = (sel) => Array.from(document.querySelectorAll(sel));

  function formatCurrency(num) {
    if (typeof num !== "number") num = Number(num) || 0;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " تومان";
  }

  function debounce(fn, wait = 300) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // ---------- عناصر DOM مرجع ----------
  const categoriesWrapper = q("#categoriesWrapper");
  const categoryList = q("#categoryList");
  const itemsWrapper = q("#itemsWrapper");
  const menuGrid = q("#menuGrid");
  const searchInput = q("#searchInput");
  const searchBtn = q("#searchBtn");
  const clearSearchBtn = q("#clearSearch");
  const sortSelect = q("#sortSelect");
  const cartBtn = q("#cartBtn");
  const cartSidebar = q("#cartSidebar");
  const closeCartBtn = q("#closeCart");
  const cartItemsEl = q("#cartItems");
  const cartCountEl = q("#cartCount");
  const cartTotalEl = q("#cartTotal");
  const checkoutBtn = q("#checkoutBtn");
  const itemModalEl = q("#itemModal");
  const modalAddBtn = q("#modalAdd");

  // ---------- ذخیره / بارگذاری cart (اختیاری اما مفید) ----------
  const CART_KEY = "cafe_cart_v1";
  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {}
  }
  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) cart = JSON.parse(raw);
    } catch (e) {
      cart = [];
    }
  }
  loadCart();

  // ---------- categories ----------
  const categories = Array.from(new Set(menuData.map((i) => i.category)));

  function renderCategories() {
    categoriesWrapper.innerHTML = "";
    categoryList.innerHTML = "";

    // "همه" slide
    const allSlide = document.createElement("div");
    allSlide.className = "swiper-slide text-center active";
    allSlide.dataset.cat = "all";
    allSlide.innerHTML = `<div class="c-inner"><i class="bi bi-grid-fill" aria-hidden="true" style="font-size:28px;color:#fff"></i><div style="font-size:13px;margin-top:8px;color:#fff">همه</div></div>`;
    categoriesWrapper.appendChild(allSlide);

    categories.forEach((cat) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide text-center";
      slide.dataset.cat = cat;
      slide.innerHTML = `<div class="c-inner"><i class="bi bi-star-fill" aria-hidden="true" style="font-size:28px;color:#fff"></i><div style="font-size:13px;margin-top:8px;color:#fff">${cat}</div></div>`;
      categoriesWrapper.appendChild(slide);

      // لیست سمت چپ
      const li = document.createElement("li");
      li.className = "list-group-item list-group-item-action";
      li.textContent = cat;
      li.style.cursor = "pointer";
      li.addEventListener("click", () => {
        filterByCategory(cat);
        // فعال‌سازی اسلاید مرتبط
        const slideIndex = Array.from(categoriesWrapper.children).findIndex(
          (s) => s.dataset.cat === cat
        );
        if (slideIndex >= 0 && categorySwiper)
          categorySwiper.slideTo(slideIndex);
        // اسکرول به top برای نمایش تغییرات (اختیاری)
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      categoryList.appendChild(li);
    });

    // "همه" در لیست سمت چپ
    const liAll = document.createElement("li");
    liAll.className = "list-group-item list-group-item-action";
    liAll.textContent = "همه";
    liAll.style.cursor = "pointer";
    liAll.addEventListener("click", () => {
      renderItems();
      if (categorySwiper) categorySwiper.slideTo(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    categoryList.insertBefore(liAll, categoryList.firstChild);
  }

  // ---------- render items (swiper + grid) ----------
  function renderItems(filter = null, searchQuery = "") {
    // اعمال sort و فیلتر و جست‌وجو
    const sort = sortSelect.value;
    let items = menuData.slice();

    if (filter) items = items.filter((i) => i.category === filter);

    // جست‌وجو (در title, desc, category) - غیر حساس به حروف
    const qStr = (searchQuery || searchInput.value || "").trim();
    if (qStr) {
      const s = qStr.normalize("NFC").toLowerCase();
      items = items.filter((i) => {
        return (
          (i.title || "").toString().toLowerCase().includes(s) ||
          (i.desc || "").toString().toLowerCase().includes(s) ||
          (i.category || "").toString().toLowerCase().includes(s)
        );
      });
    }

    if (sort === "price-asc") items.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") items.sort((a, b) => b.price - a.price);

    // render های DOM
    itemsWrapper.innerHTML = "";
    menuGrid.innerHTML = "";

    items.forEach((item) => {
      // slide
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      slide.dataset.itemId = item.id;
      slide.innerHTML = `
        <div class="d-flex flex-column h-100">
          <img class="item-img" src="${item.img}" alt="${
        item.title
      }" loading="lazy" onerror="this.src='https://via.placeholder.com/800x600?text=Img'"/>
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
      }" loading="lazy" onerror="this.src='https://via.placeholder.com/600x400?text=Img'">
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

    // پس از رندر: متصل کردن هندلرها
    attachItemHandlers();

    // تصاویر: وقتی لود شدند کلاس loaded را اضافه کن تا animation skeleton قطع شود
    qAll(".item-img, .card-img-top").forEach((img) => {
      if (img.complete) {
        img.classList.add("loaded");
      } else {
        img.addEventListener("load", () => img.classList.add("loaded"));
        img.addEventListener("error", () => img.classList.add("loaded"));
      }
    });

    // به‌روزرسانی و refresh سوایپر فقط در صورت وجود
    setTimeout(() => {
      if (
        window.itemsSwiper &&
        typeof window.itemsSwiper.update === "function"
      ) {
        window.itemsSwiper.update();
      }
    }, 80);
  }

  function attachItemHandlers() {
    // افزودن به سبد
    qAll(".add-btn").forEach((b) => {
      // پاکسازی رویدادهای قبلی (در صورت attach دوباره)
      b.replaceWith(b.cloneNode(true));
    });
    // دوباره انتخاب و متصل کن
    qAll(".add-btn").forEach((b) => {
      b.addEventListener("click", (e) => {
        const id = +e.currentTarget.dataset.id;
        addToCart(id);
        animateAddToCart(e.currentTarget);
      });
    });

    // دیدن جزییات
    qAll(".view-btn").forEach((b) => {
      b.replaceWith(b.cloneNode(true));
    });
    qAll(".view-btn").forEach((b) => {
      b.addEventListener("click", (e) => {
        const id = +e.currentTarget.dataset.id;
        openModal(id);
      });
    });
  }

  // ---------- فیلتر بر اساس دسته ----------
  function filterByCategory(cat) {
    const container = q(".mySwiper .swiper-wrapper");
    if (container) {
      container.style.transition = "opacity .20s";
      container.style.opacity = 0;
    }
    setTimeout(() => {
      renderItems(cat, searchInput.value);
      if (container) container.style.opacity = 1;
    }, 220);
  }

  // ---------- cart functions ----------
  function addToCart(id) {
    const item = menuData.find((i) => i.id === id);
    if (!item) return;
    const ex = cart.find((c) => c.id === id);
    if (ex) ex.qty += 1;
    else cart.push({ ...item, qty: 1 });
    updateCartUI();
    saveCart();
  }

  function changeQty(id, delta) {
    const it = cart.find((c) => c.id === id);
    if (!it) return;
    it.qty += delta;
    if (it.qty <= 0) cart = cart.filter((c) => c.id !== id);
    updateCartUI();
    saveCart();
  }

  function removeFromCart(id) {
    cart = cart.filter((c) => c.id !== id);
    updateCartUI();
    saveCart();
  }

  function updateCartUI() {
    const totalCount = cart.reduce((s, i) => s + i.qty, 0);
    cartCountEl.textContent = totalCount;

    if (cart.length === 0) {
      cartItemsEl.innerHTML =
        '<p class="text-muted">هیچ موردی اضافه نشده است.</p>';
      cartTotalEl.textContent = "۰ تومان";
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
            <button class="btn btn-sm btn-outline-secondary cart-op" data-id="${
              ci.id
            }" data-op="-">−</button>
            <span class="cart-qty">${ci.qty}</span>
            <button class="btn btn-sm btn-outline-secondary cart-op" data-id="${
              ci.id
            }" data-op="+">+</button>
            <button class="btn btn-sm btn-link text-danger ms-2 cart-op" data-id="${
              ci.id
            }" data-op="del">حذف</button>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(div);
    });

    // attach ops
    qAll(".cart-op").forEach((btn) => {
      btn.replaceWith(btn.cloneNode(true));
    });
    qAll(".cart-op").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = +e.currentTarget.dataset.id;
        const op = e.currentTarget.dataset.op;
        if (op === "+") changeQty(id, 1);
        else if (op === "-") changeQty(id, -1);
        else if (op === "del") removeFromCart(id);
      });
    });

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    cartTotalEl.textContent = formatCurrency(total);
  }

  // ---------- افکت افزودن به سبد ----------
  function animateAddToCart(btn) {
    try {
      btn.classList.add("adding");
      setTimeout(() => btn.classList.remove("adding"), 420);
    } catch (e) {}
    // باز کردن سایدبار بصورت موقت
    cartSidebar.classList.add("open");
    setTimeout(() => cartSidebar.classList.remove("open"), 1200);
  }

  // ---------- modal ----------
  function openModal(id) {
    const item = menuData.find((i) => i.id === id);
    if (!item) return;
    currentModalItem = item;

    const modalImg = q("#modalImg");
    const modalTitle = q("#modalTitle");
    const modalDesc = q("#modalDesc");
    const modalPrice = q("#modalPrice");

    modalImg.src = item.img;
    modalImg.alt = item.title || "تصویر محصول";
    modalTitle.textContent = item.title;
    modalDesc.textContent = item.desc;
    modalPrice.textContent = formatCurrency(item.price);

    const modal = new bootstrap.Modal(itemModalEl);
    modal.show();
  }

  if (modalAddBtn) {
    modalAddBtn.addEventListener("click", () => {
      if (currentModalItem) addToCart(currentModalItem.id);
      const inst = bootstrap.Modal.getInstance(itemModalEl);
      if (inst) inst.hide();
    });
  }

  // ---------- init Swipers (یک تعریف واحد و پایدار) ----------
  function initSwipers() {
    // category swiper
    if (categorySwiper && typeof categorySwiper.destroy === "function") {
      categorySwiper.destroy(true, true);
      categorySwiper = null;
    }
    categorySwiper = new Swiper(".categories-swiper", {
      slidesPerView: "auto",
      centeredSlides: false,
      spaceBetween: 6,
      grabCursor: true,
      freeMode: true,
      breakpoints: {
        0: { spaceBetween: 6 },
        576: { spaceBetween: 8 },
        768: { spaceBetween: 12 },
      },
    });

    // items swiper
    if (
      window.itemsSwiper &&
      typeof window.itemsSwiper.destroy === "function"
    ) {
      window.itemsSwiper.destroy(true, true);
      window.itemsSwiper = null;
    }

    window.itemsSwiper = new Swiper(".mySwiper", {
      resistanceRatio: 0.85,
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      loop: false,
      coverflowEffect: {
        rotate: window.innerWidth < 768 ? 10 : 20,
        stretch: 0,
        depth: window.innerWidth < 768 ? 80 : 160,
        modifier: 1,
        slideShadows: false,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
        dynamicBullets: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        0: { slidesPerView: 1.1, centeredSlides: true },
        400: { slidesPerView: 1.2 },
        576: { slidesPerView: 1.4 },
        768: { slidesPerView: 1.8 },
        1200: { slidesPerView: 2.2 },
      },
      on: {
        init: () => {
          // اطمینان از ارتفاع خودکار
          document
            .querySelectorAll(".mySwiper .swiper-slide")
            .forEach((slide) => {
              slide.style.height = "auto";
            });
        },
      },
    });

    // کلیک روی category slide
    categorySwiper.on("click", (swiper) => {
      const clickedIndex = swiper.clickedIndex;
      if (typeof clickedIndex !== "number") return;
      const slide = swiper.slides[clickedIndex];
      if (!slide) return;
      const cat = slide.dataset.cat;
      Array.from(categorySwiper.slides).forEach((s) =>
        s.classList.remove("active")
      );
      slide.classList.add("active");
      if (cat === "all") renderItems();
      else filterByCategory(cat);
    });
  }

  // ---------- جست‌وجو (دِبانس، دکمه پاک کردن، Enter) ----------
  const doSearch = debounce(() => {
    const qv = searchInput.value.trim();
    if (qv.length > 0) {
      clearSearchBtn.classList.remove("d-none");
    } else {
      clearSearchBtn.classList.add("d-none");
    }
    renderItems(null, qv);
  }, 220);

  if (searchInput) {
    searchInput.addEventListener("input", doSearch);
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        // اجرای فوری جستجو
        doSearch.cancel && doSearch.cancel(); // اگر تابع debounce قابلیت cancel داشت
        renderItems(null, searchInput.value.trim());
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", () =>
      renderItems(null, searchInput.value.trim())
    );
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      clearSearchBtn.classList.add("d-none");
      renderItems();
    });
  }

  // ---------- لیسنرهای هدر / سایدبار / فرم ----------
  if (cartBtn)
    cartBtn.addEventListener("click", () =>
      cartSidebar.classList.toggle("open")
    );
  if (closeCartBtn)
    closeCartBtn.addEventListener("click", () =>
      cartSidebar.classList.remove("open")
    );

  // بستن سایدبار با کلیک خارج
  document.addEventListener("click", (e) => {
    try {
      if (!cartSidebar) return;
      if (
        cartSidebar.classList.contains("open") &&
        !cartSidebar.contains(e.target) &&
        e.target !== cartBtn &&
        !(cartBtn && cartBtn.contains(e.target))
      ) {
        cartSidebar.classList.remove("open");
      }
    } catch (err) {}
  });

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) {
        alert("سبد خالی است. لطفاً ابتدا محصولی اضافه کنید.");
        return;
      }
      alert("نمونه: هدایت به درگاه پرداخت");
    });
  }

  // فرم سفارش
  const orderForm = q("#orderForm");
  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
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
      // TODO: fetch POST به سرور با بررسی خطا و نمایش وضعیت
    });
  }

  // ---------- initial render + init ----------
  renderCategories();
  renderItems();
  initSwipers();
  updateCartUI();

  // ---------- بازخوانی swiper در تغییر اندازه پنجره (برای واکنش‌پذیری بهتر) ----------
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // تغییرات مربوط به coverflow متناسب با عرض صفحه
      if (
        window.itemsSwiper &&
        window.itemsSwiper.params &&
        window.itemsSwiper.params.coverflowEffect
      ) {
        const rotate = window.innerWidth < 768 ? 10 : 20;
        const depth = window.innerWidth < 768 ? 80 : 160;
        try {
          window.itemsSwiper.params.coverflowEffect.rotate = rotate;
          window.itemsSwiper.params.coverflowEffect.depth = depth;
          window.itemsSwiper.update();
        } catch (e) {}
      }
    }, 120);
  });
}); // DOMContentLoaded end
