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
  setupPaymentModal();
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
          <button class="btn btn-primary" data-action="buy" data-plan="${plan.id}">Купить</button>
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

  if (SITE_CONFIG.paymentsEnabled) {
    grid.querySelectorAll('[data-action="buy"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const plan = SITE_CONFIG.plans.find((p) => p.id === btn.dataset.plan);
        if (plan) openPaymentModal(plan);
      });
    });
  }
}

let activePaymentPlan = null;

function openPaymentModal(plan) {
  const modal = document.getElementById("payment-modal");
  const planLabel = document.getElementById("payment-modal-plan");
  const priceLabel = document.getElementById("payment-modal-price");
  const errorBox = document.getElementById("payment-form-error");
  const input = document.getElementById("payment-contact");
  if (!modal || !planLabel || !priceLabel) return;

  activePaymentPlan = plan;
  planLabel.textContent = `Тариф «${plan.name}»`;
  priceLabel.textContent =
    billingPeriod === "year" && plan.priceYearly
      ? `${plan.priceYearly.toLocaleString("ru-RU")} ₽/год`
      : `${plan.price.toLocaleString("ru-RU")} ₽/месяц`;
  if (errorBox) errorBox.setAttribute("hidden", "");
  if (input) input.value = "";
  modal.removeAttribute("hidden");
  if (input) input.focus();
}

function closePaymentModal() {
  const modal = document.getElementById("payment-modal");
  if (!modal) return;
  modal.setAttribute("hidden", "");
  activePaymentPlan = null;
}

function setupPaymentModal() {
  const modal = document.getElementById("payment-modal");
  const closeBtn = document.getElementById("payment-modal-close");
  const form = document.getElementById("payment-form");
  const input = document.getElementById("payment-contact");
  const errorBox = document.getElementById("payment-form-error");
  const submitBtn = document.getElementById("payment-form-submit");
  if (!modal || !form) return;

  closeBtn.addEventListener("click", closePaymentModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closePaymentModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hasAttribute("hidden")) closePaymentModal();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!activePaymentPlan) return;
    const contact = input.value.trim();
    if (!contact) return;

    errorBox.setAttribute("hidden", "");
    submitBtn.disabled = true;
    submitBtn.textContent = "Создаём платёж…";

    // Открываем вкладку сразу (по клику), чтобы браузер не заблокировал её как всплывающее окно —
    // адрес подставим, когда получим ссылку от n8n.
    const paymentWindow = window.open("", "_blank");

    try {
      const response = await fetch(SITE_CONFIG.paymentWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: activePaymentPlan.id,
          period: billingPeriod,
          contact: contact,
        }),
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data && data.confirmation_url) {
        if (paymentWindow) paymentWindow.location.href = data.confirmation_url;
        closePaymentModal();
        submitBtn.disabled = false;
        submitBtn.textContent = "Перейти к оплате";
        return;
      }
      throw new Error("no confirmation_url");
    } catch (err) {
      if (paymentWindow) paymentWindow.close();
      errorBox.textContent =
        "Не получилось создать платёж. Попробуйте ещё раз или напишите нам в Telegram.";
      errorBox.removeAttribute("hidden");
      submitBtn.disabled = false;
      submitBtn.textContent = "Перейти к оплате";
    }
  });
}
