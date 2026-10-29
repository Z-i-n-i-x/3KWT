// ============================================================================
// STEALTH SUR-RON 72V 3000W — ENGINEERING BLUEPRINTS & CAD TABLET (6 SHEETS)
// Professional GOST/CAD vector blueprints, 1:1 scale templates, schematics & guides
// ============================================================================

export const CAD_SHEETS = [
  {
    id: 1,
    title: 'ЧЕРТЕЖ №1: МОНОЛИТНЫЙ ДРОПАУТ М14 + КРЕПЛЕНИЕ ТОРМОЗА IS 51 ММ (СТАЛЬ 6 ММ, МАСШТАБ 1:1)',
    shortTitle: '1. ДРОПАУТ М14 + IS 51',
    specSummary: 'Сталь 40Х / 45 (Лист 6.0 мм, термообработка 32-35 HRC)',
    desc: 'Усиленный монолитный дропаут под ось мотор-колеса 3000W с лысками 10.0 мм и резьбой М14x1.5. Интегрированные ушки стандарта IS (межцентровое 51.0 мм, 2x М6) под переходник IS-PM Rear 180 и 4-поршневой калипер ZOOM HB-890E. Накладной монтаж поверх заводского 5-мм дропаута рамы Stern с периметральной сваркой толстое к толстому (шов Т3 катет 4 мм) без прогрева тонкостенной трубки пера Ø18×1.2 мм.',
    svg: `<svg viewBox="0 0 1000 680" xmlns="http://www.w3.org/2000/svg" class="cad-sheet-svg">
      <defs>
        <pattern id="cad-grid-1" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--cad-grid-line, #13243a)" stroke-width="0.8"/>
        </pattern>
        <pattern id="cad-grid-major-1" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#cad-grid-1)"/>
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="var(--cad-grid-major, #1d3654)" stroke-width="1.4"/>
        </pattern>
        <marker id="arrow-1" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="var(--cad-dim-color, #00d2ff)"/>
        </marker>
      </defs>

      <rect width="1000" height="680" fill="var(--cad-bg, #0a192f)"/>
      <rect width="1000" height="680" fill="url(#cad-grid-major-1)"/>
      <rect x="20" y="20" width="960" height="640" fill="none" stroke="var(--cad-border, #64ffda)" stroke-width="2.5"/>
      <rect x="25" y="25" width="950" height="630" fill="none" stroke="var(--cad-border-inner, #234567)" stroke-width="1"/>

      <text x="500" y="58" fill="var(--cad-title, #64ffda)" font-family="monospace" font-size="18" font-weight="900" text-anchor="middle" letter-spacing="1.5">МОНОЛИТНЫЙ ДРОПАУТ М14 + КРЕПЛЕНИЕ ТОРМОЗА IS 51 ММ (СТАЛЬ 6 ММ)</text>
      <text x="500" y="80" fill="var(--cad-sub, #8892b0)" font-family="monospace" font-size="12" text-anchor="middle">СБОРОЧНЫЙ ЧЕРТЕЖ УЗЛА 04 • МАСШТАБ 1:1 • ТОЛЩИНА ПЛАСТИНЫ S = 6.0 ММ</text>

      <g transform="translate(140, 110)">
        <path d="M 60 210 L 140 130 L 220 180 L 230 250 L 170 300 L 90 280 Z" fill="rgba(136, 146, 176, 0.12)" stroke="#556677" stroke-width="1.8" stroke-dasharray="6 4"/>
        <text x="160" y="165" fill="#8892b0" font-family="monospace" font-size="11" font-style="italic">Заводской 5мм дропаут рамы Stern</text>

        <path d="M 40 100 L 140 130 L 125 155 L 25 125 Z" fill="rgba(0, 210, 255, 0.08)" stroke="#00d2ff" stroke-width="2"/>
        <text x="30" y="85" fill="#00d2ff" font-family="monospace" font-size="10">Верхнее перо Ø18×1.2</text>
        <path d="M 20 280 L 90 280 L 85 308 L 15 308 Z" fill="rgba(0, 210, 255, 0.08)" stroke="#00d2ff" stroke-width="2"/>
        <text x="20" y="330" fill="#00d2ff" font-family="monospace" font-size="10">Нижнее перо Ø22×1.5</text>

        <path d="M 100 230 L 110 90 Q 115 50 150 45 L 210 45 Q 240 50 250 85 L 265 140 L 320 180 Q 345 200 345 235 L 340 310 Q 335 340 300 345 L 180 345 Q 140 345 125 310 L 100 230 Z"
              fill="rgba(100, 255, 218, 0.09)" stroke="var(--cad-line-main, #64ffda)" stroke-width="3.2"/>

        <circle cx="155" cy="75" r="8.5" fill="var(--cad-hole-fill, #0a192f)" stroke="var(--cad-line-main, #64ffda)" stroke-width="2.5"/>
        <circle cx="155" cy="75" r="3.1" fill="var(--cad-line-main, #64ffda)"/>
        <line x1="140" y1="75" x2="170" y2="75" stroke="#64ffda" stroke-width="0.8" stroke-dasharray="4 2"/>
        <line x1="155" y1="60" x2="155" y2="90" stroke="#64ffda" stroke-width="0.8" stroke-dasharray="4 2"/>

        <circle cx="195" cy="106" r="8.5" fill="var(--cad-hole-fill, #0a192f)" stroke="var(--cad-line-main, #64ffda)" stroke-width="2.5"/>
        <circle cx="195" cy="106" r="3.1" fill="var(--cad-line-main, #64ffda)"/>
        <line x1="180" y1="106" x2="210" y2="106" stroke="#64ffda" stroke-width="0.8" stroke-dasharray="4 2"/>
        <line x1="195" y1="91" x2="195" y2="121" stroke="#64ffda" stroke-width="0.8" stroke-dasharray="4 2"/>

        <line x1="155" y1="75" x2="195" y2="106" stroke="var(--cad-dim-color, #00d2ff)" stroke-width="1.8" marker-start="url(#arrow-1)" marker-end="url(#arrow-1)"/>
        <text x="190" y="85" fill="var(--cad-dim-color, #00d2ff)" font-family="monospace" font-size="12" font-weight="bold">51.0 мм (IS)</text>

        <path d="M 215 345 L 215 250 A 7 7 0 0 1 229 250 L 229 345 Z" fill="var(--cad-bg, #0a192f)" stroke="var(--cad-line-main, #64ffda)" stroke-width="2.5"/>
        <line x1="215" y1="250" x2="215" y2="345" stroke="#ff5500" stroke-width="3.5"/>
        <line x1="225" y1="250" x2="225" y2="345" stroke="#ff5500" stroke-width="3.5"/>
        <circle cx="222" cy="248" r="7" fill="none" stroke="#8892b0" stroke-width="1" stroke-dasharray="3 3"/>

        <line x1="215" y1="365" x2="225" y2="365" stroke="var(--cad-dim-color, #00d2ff)" stroke-width="1.5" marker-start="url(#arrow-1)" marker-end="url(#arrow-1)"/>
        <text x="220" y="382" fill="var(--cad-dim-color, #00d2ff)" font-family="monospace" font-size="11" text-anchor="middle" font-weight="bold">10.0 мм (лыски)</text>

        <line x1="205" y1="248" x2="239" y2="248" stroke="var(--cad-dim-color, #00d2ff)" stroke-width="1.2" stroke-dasharray="2 2"/>
        <text x="252" y="252" fill="var(--cad-dim-color, #00d2ff)" font-family="monospace" font-size="11">Ø14.0 мм (ось мотора)</text>

        <path d="M 118 220 L 150 145 L 210 185 L 220 235" fill="none" stroke="#ff3344" stroke-width="2.5" stroke-dasharray="5 3"/>
        <text x="135" y="200" fill="#ff3344" font-family="monospace" font-size="10" font-weight="bold">Шов Т3 катет 4мм (сталь к стали)</text>
      </g>

      <g transform="translate(600, 140)">
        <text x="150" y="0" fill="var(--cad-title, #64ffda)" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">РАЗРЕЗ А-А (МАСШТАБ 1:1)</text>

        <rect x="80" y="30" width="40" height="200" fill="rgba(100, 255, 218, 0.2)" stroke="var(--cad-line-main, #64ffda)" stroke-width="2"/>
        <rect x="120" y="70" width="32" height="160" fill="rgba(136, 146, 176, 0.25)" stroke="#8892b0" stroke-width="1.8"/>

        <g stroke="var(--cad-line-main, #64ffda)" stroke-width="1" opacity="0.6">
          <line x1="80" y1="50" x2="100" y2="30"/><line x1="80" y1="80" x2="120" y2="40"/>
          <line x1="80" y1="110" x2="120" y2="70"/><line x1="80" y1="140" x2="120" y2="100"/>
          <line x1="80" y1="170" x2="120" y2="130"/><line x1="80" y1="200" x2="120" y2="160"/>
        </g>

        <path d="M 120 70 Q 128 64 128 72 Z" fill="#ff3344" stroke="#ff3344" stroke-width="1"/>
        <path d="M 120 230 Q 128 236 128 228 Z" fill="#ff3344" stroke="#ff3344" stroke-width="1"/>

        <line x1="80" y1="245" x2="120" y2="245" stroke="var(--cad-dim-color, #00d2ff)" stroke-width="1.5" marker-start="url(#arrow-1)" marker-end="url(#arrow-1)"/>
        <text x="100" y="260" fill="var(--cad-dim-color, #00d2ff)" font-family="monospace" font-size="11" text-anchor="middle" font-weight="bold">6.0 мм</text>

        <line x1="120" y1="245" x2="152" y2="245" stroke="var(--cad-dim-color, #00d2ff)" stroke-width="1.5" marker-start="url(#arrow-1)" marker-end="url(#arrow-1)"/>
        <text x="136" y="260" fill="var(--cad-dim-color, #00d2ff)" font-family="monospace" font-size="11" text-anchor="middle" font-weight="bold">5.0 мм</text>

        <line x1="80" y1="275" x2="152" y2="275" stroke="#64ffda" stroke-width="1.8" marker-start="url(#arrow-1)" marker-end="url(#arrow-1)"/>
        <text x="116" y="292" fill="#64ffda" font-family="monospace" font-size="12" text-anchor="middle" font-weight="bold">ИТОГО ПАКЕТ = 11.0 ММ СТАЛИ</text>

        <text x="180" y="55" fill="var(--cad-line-main, #64ffda)" font-family="monospace" font-size="11">← Бронепластина 6мм (Сталь 40Х)</text>
        <text x="180" y="110" fill="#8892b0" font-family="monospace" font-size="11">← Родной дропаут 5мм рамы</text>
        <text x="180" y="150" fill="#ff3344" font-family="monospace" font-size="11">← Двусторонний шов Т3 катет 4мм</text>
        <text x="180" y="190" fill="#ffaa00" font-family="monospace" font-size="11">← Выдерживает крутящий момент >250 Н·м</text>
      </g>

      <g transform="translate(540, 520)">
        <rect x="0" y="0" width="440" height="135" fill="var(--cad-title-bg, #0b1c30)" stroke="var(--cad-border, #64ffda)" stroke-width="2"/>
        <line x1="0" y1="35" x2="440" y2="35" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="0" y1="70" x2="440" y2="70" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="0" y1="100" x2="440" y2="100" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="110" y1="0" x2="110" y2="135" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="330" y1="0" x2="330" y2="70" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>

        <text x="10" y="22" fill="#8892b0" font-family="monospace" font-size="10">Разраб.</text>
        <text x="120" y="22" fill="#64ffda" font-family="monospace" font-size="12" font-weight="bold">Ведущий инженер АКБ</text>
        <text x="340" y="22" fill="#8892b0" font-family="monospace" font-size="10">Масштаб: <tspan fill="#64ffda" font-weight="bold">1:1</tspan></text>

        <text x="10" y="55" fill="#8892b0" font-family="monospace" font-size="10">Пров.</text>
        <text x="120" y="55" fill="#ffffff" font-family="monospace" font-size="12">ГОСТ 2.104-2006</text>
        <text x="340" y="55" fill="#8892b0" font-family="monospace" font-size="10">Лист: <tspan fill="#ff5500" font-weight="bold">1 из 6</tspan></text>

        <text x="10" y="88" fill="#8892b0" font-family="monospace" font-size="10">Узел / Деталь</text>
        <text x="120" y="88" fill="#64ffda" font-family="monospace" font-size="13" font-weight="900">БРОНЕПЛАСТИНА ДРОПАУТА М14 + IS 51</text>

        <text x="10" y="120" fill="#8892b0" font-family="monospace" font-size="10">Проект</text>
        <text x="120" y="120" fill="#ff5500" font-family="monospace" font-size="12" font-weight="bold">STEALTH SUR-RON 72V 3000W (STERN FRAME)</text>
      </g>
    </svg>`
  },
  {
    id: 2,
    title: 'ЧЕРТЕЖ №2: СХЕМА УКЛАДКИ И СВАРКИ 140 БАНОК 21700 (20S7P) В ТРЕУГОЛЬНИКЕ 560×490×360 ММ',
    shortTitle: '2. СХЕМА АКБ 20S7P (140 ЯЧЕЕК)',
    specSummary: '140x EVE INR21700-50E (5000mAh, 15A) + Никель 0.15x8мм + Медь 2.5мм² + Bisida BMS 20S 120A',
    desc: 'Точная топология 140 банок 21700 в 9 рядах (22+21+19+18+16+15+13+9+7 = 140) с гексагональным шагом сот 22.7 мм и шагом рядов 19.66 мм. 20 связных параллельных групп 7P (1S..20S) с чередованием полярности змейкой. Никелевые шины 0.15x8 мм с 4 точками сварки на пятак + напаянные медные шины 2.5 мм² на переходах серий. Распайка 21 провода балансировки к гребенке Bisida BMS 120A и силовых выводов 8 AWG к разъему Amass XT90-S.',
    svg: `<svg viewBox="0 0 1000 680" xmlns="http://www.w3.org/2000/svg" class="cad-sheet-svg">
      <defs>
        <pattern id="cad-grid-2" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--cad-grid-line, #13243a)" stroke-width="0.8"/>
        </pattern>
        <pattern id="cad-grid-major-2" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#cad-grid-2)"/>
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="var(--cad-grid-major, #1d3654)" stroke-width="1.4"/>
        </pattern>
      </defs>

      <rect width="1000" height="680" fill="var(--cad-bg, #0a192f)"/>
      <rect width="1000" height="680" fill="url(#cad-grid-major-2)"/>
      <rect x="20" y="20" width="960" height="640" fill="none" stroke="var(--cad-border, #64ffda)" stroke-width="2.5"/>
      <rect x="25" y="25" width="950" height="630" fill="none" stroke="var(--cad-border-inner, #234567)" stroke-width="1"/>

      <text x="500" y="54" fill="var(--cad-title, #64ffda)" font-family="monospace" font-size="18" font-weight="900" text-anchor="middle" letter-spacing="1.2">СХЕМА УКЛАДКИ И РАСПАЙКИ 140 БАНОК 21700 (20S7P В ТРЕУГОЛЬНИКЕ РАМЫ)</text>
      <text x="500" y="74" fill="var(--cad-sub, #8892b0)" font-family="monospace" font-size="11" text-anchor="middle">9 РЯДОВ: 22 + 21 + 19 + 18 + 16 + 15 + 13 + 9 + 7 = РОВНО 140 ЯЧЕЕК (72V 35Ah / 2520 Wh / ПИК 120A)</text>

      <g transform="translate(50, 95)">
        <polygon points="50,440 820,440 240,60" fill="rgba(0, 210, 255, 0.04)" stroke="#1d3654" stroke-width="2.5" stroke-dasharray="6 4"/>
        <text x="450" y="468" fill="#00d2ff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">Нижняя труба рамы Stern: 560 мм (Ряд 1 вдоль трубы)</text>
        <text x="110" y="230" fill="#00d2ff" font-family="monospace" font-size="11" transform="rotate(-60 110 230)">Подседельная труба: 490 мм</text>
        <text x="560" y="220" fill="#00d2ff" font-family="monospace" font-size="11" transform="rotate(33 560 220)">Верхняя труба рамы: 360 мм</text>

        <rect x="220" y="20" width="280" height="36" rx="4" fill="#112233" stroke="#ff5500" stroke-width="2"/>
        <text x="360" y="43" fill="#ff5500" font-family="monospace" font-size="12" font-weight="900" text-anchor="middle">BISIDA BMS 20S 120A (СИММЕТРИЧНЫЙ ПОРТ, NTC, 16x MOSFET)</text>
        <rect x="520" y="22" width="55" height="32" rx="3" fill="#f5b800" stroke="#111111" stroke-width="1.5"/>
        <text x="547" y="42" fill="#111111" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">XT90-S</text>

        <g id="cell-matrix">
          <g transform="translate(250, 80)">
            <rect x="0" y="0" width="190" height="30" rx="15" fill="rgba(255, 85, 0, 0.22)" stroke="#ff5500" stroke-width="2"/>
            <text x="95" y="20" fill="#ff5500" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">20S (84.0V) • 7 БАНОК • РЯД 9 (ВЕРХ)</text>
          </g>

          <g transform="translate(210, 125)">
            <rect x="0" y="0" width="75" height="65" rx="8" fill="rgba(255, 170, 0, 0.18)" stroke="#ffaa00" stroke-width="1.8"/>
            <text x="37" y="36" fill="#ffaa00" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">19S</text>
            <text x="37" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">79.8V</text>

            <rect x="85" y="0" width="75" height="65" rx="8" fill="rgba(255, 200, 0, 0.18)" stroke="#ffc800" stroke-width="1.8"/>
            <text x="122" y="36" fill="#ffc800" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">18S</text>
            <text x="122" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">75.6V</text>

            <rect x="170" y="0" width="75" height="65" rx="8" fill="rgba(200, 255, 0, 0.18)" stroke="#c8ff00" stroke-width="1.8"/>
            <text x="207" y="36" fill="#c8ff00" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">17S</text>
            <text x="207" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">71.4V</text>

            <rect x="255" y="0" width="75" height="65" rx="8" fill="rgba(100, 255, 100, 0.18)" stroke="#64ff64" stroke-width="1.8"/>
            <text x="292" y="36" fill="#64ff64" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">16S</text>
            <text x="292" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">67.2V</text>
            <text x="350" y="38" fill="#8892b0" font-family="monospace" font-size="10">РЯД 7 (13) + РЯД 8 (9)</text>
          </g>

          <g transform="translate(170, 205)">
            <rect x="0" y="0" width="85" height="65" rx="8" fill="rgba(0, 255, 150, 0.18)" stroke="#00ff96" stroke-width="1.8"/>
            <text x="42" y="36" fill="#00ff96" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">12S</text>
            <text x="42" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">50.4V</text>

            <rect x="95" y="0" width="85" height="65" rx="8" fill="rgba(0, 240, 200, 0.18)" stroke="#00f0c8" stroke-width="1.8"/>
            <text x="137" y="36" fill="#00f0c8" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">13S</text>
            <text x="137" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">54.6V</text>

            <rect x="190" y="0" width="85" height="65" rx="8" fill="rgba(0, 210, 255, 0.18)" stroke="#00d2ff" stroke-width="1.8"/>
            <text x="232" y="36" fill="#00d2ff" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">14S</text>
            <text x="232" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">58.8V</text>

            <rect x="285" y="0" width="85" height="65" rx="8" fill="rgba(50, 160, 255, 0.18)" stroke="#32a0ff" stroke-width="1.8"/>
            <text x="327" y="36" fill="#32a0ff" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">15S</text>
            <text x="327" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">63.0V</text>
            <text x="390" y="38" fill="#8892b0" font-family="monospace" font-size="10">РЯД 5 (16) + РЯД 6 (15)</text>
          </g>

          <g transform="translate(130, 285)">
            <rect x="0" y="0" width="80" height="65" rx="8" fill="rgba(90, 120, 255, 0.18)" stroke="#5a78ff" stroke-width="1.8"/>
            <text x="40" y="36" fill="#5a78ff" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">11S</text>
            <text x="40" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">46.2V</text>

            <rect x="90" y="0" width="80" height="65" rx="8" fill="rgba(120, 90, 255, 0.18)" stroke="#785aff" stroke-width="1.8"/>
            <text x="130" y="36" fill="#785aff" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">10S</text>
            <text x="130" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">42.0V</text>

            <rect x="180" y="0" width="80" height="65" rx="8" fill="rgba(160, 60, 255, 0.18)" stroke="#a03cff" stroke-width="1.8"/>
            <text x="220" y="36" fill="#a03cff" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">9S</text>
            <text x="220" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">37.8V</text>

            <rect x="270" y="0" width="80" height="65" rx="8" fill="rgba(200, 40, 255, 0.18)" stroke="#c828ff" stroke-width="1.8"/>
            <text x="310" y="36" fill="#c828ff" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">8S</text>
            <text x="310" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">33.6V</text>

            <rect x="360" y="0" width="80" height="65" rx="8" fill="rgba(240, 30, 200, 0.18)" stroke="#f01ec8" stroke-width="1.8"/>
            <text x="400" y="36" fill="#f01ec8" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">7S</text>
            <text x="400" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">29.4V</text>
            <text x="455" y="38" fill="#8892b0" font-family="monospace" font-size="10">РЯД 3 (19) + РЯД 4 (18)</text>
          </g>

          <g transform="translate(80, 365)">
            <rect x="0" y="0" width="80" height="65" rx="8" fill="rgba(255, 50, 100, 0.18)" stroke="#ff3264" stroke-width="2"/>
            <text x="40" y="34" fill="#ff3264" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">1S (B-)</text>
            <text x="40" y="48" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">4.2V (0V)</text>

            <rect x="88" y="0" width="80" height="65" rx="8" fill="rgba(255, 70, 70, 0.18)" stroke="#ff4646" stroke-width="1.8"/>
            <text x="128" y="36" fill="#ff4646" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">2S</text>
            <text x="128" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">8.4V</text>

            <rect x="176" y="0" width="80" height="65" rx="8" fill="rgba(255, 100, 50, 0.18)" stroke="#ff6432" stroke-width="1.8"/>
            <text x="216" y="36" fill="#ff6432" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">3S</text>
            <text x="216" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">12.6V</text>

            <rect x="264" y="0" width="80" height="65" rx="8" fill="rgba(255, 130, 40, 0.18)" stroke="#ff8228" stroke-width="1.8"/>
            <text x="304" y="36" fill="#ff8228" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">4S</text>
            <text x="304" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">16.8V</text>

            <rect x="352" y="0" width="80" height="65" rx="8" fill="rgba(255, 160, 30, 0.18)" stroke="#ffa01e" stroke-width="1.8"/>
            <text x="392" y="36" fill="#ffa01e" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">5S</text>
            <text x="392" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">21.0V</text>

            <rect x="440" y="0" width="80" height="65" rx="8" fill="rgba(255, 190, 20, 0.18)" stroke="#ffbe14" stroke-width="1.8"/>
            <text x="480" y="36" fill="#ffbe14" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">6S</text>
            <text x="480" y="50" fill="#8892b0" font-family="monospace" font-size="9" text-anchor="middle">25.2V</text>
            <text x="535" y="38" fill="#8892b0" font-family="monospace" font-size="10">РЯД 1 (22) + РЯД 2 (21)</text>
          </g>

          <path d="M 80 400 L 45 400 L 45 35 L 220 35" fill="none" stroke="#111111" stroke-width="4.5"/>
          <path d="M 80 400 L 45 400 L 45 35 L 220 35" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="6 4"/>
          <text x="55" y="300" fill="#ffffff" font-family="monospace" font-size="10" transform="rotate(-90 55 300)">Силовой 8 AWG: 1S(-) -> B- (Bisida 120A)</text>

          <line x1="500" y1="30" x2="520" y2="30" stroke="#111111" stroke-width="4"/>

          <path d="M 440 95 L 530 95 L 530 54" fill="none" stroke="#ff3344" stroke-width="4"/>
          <text x="470" y="85" fill="#ff3344" font-family="monospace" font-size="10" font-weight="bold">8 AWG (+) 84.0V</text>

          <path d="M 230 56 L 230 80" stroke="#00d2ff" stroke-width="2" stroke-dasharray="3 2"/>
          <text x="240" y="72" fill="#00d2ff" font-family="monospace" font-size="9">21 балансировочный провод (JST-XH)</text>
        </g>
      </g>

      <g transform="translate(540, 520)">
        <rect x="0" y="0" width="440" height="135" fill="var(--cad-title-bg, #0b1c30)" stroke="var(--cad-border, #64ffda)" stroke-width="2"/>
        <line x1="0" y1="35" x2="440" y2="35" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="0" y1="70" x2="440" y2="70" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="0" y1="100" x2="440" y2="100" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="110" y1="0" x2="110" y2="135" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="330" y1="0" x2="330" y2="70" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>

        <text x="10" y="22" fill="#8892b0" font-family="monospace" font-size="10">Разраб.</text>
        <text x="120" y="22" fill="#64ffda" font-family="monospace" font-size="12" font-weight="bold">Ведущий инженер АКБ</text>
        <text x="340" y="22" fill="#8892b0" font-family="monospace" font-size="10">Масштаб: <tspan fill="#64ffda" font-weight="bold">1:2</tspan></text>

        <text x="10" y="55" fill="#8892b0" font-family="monospace" font-size="10">Пров.</text>
        <text x="120" y="55" fill="#ffffff" font-family="monospace" font-size="12">ГОСТ 2.410-68</text>
        <text x="340" y="55" fill="#8892b0" font-family="monospace" font-size="10">Лист: <tspan fill="#ff5500" font-weight="bold">2 из 6</tspan></text>

        <text x="10" y="88" fill="#8892b0" font-family="monospace" font-size="10">Схема АКБ</text>
        <text x="120" y="88" fill="#64ffda" font-family="monospace" font-size="13" font-weight="900">ТОПОЛОГИЯ 140 ЯЧЕЕК 20S7P В ТРЕУГОЛЬНИКЕ</text>

        <text x="10" y="120" fill="#8892b0" font-family="monospace" font-size="10">Ячейки / BMS</text>
        <text x="120" y="120" fill="#ff5500" font-family="monospace" font-size="12" font-weight="bold">EVE INR21700-50E + BISIDA BMS 20S 120A</text>
      </g>
    </svg>`
  },
  {
    id: 3,
    title: 'ЧЕРТЕЖ №3: СТАЛЬНОЙ ПОДРАМНИК И ПОСАДКА ДЛИННОГО МОТО-СЕДЛА SUR-RON / ПИТБАЙК',
    shortTitle: '3. ПОДРАМНИК И СЕДЛО SUR-RON',
    specSummary: 'Профильная труба 20x20x2.0 мм + труба Ø16x2.0 мм (Сталь 20) + мото-седло 530 мм',
    desc: 'Сварной пространственный подрамник для интеграции 2-местного седла Sur-Ron/CRF110 (длина 530 мм, ПВВ 55 кг/м³). Передний упор заходит в подседельную трубу рамы с фрезерованным П-образным пазом 40x70 мм в носике седла. Две наклонные задние распорки Ø16 мм с косым срезом 38° сходятся к середине верхних перьев рамы с болтовым креплением 2x М6.',
    svg: `<svg viewBox="0 0 1000 680" xmlns="http://www.w3.org/2000/svg" class="cad-sheet-svg">
      <defs>
        <pattern id="cad-grid-3" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--cad-grid-line, #13243a)" stroke-width="0.8"/>
        </pattern>
        <pattern id="cad-grid-major-3" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#cad-grid-3)"/>
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="var(--cad-grid-major, #1d3654)" stroke-width="1.4"/>
        </pattern>
        <marker id="arrow-3" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="var(--cad-dim-color, #00d2ff)"/>
        </marker>
      </defs>

      <rect width="1000" height="680" fill="var(--cad-bg, #0a192f)"/>
      <rect width="1000" height="680" fill="url(#cad-grid-major-3)"/>
      <rect x="20" y="20" width="960" height="640" fill="none" stroke="var(--cad-border, #64ffda)" stroke-width="2.5"/>
      <rect x="25" y="25" width="950" height="630" fill="none" stroke="var(--cad-border-inner, #234567)" stroke-width="1"/>

      <text x="500" y="54" fill="var(--cad-title, #64ffda)" font-family="monospace" font-size="18" font-weight="900" text-anchor="middle" letter-spacing="1.2">СТАЛЬНОЙ ПОДРАМНИК И ПОСАДКА ДЛИННОГО МОТО-СЕДЛА SUR-RON (530 ММ)</text>
      <text x="500" y="74" fill="var(--cad-sub, #8892b0)" font-family="monospace" font-size="11" text-anchor="middle">ВИД СБОКУ И ВИД СНИЗУ • П-ПАЗ 40×70 ММ • ТРУБА 20×20×2 И РАСПОРКИ Ø16×2 ММ</text>

      <g transform="translate(80, 100)">
        <text x="0" y="20" fill="var(--cad-title, #64ffda)" font-family="monospace" font-size="13" font-weight="bold">1. ВИД СБОКУ: МОТО-СЕДЛО 530 ММ НА ПОДРАМНИКЕ</text>

        <path d="M 50 120 Q 80 80 150 72 C 250 64 360 70 470 95 Q 560 115 580 130 L 570 155 Q 480 145 380 130 L 220 125 L 80 135 Z" 
              fill="rgba(255, 85, 0, 0.16)" stroke="#ff5500" stroke-width="3"/>
        <text x="320" y="105" fill="#ffffff" font-family="monospace" font-size="11" font-weight="bold">ПОРОЛОН ПВВ 55 КГ/М³ (75-80 ММ)</text>

        <path d="M 50 120 L 20 132 L 20 148 L 55 142 Z" fill="#1a1d24" stroke="#8892b0" stroke-width="1.5"/>
        <rect x="18" y="132" width="8" height="12" fill="#ff0033" stroke="#ffffff" stroke-width="1"/>
        <text x="5" y="170" fill="#ff0033" font-family="monospace" font-size="9" font-weight="bold">LED СТОП-СИГНАЛ</text>

        <rect x="90" y="130" width="460" height="14" fill="rgba(0, 255, 102, 0.25)" stroke="#00ff66" stroke-width="2.2"/>
        <g transform="translate(490, 140) rotate(17)">
          <rect x="-10" y="0" width="20" height="160" fill="rgba(0, 255, 102, 0.25)" stroke="#00ff66" stroke-width="2.2"/>
          <text x="16" y="80" fill="#00ff66" font-family="monospace" font-size="10" font-weight="bold">Упор в подседел L=160</text>
        </g>
        <line x1="190" y1="144" x2="360" y2="275" stroke="#00ff66" stroke-width="5" stroke-linecap="round"/>
        <circle cx="360" cy="275" r="6" fill="#ff5500" stroke="#ffffff" stroke-width="1.5"/>
        <text x="210" y="225" fill="#00ff66" font-family="monospace" font-size="10" font-weight="bold">Распорка Ø16×2 (L=285, рез 38°)</text>
        <text x="375" y="280" fill="#ff5500" font-family="monospace" font-size="10">Болт М6 к перу</text>

        <line x1="50" y1="45" x2="580" y2="45" stroke="var(--cad-dim-color, #00d2ff)" stroke-width="1.8" marker-start="url(#arrow-3)" marker-end="url(#arrow-3)"/>
        <text x="315" y="38" fill="var(--cad-dim-color, #00d2ff)" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">ДЛИНА СЕДЛА = 530 ММ</text>
      </g>

      <g transform="translate(80, 420)">
        <text x="0" y="0" fill="var(--cad-title, #64ffda)" font-family="monospace" font-size="13" font-weight="bold">2. ВИД СНИЗУ: П-ОБРАЗНЫЙ ПАЗ 40×70 ММ И ТОЧКИ КРЕПЛЕНИЯ</text>

        <path d="M 40 45 Q 60 20 180 18 L 480 25 Q 540 30 550 45 Q 540 60 480 65 L 180 72 Q 60 70 40 45 Z" fill="rgba(136, 146, 176, 0.15)" stroke="#8892b0" stroke-width="2"/>

        <rect x="480" y="25" width="70" height="40" fill="var(--cad-bg, #0a192f)" stroke="#ff5500" stroke-width="2.5"/>
        <text x="515" y="48" fill="#ff5500" font-family="monospace" font-size="9" font-weight="bold" text-anchor="middle">П-ПАЗ 40×70</text>

        <line x1="480" y1="75" x2="550" y2="75" stroke="var(--cad-dim-color, #00d2ff)" stroke-width="1.2" marker-start="url(#arrow-3)" marker-end="url(#arrow-3)"/>
        <text x="515" y="88" fill="var(--cad-dim-color, #00d2ff)" font-family="monospace" font-size="10" text-anchor="middle">70 мм</text>

        <line x1="110" y1="45" x2="480" y2="45" stroke="#00ff66" stroke-width="4"/>
        <circle cx="140" cy="45" r="4" fill="#ff5500" stroke="#ffffff" stroke-width="1"/>
        <circle cx="260" cy="45" r="4" fill="#ff5500" stroke="#ffffff" stroke-width="1"/>
        <circle cx="380" cy="45" r="4" fill="#ff5500" stroke="#ffffff" stroke-width="1"/>
        <text x="260" y="25" fill="#ffffff" font-family="monospace" font-size="10" text-anchor="middle">4x Шпильки М6 крепления подрамника</text>
      </g>

      <g transform="translate(540, 520)">
        <rect x="0" y="0" width="440" height="135" fill="var(--cad-title-bg, #0b1c30)" stroke="var(--cad-border, #64ffda)" stroke-width="2"/>
        <line x1="0" y1="35" x2="440" y2="35" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="0" y1="70" x2="440" y2="70" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="0" y1="100" x2="440" y2="100" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="110" y1="0" x2="110" y2="135" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="330" y1="0" x2="330" y2="70" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>

        <text x="10" y="22" fill="#8892b0" font-family="monospace" font-size="10">Разраб.</text>
        <text x="120" y="22" fill="#64ffda" font-family="monospace" font-size="12" font-weight="bold">Ведущий инженер АКБ</text>
        <text x="340" y="22" fill="#8892b0" font-family="monospace" font-size="10">Масштаб: <tspan fill="#64ffda" font-weight="bold">1:5</tspan></text>

        <text x="10" y="55" fill="#8892b0" font-family="monospace" font-size="10">Пров.</text>
        <text x="120" y="55" fill="#ffffff" font-family="monospace" font-size="12">ГОСТ 2.109-73</text>
        <text x="340" y="55" fill="#8892b0" font-family="monospace" font-size="10">Лист: <tspan fill="#ff5500" font-weight="bold">3 из 6</tspan></text>

        <text x="10" y="88" fill="#8892b0" font-family="monospace" font-size="10">Узел 07</text>
        <text x="120" y="88" fill="#64ffda" font-family="monospace" font-size="13" font-weight="900">ПОДРАМНИК + МОТО-СЕДЛО SUR-RON 530 ММ</text>

        <text x="10" y="120" fill="#8892b0" font-family="monospace" font-size="10">Материал</text>
        <text x="120" y="120" fill="#ff5500" font-family="monospace" font-size="12" font-weight="bold">ТРУБА 20×20×2.0 + Ø16×2.0 (СТАЛЬ 20)</text>
      </g>
    </svg>`
  },
  {
    id: 4,
    title: 'ЧЕРТЕЖ №4: ПОЛНАЯ ЦВЕТНАЯ ЭЛЕКТРОСХЕМА БОРТОВОЙ СЕТИ 72V И 12V (СВЕТ + ГУДОК + СТОП + EBS)',
    shortTitle: '4. ЭЛЕКТРОСХЕМА 72V / 12V',
    specSummary: 'Провода 8 AWG (силовые 72V) + 16-22 AWG (12V) + разъемы Julet & Amass XT90-S',
    desc: 'Полная наглядная цветная электросхема без абстрактных ГОСТ-символов. 1) Силовой контур 72V: АКБ 20S7P -> Bisida BMS 120A -> XT90-S -> Синусный контроллер 60A -> Мотор 3000W MTX39 (перемычка припоем EBS->GND активирует электродинамическое торможение рекуперацией E-ABS -1650W от левой ручки тормоза). 2) Контур 12V: DC-DC 36-120V->12V 10A через предохранитель 5A -> кнопка 2-в-1 -> Фара Sur-Ron 20W и гудок 105 дБ. 3) Контур СТОП: +12V через геркон правой ручки тормоза ZOOM HB-890E -> стоп-сигнал крыла.',
    svg: `<svg viewBox="0 0 1000 680" xmlns="http://www.w3.org/2000/svg" class="cad-sheet-svg">
      <defs>
        <pattern id="cad-grid-4" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--cad-grid-line, #13243a)" stroke-width="0.8"/>
        </pattern>
        <pattern id="cad-grid-major-4" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#cad-grid-4)"/>
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="var(--cad-grid-major, #1d3654)" stroke-width="1.4"/>
        </pattern>
      </defs>

      <rect width="1000" height="680" fill="var(--cad-bg, #0a192f)"/>
      <rect width="1000" height="680" fill="url(#cad-grid-major-4)"/>
      <rect x="20" y="20" width="960" height="640" fill="none" stroke="var(--cad-border, #64ffda)" stroke-width="2.5"/>
      <rect x="25" y="25" width="950" height="630" fill="none" stroke="var(--cad-border-inner, #234567)" stroke-width="1"/>

      <text x="500" y="54" fill="var(--cad-title, #64ffda)" font-family="monospace" font-size="18" font-weight="900" text-anchor="middle" letter-spacing="1.2">ПОЛНАЯ ЦВЕТНАЯ ЭЛЕКТРОСХЕМА БОРТОВОЙ СЕТИ 72V (84V) И 12V</text>
      <text x="500" y="74" fill="var(--cad-sub, #8892b0)" font-family="monospace" font-size="11" text-anchor="middle">СИЛОВОЙ ТРАКТ 60A/120A • DC-DC 12V 10A • СВЕТ SUR-RON • ГУДОК 105 dB • СТОП-СИГНАЛ • EBS РЕКУПЕРАЦИЯ</text>

      <g transform="translate(50, 95)">
        <rect x="20" y="30" width="140" height="90" rx="6" fill="#162a45" stroke="#64ffda" stroke-width="2.5"/>
        <text x="90" y="55" fill="#64ffda" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">АКБ 20S7P</text>
        <text x="90" y="72" fill="#ffffff" font-family="monospace" font-size="10" text-anchor="middle">72V (84V) 35Ah</text>
        <text x="90" y="88" fill="#ff5500" font-family="monospace" font-size="9" text-anchor="middle">140x EVE 50E</text>

        <rect x="200" y="30" width="130" height="90" rx="6" fill="#112233" stroke="#ff5500" stroke-width="2.2"/>
        <text x="265" y="55" fill="#ff5500" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">BISIDA BMS 120A</text>
        <text x="265" y="72" fill="#ffffff" font-family="monospace" font-size="9" text-anchor="middle">B- вход / C- выход</text>
        <text x="265" y="88" fill="#64ffda" font-family="monospace" font-size="9" text-anchor="middle">21 pin Balance Header</text>

        <line x1="160" y1="55" x2="200" y2="55" stroke="#111111" stroke-width="4"/>
        <text x="180" y="48" fill="#ffffff" font-family="monospace" font-size="8" text-anchor="middle">B- 8AWG</text>

        <rect x="365" y="50" width="45" height="50" rx="4" fill="#f5b800" stroke="#111111" stroke-width="2"/>
        <text x="387" y="78" fill="#111111" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">XT90-S</text>

        <line x1="330" y1="65" x2="365" y2="65" stroke="#111111" stroke-width="4"/>
        <path d="M 160 95 L 365 95" stroke="#ff3344" stroke-width="4" fill="none"/>
        <text x="260" y="110" fill="#ff3344" font-family="monospace" font-size="9" font-weight="bold">B+ (84V Силовой 8 AWG)</text>

        <rect x="450" y="20" width="170" height="130" rx="6" fill="#1a2332" stroke="#00d2ff" stroke-width="2.5"/>
        <text x="535" y="45" fill="#00d2ff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">КОНТРОЛЛЕР 60A</text>
        <text x="535" y="62" fill="#ffffff" font-family="monospace" font-size="10" text-anchor="middle">18 MOSFET Синусный</text>
        <rect x="465" y="78" width="140" height="30" rx="3" fill="rgba(255, 85, 0, 0.2)" stroke="#ff5500" stroke-width="1.5"/>
        <text x="535" y="94" fill="#ff5500" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">ПЕРЕМЫЧКА: EBS -> GND</text>
        <text x="535" y="104" fill="#ffffff" font-family="monospace" font-size="8" text-anchor="middle">Активация рекуперации -1650W</text>

        <line x1="410" y1="65" x2="450" y2="65" stroke="#111111" stroke-width="4"/>
        <line x1="410" y1="85" x2="450" y2="85" stroke="#ff3344" stroke-width="4"/>

        <rect x="680" y="20" width="180" height="130" rx="6" fill="#111822" stroke="#ffaa00" stroke-width="2.5"/>
        <text x="770" y="45" fill="#ffaa00" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">МОТОР-КОЛЕСО 3000W</text>
        <text x="770" y="62" fill="#ffffff" font-family="monospace" font-size="10" text-anchor="middle">MTX39 26" Прямой привод</text>
        <text x="770" y="80" fill="#00d2ff" font-family="monospace" font-size="9" text-anchor="middle">+40 мл масла ПМС-100</text>
        <text x="770" y="110" fill="#64ffda" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">82.4 км/ч • 185 Н·м</text>

        <line x1="620" y1="45" x2="680" y2="45" stroke="#ffe600" stroke-width="3.5"/>
        <line x1="620" y1="65" x2="680" y2="65" stroke="#00ff66" stroke-width="3.5"/>
        <line x1="620" y1="85" x2="680" y2="85" stroke="#0088ff" stroke-width="3.5"/>
        <text x="650" y="38" fill="#ffffff" font-family="monospace" font-size="8" text-anchor="middle">3 Фазы</text>

        <rect x="160" y="200" width="150" height="80" rx="6" fill="#1a2a20" stroke="#00ff66" stroke-width="2.2"/>
        <text x="235" y="225" fill="#00ff66" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">DC-DC 12V 10A</text>
        <text x="235" y="242" fill="#ffffff" font-family="monospace" font-size="9" text-anchor="middle">Вход: 36V-120V (72V)</text>
        <text x="235" y="258" fill="#ffaa00" font-family="monospace" font-size="9" text-anchor="middle">Предохранитель 5A</text>

        <path d="M 387 100 L 387 180 L 235 180 L 235 200" fill="none" stroke="#ff5500" stroke-width="2" stroke-dasharray="4 2"/>

        <rect x="390" y="200" width="140" height="80" rx="6" fill="#222630" stroke="#ffffff" stroke-width="2"/>
        <text x="460" y="225" fill="#ffffff" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">КНОПКА 2-В-1</text>
        <text x="460" y="244" fill="#64ffda" font-family="monospace" font-size="10" text-anchor="middle">[💡 СВЕТ] Тумблер</text>
        <text x="460" y="262" fill="#ffaa00" font-family="monospace" font-size="10" text-anchor="middle">[📢 СИГНАЛ] Кнопка</text>

        <line x1="310" y1="240" x2="390" y2="240" stroke="#00ff66" stroke-width="3"/>
        <text x="350" y="232" fill="#00ff66" font-family="monospace" font-size="9" text-anchor="middle">+12V (10A)</text>

        <rect x="600" y="190" width="120" height="50" rx="5" fill="#1e2530" stroke="#64ffda" stroke-width="2"/>
        <text x="660" y="212" fill="#64ffda" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">ФАРА SUR-RON</text>
        <text x="660" y="228" fill="#ffffff" font-family="monospace" font-size="9" text-anchor="middle">20W Двухлинзовая</text>
        <line x1="530" y1="215" x2="600" y2="215" stroke="#64ffda" stroke-width="2.5"/>

        <rect x="600" y="255" width="120" height="50" rx="5" fill="#1e2530" stroke="#ffaa00" stroke-width="2"/>
        <text x="660" y="277" fill="#ffaa00" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">ГУДОК 105 dB</text>
        <text x="660" y="293" fill="#ffffff" font-family="monospace" font-size="9" text-anchor="middle">Мотоциклетный 12V</text>
        <line x1="530" y1="265" x2="600" y2="265" stroke="#ffaa00" stroke-width="2.5"/>

        <rect x="160" y="320" width="180" height="60" rx="5" fill="#251b22" stroke="#ff3366" stroke-width="2"/>
        <text x="250" y="342" fill="#ff3366" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">ПРАВАЯ РУЧКА ZOOM</text>
        <text x="250" y="358" fill="#ffffff" font-family="monospace" font-size="9" text-anchor="middle">Геркон стоп-сигнала (12V)</text>

        <path d="M 270 280 L 270 320" stroke="#00ff66" stroke-width="2" fill="none"/>

        <rect x="600" y="325" width="140" height="50" rx="5" fill="#301115" stroke="#ff0033" stroke-width="2"/>
        <text x="670" y="347" fill="#ff0033" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">СТОП-СИГНАЛ</text>
        <text x="670" y="363" fill="#ffffff" font-family="monospace" font-size="9" text-anchor="middle">Яркий LED хвоста питбайка</text>
        <line x1="340" y1="350" x2="600" y2="350" stroke="#ff0033" stroke-width="3"/>
        <text x="470" y="342" fill="#ff0033" font-family="monospace" font-size="9" font-weight="bold">+12V при нажатии тормоза</text>

        <rect x="390" y="120" width="120" height="35" rx="4" fill="#1e1828" stroke="#c828ff" stroke-width="1.8"/>
        <text x="450" y="142" fill="#c828ff" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">ЛЕВАЯ РУЧКА (EBS)</text>
        <line x1="450" y1="120" x2="470" y2="110" stroke="#c828ff" stroke-width="2"/>
      </g>

      <g transform="translate(540, 520)">
        <rect x="0" y="0" width="440" height="135" fill="var(--cad-title-bg, #0b1c30)" stroke="var(--cad-border, #64ffda)" stroke-width="2"/>
        <line x1="0" y1="35" x2="440" y2="35" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="0" y1="70" x2="440" y2="70" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="0" y1="100" x2="440" y2="100" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="110" y1="0" x2="110" y2="135" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="330" y1="0" x2="330" y2="70" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>

        <text x="10" y="22" fill="#8892b0" font-family="monospace" font-size="10">Разраб.</text>
        <text x="120" y="22" fill="#64ffda" font-family="monospace" font-size="12" font-weight="bold">Ведущий инженер АКБ</text>
        <text x="340" y="22" fill="#8892b0" font-family="monospace" font-size="10">Схема: <tspan fill="#64ffda" font-weight="bold">Э3</tspan></text>

        <text x="10" y="55" fill="#8892b0" font-family="monospace" font-size="10">Пров.</text>
        <text x="120" y="55" fill="#ffffff" font-family="monospace" font-size="12">ГОСТ 2.702-2011</text>
        <text x="340" y="55" fill="#8892b0" font-family="monospace" font-size="10">Лист: <tspan fill="#ff5500" font-weight="bold">4 из 6</tspan></text>

        <text x="10" y="88" fill="#8892b0" font-family="monospace" font-size="10">Электросхема</text>
        <text x="120" y="88" fill="#64ffda" font-family="monospace" font-size="13" font-weight="900">ПОЛНАЯ БОРТОВАЯ СЕТЬ 72V И 12V</text>

        <text x="10" y="120" fill="#8892b0" font-family="monospace" font-size="10">Система</text>
        <text x="120" y="120" fill="#ff5500" font-family="monospace" font-size="12" font-weight="bold">СВЕТ 20W + СИГНАЛ 105 dB + EBS РЕКУПЕРАЦИЯ</text>
      </g>
    </svg>`
  },
  {
    id: 5,
    title: 'ЧЕРТЕЖ №5: ВЫКРОЙКА ТАКТИЧЕСКОЙ СУМКИ ИЗ ТКАНИ CORDURA 1000D И ДЕМПФЕРНОГО КОКОНА',
    shortTitle: '5. ВЫКРОЙКА СУМКИ CORDURA 1000D',
    specSummary: 'Cordura 1000D PU 1000мм + EVA-пена 15 мм + стропы Velcro 45 мм + молния YKK Aquaguard',
    desc: 'Точный портновский раскрой на листе ткани 1000x1000 мм. 1) Левая и правая треугольные боковины 560x490x360 мм с передним мостиком 70 мм и припусками на швы 15 мм. 2) Центральная обечайка шириной 85 мм под влагозащитную молнию. 3) Разметка 7 силовых строп Velcro 45 мм с двойной крестообразной прошивкой Box-X.',
    svg: `<svg viewBox="0 0 1000 680" xmlns="http://www.w3.org/2000/svg" class="cad-sheet-svg">
      <defs>
        <pattern id="cad-grid-5" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--cad-grid-line, #13243a)" stroke-width="0.8"/>
        </pattern>
        <pattern id="cad-grid-major-5" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#cad-grid-5)"/>
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="var(--cad-grid-major, #1d3654)" stroke-width="1.4"/>
        </pattern>
      </defs>

      <rect width="1000" height="680" fill="var(--cad-bg, #0a192f)"/>
      <rect width="1000" height="680" fill="url(#cad-grid-major-5)"/>
      <rect x="20" y="20" width="960" height="640" fill="none" stroke="var(--cad-border, #64ffda)" stroke-width="2.5"/>
      <rect x="25" y="25" width="950" height="630" fill="none" stroke="var(--cad-border-inner, #234567)" stroke-width="1"/>

      <text x="500" y="54" fill="var(--cad-title, #64ffda)" font-family="monospace" font-size="18" font-weight="900" text-anchor="middle" letter-spacing="1.2">ВЫКРОЙКА СУМКИ CORDURA 1000D И 15 ММ ДЕМПФЕРНОГО КОКОНА</text>
      <text x="500" y="74" fill="var(--cad-sub, #8892b0)" font-family="monospace" font-size="11" text-anchor="middle">РАСКРОЙ НА РУЛОНЕ 1000×1000 ММ • ПРИПУСКИ 15 ММ • ОБЕЧАЙКА 85 ММ • 7 СТРОП VELCRO 45 ММ</text>

      <g transform="translate(60, 95)">
        <rect x="0" y="0" width="880" height="400" fill="none" stroke="#8892b0" stroke-width="1.5" stroke-dasharray="6 4"/>
        <text x="440" y="18" fill="#8892b0" font-family="monospace" font-size="11" text-anchor="middle">КРОЙ НА ПОЛОТНЕ CORDURA 1000D (ПРИПУСК НА ШОВ 15 ММ ПО ВСЕМУ ПЕРИМЕТРУ)</text>

        <g transform="translate(30, 40)">
          <polygon points="20,320 340,320 230,50 40,110" fill="rgba(100, 255, 218, 0.12)" stroke="#64ffda" stroke-width="2.5"/>
          <polygon points="10,330 355,330 235,40 32,105" fill="none" stroke="#00d2ff" stroke-width="1.2" stroke-dasharray="4 3"/>
          <text x="170" y="200" fill="#64ffda" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">ЛЕВАЯ БОКОВИНА</text>
          <text x="170" y="220" fill="#ffffff" font-family="monospace" font-size="10" text-anchor="middle">560 × 490 × 360 мм</text>
          <text x="170" y="240" fill="#ffaa00" font-family="monospace" font-size="9" text-anchor="middle">+ Внутренний EVA 15мм</text>

          <circle cx="140" cy="75" r="5" fill="#ff5500"/>
          <circle cx="210" cy="55" r="5" fill="#ff5500"/>
          <circle cx="30" cy="180" r="5" fill="#ff5500"/>
          <circle cx="25" cy="260" r="5" fill="#ff5500"/>
          <circle cx="100" cy="320" r="5" fill="#ff5500"/>
          <circle cx="240" cy="320" r="5" fill="#ff5500"/>
        </g>

        <g transform="translate(400, 40)">
          <polygon points="20,320 340,320 230,50 40,110" fill="rgba(100, 255, 218, 0.12)" stroke="#64ffda" stroke-width="2.5"/>
          <polygon points="10,330 355,330 235,40 32,105" fill="none" stroke="#00d2ff" stroke-width="1.2" stroke-dasharray="4 3"/>
          <text x="170" y="200" fill="#64ffda" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">ПРАВАЯ БОКОВИНА</text>
          <text x="170" y="220" fill="#ffffff" font-family="monospace" font-size="10" text-anchor="middle">Окно быстрой ревизии</text>
          <text x="170" y="240" fill="#ffaa00" font-family="monospace" font-size="9" text-anchor="middle">Влагозащитная молния YKK</text>
        </g>

        <g transform="translate(30, 360)">
          <rect x="0" y="0" width="820" height="30" fill="rgba(255, 85, 0, 0.2)" stroke="#ff5500" stroke-width="2"/>
          <text x="410" y="20" fill="#ff5500" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">ЦЕНТРАЛЬНАЯ ПОЛОСА-ОБЕЧАЙКА (ШИРИНА 85 ММ, ПОД МОЛНИЮ YKK И ВЫВОД ПРОВОДОВ XT90)</text>
        </g>
      </g>

      <g transform="translate(540, 520)">
        <rect x="0" y="0" width="440" height="135" fill="var(--cad-title-bg, #0b1c30)" stroke="var(--cad-border, #64ffda)" stroke-width="2"/>
        <line x1="0" y1="35" x2="440" y2="35" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="0" y1="70" x2="440" y2="70" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="0" y1="100" x2="440" y2="100" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="110" y1="0" x2="110" y2="135" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="330" y1="0" x2="330" y2="70" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>

        <text x="10" y="22" fill="#8892b0" font-family="monospace" font-size="10">Разраб.</text>
        <text x="120" y="22" fill="#64ffda" font-family="monospace" font-size="12" font-weight="bold">Ведущий инженер АКБ</text>
        <text x="340" y="22" fill="#8892b0" font-family="monospace" font-size="10">Масштаб: <tspan fill="#64ffda" font-weight="bold">1:5</tspan></text>

        <text x="10" y="55" fill="#8892b0" font-family="monospace" font-size="10">Пров.</text>
        <text x="120" y="55" fill="#ffffff" font-family="monospace" font-size="12">ГОСТ 2.114-2016</text>
        <text x="340" y="55" fill="#8892b0" font-family="monospace" font-size="10">Лист: <tspan fill="#ff5500" font-weight="bold">5 из 6</tspan></text>

        <text x="10" y="88" fill="#8892b0" font-family="monospace" font-size="10">Выкройка</text>
        <text x="120" y="88" fill="#64ffda" font-family="monospace" font-size="13" font-weight="900">ТАКТИЧЕСКАЯ СУМКА CORDURA 1000D</text>

        <text x="10" y="120" fill="#8892b0" font-family="monospace" font-size="10">Материал</text>
        <text x="120" y="120" fill="#ff5500" font-family="monospace" font-size="12" font-weight="bold">CORDURA 1000D + EVA FOAM 15 ММ</text>
      </g>
    </svg>`
  },
  {
    id: 6,
    title: 'ЧЕРТЕЖ №6: 3D-ПЕЧАТНЫЙ ГЕРМЕТИЧНЫЙ КОРОБ ПОД НИЖНЮЮ ТРУБУ (DC-DC + ГУДОК 105 ДБ)',
    shortTitle: '6. 3D-КОРОБ PETG + ГУДОК 105 dB',
    specSummary: 'PETG / ABS-CF (3D-печать, стенка 3.2 мм, 4 периметра, заполнение 45% Gyroid)',
    desc: 'Герметичный нижний модуль сложной формы (280x88x76 мм) под наклонную трубу рамы. Верхний отсек: фишки фаз и слаботочки контроллера 60А. Средний отсек: посадочное место DC-DC 12V 10A с теплоотводящими направляющими. Нижний акустический резонатор: резьбовая стойка М6 под пружинную пластину гудка 105 дБ и наклонные назад ламели жабр-чешуи (35°), обеспечивающие свободный выход звука 105 дБ и 100% защиту от струй воды и грязи из-под переднего колеса.',
    svg: `<svg viewBox="0 0 1000 680" xmlns="http://www.w3.org/2000/svg" class="cad-sheet-svg">
      <defs>
        <pattern id="cad-grid-6" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--cad-grid-line, #13243a)" stroke-width="0.8"/>
        </pattern>
        <pattern id="cad-grid-major-6" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#cad-grid-6)"/>
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="var(--cad-grid-major, #1d3654)" stroke-width="1.4"/>
        </pattern>
        <marker id="arrow-6" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="var(--cad-dim-color, #00d2ff)"/>
        </marker>
      </defs>

      <rect width="1000" height="680" fill="var(--cad-bg, #0a192f)"/>
      <rect width="1000" height="680" fill="url(#cad-grid-major-6)"/>
      <rect x="20" y="20" width="960" height="640" fill="none" stroke="var(--cad-border, #64ffda)" stroke-width="2.5"/>
      <rect x="25" y="25" width="950" height="630" fill="none" stroke="var(--cad-border-inner, #234567)" stroke-width="1"/>

      <text x="500" y="54" fill="var(--cad-title, #64ffda)" font-family="monospace" font-size="18" font-weight="900" text-anchor="middle" letter-spacing="1.2">3D-ПЕЧАТНЫЙ КОРОБ ПОД РАМУ (DC-DC 12V 10A + СКРЫТЫЙ ГУДОК 105 dB)</text>
      <text x="500" y="74" fill="var(--cad-sub, #8892b0)" font-family="monospace" font-size="11" text-anchor="middle">ТРИ ПРОЕКЦИИ И РАЗРЕЗ • АКУСТИЧЕСКИЕ ЖАБРЫ-ЧЕШУЯ 35° • СТОЙКА М6 • МАТЕРИАЛ PETG / ABS-CF</text>

      <g transform="translate(80, 110)">
        <text x="0" y="15" fill="var(--cad-title, #64ffda)" font-family="monospace" font-size="13" font-weight="bold">1. ВИД СБОКУ В РАЗРЕЗЕ: ОТСЕКИ DC-DC И ГУДКА</text>

        <path d="M 30 50 L 320 50 L 305 190 L 50 190 Z" fill="rgba(0, 210, 255, 0.08)" stroke="#00d2ff" stroke-width="2.5"/>

        <path d="M 30 50 Q 175 62 320 50" stroke="#8892b0" stroke-width="2" stroke-dasharray="4 3" fill="none"/>
        <text x="175" y="42" fill="#8892b0" font-family="monospace" font-size="10" text-anchor="middle">Ложемент нижней трубы рамы</text>

        <rect x="55" y="68" width="240" height="35" rx="3" fill="rgba(100, 255, 218, 0.12)" stroke="#64ffda" stroke-width="1.5"/>
        <text x="175" y="90" fill="#64ffda" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">ОТСЕК ФИШЕК И СЛАБОТОЧКИ</text>

        <rect x="60" y="110" width="130" height="42" rx="3" fill="rgba(0, 255, 102, 0.18)" stroke="#00ff66" stroke-width="1.8"/>
        <text x="125" y="135" fill="#00ff66" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">БЛОК DC-DC 12V 10A</text>

        <circle cx="245" cy="140" r="26" fill="rgba(255, 170, 0, 0.18)" stroke="#ffaa00" stroke-width="2"/>
        <circle cx="245" cy="140" r="4" fill="#ffffff" stroke="#ffaa00" stroke-width="1.5"/>
        <text x="245" y="144" fill="#111111" font-family="monospace" font-size="8" font-weight="bold" text-anchor="middle">M6</text>
        <text x="245" y="122" fill="#ffaa00" font-family="monospace" font-size="9" font-weight="bold" text-anchor="middle">ГУДОК 105 dB</text>

        <g stroke="#ff5500" stroke-width="2.5">
          <line x1="215" y1="190" x2="200" y2="178"/>
          <line x1="230" y1="190" x2="215" y2="178"/>
          <line x1="245" y1="190" x2="230" y2="178"/>
          <line x1="260" y1="190" x2="245" y2="178"/>
          <line x1="275" y1="190" x2="260" y2="178"/>
        </g>
        <text x="235" y="210" fill="#ff5500" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">Жабры-чешуя (наклон 35° назад от брызг колеса)</text>

        <line x1="30" y1="230" x2="320" y2="230" stroke="var(--cad-dim-color, #00d2ff)" stroke-width="1.8" marker-start="url(#arrow-6)" marker-end="url(#arrow-6)"/>
        <text x="175" y="248" fill="var(--cad-dim-color, #00d2ff)" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">ДЛИНА КОРПУСА = 280 ММ</text>
      </g>

      <g transform="translate(540, 110)">
        <text x="0" y="15" fill="var(--cad-title, #64ffda)" font-family="monospace" font-size="13" font-weight="bold">2. ПОПЕРЕЧНЫЙ РАЗРЕЗ: ПОСАДКА ГУДКА И ВЫХОД ЗВУКА</text>

        <path d="M 40 40 Q 84 55 128 40 L 132 160 Q 84 170 36 160 Z" fill="rgba(100, 255, 218, 0.12)" stroke="#64ffda" stroke-width="2.5"/>
        <path d="M 46 48 Q 84 61 122 48 L 126 154 Q 84 163 42 154 Z" fill="none" stroke="#8892b0" stroke-width="1" stroke-dasharray="3 3"/>

        <rect x="80" y="75" width="8" height="20" fill="#f5b800" stroke="#111111" stroke-width="1"/>
        <text x="84" y="110" fill="#f5b800" font-family="monospace" font-size="9" font-weight="bold" text-anchor="middle">Резьбовая втулка М6</text>

        <ellipse cx="84" cy="125" rx="32" ry="8" fill="#ffaa00" stroke="#111111" stroke-width="1.5"/>
        <text x="84" y="145" fill="#ffaa00" font-family="monospace" font-size="9" text-anchor="middle">Мембрана 105 dB</text>

        <line x1="40" y1="190" x2="128" y2="190" stroke="var(--cad-dim-color, #00d2ff)" stroke-width="1.5" marker-start="url(#arrow-6)" marker-end="url(#arrow-6)"/>
        <text x="84" y="206" fill="var(--cad-dim-color, #00d2ff)" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">ШИРИНА 88 ММ</text>
      </g>

      <g transform="translate(540, 520)">
        <rect x="0" y="0" width="440" height="135" fill="var(--cad-title-bg, #0b1c30)" stroke="var(--cad-border, #64ffda)" stroke-width="2"/>
        <line x1="0" y1="35" x2="440" y2="35" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="0" y1="70" x2="440" y2="70" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="0" y1="100" x2="440" y2="100" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="110" y1="0" x2="110" y2="135" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>
        <line x1="330" y1="0" x2="330" y2="70" stroke="var(--cad-border, #64ffda)" stroke-width="1"/>

        <text x="10" y="22" fill="#8892b0" font-family="monospace" font-size="10">Разраб.</text>
        <text x="120" y="22" fill="#64ffda" font-family="monospace" font-size="12" font-weight="bold">Ведущий инженер АКБ</text>
        <text x="340" y="22" fill="#8892b0" font-family="monospace" font-size="10">Масштаб: <tspan fill="#64ffda" font-weight="bold">1:2</tspan></text>

        <text x="10" y="55" fill="#8892b0" font-family="monospace" font-size="10">Пров.</text>
        <text x="120" y="55" fill="#ffffff" font-family="monospace" font-size="12">ГОСТ 2.109-73</text>
        <text x="340" y="55" fill="#8892b0" font-family="monospace" font-size="10">Лист: <tspan fill="#ff5500" font-weight="bold">6 из 6</tspan></text>

        <text x="10" y="88" fill="#8892b0" font-family="monospace" font-size="10">Деталь 06</text>
        <text x="120" y="88" fill="#64ffda" font-family="monospace" font-size="13" font-weight="900">3D-КОРОБ DC-DC 12V + ГУДОК 105 dB</text>

        <text x="10" y="120" fill="#8892b0" font-family="monospace" font-size="10">Материал</text>
        <text x="120" y="120" fill="#ff5500" font-family="monospace" font-size="12" font-weight="bold">PETG / ABS-CF (3.2 ММ, ЗАПОЛНЕНИЕ 45%)</text>
      </g>
    </svg>`
  }
];

