let billingPeriod = "month";

const ICON_SEND =
  '<svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
const ICON_CHAT =
  '<svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-4.5 7.4 8.5 8.5 0 0 1-8.9-.3L3 20l1.4-4.1a8.38 8.38 0 0 1-1.4-4.6 8.5 8.5 0 0 1 8.5-8.3h.3a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

document.addEventListener("DOMContentLoaded", () => {
  // Подставляем ссылки на ботов везде, где стоит data-role
  document.querySelectorAll('[data-role="telegram-link"]').forEach((el) => {
    el.href = SITE_CONFIG.telegramBotUrl;
  });
  document.querySelectorAll('[data-role="max-link"]').forEach((el) => {
    el.href = SITE_CONFIG.maxBotUrl;
  });

  setupHeroCta();
  setupPricingToggle();
  setupLightbox();
  setupBackToTop();
  setupCookieBanner();
  setupPayPage();
  renderPricing();
});

function setupBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;
  const toggle = () => btn.classList.toggle("visible", window.scrollY > 480);
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function setupCookieBanner() {
  const banner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("cookie-accept");
  if (!banner || !acceptBtn) return;
  let consent = null;
  try {
    consent = localStorage.getItem("cookieConsent");
  } catch (e) {}
  if (!consent) banner.removeAttribute("hidden");
  acceptBtn.addEventListener("click", () => {
    try {
      localStorage.setItem("cookieConsent", "1");
    } catch (e) {}
    banner.setAttribute("hidden", "");
  });
}

function setupHeroCta() {
  const btn = document.getElementById("hero-cta-btn");
  const choice = document.getElementById("hero-cta-choice");
  if (!btn || !choice) return;

  btn.addEventListener("click", () => {
    const isHidden = choice.hasAttribute("hidden");
    if (isHidden) {
      choice.removeAttribute("hidden");
      btn.setAttribute("aria-expanded", "true");
    } else {
      choice.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

function setupPricingToggle() {
  const toggle = document.querySelector(".period-switch");
  if (!toggle) return;

  toggle.querySelectorAll(".period-switch-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      billingPeriod = btn.dataset.period;
      toggle.querySelectorAll(".period-switch-btn").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
      });
      renderPricing();
    });
  });
}

function setupLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.getElementById("lightbox-close");
  if (!lightbox || !lightboxImg || !closeBtn) return;

  const open = (src, alt) => {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.removeAttribute("hidden");
  };
  const close = () => {
    lightbox.setAttribute("hidden", "");
    lightboxImg.src = "";
  };

  document
    .querySelectorAll(".showcase-media img, .showcase-duo-media img, .flagship-media img, .hero-proof img")
    .forEach((img) => {
      img.addEventListener("click", () => open(img.src, img.alt));
    });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function renderPricing() {
  const grid = document.getElementById("pricing-grid");
  if (!grid) return;

  grid.innerHTML = SITE_CONFIG.plans
    .map((plan) => {
      const featuresHtml = plan.features.map((f) => `<li>${f}</li>`).join("");

      const actionsHtml = SITE_CONFIG.paymentsEnabled
        ? `
          <a class="btn btn-primary" href="pay.html?plan=${plan.id}&period=${billingPeriod}">Купить</a>
        `
        : `
          <a class="btn btn-telegram" href="${SITE_CONFIG.telegramBotUrl}" target="_blank" rel="noopener">${ICON_SEND}Открыть в Telegram</a>
          <a class="btn btn-max" href="${SITE_CONFIG.maxBotUrl}" target="_blank" rel="noopener">${ICON_CHAT}Открыть в MAX</a>
        `;

      const priceHtml =
        billingPeriod === "year" && plan.priceYearly
          ? `
            <div class="plan-price">
              <span class="plan-price-old num">${plan.price.toLocaleString("ru-RU")} ₽</span>
              ${Math.round(plan.priceYearly / 12).toLocaleString("ru-RU")} ₽<span>/мес</span>
            </div>
            <p class="plan-price-note">${plan.priceYearly.toLocaleString("ru-RU")} ₽ за год · 2 месяца в подарок</p>
          `
        : `<div class="plan-price">${plan.price.toLocaleString("ru-RU")} ₽<span>/${plan.period}</span></div>`;

      return `
        <div class="price-card${plan.highlight ? " price-card--highlight" : ""}" data-plan="${plan.id}">
          <h3 class="plan-name">${plan.name}</h3>
          ${priceHtml}
          <p class="plan-subtitle">${plan.subtitle}</p>
          <ul class="plan-features">${featuresHtml}</ul>
          <div class="plan-actions">${actionsHtml}</div>
        </div>
      `;
    })
    .join("");
}

