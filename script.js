document.addEventListener("DOMContentLoaded", () => {
  // Подставляем ссылки на ботов везде, где стоит data-role
  document.querySelectorAll('[data-role="telegram-link"]').forEach((el) => {
    el.href = SITE_CONFIG.telegramBotUrl;
  });
  document.querySelectorAll('[data-role="max-link"]').forEach((el) => {
    el.href = SITE_CONFIG.maxBotUrl;
  });

  renderPricing();
});

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

      return `
        <div class="price-card" data-plan="${plan.id}">
          <h3 class="plan-name">${plan.name}</h3>
          <div class="plan-price">${plan.price.toLocaleString("ru-RU")} ₽<span>/${plan.period}</span></div>
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
