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
  renderPricing();
});

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

  document.querySelectorAll(".showcase-media img, .flagship-media img").forEach((img) => {
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
          <button class="btn btn-primary" data-action="pay-yookassa" data-plan="${plan.id}">Оплатить картой</button>
          <button class="btn btn-outline" data-action="pay-invoice" data-plan="${plan.id}">Оплатить по счету</button>
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

      const highlightBadge = plan.highlight ? `<p class="plan-highlight">${plan.highlight}</p>` : "";

      return `
        <div class="price-card${plan.highlight ? " price-card--highlight" : ""}" data-plan="${plan.id}">
          ${highlightBadge}
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
    grid.querySelectorAll('[data-action="pay-yookassa"], [data-action="pay-invoice"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        // TODO: здесь будет вызов серверной функции создания платежа ЮKassa / выставления счёта
      });
    });
  }
}