function setupPayPage() {
  const summaryPlan = document.getElementById("pay-plan-name");
  const summaryPrice = document.getElementById("pay-plan-price");
  if (!summaryPlan || !summaryPrice) return; // не страница pay.html

  const params = new URLSearchParams(window.location.search);
  const planId = params.get("plan");
  const period = params.get("period") === "year" ? "year" : "month";
  const plan = SITE_CONFIG.plans.find((p) => p.id === planId) || SITE_CONFIG.plans[0];

  summaryPlan.textContent = `Тариф «${plan.name}»`;
  summaryPrice.textContent =
    period === "year" && plan.priceYearly
      ? `${plan.priceYearly.toLocaleString("ru-RU")} ₽/год`
      : `${plan.price.toLocaleString("ru-RU")} ₽/месяц`;

  const cardBtn = document.getElementById("pay-method-card-btn");
  const invoiceBtn = document.getElementById("pay-method-invoice-btn");
  const cardPanel = document.getElementById("pay-panel-card");
  const invoicePanel = document.getElementById("pay-panel-invoice");

  cardBtn.addEventListener("click", () => {
    cardBtn.classList.add("is-active");
    invoiceBtn.classList.remove("is-active");
    cardPanel.removeAttribute("hidden");
    invoicePanel.setAttribute("hidden", "");
  });
  invoiceBtn.addEventListener("click", () => {
    invoiceBtn.classList.add("is-active");
    cardBtn.classList.remove("is-active");
    invoicePanel.removeAttribute("hidden");
    cardPanel.setAttribute("hidden", "");
  });

  const paymentForm = document.getElementById("payment-form");
  const paymentInput = document.getElementById("payment-contact");
  const paymentError = document.getElementById("payment-form-error");
  const paymentSubmit = document.getElementById("payment-form-submit");

  paymentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const contact = paymentInput.value.trim();
    if (!contact) return;

    paymentError.setAttribute("hidden", "");
    paymentSubmit.disabled = true;
    paymentSubmit.textContent = "Создаём платёж…";

    try {
      const response = await fetch(SITE_CONFIG.paymentWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, period: period, contact: contact }),
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data && data.confirmation_url) {
        // Переходим в этой же вкладке — надёжнее всплывающего окна на мобильных браузерах.
        window.location.href = data.confirmation_url;
        return;
      }
      throw new Error("no confirmation_url");
    } catch (err) {
      paymentError.textContent =
        "Не получилось создать платёж. Попробуйте ещё раз или напишите нам в Telegram.";
      paymentError.removeAttribute("hidden");
      paymentSubmit.disabled = false;
      paymentSubmit.textContent = "Перейти к оплате";
    }
  });

  const invoiceForm = document.getElementById("invoice-form");
  const invoiceError = document.getElementById("invoice-form-error");
  const invoiceSubmit = document.getElementById("invoice-form-submit");
  const invoiceSuccess = document.getElementById("invoice-form-success");

  invoiceForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const orgName = document.getElementById("invoice-org").value.trim();
    const inn = document.getElementById("invoice-inn").value.trim();
    const email = document.getElementById("invoice-email").value.trim();
    if (!orgName || !inn || !email) return;

    invoiceError.setAttribute("hidden", "");
    invoiceSubmit.disabled = true;
    invoiceSubmit.textContent = "Отправляем запрос…";

    try {
      const response = await fetch(SITE_CONFIG.invoiceWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, period: period, orgName: orgName, inn: inn, email: email }),
      });
      if (!response.ok) throw new Error("invoice request failed");
      invoiceForm.setAttribute("hidden", "");
      invoiceSuccess.removeAttribute("hidden");
    } catch (err) {
      invoiceError.textContent =
        "Не получилось отправить запрос. Попробуйте ещё раз или напишите нам в Telegram.";
      invoiceError.removeAttribute("hidden");
      invoiceSubmit.disabled = false;
      invoiceSubmit.textContent = "Запросить счёт";
    }
  });
}
