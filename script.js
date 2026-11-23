// =========================================================
// 1. DATA APLIKACE (seznam 6 stolů a denní počítadlo hostů)
// =========================================================
const stoly = [
    { id: 1, kapacita: 2, stav: "volno",    hoste: 0, casSezeni: 0,    casUklidu: 0  },
    { id: 2, kapacita: 2, stav: "obsazeno", hoste: 2, casSezeni: 600,  casUklidu: 0  },
    { id: 3, kapacita: 4, stav: "volno",    hoste: 0, casSezeni: 0,    casUklidu: 0  },
    { id: 4, kapacita: 4, stav: "uklid",    hoste: 0, casSezeni: 0,    casUklidu: 45 },
    { id: 5, kapacita: 6, stav: "obsazeno", hoste: 5, casSezeni: 1200, casUklidu: 0  },
    { id: 6, kapacita: 6, stav: "volno",    hoste: 0, casSezeni: 0,    casUklidu: 0  }
];

let celkemHostuDnes = 7; // Na začátku už v restauraci sedí 2 + 5 = 7 hostů


// =========================================================
// 2. PŘEPÍNÁNÍ MEZI MAPOU A KALKULAČKOU
// =========================================================
const btnMapa = document.getElementById("btn-mapa");
const btnKalkulacka = document.getElementById("btn-kalkulacka");
const obrazovkaMapa = document.getElementById("obrazovka-mapa");
const obrazovkaKalkulacka = document.getElementById("obrazovka-kalkulacka");

function prepniNa(nazev) {
    if (nazev === "mapa") {
        obrazovkaMapa.classList.add("aktivni");
        obrazovkaKalkulacka.classList.remove("aktivni");
        btnMapa.classList.add("aktivni");
        btnKalkulacka.classList.remove("aktivni");
    } else {
        obrazovkaKalkulacka.classList.add("aktivni");
        obrazovkaMapa.classList.remove("aktivni");
        btnKalkulacka.classList.add("aktivni");
        btnMapa.classList.remove("aktivni");
        naplnVyberStolu();
        zkontrolujKalkulacku();
    }
}

btnMapa.addEventListener("click", () => prepniNa("mapa"));
btnKalkulacka.addEventListener("click", () => prepniNa("kalkulacka"));


// =========================================================
// 3. POMOCNÉ FUNKCE (čas a statistiky)
// =========================================================

// Převede sekundy na hezký text, např. "1 min 05 s"
function formatujCas(sekundy) {
    let minuty = Math.floor(sekundy / 60);
    let zbytekSekund = sekundy % 60;

    if (zbytekSekund < 10) {
        zbytekSekund = "0" + zbytekSekund;
    }
    return minuty + " min " + zbytekSekund + " s";
}

// Spočítá a zobrazí 5 statistik nahoře na stránce
function aktualizujStatistiky() {
    let volne = 0;
    let obsazene = 0;
    let uklid = 0;
    let praveHostu = 0;
    let celkemMist = 0;

    for (let stul of stoly) {
        celkemMist += stul.kapacita;
        praveHostu += stul.hoste;

        if (stul.stav === "volno")    volne++;
        if (stul.stav === "obsazeno") obsazene++;
        if (stul.stav === "uklid")    uklid++;
    }

    document.getElementById("stat-volne").textContent = volne + " / 6";
    document.getElementById("stat-obsazene").textContent = obsazene + " / 6";
    document.getElementById("stat-uklid").textContent = uklid + " / 6";
    document.getElementById("stat-hoste").textContent = praveHostu + " / " + celkemMist + " míst";
    document.getElementById("stat-dnes").textContent = celkemHostuDnes + " os.";
}

// Přepne stůl do úklidu na 1 minutu (60 sekund) – volá se až po zaplacení
function zahajUklid(stul) {
    stul.stav = "uklid";
    stul.hoste = 0;
    stul.casSezeni = 0;
    stul.casUklidu = 60;
    vykresliStoly();
}


