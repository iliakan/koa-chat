## Install

1. Установить CLI https://devcenter.heroku.com/articles/heroku-command-line#download-and-install
2. Создать приложение через веб-интерфейс (можно пропустить этот шаг и создать приложение позже через командную строку см. пункт 3) https://dashboard.heroku.com/apps.
3. Залогиниться из командной строки
  $ heroku login
4. Создать в папке с проектом гит репозиторий
  $ git init

  $ heroku git:remote -a APPLICATION_NAME # если приложение уже создано через интерфейс
  $ heroku create APPLICATION_NAME # если приложение еще не создано

  $ git add .
  $ git commit -m 'initial commit'
  $ git push heroku master # деплой

  В результате выполнения последней команды в консоли появится инфомрация о статусе операции и ссылка на приложение в браузере

  heroku logs -d web | sed -l 's/.*app\[web\..*\]\: //'

## Notes
Обязательно иметь package.json со списком зависимостей (heroku их кэширует и ставить на сервер).

В package.json желательно указать версию node.js (при отсутствии heroku возьмет последнюю).
Нужен файл Procfile, в котором по соглашению указывается какого типа проекта и как его запустить. В случае nodejs Procfile выглядит так: ```web: node index.js```
Каждая константа должна считываться из переменных окружения (порт, uri для подключения к бд и т.д.)
Heroku CLI позволяет также просмотреть логи приложения, отправленные в stdout (stderr). подробнее https://devcenter.heroku.com/articles/logging
heroku logs - просто посмотреть все логи
heroku logs -n 200 - ограничить кол-во строк
heroku logs --tail - в режиме реального времени
heroku logs --dyno router - ограничить логи только выбранным сервисом (базой данных и т.д.) router - стандартный сервис хероку, предоставляющий что-то вроде CDN для отдачи статики