export function createCadTabletHtml(activeSheetIndex = 0) {
  const sheet = CAD_SHEETS[activeSheetIndex] || CAD_SHEETS[0];
  
  const tabsHtml = CAD_SHEETS.map((s, idx) => `
    <button class="cad-tab-btn ${idx === activeSheetIndex ? 'active' : ''}" data-sheet="${idx}">
      ${s.shortTitle}
    </button>
  `).join('');

  return `
    <div class="cad-tablet-container" id="cad-tablet-root">
      <div class="cad-tabs-bar">
        <div class="cad-tabs-list">
          ${tabsHtml}
        </div>
      </div>

      <div class="cad-toolbar">
        <div class="cad-meta-info">
          <span class="sheet-badge">ЛИСТ ${sheet.id} ИЗ 6</span>
          <span class="sheet-material">📐 ${sheet.material}</span>
        </div>
        <div class="cad-tools-actions">
          <button id="btn-cad-theme" class="cad-tool-btn" title="Переключить фон (Синька / Белый)">
            <span id="theme-label">☀️ БЕЛЫЙ ЛИСТ</span>
          </button>
          <button id="btn-cad-zoom-out" class="cad-tool-btn" title="Уменьшить">🔍 -</button>
          <button id="btn-cad-zoom-reset" class="cad-tool-btn" title="Сброс масштаба 100%">100%</button>
          <button id="btn-cad-zoom-in" class="cad-tool-btn" title="Увеличить">🔍 +</button>
          <button id="btn-cad-download" class="cad-tool-btn highlight-download" title="Скачать файл SVG 1:1">
            💾 СКАЧАТЬ ЧЕРТЕЖ SVG 1:1
          </button>
        </div>
      </div>

      <div class="cad-viewport-wrapper" id="cad-viewport">
        <div class="cad-svg-container" id="cad-svg-canvas" style="transform: scale(1.0); transform-origin: center center;">
          ${sheet.svg}
        </div>
      </div>

      <div class="cad-sheet-desc">
        <p><strong>${sheet.title}</strong></p>
        <p>${sheet.desc}</p>
      </div>
    </div>
  `;
}