// =========================================================
// 4. VYKRESLENÍ 6 STOLŮ NA STRÁNKU
// =========================================================
function vykresliStoly() {
    const seznam = document.getElementById("seznam-stolu");
    seznam.innerHTML = ""; // Smaže staré karty, aby se neduplikovaly

    for (let stul of stoly) {
        const karta = document.createElement("div");
        karta.className = "stul " + stul.stav;

        // Nadpis stolu
        let obsah = `<h3>Stůl ${stul.id} (kapacita ${stul.kapacita})</h3>`;

        // Text podle aktuálního stavu
        if (stul.stav === "volno") {
            obsah += `<p>Stav: <strong>VOLNO</strong></p>`;
        } else if (stul.stav === "obsazeno") {
            obsah += `<p>Stav: <strong>OBSAZENO (${stul.hoste} os.)</strong></p>`;
            obsah += `<p>Doba u stolu: ${formatujCas(stul.casSezeni)}</p>`;
        } else if (stul.stav === "uklid") {
            obsah += `<p>Stav: <strong>PROBÍHÁ ÚKLID</strong></p>`;
            obsah += `<p>Zbývá: ${formatujCas(stul.casUklidu)}</p>`;
        }

        karta.innerHTML = obsah;

        // Obsazený stůl má jen tlačítko "Zaplatit" – úklid začne až po zaplacení
        if (stul.stav === "obsazeno") {
            const btnZaplatit = document.createElement("button");
            btnZaplatit.textContent = "Zaplatit";
            btnZaplatit.className = "btn modre";
            btnZaplatit.addEventListener("click", () => {
                prepniNa("kalkulacka");
                document.getElementById("vyber-stolu").value = stul.id;
                document.getElementById("vstup-lide").value = stul.hoste;
                zkontrolujKalkulacku();
            });

            karta.appendChild(btnZaplatit);
        }

        // Tlačítko pro stůl v úklidu
        if (stul.stav === "uklid") {
            const btnHotovo = document.createElement("button");
            btnHotovo.textContent = "Úklid hotový (Volno)";
            btnHotovo.className = "btn zelene";
            btnHotovo.addEventListener("click", () => {
                stul.stav = "volno";
                stul.casUklidu = 0;
                vykresliStoly();
            });
            karta.appendChild(btnHotovo);
        }

        seznam.appendChild(karta);
    }

    aktualizujStatistiky();
}


// =========================================================
// 5. USAZENÍ NOVÝCH HOSTŮ (blbuvzdorný formulář)
// =========================================================
const vstupHoste = document.getElementById("vstup-hoste");
const chybaUsazeni = document.getElementById("chyba-usazeni");
const zpravaUsazeni = document.getElementById("zprava-usazeni");
const tlacitkoUsadit = document.getElementById("tlacitko-usadit");

// Zkontroluje, jestli je zadané celé číslo 1 až 6
function zkontrolujUsazeni() {
    const pocet = Number(vstupHoste.value);

    if (vstupHoste.value === "" || !Number.isInteger(pocet) || pocet < 1 || pocet > 6) {
        vstupHoste.classList.add("spatne");
        chybaUsazeni.textContent = "Zadejte celé číslo od 1 do 6.";
        tlacitkoUsadit.disabled = true;
        return false;
    }

    vstupHoste.classList.remove("spatne");
    chybaUsazeni.textContent = "";
    tlacitkoUsadit.disabled = false;
    return true;
}

vstupHoste.addEventListener("input", zkontrolujUsazeni);

document.getElementById("form-usazeni").addEventListener("submit", (event) => {
    event.preventDefault(); // Zabrání znovunačtení stránky
    if (!zkontrolujUsazeni()) return;

    const pocet = Number(vstupHoste.value);
    let vybranyStul = null;

    // Najde nejmenší volný stůl, kam se hosté vejdou
    for (let stul of stoly) {
        if (stul.stav === "volno" && stul.kapacita >= pocet) {
            if (vybranyStul === null || stul.kapacita < vybranyStul.kapacita) {
                vybranyStul = stul;
            }
        }
    }

    if (vybranyStul === null) {
        zpravaUsazeni.textContent = "Bohužel není volný žádný vhodný stůl.";
    } else {
        vybranyStul.stav = "obsazeno";
        vybranyStul.hoste = pocet;
        vybranyStul.casSezeni = 0;
        celkemHostuDnes += pocet; // Přičte hosty do celkové dnešní statistiky
        zpravaUsazeni.textContent = "Hosté byli usazeni ke Stolu " + vybranyStul.id + ".";
        vykresliStoly();
    }
});


// =========================================================
// 6. BLBUVZDORNÁ KALKULAČKA PLATBY
// =========================================================
const vyberStolu = document.getElementById("vyber-stolu");
const vstupCastka = document.getElementById("vstup-castka");
const vyberDysko = document.getElementById("vyber-dysko");
const vstupLide = document.getElementById("vstup-lide");
const chybaCastka = document.getElementById("chyba-castka");
const chybaLide = document.getElementById("chyba-lide");
const tlacitkoSpocitat = document.getElementById("tlacitko-spocitat");
const tlacitkoUvolnit = document.getElementById("tlacitko-uvolnit");
const boxVysledek = document.getElementById("vysledek");

