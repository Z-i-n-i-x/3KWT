// ============================================================================
// STEALTH SUR-RON 72V 3000W — ENGINEERING BLUEPRINTS, 1:1 SVG TEMPLATES & GUIDES
// Modal Content Generator for Hotspots & Technical Documentation
// ============================================================================

export const ENGINEERING_MODALS = {
  saddle: {
    title: 'ЧЕРТЕЖ УЗЛА 07: МОТО-СЕДЛО SUR-RON (530 ММ), СТАЛЬНОЙ ПОДРАМНИК И СТОП-СИГНАЛ',
    html: `
      <p><strong>Конструкция посадочного модуля:</strong> Вместо штатного велосипедного штыря на раму <em>Stern Dynamic 1.0 (18")</em> интегрировано длинное двухместное мотоциклетное седло <strong>Sur-Ron / Pitbike (длина 530 мм)</strong> на кастомном сварном стальном подрамнике.</p>
      
      <div class="svg-blueprint-box">
        <svg width="760" height="290" viewBox="0 0 760 290" xmlns="http://www.w3.org/2000/svg">
          <rect width="760" height="290" fill="#07080a"/>
          <!-- Grid -->
          <g stroke="#181c24" stroke-width="1">
            <line x1="0" y1="50" x2="760" y2="50"/><line x1="0" y1="100" x2="760" y2="100"/>
            <line x1="0" y1="150" x2="760" y2="150"/><line x1="0" y1="200" x2="760" y2="200"/>
            <line x1="0" y1="250" x2="760" y2="250"/>
            <line x1="120" y1="0" x2="120" y2="290"/><line x1="280" y1="0" x2="280" y2="290"/>
            <line x1="440" y1="0" x2="440" y2="290"/><line x1="600" y1="0" x2="600" y2="290"/>
          </g>
          <!-- Saddle Profile 530mm -->
          <path d="M 540 135 Q 500 95 430 92 C 330 88 230 65 110 42 Q 70 36 55 44 L 70 85 Q 190 105 350 138 L 415 138 L 415 162 L 475 162 L 475 142 Z"
                fill="rgba(255,85,0,0.14)" stroke="#FF5500" stroke-width="2.5"/>
          <!-- Welded Steel Subframe 18x2mm -->
          <line x1="445" y1="162" x2="462" y2="235" stroke="#00FF66" stroke-width="6"/>
          <line x1="445" y1="142" x2="115" y2="85" stroke="#00FF66" stroke-width="5"/>
          <line x1="145" y1="92" x2="335" y2="235" stroke="#00FF66" stroke-width="5"/>
          <circle cx="335" cy="235" r="6" fill="#FF5500"/>
          <!-- Rear LED Brake Light -->
          <rect x="46" y="72" width="22" height="12" fill="#ff0022" stroke="#ffffff" stroke-width="1"/>
          <!-- Dimensions -->
          <line x1="55" y1="20" x2="540" y2="20" stroke="#00D2FF" stroke-width="1.5"/>
          <text x="295" y="15" fill="#00D2FF" font-family="JetBrains Mono" font-size="12" text-anchor="middle">ОБЩАЯ ДЛИНА МОТО-СЕДЛА = 530 ММ</text>
          <text x="445" y="182" fill="#FF5500" font-family="JetBrains Mono" font-size="11" text-anchor="middle">П-ПАЗ 40×70 ММ (ПОДСЕДЕЛ)</text>
          <text x="205" y="195" fill="#00FF66" font-family="JetBrains Mono" font-size="11">УКОСИНЫ СТАЛЬ Ø18×2 ММ (БОЛТЫ М6 К ПЕРЬЯМ)</text>
          <text x="115" y="68" fill="#ffffff" font-family="JetBrains Mono" font-size="11">ПОРОЛОН ПВВ 55 КГ/М³ (75-80 ММ)</text>
        </svg>
      </div>

      <table class="spec-table">
        <tr>
          <th>Параметр узла</th>
          <th>Инженерная спецификация</th>
        </tr>
        <tr>
          <td>Посадочный П-образный паз носика</td>
          <td>Ширина <strong>40 мм</strong> × глубина <strong>70 мм</strong> — плотно садится на срез подседельной трубы <code>(-0.145, 0.435, 0)</code> вровень с сумкой Cordura 1000D.</td>
        </tr>
        <tr>
          <td>Геометрия подушки (ПВВ 55 кг/м³)</td>
          <td>Передний наплыв <strong>45 мм</strong>, центральная анатомическая яма <strong>75–80 мм</strong>, задний хвост <strong>55 мм</strong> в матовом антислип-виниле.</td>
        </tr>
        <tr>
          <td>Сварной стальной подрамник</td>
          <td>Труба холоднокатаная <strong>Ø16–20 мм (стенка 2.0 мм)</strong>, грунт-эмаль CERTA RAL 9005. Задние распорки крепятся болтами <strong>М6</strong> к верхним перьям рамы.</td>
        </tr>
        <tr>
          <td>Распайка LED Стоп-сигнала (12V)</td>
          <td>3 провода: <code>Черный -> GND (12V-)</code>, <code>Синий -> Габарит (+12V от тумблера фары)</code>, <code>Красный -> Стоп (+12V через нормально-разомкнутый геркон ручки ZOOM HB-890E)</code>.</td>
        </tr>
      </table>
    `
  },

  dropout: {
    title: 'SVG-ШАБЛОН 1:1 (УЗЕЛ 04): МОНОЛИТНАЯ СТАЛЬНАЯ БРОНЕПЛАСТИНА 6 ММ (ОСЬ М14 + ТОРМОЗ IS 51 ММ)',
    html: `
      <p><strong>Назначение детали «2-в-1»:</strong> Удерживает крутящий момент прямоприводного мотора <strong>72V 3000W</strong> (предотвращает проворот оси М14 с лысками 10 мм в алюминиевом дропауте) и одновременно несет верхние ушки <strong>IS 51 мм</strong> для 4-поршневого суппорта <strong>ZOOM HB-890E</strong> под ротор 180 мм.</p>

      <div class="svg-blueprint-box">
        <svg width="760" height="310" viewBox="0 0 760 310" xmlns="http://www.w3.org/2000/svg">
          <rect width="760" height="310" fill="#07080a"/>
          <!-- Monolithic 6mm Plate Contour -->
          <path d="M 290 260 L 355 260 L 355 188 L 385 188 L 385 260 L 450 260 L 465 145 L 430 48 L 392 44 L 372 105 L 315 82 L 282 92 L 290 190 Z"
                fill="rgba(255,85,0,0.16)" stroke="#FF5500" stroke-width="3"/>
          <!-- IS 51mm Mounting Holes (Ø6.2mm) -->
          <circle cx="410" cy="68" r="11" fill="#07080a" stroke="#00FF66" stroke-width="2.5"/>
          <circle cx="305" cy="105" r="11" fill="#07080a" stroke="#00FF66" stroke-width="2.5"/>
          <!-- M14x10mm Axle Center Reference -->
          <line x1="340" y1="215" x2="400" y2="215" stroke="#00D2FF" stroke-width="1" stroke-dasharray="4,3"/>
          <line x1="370" y1="175" x2="370" y2="265" stroke="#00D2FF" stroke-width="1" stroke-dasharray="4,3"/>
          <!-- IS 51mm Dimension Line -->
          <line x1="305" y1="105" x2="410" y2="68" stroke="#00FF66" stroke-width="1.5" stroke-dasharray="5,3"/>
          <text x="350" y="65" fill="#00FF66" font-family="JetBrains Mono" font-size="12" font-weight="bold">IS СТАНДАРТ = 51.0 ММ (2× Ø6.2 ММ)</text>
          <text x="370" y="285" fill="#FF5500" font-family="JetBrains Mono" font-size="12" font-weight="bold" text-anchor="middle">ПАЗ ОСИ М14: ШИРИНА 10.0 ММ × ВЫСОТА 14.0 ММ (ПОСАДКА С НАТЯГОМ)</text>
          <text x="595" y="155" fill="#ffffff" font-family="JetBrains Mono" font-size="12">ЛИСТОВАЯ СТАЛЬ СТ3 / 09Г2С</text>
          <text x="595" y="175" fill="#00D2FF" font-family="JetBrains Mono" font-size="12">ТОЛЩИНА: 6.0 ММ (МОНОЛИТ)</text>
          <text x="595" y="195" fill="#8E95A2" font-family="JetBrains Mono" font-size="11">+ СВАРКА К ДРОПАУТУ 5 ММ</text>
        </svg>
      </div>

      <table class="spec-table">
        <tr>
          <th>Узел / Параметр</th>
          <th>Допуски и технология изготовления</th>
        </tr>
        <tr>
          <td>Паз под ось мотора М14</td>
          <td>Ширина паза строго <strong>10.00..10.05 мм</strong>, глубина <strong>14.0 мм</strong> (ось забивается легким кияночным натягом без малейшего люфта при рекуперации EBS).</td>
        </tr>
        <tr>
          <td>Тормозные ушки IS -> PM 180</td>
          <td>Межцентровое расстояние <strong>51.0 мм</strong>, диаметр отверстий <strong>6.2 мм</strong> под болты М6 класса прочности 10.9 + переходник <code>IS-PM Rear 180</code>.</td>
        </tr>
        <tr>
          <td>Калипер ZOOM HB-890E</td>
          <td>4-поршневой гидравлический суппорт на минеральном масле с радиаторными колодками и ротором <strong>180 мм</strong>.</td>
        </tr>
      </table>
    `
  },

  motor: {
    title: 'ТЕХКАРТА УЗЛА 03: МОТОР-КОЛЕСО 72V 3000W DD — ЗАЛИВКА 40 МЛ ПМС-100 И ПАЙКА РЕКУПЕРАЦИИ (EBS)',
    html: `
      <p><strong>Тепловой тюнинг и электродинамическое торможение:</strong> Прямоприводное мотор-колесо <strong>72V 3000W Direct Drive (корпус Ø245 мм, 18 винтов М4 на крышку)</strong> при пиках до <strong>5040W (84V × 60A)</strong> требует жидкостного теплового моста статор-корпус и активации рекуперативного тормоза <strong>EBS</strong>.</p>

      <div class="svg-blueprint-box">
        <svg width="760" height="250" viewBox="0 0 760 250" xmlns="http://www.w3.org/2000/svg">
          <rect width="760" height="250" fill="#07080a"/>
          <!-- DD Motor Cross Section -->
          <circle cx="190" cy="125" r="92" fill="#111318" stroke="#FF5500" stroke-width="3"/>
          <circle cx="190" cy="125" r="76" fill="none" stroke="#00D2FF" stroke-width="5" stroke-dasharray="8,4"/>
          <circle cx="190" cy="125" r="22" fill="#22252a" stroke="#ffffff" stroke-width="2"/>
          <text x="190" y="238" fill="#00D2FF" font-family="JetBrains Mono" font-size="11" text-anchor="middle">ПМС-100 (40 МЛ = 2 ШПРИЦА ПО 20 МЛ)</text>
          <!-- Controller PCB EBS Jumper -->
          <rect x="390" y="45" width="330" height="160" fill="#0f1712" stroke="#00FF66" stroke-width="2"/>
          <text x="410" y="75" fill="#00FF66" font-family="JetBrains Mono" font-size="12" font-weight="bold">ПЛАТА КОНТРОЛЛЕРА 72V 60A (18 MOSFET)</text>
          <circle cx="465" cy="135" r="14" fill="#d97f45" stroke="#fff" stroke-width="2"/>
          <text x="465" y="139" fill="#000" font-family="JetBrains Mono" font-size="11" font-weight="bold" text-anchor="middle">EBS</text>
          <circle cx="615" cy="135" r="14" fill="#d97f45" stroke="#fff" stroke-width="2"/>
          <text x="615" y="139" fill="#000" font-family="JetBrains Mono" font-size="11" font-weight="bold" text-anchor="middle">GND</text>
          <path d="M 479 135 Q 540 95 601 135" fill="none" stroke="#FF5500" stroke-width="4"/>
          <text x="540" y="102" fill="#FF5500" font-family="JetBrains Mono" font-size="11" font-weight="bold" text-anchor="middle">ПЕРЕМЫЧКА МГТФ 0.5 ММ²</text>
          <text x="410" y="185" fill="#d5d9e0" font-family="JetBrains Mono" font-size="11">Активация торможения двигателем от герконов ZOOM</text>
        </svg>
      </div>

      <table class="spec-table">
        <tr>
          <th>Операция</th>
          <th>Пошаговый регламент выполнения</th>
        </tr>
        <tr>
          <td>1. Герметизация и заливка ПМС-100</td>
          <td>Открутить 18 винтов М4 левой крышки (со стороны ротора), обезжирить фланец, нанести герметик <strong>Victor Reinz</strong>. Через верхнее отверстие залить ровно <strong>40 мл (2 медицинских шприца по 20 мл)</strong> диэлектрического силиконового масла <strong>ПМС-100</strong>. Температура обмоток падает на <strong>22–28°C</strong>.</td>
        </tr>
        <tr>
          <td>2. Распайка точки EBS -> GND</td>
          <td>На плате синусного контроллера 60А запаять перемычку между контактной площадкой <code>EBS</code> (Electronic Brake System) и общей землей <code>GND</code>. При нажатии ручки тормоза ZOOM мотор генерирует обратный ток рекуперации в АКБ 20S7P, экономя колодки до 70%.</td>
        </tr>
      </table>
    `
  },

  wiring: {
    title: 'СХЕМА УЗЛА 06: 3D-КОРОБ PETG ПОД РАМОЙ, DC-DC 12V 10A, КНОПКА 2-В-1, ФАРА SUR-RON 20W И ГУДОК 105 ДБ',
    html: `
      <p><strong>Архитектура низковольтной сети 12V:</strong> Весь монтаж силовых фазных клемм, преобразователя <code>DC-DC 36–120V -> 12V 10A</code> и мотоциклетного гудка <strong>105 дБ</strong> скрыт внутри герметичного граненого 3D-короба из <strong>PETG</strong> под нижней трубой рамы вплотную к торцу контроллера 60А.</p>

      <div class="svg-blueprint-box">
        <svg width="760" height="270" viewBox="0 0 760 270" xmlns="http://www.w3.org/2000/svg">
          <rect width="760" height="270" fill="#07080a"/>
          <!-- 72V Input -->
          <rect x="25" y="35" width="145" height="55" fill="#181b22" stroke="#FF5500" stroke-width="2"/>
          <text x="97" y="60" fill="#FF5500" font-family="JetBrains Mono" font-size="11" font-weight="bold" text-anchor="middle">АКБ 20S7P (72V/84V)</text>
          <text x="97" y="78" fill="#8E95A2" font-family="JetBrains Mono" font-size="10" text-anchor="middle">Разъем XT90-S Anti-Spark</text>

          <!-- DC-DC 12V 10A -->
          <rect x="235" y="35" width="185" height="65" fill="#141e19" stroke="#00FF66" stroke-width="2"/>
          <text x="327" y="60" fill="#00FF66" font-family="JetBrains Mono" font-size="11" font-weight="bold" text-anchor="middle">DC-DC 36-120V -> 12V 10A</text>
          <text x="327" y="80" fill="#d5d9e0" font-family="JetBrains Mono" font-size="10" text-anchor="middle">Внутри 3D-короба PETG</text>

          <!-- 2-in-1 Handlebar Switch -->
          <rect x="235" y="155" width="185" height="75" fill="#181b22" stroke="#00D2FF" stroke-width="2"/>
          <text x="327" y="180" fill="#00D2FF" font-family="JetBrains Mono" font-size="11" font-weight="bold" text-anchor="middle">БЛОК КНОПОК 2-В-1 (РУЛЬ)</text>
          <text x="327" y="200" fill="#ffffff" font-family="JetBrains Mono" font-size="10" text-anchor="middle">1. Тумблер Света (Фикс.)</text>
          <text x="327" y="216" fill="#ff4444" font-family="JetBrains Mono" font-size="10" text-anchor="middle">2. Красная кнопка Гудка</text>

          <!-- Sur-Ron Headlight & Horn -->
          <rect x="515" y="30" width="215" height="65" fill="#181b22" stroke="#00FF66" stroke-width="2"/>
          <text x="622" y="55" fill="#00FF66" font-family="JetBrains Mono" font-size="11" font-weight="bold" text-anchor="middle">ФАРА SUR-RON 20W (2 LED)</text>
          <text x="622" y="75" fill="#d5d9e0" font-family="JetBrains Mono" font-size="10" text-anchor="middle">+ Габарит заднего крыла</text>

          <rect x="515" y="155" width="215" height="75" fill="#181b22" stroke="#FF5500" stroke-width="2"/>
          <text x="622" y="182" fill="#FF5500" font-family="JetBrains Mono" font-size="11" font-weight="bold" text-anchor="middle">МОТО-ГУДОК 105 ДБ (12V)</text>
          <text x="622" y="202" fill="#d5d9e0" font-family="JetBrains Mono" font-size="10" text-anchor="middle">На пружинной пластине</text>
          <text x="622" y="218" fill="#8E95A2" font-family="JetBrains Mono" font-size="10" text-anchor="middle">напротив акустических жабр</text>

          <!-- Wires -->
          <line x1="170" y1="62" x2="235" y2="62" stroke="#FF5500" stroke-width="3"/>
          <line x1="327" y1="100" x2="327" y2="155" stroke="#00FF66" stroke-width="3"/>
          <line x1="420" y1="178" x2="515" y2="62" stroke="#00D2FF" stroke-width="2.5"/>
          <line x1="420" y1="205" x2="515" y2="192" stroke="#ff4444" stroke-width="2.5"/>
        </svg>
      </div>

      <table class="spec-table">
        <tr>
          <th>Компонент</th>
          <th>Особенности монтажа в 3D-коробе</th>
        </tr>
        <tr>
          <td>Акустические прорези-жабры («чешуя»)</td>
          <td>Наклонены назад под углом <strong>45°</strong> на боковых и нижней стенках 3D-короба — беспрепятственно пропускают звуковую волну <strong>105 дБ</strong> и полностью отсекают брызги воды от переднего колеса.</td>
        </tr>
        <tr>
          <td>Силовой клеммник фаз U / V / W</td>
          <td>Керамический/карболитовый блок <strong>W20 (3 шпильки М5)</strong> соединяет фазные провода контроллера 60А и мотора 3000W внутри сухого объема короба.</td>
        </tr>
      </table>
    `
  },

  battery: {
    title: 'СХЕМА СБОРКИ И РАСПАЙКИ АКБ 20S7P (140× 21700 EVE 50E) + BISIDA BMS 120A',
    html: `
      <p><strong>Полная топология соединений «Змейкой» (Serpentine 20S7P):</strong> 140 ячеек <code>EVE INR21700-50E</code> уложены в 8 гексагональных рядов вдоль нижней трубы (ряды 1–4 по <strong>21 банке = 3 группы 7P</strong>, ряды 5–8 по <strong>14 банок = 2 группы 7P</strong>). Нечетные переходы (<code>1S→2S</code>, <code>3S→4S</code>, ..., <code>19S→20S</code>) выполняются на <strong>Правой стороне (-Z)</strong>, четные (<code>2S→3S</code>, <code>4S→5S</code>, ..., <code>18S→19S</code>) — на <strong>Левой стороне (+Z)</strong>.</p>

      <div class="svg-blueprint-box">
        <svg width="760" height="340" viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg">
          <rect width="760" height="340" fill="#07080a"/>
          <!-- BMS Top Block -->
          <rect x="190" y="12" width="290" height="38" fill="#141820" stroke="#FF5500" stroke-width="2"/>
          <text x="335" y="28" fill="#FF5500" font-family="JetBrains Mono" font-size="11" font-weight="bold" text-anchor="middle">BISIDA BMS 20S 120A (ПОД ВЕРХНЕЙ ТРУБОЙ)</text>
          <text x="335" y="43" fill="#cfd6e0" font-family="JetBrains Mono" font-size="9.5" text-anchor="middle">Пятаки: [B- к 1S(-)] • [C- к XT90(-)] • Разъем 21-pin JST (B0..B20)</text>

          <!-- XT90-S Rear Pocket -->
          <rect x="20" y="12" width="145" height="38" fill="#241e08" stroke="#f5b800" stroke-width="2"/>
          <text x="92" y="28" fill="#f5b800" font-family="JetBrains Mono" font-size="11" font-weight="bold" text-anchor="middle">AMASS XT90-S (84V)</text>
          <text x="92" y="43" fill="#ffffff" font-family="JetBrains Mono" font-size="9.5" text-anchor="middle">[+] от 20S • [-] от BMS C-</text>

          <!-- 8 Rows Serpentine Diagram -->
          <!-- Row 8 (Top, 2 groups): 20S <- 19S -->
          <rect x="80" y="66" width="150" height="24" fill="#3a1010" stroke="#ff3b1f" stroke-width="2"/>
          <text x="155" y="82" fill="#ffffff" font-family="JetBrains Mono" font-size="10" font-weight="bold" text-anchor="middle">20S (7P) [+B+ 84V на +Z]</text>
          <rect x="250" y="66" width="150" height="24" fill="#102230" stroke="#00D2FF" stroke-width="1.5"/>
          <text x="325" y="82" fill="#00D2FF" font-family="JetBrains Mono" font-size="10" text-anchor="middle">19S (7P) [19S→20S на -Z]</text>

          <!-- Row 7 (2 groups): 17S -> 18S -->
          <rect x="80" y="98" width="150" height="24" fill="#102230" stroke="#00D2FF" stroke-width="1.5"/>
          <text x="155" y="114" fill="#00D2FF" font-family="JetBrains Mono" font-size="10" text-anchor="middle">17S (7P) [17S→18S на -Z]</text>
          <rect x="250" y="98" width="150" height="24" fill="#10281c" stroke="#00FF66" stroke-width="1.5"/>
          <text x="325" y="114" fill="#00FF66" font-family="JetBrains Mono" font-size="10" text-anchor="middle">18S (7P) [18S→19S на +Z]</text>

          <!-- Row 6 (2 groups): 16S <- 15S -->
          <rect x="80" y="130" width="150" height="24" fill="#10281c" stroke="#00FF66" stroke-width="1.5"/>
          <text x="155" y="146" fill="#00FF66" font-family="JetBrains Mono" font-size="10" text-anchor="middle">16S (7P) [16S→17S на +Z]</text>
          <rect x="250" y="130" width="150" height="24" fill="#102230" stroke="#00D2FF" stroke-width="1.5"/>
          <text x="325" y="146" fill="#00D2FF" font-family="JetBrains Mono" font-size="10" text-anchor="middle">15S (7P) [15S→16S на -Z]</text>

          <!-- Row 5 (2 groups): 13S -> 14S -->
          <rect x="80" y="162" width="150" height="24" fill="#102230" stroke="#00D2FF" stroke-width="1.5"/>
          <text x="155" y="178" fill="#00D2FF" font-family="JetBrains Mono" font-size="10" text-anchor="middle">13S (7P) [13S→14S на -Z]</text>
          <rect x="250" y="162" width="150" height="24" fill="#10281c" stroke="#00FF66" stroke-width="1.5"/>
          <text x="325" y="178" fill="#00FF66" font-family="JetBrains Mono" font-size="10" text-anchor="middle">14S (7P) [14S→15S на +Z]</text>

          <!-- Row 4 (3 groups): 12S <- 11S <- 10S -->
          <rect x="80" y="196" width="150" height="24" fill="#10281c" stroke="#00FF66" stroke-width="1.5"/>
          <text x="155" y="212" fill="#00FF66" font-family="JetBrains Mono" font-size="10" text-anchor="middle">12S (7P) [12S→13S на +Z]</text>
          <rect x="250" y="196" width="150" height="24" fill="#102230" stroke="#00D2FF" stroke-width="1.5"/>
          <text x="325" y="212" fill="#00D2FF" font-family="JetBrains Mono" font-size="10" text-anchor="middle">11S (7P) [11S→12S на -Z]</text>
          <rect x="420" y="196" width="150" height="24" fill="#10281c" stroke="#00FF66" stroke-width="1.5"/>
          <text x="495" y="212" fill="#00FF66" font-family="JetBrains Mono" font-size="10" text-anchor="middle">10S (7P) [10S→11S на +Z]</text>

          <!-- Row 3 (3 groups): 7S -> 8S -> 9S -->
          <rect x="80" y="228" width="150" height="24" fill="#102230" stroke="#00D2FF" stroke-width="1.5"/>
          <text x="155" y="244" fill="#00D2FF" font-family="JetBrains Mono" font-size="10" text-anchor="middle">7S (7P) [7S→8S на -Z]</text>
          <rect x="250" y="228" width="150" height="24" fill="#10281c" stroke="#00FF66" stroke-width="1.5"/>
          <text x="325" y="244" fill="#00FF66" font-family="JetBrains Mono" font-size="10" text-anchor="middle">8S (7P) [8S→9S на +Z]</text>
          <rect x="420" y="228" width="150" height="24" fill="#102230" stroke="#00D2FF" stroke-width="1.5"/>
          <text x="495" y="244" fill="#00D2FF" font-family="JetBrains Mono" font-size="10" text-anchor="middle">9S (7P) [9S→10S на -Z]</text>

          <!-- Row 2 (3 groups): 6S <- 5S <- 4S -->
          <rect x="80" y="260" width="150" height="24" fill="#10281c" stroke="#00FF66" stroke-width="1.5"/>
          <text x="155" y="276" fill="#00FF66" font-family="JetBrains Mono" font-size="10" text-anchor="middle">6S (7P) [6S→7S на +Z]</text>
          <rect x="250" y="260" width="150" height="24" fill="#102230" stroke="#00D2FF" stroke-width="1.5"/>
          <text x="325" y="276" fill="#00D2FF" font-family="JetBrains Mono" font-size="10" text-anchor="middle">5S (7P) [5S→6S на -Z]</text>
          <rect x="420" y="260" width="150" height="24" fill="#10281c" stroke="#00FF66" stroke-width="1.5"/>
          <text x="495" y="276" fill="#00FF66" font-family="JetBrains Mono" font-size="10" text-anchor="middle">4S (7P) [4S→5S на +Z]</text>

          <!-- Row 1 (Bottom along Downtube, 3 groups): 1S -> 2S -> 3S -->
          <rect x="80" y="292" width="150" height="26" fill="#08243c" stroke="#00D2FF" stroke-width="2"/>
          <text x="155" y="309" fill="#ffffff" font-family="JetBrains Mono" font-size="10" font-weight="bold" text-anchor="middle">1S (7P) [-B- 0V на +Z]</text>
          <rect x="250" y="292" width="150" height="26" fill="#10281c" stroke="#00FF66" stroke-width="1.5"/>
          <text x="325" y="309" fill="#00FF66" font-family="JetBrains Mono" font-size="10" text-anchor="middle">2S (7P) [2S→3S на +Z]</text>
          <rect x="420" y="292" width="150" height="26" fill="#102230" stroke="#00D2FF" stroke-width="1.5"/>
          <text x="495" y="309" fill="#00D2FF" font-family="JetBrains Mono" font-size="10" text-anchor="middle">3S (7P) [3S→4S на -Z]</text>

          <!-- Power Cables Routing -->
          <path d="M 80 305 L 42 305 L 42 56 L 210 56 L 210 50" fill="none" stroke="#00D2FF" stroke-width="3.5"/>
          <text x="32" y="185" fill="#00D2FF" font-family="JetBrains Mono" font-size="10" transform="rotate(-90 32 185)" text-anchor="middle">СИНИЙ 6AWG B- (ОТ 1S К BMS B-)</text>
          <line x1="115" y1="66" x2="115" y2="50" stroke="#ff3b1f" stroke-width="3.5"/>
          <line x1="190" y1="30" x2="165" y2="30" stroke="#ffffff" stroke-width="3"/>

          <!-- Legend Box -->
          <rect x="585" y="66" width="160" height="252" fill="#0e1116" stroke="#2c3340" stroke-width="1"/>
          <text x="665" y="88" fill="#FF5500" font-family="JetBrains Mono" font-size="11" font-weight="bold" text-anchor="middle">ПРАВИЛА СВАРКИ</text>
          <text x="595" y="112" fill="#00FF66" font-family="JetBrains Mono" font-size="9.5">● Зеленые блоки:</text>
          <text x="595" y="126" fill="#cfd6e0" font-family="JetBrains Mono" font-size="9">Переход на ЛЕВОЙ (+Z)</text>
          <text x="595" y="150" fill="#00D2FF" font-family="JetBrains Mono" font-size="9.5">● Синие блоки:</text>
          <text x="595" y="164" fill="#cfd6e0" font-family="JetBrains Mono" font-size="9">Переход на ПРАВОЙ (-Z)</text>
          <text x="595" y="190" fill="#f5b800" font-family="JetBrains Mono" font-size="9.5">● Никель + Медь:</text>
          <text x="595" y="204" fill="#cfd6e0" font-family="JetBrains Mono" font-size="9">Лента 0.15×9 мм +</text>
          <text x="595" y="218" fill="#cfd6e0" font-family="JetBrains Mono" font-size="9">медная шина 2.5 мм²</text>
          <text x="595" y="244" fill="#ff3b1f" font-family="JetBrains Mono" font-size="9.5">● Балансировка:</text>
          <text x="595" y="258" fill="#cfd6e0" font-family="JetBrains Mono" font-size="9">B0 (черный) -> 1S(-)</text>
          <text x="595" y="272" fill="#cfd6e0" font-family="JetBrains Mono" font-size="9">B1..B19 -> плюсы 1S..19S</text>
          <text x="595" y="286" fill="#cfd6e0" font-family="JetBrains Mono" font-size="9">B20 -> плюс 20S (84V)</text>
        </svg>
      </div>

      <table class="spec-table">
        <tr>
          <th>Узел коммутации АКБ</th>
          <th>Как соединять (Пошаговая инструкция)</th>
        </tr>
        <tr>
          <td>1. Параллели 7P (внутри секций 1S..20S)</td>
          <td>В каждой группе <strong>7 банок</strong> стоят одинаковой полярностью и сварены с обоих торцов (<code>+Z</code> и <code>-Z</code>) чистой никелевой лентой <strong>0.15 × 9 мм</strong> (по 4 точки сварки на контакт) с напаянной центральной медной жилой <strong>2.5 мм²</strong>.</td>
        </tr>
        <tr>
          <td>2. Последовательная «Змейка» (1S → 20S)</td>
          <td>Группы чередуются по полярности: <code>1S(-)</code> на левой стороне -> на правой стороне <code>1S(+)</code> переходит широкой медно-никелевой шиной в <code>2S(-)</code> -> на левой стороне <code>2S(+)</code> переходит в <code>3S(-)</code> -> на правой стороне <code>3S(+)</code> поднимается на 2-й ряд в <code>4S(-)</code> и т.д. до <code>20S(+)</code>.</td>
        </tr>
        <tr>
          <td>3. Силовые выводы (B-, C-, B+) и BMS</td>
          <td>От минуса <code>1S</code> (внизу у каретки) синий кабель <strong>6AWG</strong> идет вверх к пятаку <code>B-</code> платы <strong>Bisida BMS 120A</strong>. С пятака <code>C-</code> BMS черный кабель <strong>6AWG</strong> идет на минус разъема <strong>Amass XT90-S</strong>, а красный кабель <strong>6AWG (B+ 84V)</strong> идет с <code>20S(+)</code> (8-й ряд у подседела) прямо на плюс <strong>XT90-S</strong>.</td>
        </tr>
      </table>
    `
  }
};