export const ENGINEERING_MODALS = {
  cadTablet: {
    title: '📐 КОНСТРУКТОРСКИЙ ПЛАНШЕТ: ИНЖЕНЕРНЫЕ ЧЕРТЕЖИ И СХЕМЫ СБОРКИ (6 ЛИСТОВ)',
    render: (activeIdx = 0) => createCadTabletHtml(activeIdx),
    html: createCadTabletHtml(0)
  },
  saddle: {
    title: 'ЧЕРТЕЖ УЗЛА 07: МОТО-СЕДЛО SUR-RON (530 ММ) И ПОДРАМНИК',
    render: () => createCadTabletHtml(2),
    html: createCadTabletHtml(2)
  },
  dropout: {
    title: 'ЧЕРТЕЖ УЗЛА 04: МОНОЛИТНАЯ СТАЛЬНАЯ БРОНЕПЛАСТИНА 6 ММ (ОСЬ М14 + IS 51 ММ)',
    render: () => createCadTabletHtml(0),
    html: createCadTabletHtml(0)
  },
  motor: {
    title: 'ЧЕРТЕЖ УЗЛА 03: МОТОР 3000W + ЗАЛИВКА ПМС-100 + ЭЛЕКТРОСХЕМА EBS',
    render: () => createCadTabletHtml(3),
    html: createCadTabletHtml(3)
  },
  wiring: {
    title: 'ЧЕРТЕЖ УЗЛА 06: 3D-КОРОБ PETG ПОД РАМОЙ, DC-DC 12V, ФАРА 20W И ГУДОК 105 dB',
    render: () => createCadTabletHtml(5),
    html: createCadTabletHtml(5)
  },
  cordura: {
    title: 'ЧЕРТЕЖ УЗЛА 05: ВЫКРОЙКА СУМКИ CORDURA 1000D И 15 ММ ДЕМПФЕРА',
    render: () => createCadTabletHtml(4),
    html: createCadTabletHtml(4)
  },
  battery: {
    title: 'ЧЕРТЕЖ УЗЛА 05: ТОПОЛОГИЯ И РАСПАЙКА АКБ 20S7P (140 ЯЧЕЕК 21700) + BISIDA BMS 120A',
    render: () => createCadTabletHtml(1),
    html: createCadTabletHtml(1)
  }
};

export const CAD_SHEETS_6 = CAD_SHEETS;