// Naplní rozbalovací menu jen obsazenými stoly
function naplnVyberStolu() {
    vyberStolu.innerHTML = '<option value="">-- Bez výběru stolu --</option>';

    for (let stul of stoly) {
        if (stul.stav === "obsazeno") {
            const moznost = document.createElement("option");
            moznost.value = stul.id;
            moznost.textContent = `Stůl ${stul.id} (${stul.hoste} os., max ${stul.kapacita})`;
            vyberStolu.appendChild(moznost);
        }
    }
}

// Když vyberu stůl, automaticky doplní počet usazených osob
vyberStolu.addEventListener("change", () => {
    const id = Number(vyberStolu.value);
    for (let stul of stoly) {
        if (stul.id === id) {
            vstupLide.value = stul.hoste;
        }
    }
    zkontrolujKalkulacku();
});

// Kontrola chybných vstupů (blbuvzdornost)
function zkontrolujKalkulacku() {
    let jeToSpravne = true;

    // 1. Kontrola částky – musí být alespoň 5 Kč
    const castka = Number(vstupCastka.value);
    if (vstupCastka.value === "" || isNaN(castka) || castka < 5) {
        vstupCastka.classList.add("spatne");
        chybaCastka.textContent = "Částka musí být minimálně 5 Kč.";
        jeToSpravne = false;
    } else {
        vstupCastka.classList.remove("spatne");
        chybaCastka.textContent = "";
    }

    // 2. Zjistí maximální povolený počet osob podle vybraného stolu (bez stolu max 6)
    let maxOsob = 6;
    const vybraneId = Number(vyberStolu.value);
    for (let stul of stoly) {
        if (stul.id === vybraneId) {
            maxOsob = stul.kapacita;
        }
    }

    // 3. Kontrola počtu osob (1 až kapacita stolu)
    const lide = Number(vstupLide.value);
    if (vstupLide.value === "" || !Number.isInteger(lide) || lide < 1 || lide > maxOsob) {
        vstupLide.classList.add("spatne");
        chybaLide.textContent = `Počet osob musí být celé číslo od 1 do ${maxOsob}.`;
        jeToSpravne = false;
    } else {
        vstupLide.classList.remove("spatne");
        chybaLide.textContent = "";
    }

    // Zamkne tlačítka, pokud je někde chyba
    tlacitkoSpocitat.disabled = !jeToSpravne;
    tlacitkoUvolnit.disabled = !jeToSpravne || vyberStolu.value === "";

    if (!jeToSpravne) {
        boxVysledek.classList.add("skryte");
    }

    return jeToSpravne;
}

vstupCastka.addEventListener("input", zkontrolujKalkulacku);
vstupLide.addEventListener("input", zkontrolujKalkulacku);

// Výpočet útraty a dýška
document.getElementById("form-kalkulacka").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!zkontrolujKalkulacku()) return;

    const castka = Number(vstupCastka.value);
    const procenta = Number(vyberDysko.value);
    const lide = Number(vstupLide.value);

    const dysko = castka * (procenta / 100);
    const celkem = castka + dysko;
    const naOsobu = celkem / lide;

    document.getElementById("vys-dysko").textContent = Math.round(dysko) + " Kč";
    document.getElementById("vys-celkem").textContent = Math.round(celkem) + " Kč";
    document.getElementById("vys-osoba").textContent = Math.ceil(naOsobu) + " Kč";

    boxVysledek.classList.remove("skryte");
});

// Zaplacení a přepnutí vybraného stolu do úklidu
tlacitkoUvolnit.addEventListener("click", () => {
    const id = Number(vyberStolu.value);
    for (let stul of stoly) {
        if (stul.id === id) {
            zahajUklid(stul);
            vstupCastka.value = "";
            boxVysledek.classList.add("skryte");
            zpravaUsazeni.textContent = "Stůl " + stul.id + " zaplatil a začal se uklízet.";
            prepniNa("mapa");
        }
    }
});


// =========================================================
// 7. ČASOVAČ (běží každou 1 sekundu)
// =========================================================
setInterval(() => {
    for (let stul of stoly) {
        if (stul.stav === "obsazeno") {
            stul.casSezeni++; // Přičítá sekundy sezení
        } else if (stul.stav === "uklid") {
            stul.casUklidu--; // Odečítá 1 minutu úklidu
            if (stul.casUklidu <= 0) {
                stul.stav = "volno"; // Po vypršení je stůl zase volný
            }
        }
    }
    vykresliStoly();
}, 1000);


// =========================================================
// 8. SPUŠTĚNÍ PŘI NAČTENÍ STRÁNKY
// =========================================================
vykresliStoly();
zkontrolujUsazeni();
zkontrolujKalkulacku();
