Довольно интересное задание, увлекательное приключение :smiley:

Возможно я не так его понял, но "не использовать фреймворки" и "безболезненно заменить
UI-слой" я принял как вызов написать свой рендер. Он лежит в `/src/renderer`

В первый день я разобрался с рендерингом и написал основной костяк приложения. Во второй день отрефакторил игровую логику.

Роутер делать не стал, но если бы делал, то скорее всего сохранял бы:

- выбранные индексы
- номер раунда

и при смене роута:

- удалял/добавлял индекс из выбранных индексов `/src/logic/game/game.ts -> Round`
- при смене раунда менял текущий раунд.

Насчет истории ошибок не уверен как поступать правильнее.

Спасибо за такой интересный опыт :smiley:

"Игра" доступна по ссылке [https://numfin.github.io/work-test-word-game](https://numfin.github.io/work-test-word-game)

# Instructions

```bash
npm ci
npm run dev # dev server
npm run build # build assets in /dist folder
```
