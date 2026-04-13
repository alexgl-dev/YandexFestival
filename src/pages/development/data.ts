import type { SectionData } from '../../types/game';

export const developmentSection: SectionData = {
  id: '002',
  slug: 'development',
  title: 'Разработка',
  theme: 'cobalt',
  orientation: 'landscape',

  professions: [
    {
      id: 'backend-developer',
      title: 'Бэкенд-разработчик',
      description:
        'Создаёт серверную часть приложений: пишет логику обработки данных, работает с базами данных, разрабатывает API. Отвечает за то, как система хранит, обрабатывает и передаёт информацию. Если сайт — это машина, бэкенд — её двигатель и электроника: не видно, но без них ничего не работает.',
    },
    {
      id: 'frontend-developer',
      title: 'Фронтенд-разработчик',
      description:
        'Создаёт интерфейсы, которые видит и с которыми взаимодействует пользователь. Работает с HTML, CSS и JavaScript, чтобы сайты и приложения были красивыми, быстрыми и удобными. Фронтенд — это витрина магазина: именно её видят все.',
    },
    {
      id: 'security-specialist',
      title: 'Специалист по информационной безопасности',
      description:
        'Защищает данные и системы от взлома, утечек и атак. Анализирует угрозы, находит уязвимости и настраивает защиту. Если разработчики строят дом, безопасник — это охранная система, сигнализация и бронированная дверь.',
    },
    {
      id: 'devops-engineer',
      title: 'DevOps-инженер',
      description:
        'Настраивает инфраструктуру и автоматизирует процессы разработки и развёртывания. Следит за тем, чтобы код быстро и безопасно доходил от разработчика до пользователя. DevOps — это конвейер на заводе: без него каждую деталь пришлось бы носить вручную.',
    },
  ],

  description:
    'Разработка — профессиональное направление, объединяющее специалистов, которые создают, поддерживают и защищают цифровые продукты. От серверной логики и пользовательских интерфейсов до инфраструктуры и кибербезопасности — разработчики строят технологический фундамент современного мира.',

  tasks: [
    // === Task 1: Распределение задач (distribute) ===
    {
      id: 'task-distribution',
      title: 'Распределение задач',
      mechanic: 'distribute',
      profession: 'all',
      duration: 4,
      mode: 'group',
      order: 1,
      isLast: false,
      feedback: 'instant',
      intro:
        'Сообщение от менеджера проекта: "В нашу компанию поступил список задач. Нужно срочно раскидать их по папкам специалистов, иначе проект сгорит. Помоги распределить задачи правильно!"',
      steps: [
        {
          categories: [
            {
              id: 'backend',
              title: 'Бэкенд-разработчик',
              description: 'Создаёт серверную логику: пишет код обработки данных, работает с базами данных, разрабатывает API. Если сайт — это машина, бэкенд — её двигатель.',
              image: '/assets/games/002/task-distribution/folder-backend.png',
              avatar: '/assets/games/002/task-distribution/avatar-backend.png',
              color: '#4161FF',
            },
            {
              id: 'frontend',
              title: 'Фронтенд-разработчик',
              description: 'Создаёт интерфейсы, которые видит пользователь: вёрстка, анимации, отображение данных. Фронтенд — это витрина магазина.',
              image: '/assets/games/002/task-distribution/folder-frontend.png',
              avatar: '/assets/games/002/task-distribution/avatar-frontend.png',
              color: '#7B4DD6',
            },
            {
              id: 'devops',
              title: 'DevOps-инженер',
              description: 'Настраивает инфраструктуру и автоматизирует процессы: сборку, деплой, резервные копии. DevOps — конвейер на заводе.',
              image: '/assets/games/002/task-distribution/folder-devops.png',
              avatar: '/assets/games/002/task-distribution/avatar-devops.png',
              color: '#D07800',
            },
            {
              id: 'security',
              title: 'Специалист по ИБ',
              description: 'Защищает данные и системы от взлома, утечек и атак. Анализирует уязвимости и настраивает защиту.',
              image: '/assets/games/002/task-distribution/folder-security.png',
              avatar: '/assets/games/002/task-distribution/avatar-security.png',
              color: '#CC2200',
            },
          ],
          items: [
            {
              title: 'Mobile-меню гамбургер',
              text: 'Сделать так, чтобы на мобильных телефонах меню сайта складывалось в «гамбургер» (иконку с тремя полосками).',
              belongs: ['frontend'],
              explanation: 'Адаптивная вёрстка — задача фронтенд-разработчика',
            },
            {
              title: 'Анимация кнопок (CSS)',
              text: 'Добавить анимацию: при наведении на кнопку она плавно меняет цвет и немного увеличивается.',
              belongs: ['frontend'],
              explanation: 'CSS-анимации — работа фронтенда',
            },
            {
              title: 'CSS-сетка карточек',
              text: 'На странице товара фотографии съехали в кривую сетку. Поправить CSS, чтобы карточки встали ровно по макету.',
              belongs: ['frontend'],
              explanation: 'Вёрстка по макету — классическая задача фронтенда',
            },
            {
              title: 'Резервное копирование БД',
              text: 'Настроить автоматическое резервное копирование базы данных каждую ночь.',
              belongs: ['devops'],
              explanation: 'Автоматизация инфраструктурных задач — работа DevOps',
            },
            {
              title: 'API списка товаров',
              text: 'Написать API для получения списка товаров из базы данных.',
              belongs: ['backend'],
              explanation: 'Разработка API и работа с БД — задача бэкенда',
            },
            {
              title: 'SQL-инъекции: проверка',
              text: 'Проверить сайт на уязвимости SQL-инъекций.',
              belongs: ['security'],
              explanation: 'Поиск уязвимостей — работа специалиста по безопасности',
            },
            {
              title: 'Оптимизация запросов к БД',
              text: 'Оптимизировать запрос к базе данных, который тормозит страницу каталога.',
              belongs: ['backend'],
              explanation: 'Оптимизация запросов к БД — задача бэкенда',
            },
            {
              title: 'CI/CD пайплайн',
              text: 'Настроить CI/CD пайплайн для автоматической сборки и деплоя.',
              belongs: ['devops'],
              explanation: 'CI/CD — ключевая задача DevOps-инженера',
            },
            {
              title: 'Аудит паролей + 2FA',
              text: 'Провести аудит паролей сотрудников и настроить двухфакторную аутентификацию.',
              belongs: ['security'],
              explanation: 'Аудит безопасности и настройка 2FA — работа безопасника',
            },
            {
              title: 'Попить кофе ☕',
              text: 'Пойти попить кофе, потому что код не работает, а голова уже не соображает.',
              belongs: [],
              explanation: 'Это нужно всем, но это не рабочая задача ни одного специалиста!',
            },
            {
              title: 'Красная лампочка на сервере 🔴',
              text: 'Смотреть на горящую красную лампочку на сервере и делать вид, что так и задумано.',
              belongs: [],
              explanation: 'Шуточная задача — на самом деле надо срочно чинить!',
            },
            {
              title: 'Объяснить бабушке профессию',
              text: 'Объяснять бабушке, чем ты вообще занимаешься на работе.',
              belongs: [],
              explanation: 'Знакомо каждому айтишнику, но это не рабочая задача',
            },
          ],
        },
      ],
      moral:
        'В реальной IT-компании каждый специалист отвечает за свою область. Бэкенд — за логику и данные, фронтенд — за интерфейс, DevOps — за инфраструктуру, безопасник — за защиту. Когда задачи распределены правильно, проект движется быстро и слаженно, как хорошо настроенный оркестр.',
    },

    // === Task 2: Проверка безопасности (label) ===
    {
      id: 'security-check',
      title: 'Проверка безопасности',
      mechanic: 'label',
      profession: 'security-specialist',
      duration: 3,
      mode: 'solo',
      order: 2,
      isLast: false,
      feedback: 'instant',
      intro:
        'Ты работаешь в отделе информационной безопасности крупной компании. Каждый день через корпоративную почту проходят тысячи писем. Большинство из них безопасны, но иногда мошенники пытаются пробраться в систему.\n\nСистема предварительной фильтрации уже отсеяла явный спам, но оставила 4 письма на ручную проверку. Какое-то из них может быть опасным.\n\nТвоя задача: проанализировать все 4 письма и решить, какие можно пропустить, а какие нужно заблокировать.',
      instruction:
        'Чек-лист: на что обращать внимание\n\n1. Адрес отправителя — совпадает ли с официальным доменом? (bank.ru, а не bank-support.ru)\n2. Тема письма — создаёт ли ощущение срочности? ("Ваш аккаунт заблокирован!")\n3. Ссылки в тексте — ведут ли на настоящий сайт? (наведи и проверь)\n4. Вложения — есть ли подозрительные файлы? (.exe, .zip от незнакомцев)\n5. Обращение — личное или безликое? ("Уважаемый клиент" вместо имени)\n6. Грамматика — есть ли ошибки, странные формулировки?\n7. Запрос данных — просят ли ввести пароль, номер карты?\n8. Контекст — ждали ли вы это письмо? Логично ли оно?',
      steps: [
        {
          labels: [
            {
              id: 'safe',
              title: 'Безопасно',
              icon: 'checkmark',
              color: 'green',
            },
            {
              id: 'danger',
              title: 'Опасно',
              icon: 'warning',
              color: 'red',
            },
          ],
          items: [
            {
              content: {
                type: 'image',
                value: '/assets/games/002/security-check/email-1.png',
                description: 'support@bank-security-check.ru: Срочно подтвердите вашу личность, перейдя по ссылке',
              },
              correctLabel: 'danger',
              explanation: 'Фишинг! Поддельный домен (bank-security-check.ru вместо bank.ru), создание срочности, запрос персональных данных по ссылке.',
            },
            {
              content: {
                type: 'image',
                value: '/assets/games/002/security-check/email-2.png',
                description: 'коллеги из HR-отдела: Напоминание о корпоративе в пятницу',
              },
              correctLabel: 'safe',
              explanation: 'Обычное внутреннее письмо: знакомый отправитель, корпоративный домен, нет ссылок и вложений.',
            },
            {
              content: {
                type: 'image',
                value: '/assets/games/002/security-check/email-3.png',
                description: 'no-reply@company.ru: Ваш ежемесячный отчёт готов',
              },
              correctLabel: 'safe',
              explanation: 'Стандартное автоматическое уведомление с корпоративного домена.',
            },
            {
              content: {
                type: 'image',
                value: '/assets/games/002/security-check/email-4.png',
                description: 'admin@g00gle-support.com: Ваш аккаунт будет удалён через 24 часа',
              },
              correctLabel: 'danger',
              explanation: 'Фишинг! Поддельный домен (g00gle с нулями вместо букв), давление срочностью, угроза удаления аккаунта.',
            },
          ],
        },
      ],
      moral:
        'Именно так работают SOC-аналитики — специалисты по информационной безопасности. Они фильтруют тысячи писем каждый день, чтобы защитить компанию от взлома. Одно пропущенное фишинговое письмо может стоить компании миллионы рублей и утечку данных клиентов. Внимательность к деталям — суперсила безопасника.',
    },

    // === Task 3: Знакомство (match) ===
    {
      id: 'languages-intro',
      title: 'Знакомство',
      mechanic: 'match',
      profession: 'all',
      duration: 4,
      mode: 'solo',
      order: 3,
      isLast: false,
      feedback: 'instant',
      intro:
        'Как бы выглядели языки программирования, если бы были людьми? Соотнеси куски кода с описаниями людей, которые на них "говорят".',
      steps: [
        {
          pairs: [
            {
              left: {
                type: 'character',
                avatar: '/assets/games/002/languages-intro/avatar-java.png',
                label: 'Джентльмен в строгом костюме',
                description: 'Здравствуйте. Посмотрите на мой код — он весь состоит из классов и строгих определений типов. Ценю [public class]{tooltip: "Публичный класс — объявление нового типа объекта, доступного всем. public = доступен всем; class = описываю новый тип объекта. Как чертёж робота в открытом доступе: любой инженер может взять его и собрать такого же робота"} и [private String]{tooltip: "Секретная текстовая переменная. private = доступ только внутри класса; String = тип данных «текст». Как пароль в секретном чипе робота — другие роботы не могут его прочитать"}. Я требую порядка во всём: каждая переменная должна быть объявлена со своим типом, каждая функция — находиться внутри класса. Мой девиз: «Напиши один раз — запускай везде». Меня обожают в банках и крупных компаниях. А ещё у меня на логотипе — чашка кофе, потому что без кофе мой код не соберёшь.',
              },
              right: {
                type: 'code',
                label: 'Java',
                code: 'public class Robot {\n    private String name;\n    private int batteryLevel;\n\n    public Robot(String name) {\n        this.name = name;\n        this.batteryLevel = 100;\n    }\n\n    public void greet() {\n        System.out.println(\n            "Hello, I am " + name\n        );\n    }\n\n    public boolean isReady() {\n        return batteryLevel > 20;\n    }\n\n    public static void main(String[] args) {\n        Robot r = new Robot("R2D2");\n        if (r.isReady()) {\n            r.greet();\n        }\n    }\n}',
              },
              explanation: 'Java — строго типизированный язык с классами. Используется в банках, на Android и в крупных системах.',
            },
            {
              left: {
                type: 'character',
                avatar: '/assets/games/002/languages-intro/avatar-go.png',
                label: 'Хипстер в очках и с блокнотом',
                description: 'Йоу! Гляньте на мой код — никаких классов, только функции и структуры. Обожаю [канал]{tooltip: "Канал (chan) — «трубопровод» для передачи данных между параллельными задачами. Как пневмопочта в офисе: отправил сообщение — другой поток его получил"} для общения между параллельными задачами, который ласково называю chan. Я умею запускать тысячи таких [горутин]{tooltip: "Горутина (go-функция) — лёгкий параллельный поток выполнения. В Go можно запустить тысячи горутин одновременно — это намного дешевле обычных потоков"} одновременно. Меня придумали в Google, чтобы чинить проблемы старых языков. Мой талисман — смешной суслик, а код выглядит очень чисто, почти как Python, но работает быстрее.',
              },
              right: {
                type: 'code',
                label: 'Go',
                code: 'package main\n\nimport (\n    "fmt"\n    "sync"\n)\n\ntype Worker struct {\n    id   int\n    jobs chan string\n}\n\nfunc (w Worker) run(wg *sync.WaitGroup) {\n    defer wg.Done()\n    for job := range w.jobs {\n        fmt.Printf("Worker %d: %s\\n",\n            w.id, job)\n    }\n}\n\nfunc main() {\n    jobs := make(chan string, 3)\n    var wg sync.WaitGroup\n\n    w := Worker{id: 1, jobs: jobs}\n    wg.Add(1)\n    go w.run(&wg)\n\n    jobs <- "task one"\n    jobs <- "task two"\n    close(jobs)\n    wg.Wait()\n}',
              },
              explanation: 'Go (Golang) — язык от Google. Простой синтаксис, мощная многопоточность, талисман — суслик.',
            },
            {
              left: {
                type: 'character',
                avatar: '/assets/games/002/languages-intro/avatar-js.png',
                label: 'Чувак с банкой энергетика',
                description: 'Хей! Я общаюсь с кнопками на сайте напрямую, спасибо моей любимой [стрелочке =>]{tooltip: "Стрелочная функция — краткая запись функции. Вместо function(x) { return x } пишем просто (x) => x. Коротко и красиво!"}. А если вы увидите [document.querySelector]{tooltip: "Команда, которая ищет элемент на веб-странице по CSS-селектору. Как «найти на странице» в браузере, но для программиста"}, знайте — это я ищу элементы на странице. Я тот парень, на котором держится пол-интернета. Раньше я был только для анимации кнопок, а теперь я и на сервере работаю! Моё имя знает каждый, но путают с кофе.',
              },
              right: {
                type: 'code',
                label: 'JavaScript',
                code: 'const fetchUser = async (id) => {\n    const res = await fetch(\n        `/api/users/${id}`\n    );\n    return await res.json();\n};\n\nconst btn = document\n    .querySelector(\'#load-btn\');\nconst card = document\n    .querySelector(\'.user-card\');\n\nbtn.addEventListener(\'click\',\n    async () => {\n        btn.disabled = true;\n        const user = await fetchUser(42);\n        card.innerHTML = `\n            <h2>${user.name}</h2>\n            <p>${user.email}</p>\n        `;\n        btn.disabled = false;\n    }\n);',
              },
              explanation: 'JavaScript — язык интернета. Работает в браузере и на сервере. Стрелочные функции — его визитная карточка.',
            },
            {
              left: {
                type: 'character',
                avatar: '/assets/games/002/languages-intro/avatar-cpp.png',
                label: 'Профессор, заваленный книгами',
                description: 'Здрасьте. Вы не встречали тут мою драгоценную звёздочку [int* ptr]{tooltip: "Указатель — переменная, хранящая адрес в памяти. int* — указатель на целое число. Как GPS-координата: не сам объект, а адрес, где он лежит"}? Это указатель на память. Я работаю напрямую с железом, поэтому могу выделять память через [new]{tooltip: "Команда для резервирования памяти: «займи мне место». Как бронирование столика в ресторане — место занято, пока сам не освободишь"} и удалять через [delete]{tooltip: "Команда для освобождения памяти. Если забудешь — будет «утечка памяти»: программа раздуется и в итоге упадёт"}. Если ошибётесь — программа упадёт без предупреждения. Мне уже под 40, но я всё ещё в строю. На мне написаны игры и фотошоп. Узнали старого деда?',
              },
              right: {
                type: 'code',
                label: 'C++',
                code: '#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Robot {\nprivate:\n    string name;\n    int* battery;\n\npublic:\n    Robot(string n) : name(n) {\n        battery = new int(100);\n    }\n\n    ~Robot() {\n        delete battery;\n    }\n\n    void greet() {\n        cout << "Hello, " << name << endl;\n        cout << "Battery: "\n             << *battery << "%" << endl;\n    }\n};\n\nint main() {\n    Robot* r = new Robot("R2D2");\n    r->greet();\n    delete r;\n    return 0;\n}',
              },
              explanation: 'C++ — мощный язык для игр, графики и системного ПО. Работает напрямую с памятью.',
            },
            {
              left: {
                type: 'character',
                avatar: '/assets/games/002/languages-intro/avatar-python.png',
                label: 'Девушка-блогер с улыбкой',
                description: 'Приветик! Мой прекрасный код ни с кем не спутаешь — никаких фигурных скобок, только [отступы]{tooltip: "В Python структура кода определяется отступами (пробелами), а не фигурными скобками {}. Это делает код очень читаемым и аккуратным на вид"}! В нём всё чисто и читаемо без лишних усилий. А ещё я использую двоеточия и пробелы вместо кучи символов. Меня назвали в честь комедийного шоу Monty Python, а не в честь змеи. На мне пишут нейросети, делают сайты и учат программировать детей.',
              },
              right: {
                type: 'code',
                label: 'Python',
                code: 'class Robot:\n    def __init__(self, name):\n        self.name = name\n        self.battery = 100\n\n    def greet(self):\n        print(f"Hello, I am {self.name}!")\n\n    def charge(self, amount):\n        self.battery = min(\n            100, self.battery + amount\n        )\n        print(f"Battery: {self.battery}%")\n\n    def is_ready(self):\n        return self.battery > 20\n\n\ndef main():\n    r = Robot("R2D2")\n    if r.is_ready():\n        r.greet()\n    r.charge(20)\n\n\nif __name__ == "__main__":\n    main()',
              },
              explanation: 'Python — самый читаемый язык. Используется в AI, науке и обучении. Назван в честь Monty Python.',
            },
            {
              left: {
                type: 'character',
                avatar: '/assets/games/002/languages-intro/avatar-php.png',
                label: 'Парень в ковбойской шляпе',
                description: 'Хаудии! Мои скакуны — это угловые скобки со знаками вопроса [<?php и ?>]{tooltip: "Открывающий и закрывающий теги PHP. Весь код между ними — это PHP. Эти теги можно вставлять прямо в HTML-страницу в любом месте"}. Я прячусь прямо внутри HTML-кода. Сервер меня обожает, потому что я быстро выполняюсь и прост в настройке. Меня часто хейтят, но половина сайтов до сих пор работает на мне. Мой символ — слон.',
              },
              right: {
                type: 'code',
                label: 'PHP',
                code: '<?php\nclass Robot {\n    private string $name;\n    private int $battery;\n\n    public function __construct(\n        string $name\n    ) {\n        $this->name = $name;\n        $this->battery = 100;\n    }\n\n    public function greet(): string {\n        return "Hello, I am "\n            . $this->name . "!";\n    }\n\n    public function isReady(): bool {\n        return $this->battery > 20;\n    }\n}\n\n$robot = new Robot("R2D2");\n$msg = $robot->greet();\n?>\n\n<html><body>\n    <h1><?= $msg ?></h1>\n</body></html>',
              },
              explanation: 'PHP — язык для веб-серверов. На нём работают WordPress, Wikipedia и множество сайтов. Символ — слон.',
            },
          ],
        },
      ],
      moral:
        'Языки программирования в чём-то похожи, а в чём-то совершенно разные — как люди. Сегодня тебе удалось познакомиться с ними поближе. Каждый язык создан для своих задач: Java — для надёжных корпоративных систем, Python — для науки и AI, JavaScript — для интернета. А при желании и наличии интереса ты сможешь самостоятельно продолжить это знакомство и, возможно, заговорить на одном из этих языков!',
    },

    // === Task 4: Список покупок (sequence) ===
    {
      id: 'shopping-list',
      title: 'Список покупок',
      subtitle: 'Собери код',
      mechanic: 'sequence',
      profession: 'backend-developer',
      duration: 3,
      mode: 'solo',
      order: 4,
      isLast: false,
      feedback: 'instant',
      intro:
        'Робот-помощник пытался собрать программу для списка покупок, но у него рассыпались детали. Он перепутал порядок шагов и теперь не знает, что за чем должно идти.\n\nПомоги роботу разложить кусочки кода в правильном порядке — как пазл или инструкцию по сборке техники.',
      instruction:
        'В программировании, как в строительстве дома, есть чёткая последовательность.\n\nНАЧАЛО — Подготовка материалов: сначала мы достаём инструменты ([библиотеки]{tooltip: "from flask import..."}) и включаем компьютер ([создаём приложение]{tooltip: "app = Flask..."}).\nСЕРЕДИНА — Инструкции, что делать: потом мы объясняем роботу, что он должен показывать, [когда к нему приходят гости]{tooltip: "программа должна показать список (show_list) и добавить новый элемент (add_item)"}.\nКОНЕЦ — Запуск: в конце мы говорим [«Всё готово, можно включать!»]{tooltip: "app.run()"}.',
      steps: [
        {
          blocks: [
            {
              text: 'Импорт и создание приложения',
              code: 'from flask import Flask, render_template, request, redirect\n\napp = Flask(__name__)\nshopping_list = ["Молоко", "Хлеб", "Яйца"]',
              order: 1,
            },
            {
              text: 'Функции show_list и add_item',
              code: "@app.route('/')\ndef show_list():\n    return render_template('index.html', items=shopping_list)\n\n@app.route('/add', methods=['POST'])\ndef add_item():\n    new_item = request.form['item']\n    shopping_list.append(new_item)\n    return redirect('/')",
              order: 2,
            },
            {
              text: 'Запуск приложения',
              code: "if __name__ == '__main__':\n    app.run(debug=True)",
              order: 3,
            },
          ],
        },
      ],
      moral:
        'Код, как и любая инструкция, работает только в правильном порядке. Сначала подготовка, потом логика, в конце — запуск. Бэкенд-разработчик каждый день выстраивает такие цепочки, чтобы приложения работали чётко и без сбоев. Порядок в коде — порядок в голове!',
    },

    // === Task 5: Археология кода (match) ===
    {
      id: 'code-archaeology',
      title: 'Археология кода',
      mechanic: 'match',
      profession: 'frontend-developer',
      duration: 3,
      mode: 'solo',
      order: 5,
      isLast: true,
      feedback: 'onComplete',
      intro:
        'На столе разбросаны старые жёсткие диски. На одних сохранились исходники сайтов (фрагменты кода), на других — скриншоты того, как эти сайты выглядели в браузере. За годы хранения данные перепутались, и теперь никто не знает, какой код к какому интерфейсу относится.\n\nПобудь аналитиком и восстанови соответствие между кодом и его визуальным воплощением.',
      instruction:
        'Перед тобой 5 фрагментов кода и 5 картинок.\n\nВнимательно посмотри на код. В нём есть подсказки:\n- HTML — описывает, какие элементы будут на странице (кнопки, поля, картинки)\n- CSS — описывает, как они будут выглядеть (цвет, размер, отступы)\n\nНайди для каждого кода его визуальное воплощение — ту картинку, которая получится на экране.',
      steps: [
        {
          pairs: [
            {
              left: {
                type: 'mockup',
                mockupId: 'buy-button',
                label: 'Кнопка «Купить» в интернет-магазине',
              },
              right: {
                type: 'code',
                hidden: true,
                code: `<button class="buy">
  Купить
</button>

.buy {
  background: #4161FF;
  color: #FFFFFF;
  padding: 18px 44px;
  border-radius: 999px;
  font-size: 32px;
  border: none;
  cursor: pointer;
}`,
              },
              explanation: 'HTML-тег <button> с классом \'buy\' + CSS-стили с синим фоном и эффектом при наведении',
            },
            {
              left: {
                type: 'mockup',
                mockupId: 'dropdown-menu',
                label: 'Выпадающее меню на сайте',
              },
              right: {
                type: 'code',
                hidden: true,
                code: `<div class="dropdown open">
  <div class="title">
    Популярные товары
  </div>
  <ul class="items">
    <li>Подешевле</li>
    <li>Подороже</li>
    <li>Высокий рейтинг</li>
  </ul>
</div>

.dropdown .items {
  display: none;
}
.dropdown.open .items {
  display: block;
}
.title {
  background: #4161FF;
  color: #fff;
}`,
              },
              explanation: 'HTML-список <ul> с вложенными <li> + CSS-стили с display:none/block для показа/скрытия',
            },
            {
              left: {
                type: 'mockup',
                mockupId: 'heart-animation',
                label: 'Анимация лайка в соцсети',
              },
              right: {
                type: 'code',
                hidden: true,
                code: `<svg class="heart liked">
  <path d="M12 21l-1-1
    C5 15 2 12 2 8.5
    A5.5 5.5 0 0 1 12 5
    A5.5 5.5 0 0 1 22 8.5
    C22 12 19 15 13 20z"/>
</svg>

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
}

.heart.liked {
  fill: #4161FF;
  animation: pulse 0.6s ease;
}`,
              },
              explanation: 'CSS @keyframes анимация с transform: scale() для эффекта пульсации сердечка',
            },
            {
              left: {
                type: 'mockup',
                mockupId: 'login-form',
                label: 'Форма входа с проверкой пароля',
              },
              right: {
                type: 'code',
                hidden: true,
                code: `<form>
  <input type="text"
    placeholder="Логин">
  <input type="password"
    placeholder="Пароль"
    class="invalid">
  <p class="error">
    Вы ввели неверный пароль
  </p>
  <button>Войти</button>
</form>

<script>
  if (password.length < 6) {
    input.classList
      .add('invalid');
  }
</script>`,
              },
              explanation: 'HTML <form> с <input type=\'password\'> + JavaScript-валидация длины пароля',
            },
            {
              left: {
                type: 'mockup',
                mockupId: 'product-cards',
                label: 'Карточки товаров с фото и ценой',
              },
              right: {
                type: 'code',
                hidden: true,
                code: `<div class="cards">
  <div class="card">
    <img src="laptop.jpg">
    <p class="name">Ноутбук</p>
    <span class="price">
      38 055 ₽
    </span>
  </div>
  <div class="card">
    <img src="phone.jpg">
    <p class="name">Смартфон</p>
    <span class="price">
      13 163 ₽
    </span>
  </div>
</div>

.cards {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  gap: 12px;
}`,
              },
              explanation: 'HTML-структура с <img> и <span class=\'price\'> + CSS Grid/Flexbox для сетки карточек',
            },
          ],
        },
      ],
      moral:
        'Фронтенд-разработчик — это переводчик между миром кода и миром, который видит пользователь. За каждой красивой кнопкой, анимацией или формой стоят строки HTML, CSS и JavaScript. Научившись читать код, ты начинаешь видеть "скелет" любого сайта — и это первый шаг к тому, чтобы создавать свои!',
    },

    // === Task 6: Баг-хантер (catch) ===
    {
      id: 'bug-hunter',
      title: 'Баг-хантер',
      hidden: true,
      mechanic: 'catch',
      profession: 'security-specialist',
      duration: 3,
      mode: 'solo',
      order: 6,
      isLast: true,
      feedback: 'instant',
      intro:
        'Система мониторинга показала, что в коде завелись жуки. Они падают сверху, как в старых аркадах, и каждый несёт свою проблему. Если пропустить жука — он попадёт в продакшн (на сайт) и сломает всё!\n\nТвоя задача: ловить баги и узнавать, как они выглядят в реальной жизни.',
      instruction:
        'Баг (от англ. bug — жук) — это ошибка в программе, из-за которой она работает неправильно.\n\nВ 1947 году в США программисты нашли настоящего мотылька, который застрял в компьютере и вызывал сбои. Они вклеили его в журнал с пометкой «Первый найденный баг». С тех пор все ошибки в коде называют «жуками».\n\nВ современном мире баги бывают разными:\n- Где-то кнопка не нажимается\n- Где-то сайт тормозит\n- А где-то можно зайти в чужой аккаунт без пароля',
      steps: [
        {
          catcher: {
            type: 'net',
            label: 'Сачок',
          },
          objects: [
            {
              icon: '/assets/games/002/bug-hunter/bug-button.png',
              title: 'Кнопка не нажимается',
              description: 'UI-баг: кнопка не реагирует на клик. Причина — элемент перекрыт невидимым слоем или отключён обработчик событий.',
              category: 'ui',
            },
            {
              icon: '/assets/games/002/bug-hunter/bug-layout.png',
              title: 'Съехавшая вёрстка',
              description: 'Визуальный баг: элементы на странице отображаются криво. Причина — ошибка в CSS или конфликт стилей.',
              category: 'ui',
            },
            {
              icon: '/assets/games/002/bug-hunter/bug-loading.png',
              title: 'Долгая загрузка',
              description: 'Баг производительности: страница грузится больше 10 секунд. Причина — тяжёлые запросы к серверу или неоптимизированные картинки.',
              category: 'performance',
            },
            {
              icon: '/assets/games/002/bug-hunter/bug-calculation.png',
              title: 'Ошибка в расчётах',
              description: 'Логический баг: калькулятор на сайте считает неправильно. Причина — ошибка в формуле или неверное округление.',
              category: 'logic',
            },
            {
              icon: '/assets/games/002/bug-hunter/bug-data-leak.png',
              title: 'Утечка данных',
              description: 'Баг безопасности: персональные данные пользователей доступны без авторизации. Самый опасный тип багов!',
              category: 'security',
            },
            {
              icon: '/assets/games/002/bug-hunter/bug-infinite-load.png',
              title: 'Бесконечная загрузка',
              description: 'Баг: страница крутит индикатор загрузки вечно. Причина — запрос к серверу зацикливается или сервер не отвечает.',
              category: 'performance',
            },
            {
              icon: '/assets/games/002/bug-hunter/bug-search.png',
              title: 'Кривой поиск',
              description: 'Функциональный баг: поиск показывает не те результаты или вообще ничего. Причина — ошибка в алгоритме поиска.',
              category: 'logic',
            },
            {
              icon: '/assets/games/002/bug-hunter/bug-payment.png',
              title: 'Сбой оплаты',
              description: 'Критический баг: пользователь не может оплатить заказ. Причина — ошибка интеграции с платёжной системой.',
              category: 'critical',
            },
          ],
        },
      ],
      moral:
        'Специалист по безопасности — как охотник за багами. В реальной работе баги могут стоить компании миллионы: сбой оплаты — потеря выручки, утечка данных — штрафы и потеря доверия, кривая вёрстка — уход пользователей. Чем раньше найден баг, тем дешевле его исправить. Поэтому тестирование и поиск уязвимостей — одна из самых важных задач в IT.',
    },
  ],

  videos: [
    {
      profession: 'backend-developer',
      title: 'Бэкенд-разработчик',
      src: '/videos/002/backend-developer.mp4',
      subtitles: '/videos/002/backend-developer.vtt',
    },
    {
      profession: 'frontend-developer',
      title: 'Фронтенд-разработчик',
      src: '/videos/002/frontend-developer.mp4',
      subtitles: '/videos/002/frontend-developer.vtt',
    },
    {
      profession: 'security-specialist',
      title: 'Специалист по информационной безопасности',
      src: '/videos/002/security-specialist.mp4',
      subtitles: '/videos/002/security-specialist.vtt',
    },
    {
      profession: 'devops-engineer',
      title: 'DevOps-инженер',
      src: '/videos/002/devops-engineer.mp4',
      subtitles: '/videos/002/devops-engineer.vtt',
    },
  ],
};
