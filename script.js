document.addEventListener("DOMContentLoaded", () => {
  // Подставляем ссылки на ботов везде, где стоит data-role
  document.querySelectorAll('[data-role="telegram-link"]').forEach((el) => {
    el.href = SITE_CONFIG.telegramBotUrl;
  });
  document.querySelectorAll('[data-role="max-link"]').forEach((el) => {
    el.href = SITE_CONFIG.maxBotUrl;
  });

  // Подставляем цены/названия тарифов из config.js
  SITE_CONFIG.plans.forEach((plan) => {
    const card = document.querySelector(`[data-plan="${plan.id}"]`);
    if (!card) return;
    const nameEl = card.querySelector(".plan-name");
    const priceEl = card.querySelector(".plan-price");
    if (nameEl) nameEl.textContent = plan.name;
    if (priceEl) priceEl.innerHTML = `${plan.price} ₽<span>/${plan.period}</span>`;
  });

  // Кнопки оплаты. Пока нет серверного приёма платежей — ведём в бота.
  document.querySelectorAll('[data-action="pay-yookassa"], [data-action="pay-invoice"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!SITE_CONFIG.paymentsEnabled) {
        window.open(SITE_CONFIG.telegramBotUrl, "_blank", "noopener");
        return;
      }
      // TODO: здесь будет вызов серверной функции создания платежа ЮKassa / выставления счёта
    });
  });
});
