let billingPeriod = "month";

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
  const toggle = document.querySelector(".pricing-toggle");
  if (!toggle) return;

  toggle.querySelectorAll(".pricing-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      billingPeriod = btn.dataset.period;
      toggle.querySelectorAll(".pricing-toggle-btn").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
      });
      renderPricing();
    });
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
          <a class="btn btn-primary" href="${SITE_CONFIG.telegramBotUrl}" target="_blank" rel="noopener">Открыть бот в Telegram</a>
          <a class="btn btn-outline" href="${SITE_CONFIG.maxBotUrl}" target="_blank" rel="noopener">Открыть бот в MAX</a>
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
