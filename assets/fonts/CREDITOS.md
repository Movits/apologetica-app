# Fontes embarcadas

| Arquivo | Uso | Origem | Licença |
|---|---|---|---|
| `CormorantGaramond-SemiBold.ttf` | títulos e large titles do app (chave `CormorantGaramond-SemiBold` no `useFonts`) | instância estática peso 600 da Cormorant Garamond variável, subset latino (U+0000-017F, pontuação geral, euro, TM), gerada com fonttools 4.66 (`varLib.instancer --update-name-table wght=600` + `subset --layout-features=kern,liga`) | SIL OFL 1.1 (`OFL-CormorantGaramond.txt`) |

Fonte de origem: `https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf`,
baixada em 2026-09-24 (blob `d992a83ce525c330fad3a19087746bcb2dc038ee`,
sha256 `b20b7d9626dd956b2c5e558692ad328b1f19e3275e2782db4fa07670d83f35e0`).
Resultado: 79.168 bytes, 402 glifos, nome PostScript `CormorantGaramond-SemiBold`.

A UI usa a sans do sistema e a leitura usa a serifa do sistema (Georgia, New
York, Noto Serif): nenhuma outra fonte é embarcada, de propósito.
