import imgMostar from "@/assets/hero-house.jpg";
import imgBattery from "@/assets/card-battery.jpg";
import imgHeating from "@/assets/card-heating.jpg";

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  content: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "6kwp-mostar",
    title: "Koliko stvarno štedi 6 kWp sustav u Mostaru?",
    category: "Studija slučaja",
    description: "Analiza realne potrošnje i proizvodnje kroz cijelu godinu.",
    image: imgMostar,
    content: [
      "Mostar je zbog visokog broja sunčanih sati godišnje jedna od najpovoljnijih lokacija u BiH za solarne elektrane. Sustav od 6 kWp, postavljen na krov orijentiran prema jugu, u prosjeku proizvede između 8.000 i 8.800 kWh električne energije godišnje.",
      "Za prosječno kućanstvo s mjesečnom potrošnjom od 400-500 kWh, ovakav sustav pokriva 80-100% godišnjih potreba za strujom, uz manje sezonske oscilacije (veća proizvodnja ljeti, manja zimi).",
      "Uz prosječnu cijenu struje od 0.29 KM/kWh, godišnja ušteda za ovakvo kućanstvo iznosi otprilike 2.300 - 2.500 KM. Investicija u sustav ove veličine se u Mostaru u prosjeku vraća za 6 do 7 godina, a sustav ima vijek trajanja od 25+ godina — ostatak je čista ušteda.",
      "Dodatni faktori koji utječu na stvarnu uštedu su orijentacija i nagib krova, sjena od okolnih objekata ili drveća, te vrsta priključka (jednofazni ili trofazni). Naš kalkulator uzima sve ove parametre u obzir kako bi dao realnu procjenu za tvoju konkretnu lokaciju.",
    ],
  },
  {
    slug: "baterijski-sustavi",
    title: "Baterijski sustavi: kada se isplate?",
    category: "Tehnologija",
    description: "ROI analiza skladištenja energije za prosječno kućanstvo.",
    image: imgBattery,
    content: [
      "Baterijski sustav skladišti višak solarne energije proizvedene tokom dana, kako bi se mogao koristiti navečer ili u danima sa slabijom proizvodnjom. Pitanje koje si većina korisnika postavlja jeste — isplati li se dodatna investicija?",
      "Za kućanstva koja veći dio potrošnje imaju tokom dana (rad od kuće, dnevna upotreba uređaja), baterija često nije nužna — direktna potrošnja proizvedene energije je već vrlo efikasna. Baterija postaje isplativija za kućanstva koja trebaju struju uglavnom navečer, ili za one koji žele veću sigurnost u slučaju prekida napajanja.",
      "Tipičan baterijski sustav kapaciteta 5-10 kWh dodatno poveća investiciju za otprilike 30-50%, ali može povećati samodostatnost kućanstva sa 60-70% (samo solar) na 85-95% (solar + baterija).",
      "Period povrata investicije za baterijski dio sustava je obično duži nego za panele — u prosjeku 8-12 godina, ovisno o cijeni baterije i obrascu potrošnje. Naš kalkulator daje preporuku da li je baterija isplativa za tvoj specifični slučaj, na temelju veličine sustava i potrošnje.",
    ],
  },
  {
    slug: "toplotne-pumpe-solar",
    title: "Toplotne pumpe + solar: idealna kombinacija",
    category: "Vodič",
    description: "Kako spojiti toplotnu pumpu sa solarnom elektranom.",
    image: imgHeating,
    content: [
      "Toplotne pumpe su jedan od najefikasnijih načina grijanja i hlađenja doma, ali trebaju struju za rad — što ih čini prirodnim partnerom solarnoj elektrani. Kombinacija ova dva sustava može značajno smanjiti ukupne troškove energije u kućanstvu.",
      "Toplotna pumpa za svaki uloženi kWh struje proizvede 3-4 kWh toplinske energije (tzv. COP faktor), što znači da je solarna energija koja pokreće pumpu izuzetno efikasno iskorištena.",
      "Najveća prednost je u prijelaznim periodima (proljeće, jesen) kada je proizvodnja solarne energije visoka, a potreba za grijanjem/hlađenjem umjerena — višak proizvedene energije se direktno koristi za rad pumpe, bez gubitaka kroz mrežu.",
      "Za kućanstva koja razmatraju zamjenu starog sustava grijanja (na lož ulje, ugalj ili struju), kombinacija solarne elektrane i toplotne pumpe može smanjiti godišnje troškove energije za 60-80% u odnosu na konvencionalne sustave grijanja.",
    ],
  },
];
