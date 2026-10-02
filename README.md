# NORTH — Streetwear Store (portfolio project)

Минималистичный магазин вымышленного бренда. Чистые HTML/CSS/JS, без сборки и библиотек.
Открыть: `index.html` в браузере (работает офлайн).

## Файлы
- `index.html` — разметка
- `styles.css` — стили
- `products.js` — **каталог**, пути к фото (`IMAGE_ROOT`), размерные таблицы
- `app.js` — фильтры, поиск, сортировка, галерея, корзина, меню
- `public/images/products/<slug>/` — сюда кладутся фото товаров
## Возможности
- Категории + NEW / BESTSELLERS (по полям `isNew` / `isBestseller`)
- Фильтры: размер (раздельно для верха и брюк), цена, цвет; active-чипы с ×, CLEAR ALL, живой счётчик
- Поиск по названию, категории и цвету; состояние NO RESULTS
- Сортировка: Featured, Newest, цена ↑/↓, A → Z
- Карточки: второе изображение при наведении, QUICK ADD, бейджи
- Карточка товара: галерея, размеры кнопками, SIZE GUIDE (отдельные для tops / jackets / pants), количество, wishlist, Details / Materials / Shipping
- Корзина: количество, удаление, объединение одинаковых позиций, subtotal, демо-checkout (оплаты нет)
- Мобильное меню, фильтры-drawer на телефоне, sticky-хедер, мягкие анимации (отключаются при `prefers-reduced-motion`)

## Изображения товаров
У каждого товара `images: { front, model, detail }` (front — каталог, model — при наведении, detail — крупный план).

Сейчас используются бесплатные стоковые фото Unsplash (лицензия: unsplash.com/license), подобранные как наиболее близкие к вещам. Это не собственные снимки бренда, их список — таблица `PHOTOS` в `products.js`. Несколько фото объединены в галерею только если они из одной съёмки (одна и та же вещь), иначе у товара одно фото.

Чтобы подставить свои фото (портрет 3:4, например 1200×1600, JPG/WEBP):

    public/images/products/<slug>/front.jpg
    public/images/products/<slug>/model.jpg
    public/images/products/<slug>/detail.jpg

и добавьте slug в `LOCAL_PHOTOS` в `products.js`, например `const LOCAL_PHOTOS = ['heavy-tee-black'];`.

Подпись на model-фото включается данными товара: `model: { height: '182 cm', size: 'M' }`. Нет данных — нет подписи.

