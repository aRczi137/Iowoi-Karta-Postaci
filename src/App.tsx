import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Users,
  MessageSquare,
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sword,
  ScrollText,
  Shield,
  Upload,
  Coins,
  Zap,
  Skull,
  Minus,
  FileText,
  ArrowUpCircle,
  Clock,
  X,
  Bot,
  BookOpen,
  RefreshCw,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Users2,
  Edit2
} from 'lucide-react';
import { Character, Post, StatHistory, Session, NPCDetectionResult, DetectedNPC, NPCUpdate, Location, EncounteredPlayer } from './types';
import { generateCharacterAvatar, generateMangaPanel, getPostAssistance, generateSimplifiedNPC, summarizeSession, generatePlayerResponse, extractNPCsFromGMPost } from './services/gemini';
import { cn } from './utils';
import ReactMarkdown from 'react-markdown';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 w-full transition-all duration-300 rounded-lg",
      active
        ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
    )}
  >
    <Icon size={20} />
    <span className="text-sm uppercase tracking-widest">{label}</span>
  </button>
);

const SimplifiedNPCForm = ({
  initialCharacter,
  playerName,
  onSave,
  onCancel,
}: {
  initialCharacter?: Character;
  playerName: string;
  onSave: (character: Partial<Character>) => void;
  onCancel: () => void;
}) => {
  const [gmNote, setGmNote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNPC, setGeneratedNPC] = useState<Partial<Character> | null>(initialCharacter || null);

  const handleGenerate = async () => {
    if (!gmNote.trim()) return;
    setIsGenerating(true);
    try {
      const data = await generateSimplifiedNPC(gmNote, playerName, initialCharacter);

      setGeneratedNPC((prev) => ({
        ...(prev || {}), // Keep ID and existing fields if updating
        name: data.name,
        profession: data.race_profession,
        appearance: data.appearance,
        personality: data.personality,
        avatar_url: data.avatarUrl,
        type: 'NPC',
        surname: prev?.surname || '',
        quote: prev?.quote || '',
        gender: prev?.gender || 'Nieznana',
        age: prev?.age || '',
        weight: prev?.weight || '',
        height: prev?.height || '',
        history: prev?.history || '',
        equipment: prev?.equipment || '',
        money: prev?.money || '',
        skills: prev?.skills || 'Brak',
        disadvantages: prev?.disadvantages || 'Brak',
        stats: prev?.stats || '',
        general_stats: prev?.general_stats || '',
        techniques: prev?.techniques || 'Brak'
      }));
    } catch (e: any) {
      alert("Błąd generowania NPC: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-3xl space-y-6">
      <h3 className="text-2xl font-display italic uppercase border-b border-zinc-800 pb-4">
        {initialCharacter ? `Aktualizacja: ${initialCharacter.name}` : 'Tajemniczy Nieznajomy (Nowy NPC)'}
      </h3>
      <p className="text-sm text-zinc-400">
        Możesz opisać wygląd/charakter własnymi słowami albo wkleić notatkę od Mistrza Gry. AI automatycznie wyodrębni to, co najważniejsze i {initialCharacter ? 'zaktualizuje informacje o tej postaci.' : 'zrobi portret.'}
      </p>

      {(!generatedNPC || gmNote.length > 0) ? (
        <div className="space-y-4">
          <textarea
            value={gmNote}
            onChange={e => setGmNote(e.target.value)}
            placeholder="Opis od Mistrza Gry (np. Spotykacie w tawernie młodą kobietę o siwych włosach i bladych oczach. Twierdzi, że jest z 9 dywizji. Wydaje się bardzo nerwowa.)"
            className="w-full h-40 bg-zinc-900/50 border border-zinc-700 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-white transition-colors"
          />
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={onCancel} className="px-6 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors">Anuluj</button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !gmNote.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Generuj z AI
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          <div className="col-span-1">
            <img src={generatedNPC.avatar_url!} alt="Avatar" className="w-full aspect-square object-cover rounded-2xl border border-zinc-800 shadow-xl" />
          </div>
          <div className="col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Imię / Nazwa</label>
                <input value={generatedNPC.name} onChange={e => setGeneratedNPC({ ...generatedNPC, name: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-white transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Kim jest? (Frakcja/Rasa)</label>
                <input value={generatedNPC.profession} onChange={e => setGeneratedNPC({ ...generatedNPC, profession: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-white transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Wygląd (do edycji)</label>
              <textarea value={generatedNPC.appearance} onChange={e => setGeneratedNPC({ ...generatedNPC, appearance: e.target.value })} className="w-full h-20 bg-zinc-900/50 border border-zinc-700 rounded-lg p-3 text-sm focus:outline-none focus:border-white transition-colors resize-none" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Osobowość / Relacja / Notatka z Sesji</label>
              <textarea value={generatedNPC.personality} onChange={e => setGeneratedNPC({ ...generatedNPC, personality: e.target.value })} className="w-full h-24 bg-zinc-900/50 border border-zinc-700 rounded-lg p-3 text-sm focus:outline-none focus:border-white transition-colors resize-none" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button onClick={() => setGeneratedNPC(initialCharacter || null)} className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"><Trash2 size={14} /> Odrzuć Zmiany AI</button>
              {initialCharacter && (
                <button onClick={onCancel} className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Anuluj Edycję</button>
              )}
              <button
                onClick={() => { onSave(generatedNPC!); setGmNote(""); }}
                className="flex items-center gap-2 px-6 py-2 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-lg hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10"
              >
                <Save size={16} /> Zapisz do Akt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ImageCarousel = ({ images, title }: { images: string[], title: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600">
        <User size={64} />
      </div>
    );
  }

  if (images.length === 1) {
    return <img src={images[0]} alt={title} className="w-full h-full object-cover" />;
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-full group">
      <img src={images[currentIndex]} alt={`${title} - ${currentIndex + 1}`} className="w-full h-full object-cover transition-all duration-500" />

      {/* Navigation Arrows */}
      <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handlePrevious} className="p-1 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors backdrop-blur-sm">
          <ChevronLeft size={20} />
        </button>
        <button onClick={handleNext} className="p-1 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors backdrop-blur-sm">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              idx === currentIndex ? "bg-white w-4" : "bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </div>
  );
};

const StatBar = ({ label, current, max, color, onChange }: { label: string, current: number, max: number, color: string, onChange: (v: number) => void }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => onChange(Math.max(0, current - 1))} className="text-zinc-500 hover:text-white transition-colors"><Minus size={12} /></button>
          <span className="text-xs font-bold font-mono min-w-[3rem] text-center">
            <span className="text-white">{current}</span> <span className="text-zinc-600">/ {max}</span>
          </span>
          <button onClick={() => onChange(Math.min(max, current + 1))} className="text-zinc-500 hover:text-white transition-colors"><Plus size={12} /></button>
        </div>
      </div>
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const STARTING_RANKS: Record<string, string[]> = {
  'Quincy': ['Nowicjusz Quincy'],
  'Człowiek': ['Zwykły Człowiek'],
  'Dusza': ['Mieszkaniec Rukongai', 'Mieszkaniec Seireitei'],
  'Shinigami': ['Uczeń akademii Shinigami', 'Shinigami'],
  'Hollow': ['Hollow (Początkujący)'],
  'Bounto': ['Początkujący Bounto'],
  'Kami': ['Nowicjusz'],
  'Fullbringer': ['Początkujący Fullbringer']
};

const getRaceModifiers = (profession?: string) => {
  const mods = {
    freePoints: 0,
    moneyDisabled: false,
    stats: {
      'Siła': 0, 'Szybkość': 0, 'Zręczność': 0, 'Wytrzymałość': 0,
      'Inteligencja': 0, 'Psychika': 0, 'Reiatsu': 0, 'Kontrola Reiatsu': 0
    }
  };

  if (!profession) return mods;
  const p = profession.toLowerCase();

  if (p.includes('uczeń akademii shinigami')) {
    mods.stats['Reiatsu'] += 2;
  } else if (p === 'shinigami') {
    mods.stats['Reiatsu'] += 2;
    mods.freePoints += 3;
  } else if (p.includes('quincy')) {
    mods.stats['Kontrola Reiatsu'] += 5;
    mods.stats['Szybkość'] += 3;
    mods.stats['Psychika'] += 2;
    mods.stats['Wytrzymałość'] -= 1;
    mods.stats['Siła'] -= 1;
    mods.stats['Reiatsu'] -= 3;
  } else if (p.includes('człowiek')) {
    mods.freePoints += 3;
    mods.stats['Reiatsu'] += 2;
  } else if (p.includes('rukongai')) {
    mods.stats['Wytrzymałość'] += 2;
    mods.stats['Szybkość'] += 2;
    mods.freePoints += 2;
    mods.stats['Kontrola Reiatsu'] -= 1;
  } else if (p.includes('seireitei')) {
    mods.stats['Inteligencja'] += 3;
    mods.stats['Kontrola Reiatsu'] += 2;
  } else if (p.includes('hollow')) {
    // Note: +4 to physical stats is treated as +4 free points for simplicity 
    // but the system will display a note if possible.
    mods.freePoints += 4;
    mods.stats['Psychika'] -= 4;
    mods.moneyDisabled = true;
  } else if (p.includes('bounto')) {
    mods.stats['Kontrola Reiatsu'] += 3;
    mods.stats['Psychika'] += 2;
  } else if (p.includes('kami')) {
    mods.moneyDisabled = true;
  }

  return mods;
};

const HADOU_LIST = [
  { level: 1, name: "#1 - Shou (Pchnięcie)" },
  { level: 2, name: "#2 - Shuuha (Fala Uderzenia)" },
  { level: 3, name: "#3 - Housenka Houka (Ogień)" },
  { level: 4, name: "#4 - Byakurai (Biała Błyskawica)" },
  { level: 5, name: "#5 - Kuragari (Strzała Mroku)" },
  { level: 6, name: "#6 - Gogyou (Podmuch Ognia)" },
  { level: 7, name: "#7 - Dokubutsu (Zatruta Kula)" },
  { level: 8, name: "#8 - Sando (Deszcz Kwasu)" },
  { level: 9, name: "#9 - Washi Ken (Papierowe ostrze)" },
  { level: 10, name: "#10 - Kasai (Ognisty Wir)" },
  { level: 11, name: "#11 - Tsuzuri Raiden (Wiążąca Błyskawica)" },
  { level: 12, name: "#12 - Fushibi (Rozpostarty ogień)" },
  { level: 13, name: "#13 - Sougai (Siarczysty mróz wieku)" },
  { level: 14, name: "#14 - Hokoriyume (Pył marzeń)" },
  { level: 15, name: "#15 - Buke Katachi (Forma Wojownika)" },
  { level: 16, name: "#16 - Semai Jishin (Niszczące Uderzenie Ziemi)" },
  { level: 17, name: "#17 - Genjuu Ishi (Wielka Skała)" },
  { level: 18, name: "#18 - Oogata Shippuu (Wielki Podmuch Wiatru)" },
  { level: 19, name: "#19 - Itami Senritsu (Melodia bólu)" },
  { level: 20, name: "#20 - Torimonoi Nentou (Przejęcie Umysłu)" },
  { level: 21, name: "#21 - Juu Ken (Dziesięć Ostrzy)" },
  { level: 22, name: "#22 - Kinokiita Ken (inteligentne ostrze)" },
  { level: 23, name: "#23 - Gyokaku (Ciężkość)" },
  { level: 24, name: "#24 - Hyaku Ken (Sto ostrzy)" },
  { level: 25, name: "#25 - Denkou (Grzmot)" },
  { level: 26, name: "#26 - Bakuhatsuiro (Eksplozja barw)" },
  { level: 27, name: "#27 - Shippu Shinrai (Podżegające Ostrze Burzy)" },
  { level: 28, name: "#28 - Hoeryuuken (Pieść Wyjącego Smoka)" },
  { level: 29, name: "#29 - Kouri Ya (Lodowa strzała)" },
  { level: 30, name: "#30 - Senkou Saikoro (Błysk śmierci)" },
  { level: 31, name: "#31 - Shukkahou (Kula Czerwonego Ognia)" },
  { level: 32, name: "#32 - Okasen (Promień Złotego Ognia)" },
  { level: 33, name: "#33 - Soukatsui (Rozbicie Niebieskiego Płomienia)" },
  { level: 34, name: "#34 - Hidoi no Mai (Makabryczny Taniec)" },
  { level: 35, name: "#35 - Routa (Spopielenie)" },
  { level: 36, name: "#36 - Atsuijouki (Gorąca para)" },
  { level: 37, name: "#37 - Warui Inu (Wściekłe psy)" },
  { level: 38, name: "#38 - Hichou (Ogniste motyle)" },
  { level: 39, name: "#39 - Suiryukou (Ryk wodnego smoka)" },
  { level: 40, name: "#40 - Kiramekibara (Różany błysk)" },
  { level: 41, name: "#41 - Ranpu (Oślepienie)" },
  { level: 42, name: "#42 - Tetsusei no Reiki (Aura żelaznego pyłu)" },
  { level: 43, name: "#43 - Seishinken (Duchowe ostrze)" },
  { level: 44, name: "#44 - Koumaru Sogeki Koori (Kula Lodu)" },
  { level: 45, name: "#45 - Taika katachi - Kamakiri (Forma mistrza - modliszka)" },
  { level: 46, name: "#46 - Taika katachi - Kusarihebi (Forma mistrza - żmija)" },
  { level: 47, name: "#47 - Taika katachi - Tsuru (Forma mistrza - żuraw)" },
  { level: 48, name: "#48 - Yanma Yuki (Śnieżny lament)" },
  { level: 49, name: "#49 - Muchinangyou (Bicze pokutne)" },
  { level: 50, name: "#50 - Ten no Ikari (Niebiański Gniew)" },
  { level: 51, name: "#51 - Chokushi no Akuma (Demoniczne oczy wizji śmierci)" },
  { level: 52, name: "#52 - Harashirohone (Pole białych kości)" },
  { level: 53, name: "#53 - Mizudanha (Wodny Strumień Ciśnienia)" },
  { level: 54, name: "#54 - Haien (Niszczące Płomienie)" },
  { level: 55, name: "#55 - Norowa no Kasai (Przeklęty Ogień)" },
  { level: 56, name: "#56 - Kongou Bakufuu (Adamantowy Podmuch)" },
  { level: 57, name: "#57 - Daichi Tenyo (Rozkołysany taniec ziemi)" },
  { level: 58, name: "#58 - Tenran (Mroczna Burza)" },
  { level: 59, name: "#59 - Raikyu Koudan (Granat Burzowego Smoka)" },
  { level: 60, name: "#60 - Hebi Hanone (Kły węża)" },
  { level: 61, name: "#61 - Same Sekiryou Ibari (Gniew samotnego rekina)" },
  { level: 62, name: "#62 - Ureshī Itami Tome (Triumfalny wór bólu)" },
  { level: 63, name: "#63 - Ikarichi (Gniew krwi)" },
  { level: 64, name: "#64 - Raikouhou (Palący Wrzask Błyskawic)" },
  { level: 65, name: "#65 - Jojoushi hanshaha (Fala lyriczna)" },
  { level: 66, name: "#66 - Kizutogame (Zaognienie rany)" },
  { level: 67, name: "#67 - Yuudoku Kichigai (Trujące szaleństwo)" },
  { level: 68, name: "#68 - Kūkyo no te (Dłoń pustki)" },
  { level: 69, name: "#69 - Tsubame hakai (Jaskółka zagłady)" },
  { level: 70, name: "#70 - Ashura no ikari (Gniew Asury)" },
  { level: 71, name: "#71 - Shojohebi Fukushū (Zemsta wężowej panny)" },
  { level: 72, name: "#72 - Shōgo no toppū (Podmuch południa)" },
  { level: 73, name: "#73 - Souren Soukatsui (Podwójny Lotus)" },
  { level: 74, name: "#74 - Kesshou Yari (Kryształowa Włócznia)" },
  { level: 75, name: "#75 - Hashiraintetsu (Filar meteorytowego żelaza)" },
  { level: 76, name: "#76 - Jigoku no tsume (Szpony piekieł)" },
  { level: 77, name: "#77 - Shoumei Yari (Włócznia błyskawicy)" },
  { level: 78, name: "#78 - Tangerine (Tnące koło)" },
  { level: 79, name: "#79 - Kouyoutsuiraku (Wywyższenie i upadek)" },
  { level: 80, name: "#80 - Yonatamahitei (Cztery łby zaprzeczenia)" },
  { level: 81, name: "#81 - Akaikoketsu (Czerwona paszcza śmierci)" },
  { level: 82, name: "#82 - Tsuihō Sa Reta Ikari (Wygnana furia)" },
  { level: 83, name: "#83 - Rokujou Rei Ranpu (Gniewny Promień Światła)" },
  { level: 84, name: "#84 - Yuureikoushin (Marsz upiorów)" },
  { level: 85, name: "#85 - Ko Nadare (Wielka Lawina)" },
  { level: 86, name: "#86 - Shikisokuzeku (Pustka)" },
  { level: 87, name: "#87 - Shūkgendō no michi (Droga shugendo)" },
  { level: 88, name: "#88 - Hiryuu Gekizoku Shinten Raihou (Cios Latającego Smoka, Trzęsące Niebem Działo Błyskawic)" },
  { level: 89, name: "#89 - Sesshōseki (Zabijający kamień)" },
  { level: 90, name: "#90 - Kurohitsugi (Czarna Trumna)" },
  { level: 91, name: "#91 - Senjū Kōten Taihō (Działo Tysiąca Niebiańskich Błysków)" },
  { level: 92, name: "#92 - Teppūsatsu (Morderstwo Żelaznego Wiatru)" },
  { level: 93, name: "#93 - Yamakougeki (Uderzenie góry)" },
  { level: 94, name: "#94 - Ten no kugyō (Niebiańska pokuta)" },
  { level: 95, name: "#95 - Senkokuarashi (Osąd Burzy)" },
  { level: 96, name: "#96 - Ittou Kasou (Spopielające Ostrze)" },
  { level: 97, name: "#97 - Kami no Kyoijin (Boski olbrzym)" },
  { level: 98, name: "#98 - Kusanagi no Tsurugi (Miecz trawosiecz)" },
  { level: 99, name: "#99 - Goryutenmetsu (Pięć wirujących smoków destrukcji)" },
  { level: 100, name: "#100 - Ame-no-nuhoko (Niebiańska włócznia)" }
];

const BAKUDOU_LIST = [
  { level: 1, name: "#1 - Sai (Blokada)" },
  { level: 2, name: "#2 - Engo (Tarcza Reiatsu)" },
  { level: 3, name: "#3 - Goshin (Protekcja)" },
  { level: 4, name: "#4 - Hainawa (Pełzająca lina)" },
  { level: 5, name: "#5 - Ke (Pas)" },
  { level: 6, name: "#6 - Reidou (Mumifikacja)" },
  { level: 7, name: "#7 - Kuuchuu Tenkuu (Powietrzna Bomba)" },
  { level: 8, name: "#8 - Seki (Odepchnięcie)" },
  { level: 9, name: "#9 - Geki (Uderzenie)" },
  { level: 10, name: "#10 - Kuchisaki (Pajęcze Usta)" },
  { level: 11, name: "#11 - Ishigaki (ściana kamienia)" },
  { level: 12, name: "#12 - Bunorihin Hebi (Oplątanie Węża)" },
  { level: 13, name: "#13 - Kashitsu (Zmiana Ruchu)" },
  { level: 14, name: "#14 - Tounyuu (Odrzut)" },
  { level: 15, name: "#15 - Haji (Wstrzymanie)" },
  { level: 16, name: "#16 - Hōrin (Rozpadający się krąg)" },
  { level: 17, name: "#17 - Sekienton (Czerwony dym ucieczki)" },
  { level: 18, name: "#18 - Mokuhon (Chwytające Pnącza)" },
  { level: 19, name: "#19 - Tsuerai (Absorbacja)" },
  { level: 20, name: "#20 - Akai Tate (Czerwona Blokada)" },
  { level: 21, name: "#21 - Hatashiai (Pojedynek Mistrza)" },
  { level: 22, name: "#22 - Nawa (Sznur Niewoli)" },
  { level: 23, name: "#23 - Nami (Fala)" },
  { level: 24, name: "#24 - Keigoku (Ogniste Więzienie)" },
  { level: 25, name: "#25 - Hea (Uścisk)" },
  { level: 26, name: "#26 - Nekutai Rensa (Wiążąca Łańcuchy)" },
  { level: 27, name: "#27 - Baikyuu Genshuku (Wzmożona Grawitacja)" },
  { level: 28, name: "#28 - Aigo Engo (Duch Mrozu)" },
  { level: 29, name: "#29 - Genkotsu (Łapka Cienia)" },
  { level: 30, name: "#30 - Shitotsusansen (Dziobiący potrójny rozbłysk)" },
  { level: 31, name: "#31 - Koori Hako (Szklana Klatka)" },
  { level: 32, name: "#32 - Shibireyubi (Paraliżujący palec)" },
  { level: 33, name: "#33 - Maisō shizen (Pogrzeb natury)" },
  { level: 34, name: "#34 - Koujoujisshuu (Więzienie Reiatsu)" },
  { level: 35, name: "#35 - Hatsukanezumi (Powłoka Ognia)" },
  { level: 36, name: "#36 - Su (Sieć)" },
  { level: 37, name: "#37 - Tsuriboshi (Wisząca gwiazda)" },
  { level: 38, name: "#38 - Keimusho Gaito (Kaftan Zacisku)" },
  { level: 39, name: "#39 - Enkosen (Okrągła tarcza)" },
  { level: 40, name: "#40 - Obasan (Dotyk)" },
  { level: 41, name: "#41 - Koori Tate (Lodowa Tarcza)" },
  { level: 42, name: "#42 - Kusariwana (Łańcuchowe sidła)" },
  { level: 43, name: "#43 - Hiwana (Ogniste sidła)" },
  { level: 44, name: "#44 - Jinpuuwana (Sidła wichru)" },
  { level: 45, name: "#45 - Kageshihai (Kontrola Cienia)" },
  { level: 46, name: "#46 - Goshin Tengoku (Niebiańska protekcja)" },
  { level: 47, name: "#47 - Ichidan (Wyzysk Ducha)" },
  { level: 48, name: "#48 - Genkaku (Iluzja)" },
  { level: 49, name: "#49 - Yami (Ciemność)" },
  { level: 50, name: "#50 - Yomi Numa (Bagna zaświatów)" },
  { level: 51, name: "#51 - Tamashii genkai (Więź dusz)" },
  { level: 52, name: "#52 - Hikaritate (Świetliste tarcze)" },
  { level: 53, name: "#53 - Kobushi Kyojin (Pięść olbrzyma)" },
  { level: 54, name: "#54 - Orishoumei (Klatka gromów)" },
  { level: 55, name: "#55 - Futago Kagami (Lustrzany bliźniak)" },
  { level: 56, name: "#56 - Orochi Hisen (wodospad wielkiego węża)" },
  { level: 57, name: "#57 - Seki Kyoukai (Odpychająca bariera)" },
  { level: 58, name: "#58 - Kakushitsuijaku (Przyzwanie tropiących wróbli)" },
  { level: 59, name: "#59 - Tamashīnokyōen (Uczta na duszach)" },
  { level: 60, name: "#60 - Sekimarui (Okrągła bariera)" },
  { level: 61, name: "#61 - Rikujou Kourou (Ograniczenie sześciu prętów światła)" },
  { level: 62, name: "#62 - Hyapporankan (Ogrodzenie stu kroków)" },
  { level: 63, name: "#63 - Sajo Sabaku (Zamknięcie niewolniczych łańcuchów)" },
  { level: 64, name: "#64 - Kagami de odoru (Tańcząc z lustrami)" },
  { level: 65, name: "#65 - Sekushi no Hikari (Światło ułudy)" },
  { level: 66, name: "#66 - Imoshinai Tengu (Niezauważony długo nosy goblin)" },
  { level: 67, name: "#67 - Ibara gaitou (Płaszcz cierni)" },
  { level: 68, name: "#68 - Goyōgai (Pięć Pomocnych Pokryw)" },
  { level: 69, name: "#69 - Tate Kagami (Lustrzana tarcza)" },
  { level: 70, name: "#70 - Haritsuke (Ukrzyżowanie)" },
  { level: 71, name: "#71 - Saiban no Ikatteiru-ō (Sąd gniewnego króla)" },
  { level: 72, name: "#72 - Nageku Dōjō-ji (Lament Dōjō-ji)" },
  { level: 73, name: "#73 - Touzanshou (Odwrócony kryształ górski)" },
  { level: 74, name: "#74 - Ame no naka de kanchi (Wyczuwanie w deszczu)" },
  { level: 75, name: "#75 - Gochuu tekkan (Kwintet żelaznych filarów)" },
  { level: 76, name: "#76 - Sakuru Fukashi Kyojaku (Kręgi niewidzialnej niemocy)" },
  { level: 77, name: "#77 - Tenteikuura (Niebiańskie riksze na jedwabistym powietrzu)" },
  { level: 78, name: "#78 - Tsutamatoi Nibuigiri (Powleczone Bluszczem Tępe Cięcie)" },
  { level: 79, name: "#79 - Kuyō Shibari (Więzy dziewięciu świtów)" },
  { level: 80, name: "#80 - Seimon (Wrota)" },
  { level: 81, name: "#81 - Danku (Rozszczepiająca próżnia)" },
  { level: 82, name: "#82 - Chōshi (Warunek)" },
  { level: 83, name: "#83 - Heikairoshin (Zamknięty krąg serca)" },
  { level: 84, name: "#84 - Shikai ni aru kokū (Pustka we wzroku)" },
  { level: 85, name: "#85-1 - Jorōgumo (Wiążąca panna młoda)" },
  { level: 85, name: "#85-2 - Jorōgumo Tetsu Fuhen (Wiecznie żelazna wiążąca panna młoda)" },
  { level: 86, name: "#86 - Gekihakyuu (Miażdżąca sfera)" },
  { level: 87, name: "#87 - Omoi hassha-tai (Ciężkie pociski)" },
  { level: 88, name: "#88 - Koori Kangoku (Lodowe Więzienie)" },
  { level: 89, name: "#89 - Tamatane (Kula triku magika)" },
  { level: 90, name: "#90 - Tetsu no Shojo (Żelazna Dziewica)" },
  { level: 91, name: "#91 - Shoukenitami (Więź bólu)" },
  { level: 92, name: "#92 - Tokkaneikou (Wojenny okrzyk chwały)" },
  { level: 93, name: "#93 - Fukushū no soryu (Lazurowy smok zemsty)" },
  { level: 94, name: "#94 - Hihanteki (Osąd)" },
  { level: 95, name: "#95 - Fūsatsu Kakei (Zabijająca pieczęć, ogień pokutny)" },
  { level: 96, name: "#96 - Yasakani no Magatama (Zakrzywiony klejnot)" },
  { level: 97, name: "#97 - Yata no Kagami (Ośmioboczne lustro)" },
  { level: 98, name: "#98 - Aojiroi Mangetsu (Pełnia bladego księżyca)" },
  { level: 98, name: "#98-1 - Muzan Mangetsu (Pełnia okrutnego księżyca)" },
  { level: 98, name: "#98-2 - Jishin Mangetsu (Pełnia miłosiernego księżyca)" },
  { level: 99, name: "#99-1 - Kin (Pieczęć)" },
  { level: 99, name: "#99-2 - Bankin (Wielka Pieczęć)" },
  { level: 100, name: "#100 - Ame-no-mihashira (Niebiański filar)" }
];

const QUINCY_SPELLS = [
  { circle: 1, name: "Glanz (Blask)", cost: "1+", requirements: "Kontrola: 10, Inteligencja: 7", description: "Przekształcenie reiatsu z rurki w prosty pocisk o zasięgu dwudziestu metrów." },
  { circle: 1, name: "Frühling (Sprężyna)", cost: "1+", requirements: "Kontrola: 10, Inteligencja: 7", description: "Tworzy wypukłe koło, które odbija ataki materialne i energetyczne." },
  { circle: 1, name: "Seijin Oshi", cost: "1", requirements: "Kontrola: 10, Inteligencja: 7", description: "Tworzy aurę odpychającą wszystko od siebie w promieniu 2m." },
  { circle: 1, name: "Sejin Shuuren", cost: "1+", requirements: "Kontrola: 10, Inteligencja: 7", description: "Tworzy eteryczne wiertła wwiercające się na głębokość metra." },
  { circle: 1, name: "Sourei Kamaidan", cost: "1+", requirements: "Kontrola: 10, Inteligencja: 7", description: "Przyzywa strzałę namierzającą cel, która może wielokrotnie przebijać wroga." },
  { circle: 1, name: "Wolke", cost: "1-6", requirements: "Kontrola: 10, Inteligencja: 7", description: "Wytwarza ładunek energii w kształcie chybotliwego promienia." },

  { circle: 2, name: "Feuertaufe (Chrzest bitwy)", cost: "1", requirements: "Kontrola: 20, Inteligencja: 10", description: "Wzmacnianie pobratymców poprzez zwiększenie odporności na ból i odwagę." },
  { circle: 2, name: "Heizen", cost: "1-4", requirements: "Kontrola: 20, Inteligencja: 10", description: "Wytwarza prostokątny pocisk mogący rozerwać lub zmiażdżyć przeciwnika." },
  { circle: 2, name: "Gritz", cost: "5", requirements: "Kontrola: 20, Inteligencja: 10", description: "Tworzy pentagonalne więzienie z krzyżem Quincy." },
  { circle: 2, name: "Nebel (Mgła)", cost: "1", requirements: "Kontrola: 20, Inteligencja: 10", description: "Wybuch rozsiewający iskrzący energią opar reagujący na reiatsu." },
  { circle: 2, name: "Seele Schneider: Seligmesser", cost: "1", requirements: "Kontrola: 20, Inteligencja: 10", description: "Wzmacnia Seele Schneidera, zmieniając kształt ostrza na ząbkowany." },

  { circle: 3, name: "Himmelswächter (Dostojny strażnik)", cost: "1+", requirements: "Kontrola: 35, Inteligencja: 15", description: "Tworzy lewitujące miecze z reiatsu czekające na sygnał do ataku." },
  { circle: 3, name: "Mammakachi", cost: "1+", requirements: "Kontrola: 35, Inteligencja: 15", description: "Oblepia przeciwnika reiatsu, blokując jego zmysły i pobieranie energii." },
  { circle: 3, name: "Mizushikari", cost: "1", requirements: "Kontrola: 35, Inteligencja: 15", description: "Rozpyla pole holograficzne rozmywające kontury osób wewnątrz." },
  { circle: 3, name: "Sejin Kabe", cost: "3+", requirements: "Kontrola: 35, Inteligencja: 15", description: "Tworzy nieprzeniknioną ścianę z energii o wymiarach 2x2m." },

  { circle: 4, name: "Echo Licht (Świetlne Echo)", cost: "1+", requirements: "Kontrola: 60, Inteligencja: 20", description: "Rozdziela strzałę na kilka słabszych, ale szybszych i rykoszetujących pocisków." },
  { circle: 4, name: "Heilige Sehen (Święta Wizja)", cost: "1", requirements: "Kontrola: 60, Inteligencja: 20", description: "Wysyła impulsy Reishi działające jak sonar wykrywający inne źródła energii." },
  { circle: 4, name: "Sankt Schwert (Święty miecz)", cost: "3+", requirements: "Kontrola: 60, Inteligencja: 20", description: "Tworzy dwumetrowy lewitujący miecz imitujący ruchy ręki użytkownika." },

  { circle: 5, name: "Glanzen Schwert (Błyszczący Miecz)", cost: "1-5", requirements: "Kontrola: 90, Inteligencja: 30", description: "Tworzy do pięciu mieczy orbitujących wokół użytkownika i chroniących go autonomicznie." },
  { circle: 5, name: "Kirchenlied: Sankt Zwinger", cost: "5", requirements: "Kontrola: 90, Inteligencja: 30", description: "Tworzy potężny mur z krzyżami quincy, raniący wrogów i blokujący ataki." },
  { circle: 5, name: "Sprenger", cost: "1", requirements: "Kontrola: 90, Inteligencja: 30", description: "Wykorzystuje 5 Seele Schneiderów do wywołania potężnej eksplozji wokół unieruchomionego wroga." }
];

const ATTRIBUTE_NAMES = [
  'Siła',
  'Szybkość',
  'Zręczność',
  'Wytrzymałość',
  'Inteligencja',
  'Psychika',
  'Reiatsu',
  'Kontrola Reiatsu'
];

const CLASS_SKILLS: Record<string, any[]> = {
  'Bounto': [
    { name: "Alchemia*", category: "Klasowe", isInnate: false, requirements: "Inteligencja 16", description: "Możliwość tworzenia mikstur o niezwykłych właściwościach." },
    { name: "Asklepios*", category: "Klasowe", isInnate: false, requirements: "Wytrzymałość 25, Kontrola 35, Taumaturgia", description: "Zdolność 'zrzucania skóry' - odtworzenie całego ciała w innym miejscu, lecząc wszystkie rany i efekty." },
    { name: "Blitzname*", category: "Klasowe", isInnate: false, requirements: "Szybkość 16, Inteligencja 12, Kontrola 20", description: "Błyskawiczne przemieszczenie (szybowanie) bez wydawania dźwięku, ale z utratą zmysłów na ułamek sekundy." },
    { name: "Brama Światów*", category: "Klasowe", isInnate: false, requirements: "Kontrola reiatsu 35", description: "Rytuał otwierający przejście między Światem Żywych a Soul Society." },
    { name: "Dominujący Głos*", category: "Klasowe", isInnate: false, requirements: "Psychika 8, Kontrola 10", description: "Wampiryczny głos pozwalający siać lęk, sugerować działania lub hipnotyzować słabsze umysły." },
    { name: "Forma Drapieżcy*", category: "Klasowe", isInnate: false, requirements: "Wybór ścieżki (Monstrum/Łowca)", description: "Fizyczna transformacja zwiększająca statystyki (+10%), ale blokująca leczenie." },
    { name: "Glif Strażniczy*", category: "Klasowe", isInnate: false, requirements: "Inteligencja 12, Kontrola 10", description: "Tworzenie wybuchowych pieczęci krwią, które bronią przedmiotów lub przejść." },
    { name: "Inteligentna Lalka", category: "Klasowe", isInnate: false, requirements: "Inteligencja 12", description: "Lalka posiada wysoką inteligencję, rozwiązuje zagadki i podpowiada taktyki." },
    { name: "Jako Cień Jestem*", category: "Klasowe", isInnate: false, requirements: "Zręczność 7", description: "Zdolność optycznego stapiania się z otoczeniem w bezruchu." },
    { name: "Kompatybilność z Lalką", category: "Klasowe", isInnate: false, requirements: "Kontrola 8, Psychika 11", description: "Możliwość swobodnej wymiany energii (PR) między Bounto a jego lalką." },
    { name: "Kontr-Imię*", category: "Klasowe", isInnate: false, requirements: "Inteligencja 35, Kontrola 30", description: "Zdolność negowania cudzych technik poprzez wypowiedzenie ich 'kontr-imienia'." },
    { name: "Lalka w dłoni", category: "Klasowe", isInnate: false, requirements: "Przyznaje MG", description: "Lalka nie jest osobnym bytem, lecz bronią (np. mieczem) o własnej jaźni." },
    { name: "Lustro Świata*", category: "Klasowe", isInnate: false, requirements: "Inteligencja 18, Reiatsu 12", description: "Podróżowanie między znanymi lustrami poprzez wymiar wewnątrz zwierciadeł." },
    { name: "Magnes", category: "Klasowe", isInnate: false, requirements: "Kontrola Reiatsu 18", description: "Emitowanie energii wabiącej dusze o niskiej psychice." },
    { name: "Miłość Lalki", category: "Klasowe", isInnate: true, requirements: "Psychika 11, wrodzone", description: "Lalka jest fanatycznie oddana właścicielowi, osłoni go własnym ciałem." },
    { name: "Pochłaniacz Reiatsu", category: "Klasowe", isInnate: false, requirements: "Kontrola 10, Kontrola > Reiatsu", description: "Wchłanianie energii z otoczenia dwa razy efektywniej niż inni." },
    { name: "Rozdzieranie Iluzji*", category: "Klasowe", isInnate: false, requirements: "Inteligencja 16", description: "Fizyczne rozdzieranie iluzji rzeczywistości." },
    { name: "Sztuczka (Fähigkeit)", category: "Klasowe", isInnate: false, requirements: "Kompatybilność, Psychika 20, Kontrola 18", description: "Korzystanie z ułamka mocy lalki bez jej przywoływania." },
    { name: "Świetny Pożeracz", category: "Klasowe", isInnate: true, requirements: "Kontrola 6, Psychika 12, wrodzone", description: "Dwukrotnie większe profity z pożerania dusz." },
    { name: "Taumaturgia*", category: "Klasowe", isInnate: false, requirements: "Kontrola Reiatsu 20", description: "Podstawowa manipulacja krwią (np. krwawe pociski)." },
    { name: "Ukrycie Lalki", category: "Klasowe", isInnate: false, requirements: "Kontrola Reiatsu 14", description: "Maskowanie lalki przed ludźmi poprzez oblekanie jej cząstkami duchowymi." },
    { name: "Wampiryczne Wzmocnienie*", category: "Klasowe", isInnate: false, requirements: "Wytrzymałość 20, Reiatsu 15, Forma Drapieżcy", description: "Magazynowanie energii w celu dwukrotnego wzmocnienia statystyki fizycznej." },
    { name: "Wypchnięcie Duszy", category: "Klasowe", isInnate: false, requirements: "Kontrola 30, Psychika 20", description: "Zdolność wyrzucania duszy z żywego ciała lub gigai." },
    { name: "Zuchwały uczeń", category: "Klasowe", isInnate: false, requirements: "Psychika 10, historia", description: "Posiadanie lalki na start, ale słabej i niemożliwej do zapieczętowania." }
  ],
  'Shinigami': [
    { name: "Arystokrata", category: "Klasowe", isInnate: false, requirements: "Pochodzenie z Seireitei", description: "Przynależność do rodu szlacheckiego (małego lub wielkiego), dająca wpływy i bogactwo." },
    { name: "Ban Kai", category: "Klasowe", isInnate: false, requirements: "Tylko w grze", description: "Ostateczne uwolnienie Zanpakutou." },
    { name: "Bliskość z Zanpakutou", category: "Klasowe", isInnate: false, requirements: "Psychika 12", description: "Głęboka więź z mieczem, ułatwiająca naukę Shikai i Bankai." },
    { name: "Cienkie Ostrze", category: "Klasowe", isInnate: false, requirements: "Kontrola Reiatsu 12", description: "Pokrycie miecza warstwami energii, czyniąc go ekstremalnie ostrym." },
    { name: "Forma Zwierzęca", category: "Klasowe", isInnate: true, requirements: "Psychika 13, wrodzone", description: "Zdolność przemiany w konkretne zwierzę." },
    { name: "Ikkotsu/Sōkotsu", category: "Klasowe", isInnate: false, requirements: "Wytrzymałość 30, Siła 30, Psychika 35", description: "Potężne uderzenie pięścią wykorzystujące czystą siłę witalną (x3 lub x6)." },
    { name: "Koinkantacja", category: "Klasowe", isInnate: false, requirements: "Znakomity Magik, Inteligencja 20", description: "Mieszanie inkantacji w celu użycia dwóch Kido jednocześnie." },
    { name: "Miecz i Pięść", category: "Klasowe", isInnate: false, requirements: "Szybkość 15, Zręczność 15, Inteligencja 10", description: "Styl łączący Hakudę i Zanjutsu, pozwalający na naprzemienne ataki." },
    { name: "Mistrz hakudy", category: "Klasowe", isInnate: false, requirements: "Walka wręcz, Kontrola > Reiatsu", description: "Łączenie walki wręcz z żywiołami (Ogień, Ziemia, Wiatr, Woda)." },
    { name: "Mutant", category: "Klasowe", isInnate: true, requirements: "Wrodzone", description: "Odmienny wygląd duszy dający specyficzne bonusy." },
    { name: "Otwieranie Bramy Senkai", category: "Klasowe", isInnate: false, requirements: "Kontrola 20, zanpakutou", description: "Zdolność otwierania przejścia do Świata Przejścia." },
    { name: "Przewodzenie reiatsu", category: "Klasowe", isInnate: false, requirements: "Kontrola 25, Inteligencja 20", description: "Korzystanie z energii przesyłanej przez towarzyszy do wzmacniania Kido." },
    { name: "Raiōken", category: "Klasowe", isInnate: false, requirements: "Szybkość 30, Siła 30, Wytrzymałość 40, Psychika 40", description: "Grad ciosów o niszczycielskiej sile, wywołujący fale uderzeniowe." },
    { name: "Ryōdan", category: "Klasowe", isInnate: false, requirements: "Wytrzymałość 30, Psychika 30, Siła 30, Biegłość Ekspert", description: "Potężne oburęczne cięcie mieczem (Siła x3)." },
    { name: "Seishin", category: "Klasowe", isInnate: false, requirements: "Psychika 40, Kontrola 30, Medytacja", description: "Stan doskonałej harmonii, zwiększający szansę na sukcesy krytyczne i odporność psychiczną." },
    { name: "Shikai", category: "Klasowe", isInnate: false, requirements: "Tylko w grze", description: "Pierwsze uwolnienie Zanpakutou." },
    { name: "Shunkō (Błysk wojny)", category: "Klasowe", isInnate: false, requirements: "Kontrola 40, Reiatsu 30, Wytrzymałość 20", description: "Doprowadzenie reiatsu do szału, podwajające szybkość i wzmacniające ataki wręcz." },
    { name: "Shunpo", category: "Klasowe", isInnate: false, requirements: "Kontrola 20, Szybkość 20", description: "Elitarna technika szybkiego kroku Shinigami." },
    { name: "Specjalista", category: "Klasowe", isInnate: false, requirements: "Inteligencja 15", description: "Wyszkolenie w walce z konkretnym typem Hollowów." },
    { name: "Technik", category: "Klasowe", isInnate: false, requirements: "Inteligencja 12", description: "Znajomość technologii Soul Society, tworzenie przyrządów i eksperymenty." },
    { name: "Tsuin Shunpou", category: "Klasowe", isInnate: false, requirements: "Kontrola 35, Szybkość 55", description: "Bliźniacze Shunpo, tworzące iluzję bycia w kilku miejscach naraz." },
    { name: "Ulubione kidou", category: "Klasowe", isInnate: false, requirements: "Inteligencja 10, Kontrola 12", description: "Jedno wybrane Kido jest znacznie silniejsze i szybsze w Twoim wykonaniu." },
    { name: "Utsusemi", category: "Klasowe", isInnate: false, requirements: "Shunpo, Szybkość 40", description: "Pozostawianie po sobie rozmywającego się 'śladu' podczas Shunpo." },
    { name: "Wyjątkowe Asauchi", category: "Klasowe", isInnate: true, requirements: "Wrodzone", description: "Zanpakutou w formie innej niż katana (np. Tanto, Yari)." },
    { name: "Wzmocnienie kido", category: "Klasowe", isInnate: false, requirements: "Kontrola 40, Inteligencja 30", description: "Wzmacnianie inkantacją zaklęć rzuconych w wersji 'szybkiej'." },
    { name: "Yuubu", category: "Klasowe", isInnate: false, requirements: "Psychika 40, Kontrola 30, Reiatsu 20", description: "Utwardzanie ciała poprzez manipulację energią wewnątrz, redukujące obrażenia." },
    { name: "Znakomity Magik", category: "Klasowe", isInnate: false, requirements: "Inteligencja 14, Kontrola 8", description: "Szybsze opanowywanie i lepsze efekty rzucania Kido." },
    { name: "Zrozumienie miecza", category: "Klasowe", isInnate: false, requirements: "Psychika 10", description: "Zestrajanie duszy z przeciwnikiem podczas walki, pozwalające pojąć jego zamiary." }
  ],
  'Dusza': [
    { name: "Artefakt", category: "Klasowe", isInnate: false, requirements: "Opis w KP", description: "Posiadanie przedmiotu mocy (np. amuletu, rękawic) o nadnaturalnych właściwościach." },
    { name: "Arystokrata", category: "Klasowe", isInnate: false, requirements: "Pochodzenie z Seireitei", description: "Przynależność do rodu szlacheckiego, dająca wpływy i bogactwo." },
    { name: "Boskie nasienie", category: "Klasowe", isInnate: true, requirements: "Psychika 10, Kontrola 10, wrodzone", description: "Wyjątkowy potencjał pozwalający opanować niektóre boskie umiejętności Kami." },
    { name: "Mentor", category: "Klasowe", isInnate: false, requirements: "Opis w historii", description: "Posiadanie nauczyciela, który uczy unikalnych technik (nawet tych dla Shinigami)." },
    { name: "Mutant", category: "Klasowe", isInnate: true, requirements: "Wrodzone", description: "Odmienny wygląd duszy dający specyficzne bonusy fizyczne." },
    { name: "Nieapetyczny", category: "Klasowe", isInnate: true, requirements: "Wrodzone", description: "Twoja energia jest nieatrakcyjna dla Hollowów, rzadziej stajesz się ich celem." },
    { name: "Onmyōdō", category: "Klasowe", isInnate: false, requirements: "Sztukmistrz, lata nauk", description: "Pradawna magia talizmanów i rytuałów oparta na pięciu żywiołach." },
    { name: "Onmyōdō: Duch Stali", category: "Klasowe", isInnate: false, requirements: "Walka wręcz, Onmyōdō", description: "Zdolność blokowania mieczy gołymi rękami dzięki zrozumieniu żywiołu metalu." },
    { name: "Onmyōdō: Zrozumienie Żywiołów", category: "Klasowe", isInnate: false, requirements: "Inteligencja 18, Psychika 14, Onmyōdō", description: "Odporność na zjawiska naturalne i ataki oparte na żywiołach." },
    { name: "Onmyōdō: Żywe Trawy", category: "Klasowe", isInnate: false, requirements: "Reiatsu 12, Onmyōdō", description: "Ożywianie roślinności (liści, traw), by służyły jako tnące ostrza lub tarcze." },
    { name: "Opętanie", category: "Klasowe", isInnate: false, requirements: "Kontrola 20, Psychika 20", description: "Przenoszenie świadomości do ciała zwierzęcia, by korzystać z jego zmysłów." },
    { name: "Półmaterialny", category: "Klasowe", isInnate: true, requirements: "Wrodzone", description: "Zdolność posilania się materialnym jedzeniem ze świata żywych." },
    { name: "Roślinka", category: "Klasowe", isInnate: true, requirements: "Wrodzone", description: "Brak potrzeby odżywiania się, wystarcza sama woda (w dużej ilości)." },
    { name: "Starszy wioski", category: "Klasowe", isInnate: false, requirements: "Inteligencja 7, Psychika 7", description: "Bycie liderem osady w Rukongai, dające posłuch i wsparcie mieszkańców." },
    { name: "Szanowana rodzina", category: "Klasowe", isInnate: false, requirements: "Pochodzenie z Rukongai", description: "Przynależność do wpływowej rodziny w okręgu, dająca ułatwienia fabularne." },
    { name: "Utalentowany jeździec", category: "Klasowe", isInnate: false, requirements: "Zręczność 10", description: "Biegłość w jeździe na wierzchowcach i walce z ich grzbietu." },
    { name: "Utalentowany Rzemieślnik", category: "Klasowe", isInnate: false, requirements: "Inteligencja 13", description: "Wyjątkowy talent do rzemiosła (stolarstwo, płatnerstwo), tworzenie lepszych wyrobów." },
    { name: "Widzący", category: "Klasowe", isInnate: true, requirements: "Wrodzone", description: "Zdolność dostrzegania Kami i Yokai bez specjalnych rytuałów." },
    { name: "Wiedza z życia", category: "Klasowe", isInnate: true, requirements: "Psychika 7, wrodzone", description: "Zachowanie fragmentów wiedzy i wspomnień z poprzedniego życia na Ziemi." },
    { name: "Wrodzony dar", category: "Klasowe", isInnate: true, requirements: "Kontrola 7+, wrodzone", description: "Jedna z Twoich unikalnych mocy jest znacznie silniejsza na starcie." },
    { name: "Yuubu", category: "Klasowe", isInnate: false, requirements: "Psychika 50, Kontrola 20, Reiatsu 20", description: "Utwardzanie ciała siłą woli, pozwalające na redukcję obrażeń i mocniejsze ciosy." },
    { name: "Zwierzak", category: "Klasowe", isInnate: true, requirements: "Psychika 13, wrodzone", description: "Intuicyjna zdolność przybrania formy zwierzęcia z zachowaniem intelektu." }
  ],
  'Quincy': [
    { name: "Blut", category: "Klasowe", isInnate: false, requirements: "Kontrola 40, Reiatsu 25", description: "Wzmacnianie krwi: Vene (obrona) lub Arterie (atak). Drastycznie zwiększa przeżywalność lub moc." },
    { name: "Czysta krew", category: "Klasowe", isInnate: false, requirements: "Historia rodu", description: "Pochodzenie z czystej linii Quincy, dające prestiż i dodatkowe fundusze." },
    { name: "Hirenkyaku", category: "Klasowe", isInnate: false, requirements: "Szybkość 15, Kontrola 25", description: "Technika szybkiego przemieszczania się na cząsteczkach duchowych." },
    { name: "Kreacjonista", category: "Klasowe", isInnate: false, requirements: "Kontrola 36", description: "Tworzenie broni i przedmiotów o dowolnym kształcie z czystego Reishi." },
    { name: "Kumulator", category: "Klasowe", isInnate: true, requirements: "Kontrola 14, wrodzone", description: "Dwukrotnie szybsze i efektywniejsze pobieranie energii z otoczenia." },
    { name: "Świetlista Zbroja", category: "Klasowe", isInnate: false, requirements: "Kontrola 29, Reiatsu 12", description: "Powłoka z Reishi drastycznie zwiększająca obronę (do 75%)." },
    { name: "Licht Regen", category: "Klasowe", isInnate: false, requirements: "Reiatsu 25, Kontrola 30", description: "Deszcz strzał - wystrzeliwanie setek pocisków w sekundę." },
    { name: "Migawka (Verschluss)", category: "Klasowe", isInnate: false, requirements: "Hirenkyaku, Szybkość 25, Zręczność 30", description: "Zostawianie powidoku z pułapką (rurki/Zelle Schneider) podczas uniku." },
    { name: "Wielokrotny Strzelec", category: "Klasowe", isInnate: false, requirements: "Kontrola 20, Zręczność 10", description: "Zdolność wystrzeliwania do 3 strzał jednocześnie." },
    { name: "Ransotengai", category: "Klasowe", isInnate: false, requirements: "Kontrola 25", description: "Poruszanie ciałem za pomocą nitek energii, pozwalające walczyć mimo paraliżu lub ran." },
    { name: "Rurkarz", category: "Klasowe", isInnate: true, requirements: "Wrodzone", description: "Talent do używania srebrnych rurek (Ginto), szybsze i silniejsze zaklęcia." },
    { name: "Sklaverei", category: "Klasowe", isInnate: false, requirements: "Kontrola 50, Reiatsu 30", description: "Pochłanianie żywej energii przeciwnika, pozwalające przejąć jego techniki (bardzo ryzykowne)." },
    { name: "Specjalista", category: "Klasowe", isInnate: false, requirements: "Inteligencja 15", description: "Wyszkolenie w walce z konkretnym typem Hollowów." },
    { name: "Spostrzegawczość Quincy", category: "Klasowe", isInnate: false, requirements: "Inteligencja 12", description: "Szybsze znajdowanie słabych punktów przeciwnika podczas walki." },
    { name: "Still", category: "Klasowe", isInnate: false, requirements: "Psychika 20+", description: "Rzucanie zaklęć z pominięciem inkantacji dzięki dyscyplinie umysłu." },
    { name: "Transfer Reiatsu", category: "Klasowe", isInnate: false, requirements: "Kontrola 18", description: "Dzielenie się energią z sojusznikami lub pobieranie jej od nich." },
    { name: "Wyssanie Reiatsu", category: "Klasowe", isInnate: false, requirements: "Kontrola 28", description: "Zdolność wysysania energii bezpośrednio z przeciwnika." },
    { name: "Wytwórca rurek", category: "Klasowe", isInnate: false, requirements: "Kontrola 30", description: "Samodzielne wytwarzanie rurek Ginto poprzez koncentrację energii." },
    { name: "Zauberer", category: "Klasowe", isInnate: false, requirements: "Kontrola 40, Reiatsu 35", description: "Mistrzostwo magii pozwalające rzucać zaklęcia bez użycia rurek." }
  ],
  'Hollow': [
    { name: "Asceta", category: "Klasowe", isInnate: true, requirements: "Psychika 8, wrodzone", description: "Zdolność dłuższego wytrzymania bez pożerania dusz (2x dłużej)." },
    { name: "Dominator", category: "Klasowe", isInnate: true, requirements: "Inteligencja 8, Psychika 5, wrodzone", description: "Charyzma ułatwiająca ewolucję w Adjuchasa i Vasto Lorde." },
    { name: "Cero", category: "Klasowe", isInnate: false, requirements: "Kontrola 15, Reiatsu 15", description: "Niszczycielski promień skoncentrowanej energii." },
    { name: "Jadowity dotyk", category: "Klasowe", isInnate: false, requirements: "Kontrola 10", description: "Obleczenie kończyn toksyczną energią, która parzy i osłabia wrogów." },
    { name: "Mocna Kość", category: "Klasowe", isInnate: true, requirements: "Wytrzymałość 11, wrodzone", description: "Niezwykle twarde kości i skóra, redukujące otrzymywane obrażenia." },
    { name: "Mózg", category: "Klasowe", isInnate: true, requirements: "Inteligencja 10, wrodzone", description: "Wysoki intelekt pozwalający na taktyczną walkę i szybszą naukę." },
    { name: "Przejście do społeczności dusz", category: "Klasowe", isInnate: false, requirements: "Kontrola 10, Psychika 10", description: "Otwieranie Garganty prowadzącej bezpośrednio do Soul Society." },
    { name: "Przerażający", category: "Klasowe", isInnate: false, requirements: "Reiatsu 20, Psychika 20", description: "Aura siejąca grozę, osłabiająca statystyki pobliskich wrogów." },
    { name: "Podstępna aura", category: "Klasowe", isInnate: true, requirements: "Wrodzone", description: "Twoje Reiatsu jest trudne do zidentyfikowania jako należące do Hollowa." },
    { name: "Oddzielenie duszy", category: "Klasowe", isInnate: false, requirements: "Kontrola 15", description: "Wydzieranie dusz żywych ludzi z ich ciał w celu pożarcia." },
    { name: "Skupiony", category: "Klasowe", isInnate: false, requirements: "Reiatsu 8, Kontrola 6", description: "Posiadanie jednej, ale znacznie potężniejszej zdolności osobistej." },
    { name: "Sprawny Pożeracz", category: "Klasowe", isInnate: true, requirements: "Psychika 6, wrodzone", description: "Dwukrotnie większe bonusy z pożerania innych istot." },
    { name: "Sonído", category: "Klasowe", isInnate: false, requirements: "Szybkość 25, Kontrola 15, Inteligencja 16, Psychika 14", description: "Instynktowna technika szybkiego ruchu, niemal niewykrywalna dla radarów." },
    { name: "Szybka Regeneracja", category: "Klasowe", isInnate: false, requirements: "Reiatsu 13, Kontrola 7", description: "Zdolność leczenia ran i odrastania kończyn kosztem energii." },
    { name: "Twarda maska", category: "Klasowe", isInnate: true, requirements: "Wytrzymałość 9, wrodzone", description: "Maska odporna na uszkodzenia, redukująca obrażenia w słaby punkt." },
    { name: "Ulubiona Ofiara", category: "Klasowe", isInnate: true, requirements: "Historia postaci", description: "Trzykrotnie większe korzyści z pożerania konkretnego typu dusz." },
    { name: "Umiejętny", category: "Klasowe", isInnate: true, requirements: "Inteligencja 7, wrodzone", description: "Posiadanie większej liczby uniwersalnych zdolności na start." }
  ],
  'Kami': [
    { name: "Amanoukihashi", category: "Klasowe", isInnate: false, requirements: "Reiatsu 20, Kontrola 30", description: "Niebiański most pozwalający podróżować między światami." },
    { name: "Boska ochrona", category: "Klasowe", isInnate: false, requirements: "Punkty z wiary", description: "Redukcja obrażeń zależna od siły wiary wyznawców." },
    { name: "Boska odnowa", category: "Klasowe", isInnate: false, requirements: "Reiatsu z wiary 15", description: "Podwojona regeneracja PŻ i PR dzięki modłom wiernych." },
    { name: "Boska proteza", category: "Klasowe", isInnate: false, requirements: "Kontrola 20", description: "Odbudowa utraconych części ciała z Reishi Takamagahary." },
    { name: "Boski majestat", category: "Klasowe", isInnate: false, requirements: "Reiatsu 40, Kontrola 30, Psychika 30", description: "Wpływanie na otoczenie, pogodę i emocje śmiertelników samą obecnością." },
    { name: "Boski Podział", category: "Klasowe", isInnate: false, requirements: "Reiatsu 60, Kontrola 50", description: "Tworzenie artefaktów lub nowych bytów z fragmentów własnego ciała." },
    { name: "Byt Chaosu", category: "Klasowe", isInnate: false, requirements: "Próba chaosu, Statystyki 70+", description: "Osiągnięcie najwyższej formy (Zenkei) bez potrzeby posiadania wyznawców." },
    { name: "Dar magii", category: "Klasowe", isInnate: false, requirements: "Reiatsu 10, Kontrola 15", description: "Obdarzanie wyznawców mocą rzucania konkretnych zaklęć." },
    { name: "Druga forma", category: "Klasowe", isInnate: false, requirements: "Kontrola 12", description: "Zdolność posiadania dwóch różnych form początkowych." },
    { name: "Domena", category: "Klasowe", isInnate: false, requirements: "Kontrola 30, Reiatsu 25, Psychika 20", description: "Własny kąt w Takamagaharze, dający bonusy do regeneracji." },
    { name: "Forma awatara", category: "Klasowe", isInnate: false, requirements: "Kontrola > Wiara", description: "Przybranie formy człowieka lub duszy, by szpiegować bez zwracania uwagi." },
    { name: "Forma pierwotna", category: "Klasowe", isInnate: false, requirements: "Reiatsu 20, Kontrola 20", description: "Zamiana w czystą energię żywiołu lub konceptu, unikając obrażeń fizycznych." },
    { name: "Mistyczna aura", category: "Klasowe", isInnate: false, requirements: "Kontrola 10", description: "Twoje Reiatsu jest niewykrywalne, objawia się jako zapach lub dźwięk." },
    { name: "Opętanie", category: "Klasowe", isInnate: false, requirements: "Kontrola 22", description: "Wniknięcie w duszę śmiertelnika, by obserwować świat lub przejąć kontrolę." },
    { name: "Ostrze wiary", category: "Klasowe", isInnate: false, requirements: "Reiatsu z wiary 1", description: "Modły wojowniczych wyznawców zwiększają siłę Twoich ataków." },
    { name: "Przekierowanie wiary", category: "Klasowe", isInnate: false, requirements: "Kontrola 8, Psychika 8", description: "Rozwijanie innych atrybutów zamiast Reiatsu dzięki wierze." },
    { name: "Przeniknięcie", category: "Klasowe", isInnate: false, requirements: "Kontrola 12", description: "Zdolność bezpośredniego przenikania do Takamagahary." },
    { name: "Sensen", category: "Klasowe", isInnate: false, requirements: "Kontrola 25, Psychika 20", description: "Boska teleportacja w zasięgu wzroku lub do znanych miejsc." },
    { name: "Shinkō no mado", category: "Klasowe", isInnate: false, requirements: "Kontrola 12, Psychika 10", description: "Obserwowanie wiernych i rzucanie błogosławieństw na odległość." },
    { name: "Symbioza", category: "Klasowe", isInnate: false, requirements: "Kontrola 34, Opętanie", description: "Dzielenie się mocą i wiedzą z opętanym nosicielem." },
    { name: "Tenbatsu", category: "Klasowe", isInnate: false, requirements: "Reiatsu 15, Psychika 15", description: "Sprowadzanie boskiego gniewu na cel poprzez ataki otoczenia." },
    { name: "Tworzenie życia", category: "Klasowe", isInnate: false, requirements: "40 pkt wiary", description: "Tworzenie nowych form życia związanych z Twoim istnieniem." },
    { name: "Wybraniec", category: "Klasowe", isInnate: false, requirements: "Psychika 11, Wyznawca", description: "Unikalna więź z jednym śmiertelnikiem, dająca mu nadnaturalne przywileje." },
    { name: "Wyznawca", category: "Klasowe", isInnate: false, requirements: "Opis w KP", description: "Posiadanie fanatycznie oddanego czciciela (NPC)." },
    { name: "Zaklinanie", category: "Klasowe", isInnate: false, requirements: "Kontrola 15, Reiatsu 12", description: "Nadawanie przedmiotom nadnaturalnych właściwości." },
    { name: "Zenkei", category: "Klasowe", isInnate: false, requirements: "Reiatsu z wiary 50", description: "Ostateczna, majestatyczna forma bóstwa o potężnych efektach." }
  ],
  'Fullbringer': [
    { name: "Duchowy Powidok", category: "Klasowe", isInnate: false, requirements: "Psychika 9", description: "Wyczuwanie natury przedmiotów i osób, nawet przy maskowaniu energii." },
    { name: "Boski Powidok", category: "Klasowe", isInnate: true, requirements: "Duchowy Powidok, wrodzone", description: "Zdolność dostrzegania Kami i Yokai każdym zmysłem." },
    { name: "Medium", category: "Klasowe", isInnate: false, requirements: "Psychika 18", description: "Wprowadzanie się w trans i wpuszczanie boskich istot do ciała." },
    { name: "Wyczuwanie Portali", category: "Klasowe", isInnate: false, requirements: "Kontrola 12", description: "Wykrywanie otwierających się przejść międzywymiarowych na odległość." },
    { name: "FullKnow", category: "Klasowe", isInnate: true, requirements: "Psychika 13, wrodzone", description: "Głębokie rozumienie natury materii, z którą się stykasz." },
    { name: "Soul Dive", category: "Klasowe", isInnate: false, requirements: "Psychika 16, Reiatsu 10", description: "Podróż do wnętrza cudzej duszy w celu walki, treningu lub poznania." },
    { name: "Fullbring Art I: Favor", category: "Klasowe", isInnate: false, requirements: "Kontrola 10, Inteligencja 8", description: "Podstawowa manipulacja materią nieożywioną poprzez dotyk." },
    { name: "Fullbring Art II: Order", category: "Klasowe", isInnate: false, requirements: "Kontrola 20, Inteligencja 16", description: "Średnia manipulacja materią (np. zamrażanie wody, odchylanie płomieni) na dystans." },
    { name: "Fullbring Art III: Command", category: "Klasowe", isInnate: false, requirements: "Kontrola 40, Inteligencja 24", description: "Zaawansowana manipulacja materią, wyciąganie z niej pełnego potencjału." },
    { name: "Fullbring Atristry", category: "Klasowe", isInnate: true, requirements: "Inteligencja 14, wrodzone", description: "Większy zasięg i efektywność wszystkich technik manipulacji materią." },
    { name: "Bringer Light", category: "Klasowe", isInnate: false, requirements: "Szybkość 20, Kontrola 25", description: "Technika szybkiego ruchu oparta na 'wybijaniu się' z dusz powierzchni." },
    { name: "Armor of All Creation", category: "Klasowe", isInnate: false, requirements: "Psychika 35, Kontrola 30", description: "Wirująca zbroja z materii otoczenia, chroniąca przed atakami." },
    { name: "FullPassing", category: "Klasowe", isInnate: false, requirements: "Kontrola 20", description: "Wtapianie się w materię nieożywioną, pozwalające na przenikanie przez nią." },
    { name: "Universal Harmony", category: "Klasowe", isInnate: false, requirements: "Psychika 12, Kontrola 12", description: "Pobieranie energii (PR) z dusz tła (roślin, kamieni) w celu regeneracji." },
    { name: "Soul Melody", category: "Klasowe", isInnate: false, requirements: "Inteligencja 10", description: "Postrzeganie rytmów i melodii, ułatwiające diagnozę lub walkę." },
    { name: "Soul Resonance", category: "Klasowe", isInnate: false, requirements: "Psychika 14, Kontrola 18", description: "Dostrajanie się do pulsu duszy innej osoby i przekazywanie jej energii." },
    { name: "OverSoul", category: "Klasowe", isInnate: false, requirements: "Reiatsu 20, Kontrola 13", description: "Samoleczenie poprzez przywracanie właściwego rytmu własnemu ciału." },
    { name: "OverSoul Resonance", category: "Klasowe", isInnate: false, requirements: "Kontrola 30", description: "Leczenie innych osób poprzez dostosowanie się do rytmu ich ciała." }
  ]
};

const DISADVANTAGES: Record<string, { name: string, points: number, description: string, requirements?: string, category: string }[]> = {
  'Ogólne': [
    { name: "Achromatopsja", points: 1, category: "Ogólne", description: "Brak postrzegania barw, tylko czerń i biel.", requirements: "Wrodzone" },
    { name: "Ageuzja", points: 1, category: "Ogólne", description: "Brak zmysłu smaku. Trudniej wykryć truciznę w jedzeniu." },
    { name: "Agnozja", points: 2, category: "Ogólne", description: "Niezdolność do rozróżniania bodźców (np. przedmiotów).", requirements: "Zgoda MG" },
    { name: "Alergik", points: 1, category: "Ogólne", description: "Uczulenie na pyłki, sierść itp. Utrudnienia w kontakcie z patogenem." },
    { name: "Anosmia", points: 1, category: "Ogólne", description: "Brak węchu. Nie wyczujesz gazu ani zepsutego jedzenia." },
    { name: "Apetyczny", points: 1, category: "Ogólne", description: "Przyciągasz Hollowy i Bounto jak magnes.", requirements: "Wrodzone" },
    { name: "Aura emocji", points: 1, category: "Ogólne", description: "Każdy widzi Twoje emocje. Za 2 pkt widać też kłamstwa." },
    { name: "Bezduchowiec", points: 2, category: "Ogólne", description: "Słabsze Reiatsu. Zmienia wzór PR: (0.5R + 0.25KR)^2.", requirements: "Wrodzone" },
    { name: "Biedak", points: 1, category: "Ogólne", description: "Zawsze tracisz połowę zarobków. Startujesz z 10 ryo." },
    { name: "Bipolarny", points: 1, category: "Ogólne", description: "Wahania nastroju od manii do depresji.", requirements: "Wrodzone" },
    { name: "Brak Kończyny", points: 2, category: "Ogólne", description: "Utrata ręki lub nogi. Poważne utrudnienia fizyczne.", requirements: "Opis w historii" },
    { name: "Brak Wyczucia", points: 1, category: "Ogólne", description: "Upośledzone wykrywanie Reiatsu (Kontrola -50%).", requirements: "Wrodzone" },
    { name: "Brzydal", points: 1, category: "Ogólne", description: "Zniekształcona twarz lub blizny. Utrudnienia społeczne." },
    { name: "Chaotyczny", points: 2, category: "Ogólne", description: "Brak dyscypliny. Trudniej rozwijać Kontrolę Reiatsu.", requirements: "Odpowiedni charakter" },
    { name: "Choroba czarnej duszy", points: 1, category: "Ogólne", description: "Ataki paraliżującego bólu i drgawek.", requirements: "Opis w historii" },
    { name: "Chorowity", points: 2, category: "Ogólne", description: "Słaba odporność, częste przeziębienia i omdlenia." },
    { name: "Chuchro", points: 1, category: "Ogólne", description: "Bardzo niska waga, brak siły i szybkie męczenie się.", requirements: "Wrodzone" },
    { name: "Deformacja", points: 1, category: "Ogólne", description: "Wada genetyczna utrudniająca życie (np. brak stawu).", requirements: "Wrodzone" },
    { name: "Duchowa niewydolność", points: 1, category: "Ogólne", description: "Reiryoku odnawia się 2x wolniej.", requirements: "Wrodzone" },
    { name: "Fibromialgia duchowa", points: 1, category: "Ogólne", description: "Ból przy korzystaniu z reiatsu, rosnący wraz z jego zużyciem." },
    { name: "Fobia", points: 1, category: "Ogólne", description: "Irracjonalny strach przed czymś (np. pająki, krew).", requirements: "Opis w historii" },
    { name: "Głuchy", points: 2, category: "Ogólne", description: "Całkowity brak słuchu. Trudności w komunikacji i Kido." },
    { name: "Jednooki", points: 1, category: "Ogólne", description: "Brak widzenia przestrzennego i problemy z dystansem." },
    { name: "Kiepska Pamięć", points: 1, category: "Ogólne", description: "Wolniejsze przyswajanie nowej wiedzy.", requirements: "Wrodzone" },
    { name: "Krótki lont", points: 1, category: "Ogólne", description: "Łatwo Cię zdenerwować. Działasz nieprzewidywalnie.", requirements: "Wrodzone" },
    { name: "Kulawy", points: 1, category: "Ogólne", description: "Problem z nogą. Brak możliwości szybkiego biegu.", requirements: "Opis w historii" },
    { name: "Mały", points: 1, category: "Ogólne", description: "Bardzo niski wzrost. Mniej PŻ (Wytrzymałość * 7.5).", requirements: "Odpowiedni wzrost" },
    { name: "Miękkie Reiatsu", points: 1, category: "Ogólne", description: "Słabsza ochrona przed atakami duchowymi.", requirements: "Wrodzone" },
    { name: "Mizofonia", points: 1, category: "Ogólne", description: "Nadwrażliwość na dźwięki, wywołująca złość lub strach." },
    { name: "Nadajnik duchowy", points: 2, category: "Ogólne", description: "Świecisz jak latarnia dla istot duchowych. Brak maskowania.", requirements: "Wrodzone" },
    { name: "Narkolepsja", points: 1, category: "Ogólne", description: "Zasypianie w nudnych momentach.", requirements: "Wrodzone" },
    { name: "Niemy", points: 2, category: "Ogólne", description: "Brak możliwości mówienia.", requirements: "Opis w historii" },
    { name: "Niepopularny", points: 1, category: "Ogólne", description: "Zła opinia w środowisku. Ludzie patrzą krzywo.", requirements: "Opis w historii" },
    { name: "Nieprecyzyjny", points: 1, category: "Ogólne", description: "Problemy z celowaniem na dystans (Kido, Cero, łuki)." },
    { name: "Nietolerancja", points: 1, category: "Ogólne", description: "Wrażliwość na temperaturę, ciśnienie itp.", requirements: "Wrodzone" },
    { name: "Nieudacznik", points: 1, category: "Ogólne", description: "Trudności w osiąganiu spektakularnych sukcesów." },
    { name: "Niezgrabny", points: 1, category: "Ogólne", description: "Brak gracji, trudniej rozwijać Zręczność." },
    { name: "Obsesja", points: 1, category: "Ogólne", description: "Opętanie na punkcie sprawy, osoby lub fetyszu." },
    { name: "Otyłość", points: 1, category: "Ogólne", description: "Nadwaga utrudniająca ruch. Szybsze męczenie się.", requirements: "Opis wyglądu" },
    { name: "Pechowiec", points: 1, category: "Ogólne", description: "Zawsze masz pecha w losowych sytuacjach.", requirements: "Wrodzone" },
    { name: "Podatność na stres", points: 1, category: "Ogólne", description: "Kiepskie radzenie sobie w sytuacjach stresowych." },
    { name: "Poszukiwany", points: 1, category: "Ogólne", description: "Ścigany przez lokalne władze za przestępstwa." },
    { name: "Półgłówek", points: 1, category: "Ogólne", description: "Niska inteligencja, bardzo wolna nauka." },
    { name: "Prokrastynacja", points: 1, category: "Ogólne", description: "Ociąganie się z zadaniami, trudność z terminami." },
    { name: "Słaba Wola", points: 1, category: "Ogólne", description: "Problemy z asertywnością i podejmowaniem decyzji." },
    { name: "Słabeusz", points: 1, category: "Ogólne", description: "Brak krzepy fizycznej, trudniej rozwijać Siłę." },
    { name: "Słaby Słuch", points: 1, category: "Ogólne", description: "Problemy z usłyszeniem cichych dźwięków." },
    { name: "Słaby Wzrok", points: 1, category: "Ogólne", description: "Konieczność noszenia okularów/soczewek." },
    { name: "Stara Rana", points: 1, category: "Ogólne", description: "Pamiątka po urazie, która odzywa się bólem.", requirements: "Opis w historii" },
    { name: "Ślepy", points: 2, category: "Ogólne", description: "Całkowity brak wzroku. Poważne utrudnienia w walce." },
    { name: "Śmierdziel", points: 1, category: "Ogólne", description: "Obfite pocenie się o intensywnym zapachu.", requirements: "Wrodzone" },
    { name: "Światłoczuły", points: 1, category: "Ogólne", description: "Słońce razi Cię mocniej, powodując bóle głowy.", requirements: "Wrodzone" },
    { name: "Twardy sen", points: 1, category: "Ogólne", description: "Trudno Cię obudzić, potrzebujesz min. 10h snu.", requirements: "Wrodzone" },
    { name: "Uzależnienie", points: 1, category: "Ogólne", description: "Silna potrzeba zażywania substancji lub czynności." },
    { name: "Wada Wymowy", points: 1, category: "Ogólne", description: "Jąkanie się lub seplenienie. Trudniej używać Kido.", requirements: "Wrodzone" },
    { name: "Wielki Żarłok", points: 1, category: "Ogólne", description: "Potrzebujesz 5x więcej jedzenia. Koszt: -400 Ryo." },
    { name: "Wrażliwość na trucizny", points: 1, category: "Ogólne", description: "Słaba tolerancja na trucizny i alkohol." },
    { name: "Wredny przełożony", points: 1, category: "Ogólne", description: "Oficer, który wyraźnie się na Ciebie uwziął." }
  ],
  'Bounto': [
    { name: "Defekt", points: 1, category: "Bounto", description: "Choroba psychiczna lub upośledzona budowa lalki." },
    { name: "Dominująca lalka", points: 1, category: "Bounto", description: "Lalka działa na własną rękę, nie zawsze słuchając właściciela." },
    { name: "Energożerna lalka", points: 1, category: "Bounto", description: "Uwolniona forma lalki stale pobiera PR od właściciela." },
    { name: "Kruchy katalizator", points: 1, category: "Bounto", description: "Zniszczenie przedmiotu lalki skutkuje Twoją śmiercią." },
    { name: "Mięsożerca", points: 1, category: "Bounto", description: "Musisz dosłownie spożywać dusze, co budzi obrzydzenie." },
    { name: "Nienawiść lalki", points: 1, category: "Bounto", description: "Lalka gardzi Tobą i może próbować Cię zabić." },
    { name: "Palące słońce", points: 2, category: "Bounto", description: "Słońce rani Twoje ciało, prowadząc do spalenia w proch." },
    { name: "Pasożyt", points: 1, category: "Bounto", description: "Lalka potrzebuje więcej energii, musisz częściej jeść." },
    { name: "Prozaiczny", points: 1, category: "Bounto", description: "Brak możliwości nauki umiejętności wiedzy tajemnej." },
    { name: "Słaba regeneracja", points: 1, category: "Bounto", description: "Leczenie wymaga 2x więcej reiatsu niż normalnie." },
    { name: "Słaby punkt", points: 1, category: "Bounto", description: "Lalka ma wrażliwe miejsce otrzymujące 2x obrażeń." },
    { name: "Stary", points: 1, category: "Bounto", description: "Brak możliwości spożycia dusz. Wymagany wiek >50." }
  ],
  'Dusza': [
    { name: "Analfabeta", points: 1, category: "Dusza", description: "Nie umiesz czytać ani pisać." },
    { name: "Beztalencie", points: 2, category: "Dusza", description: "Brak umiejętności specjalnych duszy i trudność w ich zdobyciu." },
    { name: "Deformacja", points: 1, category: "Dusza", description: "Dodatkowa część ciała utrudniająca kontrolę.", requirements: "Wrodzone" },
    { name: "Niekompatybilne reiatsu", points: 1, category: "Dusza", description: "Kido medyczne zadaje Ci obrażenia zamiast leczyć." },
    { name: "Niskie pochodzenie", points: 1, category: "Dusza", description: "Pochodzisz z rodziny o bardzo złej sławie." },
    { name: "Poszukiwany", points: 1, category: "Dusza", description: "Nagroda za Twoją głowę w Soul Society." },
    { name: "Przeklęty", points: 1, category: "Dusza", description: "Klątwa od bogów o charakterze uzgodnionym z MG." },
    { name: "Wspomnienia życia", points: 1, category: "Dusza", description: "Traumatyczne koszmary z poprzedniego życia." },
    { name: "Z zewnętrznych okręgów", points: 1, category: "Dusza", description: "Pochodzenie z parszywej okolicy Rukongai." },
    { name: "Zwierzę", points: 2, category: "Dusza", description: "Jesteś zwierzęciem z ludzką inteligencją. Brak mowy." }
  ],
  'Hollow': [
    { name: "Chwiejne Cero", points: 1, category: "Hollow", description: "Cero jest niestabilne i może wybuchnąć w twarz." },
    { name: "Degradacja Reiatsu", points: 1, category: "Hollow", description: "Głód powoduje utratę reiatsu (10% dziennie)." },
    { name: "Hollow smakosz", points: 1, category: "Hollow", description: "Brak premii za jedzenie słabszych Hollow." },
    { name: "Niepohamowany apetyt", points: 1, category: "Hollow", description: "Musisz dojeść ofiarę do końca, nawet w walce." },
    { name: "Niestabilna garganta", points: 1, category: "Hollow", description: "Trudność w trafieniu do celu przy przeskoku między światami." },
    { name: "Pasożyt", points: 1, category: "Hollow", description: "Możesz wysysać energię tylko z żywych dusz." },
    { name: "Podatny", points: 1, category: "Hollow", description: "Jeden typ ataku zadaje Ci 1.5x obrażeń." },
    { name: "Powolna ewolucja", points: 1, category: "Hollow", description: "Utrudnienia w awansie na Adjuchas i Vasto Lorde." },
    { name: "Półprzezroczysty", points: 1, category: "Hollow", description: "Twoja aura jest wyczuwalna nawet dla nieświadomych." },
    { name: "Pstrokaty", points: 1, category: "Hollow", description: "Jaskrawe kolory ciała uniemożliwiają ukrycie się." },
    { name: "Rozpadający się", points: 2, category: "Hollow", description: "W trakcie głodu ciało dosłownie się rozpada." },
    { name: "Upośledzony", points: 1, category: "Hollow", description: "Jedna zdolność specjalna mniej na start." },
    { name: "Wrażliwa maska", points: 1, category: "Hollow", description: "Maska otrzymuje 2x większe obrażenia." },
    { name: "Wrażliwy na słońce", points: 1, category: "Hollow", description: "W świetle słońca masz tylko 75% statystyk." }
  ],
  'Kami': [
    { name: "Barbarzyński", points: 1, category: "Kami", description: "Zachowanie trolla spod mostu zamiast bóstwa." },
    { name: "Głodomór", points: 1, category: "Kami", description: "Masz konwencjonalną potrzebę jedzenia." },
    { name: "Gniewny", points: 1, category: "Kami", description: "Musisz ukarać każdego, kto Cię obrazi." },
    { name: "Nadopiekuńczy", points: 1, category: "Kami", description: "Zbyt mocno dbasz o wyznawców, tracąc energię." },
    { name: "Pacyfista", points: 2, category: "Kami", description: "Walka sprawia Ci fizyczny ból i podważa wiarę." },
    { name: "Pośmiewisko", points: 1, category: "Kami", description: "Odrzucająca cecha sprawia, że nikt nie bierze Cię serio." },
    { name: "Rywal", points: 1, category: "Kami", description: "Inny kami postawił sobie za cel utrudnianie Ci życia." },
    { name: "Słabość", points: 1, category: "Kami", description: "Dziwna słabość (np. kwiat) pozbawiająca Cię mocy." },
    { name: "Sługa", points: 1, category: "Kami", description: "Jesteś pomniejszym bóstwem w czyjejś posłudze." },
    { name: "Upadły kami", points: 1, category: "Kami", description: "Straciłeś wyznawców w niesławie." },
    { name: "Wybredny", points: 1, category: "Kami", description: "Czerpiesz moc tylko od specyficznych wyznawców." },
    { name: "Wygnanie", points: 1, category: "Kami", description: "Nie jesteś mile widziany w jednym ze światów." },
    { name: "Zaklęty", points: 2, category: "Kami", description: "Twoje jestestwo jest zamknięte w przedmiocie." },
    { name: "Żądza ofiar", points: 1, category: "Kami", description: "PR regenerują się tylko po złożeniu ofiary." }
  ],
  'Fullbringer': [
    { name: "Bezrefleksyjny", points: 1, category: "Fullbringer", description: "Brak możliwości opanowania zdolności transu." },
    { name: "Człowiek Pierwotny", points: 1, category: "Fullbringer", description: "Nienawiść do nowoczesnej technologii.", requirements: "Wrodzone" },
    { name: "Naznaczony", points: 1, category: "Fullbringer", description: "Twoja aura przypomina aurę Hollowa.", requirements: "Wrodzone" },
    { name: "Nieempatyczny", points: 2, category: "Fullbringer", description: "Brak możliwości opanowania percepcji i dominacji." },
    { name: "Przyziemny", points: 1, category: "Fullbringer", description: "Materialista, brak zdolności percepcji." },
    { name: "Wyniosły", points: 1, category: "Fullbringer", description: "Brak możliwości opanowania zdolności dostosowania." },
    { name: "Roztrzepany", points: 1, category: "Fullbringer", description: "Trudności z koncentracją przy technikach." },
    { name: "Terror Dusz", points: 1, category: "Fullbringer", description: "Twoja aura jest niepokojąca dla przedmiotów.", requirements: "Wrodzone" },
    { name: "Wrażliwiec", points: 1, category: "Fullbringer", description: "Zbyt duża empatia, fizyczny ból przy cudzym cierpieniu." }
  ],
  'Quincy': [
    { name: "Antagonizm Hollow", points: 1, category: "Quincy", description: "Otrzymujesz 2x większe obrażenia od Hollowów." },
    { name: "Glitzern", points: 2, category: "Quincy", description: "Brak możliwości korzystania z łuków." },
    { name: "Niemobilny", points: 1, category: "Quincy", description: "Zwiększone kary do celności przy poruszaniu się." },
    { name: "Niepokojąca aura", points: 1, category: "Quincy", description: "Twoja aura wywołuje podświadomy strach." },
    { name: "Niestabilny", points: 1, category: "Quincy", description: "Większe obrażenia (+20%), ale trudniejsze trafienie." },
    { name: "Słaba krew", points: 1, category: "Quincy", description: "Pobieranie reiatsu z otoczenia zmniejszone o połowę." },
    { name: "Wygnany/Znienawidzony", points: 1, category: "Quincy", description: "Zbrodnia w społeczności Quincy, wykluczenie." },
    { name: "Zamknięty obieg", points: 1, category: "Quincy", description: "Słabe zdrowie (wytrzymałość x0.8)." }
  ],
  'Shinigami': [
    { name: "Aura śmierci", points: 1, category: "Shinigami", description: "Nawet śmiertelnicy wyczuwają, że coś z Tobą nie tak." },
    { name: "Beztalencie w Kidō", points: 1, category: "Shinigami", description: "Nauka zaklęć zajmuje znacznie więcej czasu." },
    { name: "Beztalencie w Hakuda", points: 1, category: "Shinigami", description: "Nauka walki wręcz zajmuje znacznie więcej czasu." },
    { name: "Beztalencie w Hoho", points: 1, category: "Shinigami", description: "Nauka szybkiego poruszania się zajmuje więcej czasu." },
    { name: "Beztalencie w Zanjutsu", points: 1, category: "Shinigami", description: "Nauka walki mieczem zajmuje więcej czasu." },
    { name: "Cierpiące zanpaktō", points: 1, category: "Shinigami", description: "Zanpaktō jest głuche na Twoje wołania." },
    { name: "Lustrowany", points: 1, category: "Shinigami", description: "Jesteś pod stałą obserwacją władz Gotei 13." },
    { name: "Niekontrolowane kidō", points: 1, category: "Shinigami", description: "Silniejsze czary (+50%), ale 50% szans na wybuch." },
    { name: "Nieuk", points: 1, category: "Shinigami", description: "Zaczynasz bez Kido na start i trudniej się ich uczysz." },
    { name: "Omen", points: 1, category: "Shinigami", description: "Ściągasz pecha na towarzyszy niebędących shinigami." },
    { name: "Zwyczajne shikai", points: 1, category: "Shinigami", description: "Shikai zmienia tylko formę fizyczną, brak magii." }
  ]
};

const GENERAL_SKILLS = [
  // DUCHOWE
  {
    name: "Dzika aura",
    category: "Duchowe",
    isInnate: false,
    requirements: "Reiatsu: 30, Reiatsu > Kontrola Reiatsu",
    description: "Chaotyczna energia osnuwa ciało, zwiększając statystyki fizyczne o wartość Reiatsu, ale kalecząc użytkownika (koszt PŻ)."
  },
  {
    name: "Hifurei „Duchowa skóra”",
    category: "Duchowe",
    isInnate: false,
    requirements: "Kontrola reiatsu: 30, Rasa materialna",
    description: "Uwalnianie cząsteczek duchowych przez skórę czyni użytkownika niewidzialnym dla zwykłych ludzi."
  },
  {
    name: "Medytacja",
    category: "Duchowe",
    isInnate: false,
    requirements: "Psychika: 15",
    description: "Oczyszczenie umysłu pozwala odnowić 20% PR raz dziennie i daje bonus do kontroli reiatsu."
  },
  {
    name: "Przekształcanie Reiatsu",
    category: "Duchowe",
    isInnate: false,
    requirements: "Kontrola Reiatsu: 50",
    description: "Manipulacja częstotliwością energii, by przypominała inną osobę lub rasę (z wyjątkiem Kami)."
  },
  {
    name: "Przenikliwość",
    category: "Duchowe",
    isInnate: false,
    requirements: "Kontrola Reiatsu: 25, Psychika: 15, tylko istoty duchowe",
    description: "Zdolność przechodzenia przez materię fizyczną (ściany) dzięki manipulacji duchowym ciałem."
  },
  {
    name: "Reiar",
    category: "Duchowe",
    isInnate: false,
    requirements: "Kontrola Reiatsu: 14",
    description: "Niezwykle wyczulony szósty zmysł, działający pasywnie jak nos psa do tropienia energii."
  },
  {
    name: "Reiki",
    category: "Duchowe",
    isInnate: false,
    requirements: "Reiatsu: 10, Kontrola Reiatsu: 10, trening, Człowiek/Quincy",
    description: "Ludzka technika uzdrawiania przywracająca 10 PŻ i 20 PR pacjentowi."
  },
  {
    name: "Sztukmistrz",
    category: "Duchowe",
    isInnate: false,
    requirements: "Kontrola reiatsu: 12",
    description: "Ograniczone przekształcanie surowego reiatsu w proste efekty jak płomień, lód czy iskry."
  },
  {
    name: "Śniący",
    category: "Duchowe",
    isInnate: false,
    requirements: "Psychika: 10",
    description: "Zdolność opuszczania materialnego ciała (lub gigai) i poruszania się jako dusza."
  },
  {
    name: "Wulkan reiatsu",
    category: "Duchowe",
    isInnate: true,
    requirements: "Reiatsu: 12, wrodzone",
    description: "Olbrzymie pokłady energii duchowej. Zmienia wzór PR: 1.3 x (0,75R + 0,25KR)^2."
  },
  {
    name: "Wyczucie portali",
    category: "Duchowe",
    isInnate: true,
    requirements: "Kontrola Reiatsu: 12, wrodzone",
    description: "Wrodzony dar pozwalający wyczuć otwieranie się portali (Garganta, Senkaimon) tuż przed ich pojawieniem się."
  },
  {
    name: "Zmodyfikowany",
    category: "Duchowe",
    isInnate: false,
    requirements: "Opis modyfikacji, Istota duchowa",
    description: "Unikalna modyfikacja duszy (np. odczepiana ręka, oczy z zoomem) zaakceptowana przez MG."
  },

  // OGÓLNE
  {
    name: "Artysta",
    category: "Ogólne",
    isInnate: true,
    requirements: "Wrodzone",
    description: "Wrodzony talent w wybranej dziedzinie artystycznej (malarstwo, śpiew itp.)."
  },
  {
    name: "Fotograficzna Pamięć",
    category: "Ogólne",
    isInnate: true,
    requirements: "Wrodzone",
    description: "Zdolność zapamiętywania w szczegółach wszystkiego, co zobaczyły oczy."
  },
  {
    name: "Hacker",
    category: "Ogólne",
    isInnate: false,
    requirements: "Inteligencja 15",
    description: "Doskonała znajomość programowania, wirusów i włamań na serwery."
  },
  {
    name: "Hazardzista",
    category: "Ogólne",
    isInnate: true,
    requirements: "Wrodzone",
    description: "Niezwykły fart w losowych wyborach i grach hazardowych."
  },
  {
    name: "Kieszonkowiec",
    category: "Ogólne",
    isInnate: false,
    requirements: "Zręczność: 9",
    description: "Sztuka kradzieży kieszonkowej, zręczne palce i nerwy ze stali."
  },
  {
    name: "Kucharz",
    category: "Ogólne",
    isInnate: false,
    requirements: "Inteligencja: 8",
    description: "Przyrządzanie posiłków, które szybciej odnawiają energię (PR)."
  },
  {
    name: "Magia przyjaźni",
    category: "Ogólne",
    isInnate: true,
    requirements: "Wrodzone, odpowiedni charakter",
    description: "Bonusy w sytuacjach krytycznych zagrażających życiu Twojemu lub bliskich."
  },
  {
    name: "Maskowanie Reiatsu",
    category: "Ogólne",
    isInnate: false,
    requirements: "Kontrola Reiatsu > Reiatsu",
    description: "Tłumienie własnej aury, by stać się niewykrywalnym dla osób o niższej kontroli."
  },
  {
    name: "Mechanik",
    category: "Ogólne",
    isInnate: false,
    requirements: "Inteligencja: 8",
    description: "Zdolność naprawy większości urządzeń mechanicznych i tworzenia prostych części."
  },
  {
    name: "Medycyna",
    category: "Ogólne",
    isInnate: false,
    requirements: "Inteligencja: 12, Pierwsza pomoc",
    description: "Szeroka wiedza medyczna, nastawianie kości, leczenie chorób i tworzenie leków."
  },
  {
    name: "Niewrażliwy",
    category: "Ogólne",
    isInnate: true,
    requirements: "Wrodzone",
    description: "Znaczna odporność na presję reiatsu silniejszych istot (oddziałuje 2x słabiej)."
  },
  {
    name: "Obsługa Komputerów",
    category: "Ogólne",
    isInnate: false,
    requirements: "Inteligencja: 7",
    description: "Podstawowa obsługa PC, tworzenie stron i naprawa drobnych awarii."
  },
  {
    name: "Pierwsza pomoc",
    category: "Ogólne",
    isInnate: false,
    requirements: "Inteligencja: 8",
    description: "Podstawy ratownictwa: RKO, bandażowanie, ocucanie, opatrywanie oparzeń."
  },
  {
    name: "Pojętność",
    category: "Ogólne",
    isInnate: true,
    requirements: "Inteligencja: 14, wrodzone",
    description: "Naturalna predyspozycja do szybkiego przyswajania wiedzy i teorii (np. Kido)."
  },
  {
    name: "Przedsiębiorczy",
    category: "Ogólne",
    isInnate: false,
    requirements: "Inteligencja: 8",
    description: "Smykałka do interesów i łatwiejsze gromadzenie środków finansowych."
  },
  {
    name: "Przyjaciel z drugiej strony",
    category: "Ogólne",
    isInnate: false,
    requirements: "Opisanie w KP",
    description: "Dobry kontakt z istotą innej rasy (np. człowiek znający Shinigami)."
  },
  {
    name: "Regeneracja",
    category: "Ogólne",
    isInnate: true,
    requirements: "Wytrzymałość: 10, Reiatsu: 10, wrodzone",
    description: "Szybsze gojenie ran, zrastanie kości i odporność na trucizny/choroby."
  },
  {
    name: "Ryzykant",
    category: "Ogólne",
    isInnate: false,
    requirements: "Psychika: 8",
    description: "Intuicja w sytuacjach niebezpiecznych, zmniejszająca ryzyko porażki przy brawurze."
  },
  {
    name: "Sowa",
    category: "Ogólne",
    isInnate: true,
    requirements: "Wrodzone",
    description: "Lepsze samopoczucie i więcej energii podczas pory nocnej."
  },
  {
    name: "Sprinter",
    category: "Ogólne",
    isInnate: true,
    requirements: "Wrodzone, Szybkość: 12",
    description: "Zwiększa prędkość średnią (x1.5) i maksymalną (x3 + 10)."
  },
  {
    name: "Szpieg",
    category: "Ogólne",
    isInnate: false,
    requirements: "Zręczność 10, inteligencja 10",
    description: "Ciche chodzenie, skradanie się i otwieranie zamków wytrychami."
  },
  {
    name: "Twardziel",
    category: "Ogólne",
    isInnate: true,
    requirements: "Wytrzymałość: 12, wrodzone",
    description: "Ponadprzeciętna żywotność. Zmienia wzór PŻ na Wytrzymałość * 12."
  },
  {
    name: "Widzenie w ciemności",
    category: "Ogólne",
    isInnate: true,
    requirements: "Wrodzone/MG",
    description: "Wyraźne widzenie przy słabym świetle (księżyc/gwiazdy) do 30m."
  },
  {
    name: "Wyostrzone Zmysły",
    category: "Ogólne",
    isInnate: true,
    requirements: "Wrodzone, opis",
    description: "Jeden ze zmysłów (wzrok, słuch itp.) jest niezwykle wyczulony."
  },
  {
    name: "Wytrwały Surviwalowiec",
    category: "Ogólne",
    isInnate: false,
    requirements: "Inteligencja: 8",
    description: "Wiedza o przetrwaniu w dziczy, budowa szałasów i pułapek."
  },
  {
    name: "Wiedza/Nauka/Umiejętność",
    category: "Ogólne",
    isInnate: false,
    requirements: "Współczynnik 9 przy statystyce",
    description: "Ekspercka wiedza lub rzemiosło w wybranej dziedzinie (np. matematyka, kowalstwo)."
  },
  {
    name: "Wyczucie balansu",
    category: "Ogólne",
    isInnate: false,
    requirements: "Zręczność: 10",
    description: "Łatwiejsze zachowanie równowagi na niestabilnym gruncie lub po ciosach."
  },
  {
    name: "Wydolny organizm",
    category: "Ogólne",
    isInnate: true,
    requirements: "Wrodzony lub trening",
    description: "Wyższa odporność na przeciążenia przy wzmacnianiu ciała energią (do 1.5x Wytrzymałości)."
  },
  {
    name: "Wyjątkowo Uzdolniony",
    category: "Ogólne",
    isInnate: true,
    requirements: "Wrodzone",
    description: "Premia +3 do jednej statystyki kosztem wolniejszego rozwoju statystyki przeciwstawnej."
  },
  {
    name: "Zimnokrwisty",
    category: "Ogólne",
    isInnate: false,
    requirements: "Psychika: 10",
    description: "Zachowanie zimnej krwi w sytuacjach stresowych, brak objawów lęku."
  },

  // SPOŁECZNE
  {
    name: "Błogosławiony",
    category: "Społeczne",
    isInnate: false,
    requirements: "Przypadnięcie do gustu kami",
    description: "Otrzymanie błogosławieństwa od bóstwa o właściwościach wybranych przez MG."
  },
  {
    name: "Bogacz",
    category: "Społeczne",
    isInnate: true,
    requirements: "Wrodzone lub przygoda",
    description: "Duży majątek na start (+1500 Ryo) i stały dopływ gotówki."
  },
  {
    name: "Empatyczna więź",
    category: "Społeczne",
    isInnate: false,
    requirements: "Psychika: 10, więź z NPC",
    description: "Silne przywiązanie do kogoś, objawiające się przeczuciami lub przypadkowymi spotkaniami."
  },
  {
    name: "Kanciarz/Kłamca",
    category: "Społeczne",
    isInnate: false,
    requirements: "Psychika: 10",
    description: "Opanowana mowa ciała i ton głosu, pozwalające skutecznie oszukiwać innych."
  },
  {
    name: "Lider",
    category: "Społeczne",
    isInnate: false,
    requirements: "Psychika: 10",
    description: "Naturalny autorytet, posłuch w grupie i zdolność inspirowania innych."
  },
  {
    name: "Medium",
    category: "Społeczne",
    isInnate: false,
    requirements: "Psychika: 20, rytuał, Człowiek/dusza",
    description: "Zdolność wprowadzania się w trans i głoszenia woli boskich istot (Kami/Yokai)."
  },
  {
    name: "Mordercze spojrzenie",
    category: "Społeczne",
    isInnate: false,
    requirements: "Psychika: 13",
    description: "Spojrzenie wzbudzające respekt lub strach, ułatwiające podporządkowanie innych."
  },
  {
    name: "Nadzwyczajna Uroda",
    category: "Społeczne",
    isInnate: true,
    requirements: "Wrodzone, opis",
    description: "Wyjątkowo atrakcyjny wygląd ułatwiający kontakty z płcią przeciwną."
  },
  {
    name: "Niewiniątko",
    category: "Społeczne",
    isInnate: true,
    requirements: "Wrodzone",
    description: "Aura utrudniająca posądzenie o coś złego, nawet przy winie."
  },
  {
    name: "Niezwykły głos",
    category: "Społeczne",
    isInnate: true,
    requirements: "Wrodzone",
    description: "Wyjątkowa barwa głosu (Srebrny, Łagodny lub Autorytatywny) dająca bonusy społeczne."
  },
  {
    name: "Plecy",
    category: "Społeczne",
    isInnate: false,
    requirements: "Brak",
    description: "Proteksja u kogoś wysoko postawionego (np. oficer Gotei 13), dająca ulgi i awanse."
  },
  {
    name: "Przeciętny",
    category: "Społeczne",
    isInnate: false,
    requirements: "Brak przeciwstawnych",
    description: "Brak wyróżniających cech, co sprawia, że postać jest ignorowana jako element tła."
  },
  {
    name: "Przekaźnik",
    category: "Społeczne",
    isInnate: false,
    requirements: "Psychika: 40, Kontrola Reiatsu: 30",
    description: "Telepatyczne przekazywanie informacji do określonej grupy odbiorców."
  },
  {
    name: "Retoryka",
    category: "Społeczne",
    isInnate: false,
    requirements: "Inteligencja: 12, Psychika: 10",
    description: "Zdolność układania przemów i przekonywania ludzi do swojego zdania."
  },
  {
    name: "Sojusznik",
    category: "Społeczne",
    isInnate: false,
    requirements: "Opisanie w KP",
    description: "Posiadanie pomocnika NPC, który podróżuje z bohaterem."
  },
  {
    name: "Szanowany",
    category: "Społeczne",
    isInnate: false,
    requirements: "Historia, opis",
    description: "Dobra opinia w konkretnej grupie społecznej, dająca profity i upusty."
  },
  {
    name: "Wyczucie Duszy",
    category: "Społeczne",
    isInnate: false,
    requirements: "Inteligencja: 12, Psychika: 12",
    description: "Odczytywanie emocji i kłamstw z mowy ciała i spojrzenia."
  },
  {
    name: "Wyczuwanie Sakki",
    category: "Społeczne",
    isInnate: false,
    requirements: "Inteligencja: 30, Psychika: 40, Wyczucie Duszy",
    description: "Wyczuwanie morderczych intencji i subtelnych wahań energii oponenta."
  },
  {
    name: "Zaklinacz zwierząt",
    category: "Społeczne",
    isInnate: true,
    requirements: "Wrodzone",
    description: "Wrodzony dar komunikowania się ze zwierzętami i nakłaniania ich do pomocy."
  },
  {
    name: "Żarliwa modlitwa",
    category: "Społeczne",
    isInnate: true,
    requirements: "Wrodzone lub przygoda",
    description: "Modlitwy o większej mocy, które zawsze zostają usłyszane przez bóstwa."
  },

  // BOJOWE
  {
    name: "Anatomia",
    category: "Bojowe",
    isInnate: false,
    requirements: "Inteligencja 12",
    description: "Znajomość punktów witalnych ciała, ułatwiająca zadawanie bólu i leczenie."
  },
  {
    name: "Berserk",
    category: "Bojowe",
    isInnate: false,
    requirements: "Zręczność: 8, Szybkość: 8",
    description: "Lepszy atak kosztem obrony podczas ciągłego napierania na wroga."
  },
  {
    name: "Biegłość (Broń)",
    category: "Bojowe",
    isInnate: false,
    requirements: "Zręczność 7+",
    description: "Wyszkolenie w posługiwaniu się konkretnym rodzajem broni białej."
  },
  {
    name: "Biegłość (Walka wręcz)",
    category: "Bojowe",
    isInnate: false,
    requirements: "Zręczność 7+",
    description: "Uczynienie z własnego ciała broni równie zabójczej co miecz."
  },
  {
    name: "Cień",
    category: "Bojowe",
    isInnate: false,
    requirements: "Kontrola Reiatsu: 60, Reiatsu: 50, Psychika: 50",
    description: "Niewykrywalna teleportacja poprzez materializację własnego cienia."
  },
  {
    name: "Deflektor",
    category: "Bojowe",
    isInnate: false,
    requirements: "Szybkość: 12, Zręczność: 10, Biegłość 2",
    description: "Sztuka przechwytywania i odbijania nadlatujących pocisków."
  },
  {
    name: "Determinator",
    category: "Bojowe",
    isInnate: false,
    requirements: "Psychika: 30, Wytrzymałość: 20",
    description: "Zdolność do walki przez kilka sekund po utracie przytomności dzięki sile woli."
  },
  {
    name: "Dezaktywacja Reiatsu",
    category: "Bojowe",
    isInnate: false,
    requirements: "Inteligencja: 40, Kontrola Reiatsu: 30",
    description: "Wyłączanie cudzych zaklęć poprzez wprowadzenie energii o przeciwnym wektorze."
  },
  {
    name: "Dłuższa Przemiana",
    category: "Bojowe",
    isInnate: false,
    requirements: "Kontrola Reiatsu: 35",
    description: "Zmniejszenie obciążeń ciała, pozwalające dłużej utrzymać formy jak Bankai czy Shunko."
  },
  {
    name: "Duchowa więź",
    category: "Bojowe",
    isInnate: false,
    requirements: "Długie lata korzystania",
    description: "Przywołanie i przyciąganie broni siłą woli z niewielkiej odległości."
  },
  {
    name: "Hipermobilność",
    category: "Bojowe",
    isInnate: true,
    requirements: "Wrodzone lub MG",
    description: "Niezwykle elastyczne stawy, uniemożliwiające założenie dźwigni."
  },
  {
    name: "Iaido",
    category: "Bojowe",
    isInnate: false,
    requirements: "Zręczność: 20, Biegłość ekspert",
    description: "Błyskawiczny atak mieczem prosto z pochwy, zaskakujący przeciwnika."
  },
  {
    name: "Intuicja",
    category: "Bojowe",
    isInnate: true,
    requirements: "Psychika: 10, Wrodzone",
    description: "Subtelne wyczuwanie nadchodzącego ataku z zaskoczenia."
  },
  {
    name: "Kompletna moc",
    category: "Bojowe",
    isInnate: false,
    requirements: "Opanowanie ostatecznej mocy",
    description: "Perfekcyjne opanowanie ostatecznej formy wzmacnia formę podstawową (np. Shikai)."
  },
  {
    name: "Manipulacja Powietrzem",
    category: "Bojowe",
    isInnate: false,
    requirements: "Kontrola Reiatsu: 35",
    description: "Zdolność biegania po powietrzu dzięki skupianiu energii w stopach."
  },
  {
    name: "Mistrz Broni",
    category: "Bojowe",
    isInnate: false,
    requirements: "Inteligencja: 9, zręczność 16",
    description: "Talent do walki każdą bronią białą lub improwizowaną (np. krzesłem)."
  },
  {
    name: "Mukei Sentou",
    category: "Bojowe",
    isInnate: false,
    requirements: "Kontrola Reiatsu: 8",
    description: "Możliwość ranienia istot duchowych gołymi rękami dzięki otoczce z energii."
  },
  {
    name: "Oburęczność",
    category: "Bojowe",
    isInnate: false,
    requirements: "Zręczność: 15",
    description: "Używanie obu rąk z jednakową skutecznością w walce i rzemiośle."
  },
  {
    name: "Ostrożny",
    category: "Bojowe",
    isInnate: false,
    requirements: "Zręczność: 8, Szybkość: 8",
    description: "Lepsza obrona kosztem ataku, skupienie na kontrowaniu ruchów wroga."
  },
  {
    name: "Poświęcenie",
    category: "Bojowe",
    isInnate: false,
    requirements: "Kontrola > Reiatsu, Psychika: 12",
    description: "Używanie punktów życia (PŻ) zamiast energii (PR) do rzucania zaklęć (1:3)."
  },
  {
    name: "Przebicie gardy",
    category: "Bojowe",
    isInnate: false,
    requirements: "Siła: 10, Biegłość biegły",
    description: "Ciosy przebijające się przez bloki przeciwnika dzięki przewadze siły."
  },
  {
    name: "Punktowa presja",
    category: "Bojowe",
    isInnate: false,
    requirements: "Kontrola Reiatsu: 40, Kontrola > Reiatsu",
    description: "Skupienie presji duchowej wyłącznie na jednym celu, paraliżując go bólem lub strachem."
  },
  {
    name: "Senka",
    category: "Bojowe",
    isInnate: false,
    requirements: "Szybki krok, Biegłość ekspert, Szybk: 45, Zręcz: 45",
    description: "Błyskawiczny atak podczas migoczącego kroku (skok, cięcie, odskok)."
  },
  {
    name: "Sokole Oko",
    category: "Bojowe",
    isInnate: true,
    requirements: "Zręczność: 13, Wrodzone",
    description: "Naturalny talent do walki na dystans (łuki, broń palna, Cero, Kido)."
  },
  {
    name: "Sztuki walki",
    category: "Bojowe",
    isInnate: false,
    requirements: "Biegłość Walka wręcz (Ekspert)",
    description: "Perfekcja w konkretnym stylu walki (np. Karate, Judo) dająca unikalne korzyści."
  },
  {
    name: "Trafienie Krytyczne",
    category: "Bojowe",
    isInnate: false,
    requirements: "Zręczność: 20, Szybkość: 10, Anatomia",
    description: "Skuteczne uderzanie w punkty witalne, by wywołać paraliż lub śmierć."
  },
  {
    name: "Youma Genkotsu",
    category: "Bojowe",
    isInnate: false,
    requirements: "Kontrola Reiatsu: 16, Reiatsu: 8",
    description: "Naładowanie skóry energią, by ciosy uszkadzały duszę i wytrącały PR wroga."
  },
  {
    name: "Zapomniana technika",
    category: "Bojowe",
    isInnate: false,
    requirements: "Biegłość w broni białej",
    description: "Zaskakujące manewry ze starych szkół szermierczych, dające bonusy do trafienia."
  },
  {
    name: "Żądza Krwi",
    category: "Bojowe",
    isInnate: true,
    requirements: "Wrodzone",
    description: "Zachowanie pełnej sprawności bojowej mimo niskiego poziomu zdrowia i energii."
  },
  {
    name: "Żrące Reishi",
    category: "Bojowe",
    isInnate: true,
    requirements: "Wrodzone",
    description: "Emitowanie parzącej energii z ran, raniącej przeciwników w zwarciu."
  }
];

const AddStatModal = ({ characterId, onClose, onSuccess }: { characterId: number, onClose: () => void, onSuccess: () => void }) => {
  const [statName, setStatName] = useState('Siła');
  const [amount, setAmount] = useState(1);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert("Proszę podać poprawną ilość.");
      return;
    }
    setIsSubmitting(true);
    try {
      await fetch(`/api/characters/${characterId}/stat_history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stat_name: statName, amount, comment })
      });
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl w-full max-w-md p-6">
        <h3 className="text-xl font-display italic uppercase mb-6 flex items-center gap-2">
          <ArrowUpCircle className="text-emerald-500" /> Dodaj Punkty Statystyk
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Wybierz Atrybut</label>
            <select
              value={statName}
              onChange={e => setStatName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {ATTRIBUTE_NAMES.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Ilość punktów dodanych (+)</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Uzasadnienie / Komentarz (Opcjonalne)</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="np. Kupiłem za PD z walki z Hollowem..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm h-24 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/50">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
              Anuluj
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-emerald-500 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Zapisywanie...' : 'Zapisz Rozwój'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const CharacterForm = ({ character, onSave, onCancel, isNPC = false }: { character?: Partial<Character>, onSave: (c: Partial<Character>) => void, onCancel: () => void, isNPC?: boolean }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ wady: false, zdolnosci: false });
  const toggleSection = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const [formData, setFormData] = useState<Partial<Character>>(character || {
    name: '',
    surname: '',
    quote: '',
    type: isNPC ? 'NPC' : 'PC',
    profession: '',
    gender: '',
    age: '15',
    weight: '',
    height: '',
    appearance: '',
    history: '',
    personality: '',
    equipment: '',
    money: '500 Ryo',
    skills: '',
    disadvantages: '',
    stats: '',
    general_stats: '',
    techniques: 'Brak',
    avatar_url: '',
    appearance_images: ''
  });

  useEffect(() => {
    const race = Object.keys(STARTING_RANKS).find(key => formData.profession?.includes(key)) || '';
    const isKami = race === 'Kami';
    const mods = getRaceModifiers(formData.profession);

    if (isKami && formData.age !== '0') {
      setFormData(prev => ({ ...prev, age: '0' }));
    }

    const hasBiedak = formData.disadvantages?.includes('Biedak');
    let expectedMoney = hasBiedak ? '10 Ryo' : '500 Ryo';
    if (mods.moneyDisabled) {
      expectedMoney = 'Brak';
    }

    if (formData.money !== expectedMoney) {
      setFormData(prev => ({ ...prev, money: expectedMoney }));
    }
  }, [formData.profession, formData.disadvantages]);

  const [attributes, setAttributes] = useState<Record<string, number>>(() => {
    const attrs: Record<string, number> = {};
    const mods = getRaceModifiers(character?.profession || '');
    ATTRIBUTE_NAMES.forEach(name => {
      const match = character?.stats?.match(new RegExp(`${name}:\\s*(\\d+)`, 'i'));
      if (match) {
        const effectiveStat = parseInt(match[1]);
        attrs[name] = Math.max(1, effectiveStat - (mods.stats[name as keyof typeof mods.stats] || 0));
      } else {
        attrs[name] = 5;
      }
    });
    return attrs;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAvatar = async () => {
    if (!formData.appearance) return;
    setIsGenerating(true);
    try {
      const race = Object.keys(STARTING_RANKS).find(key => formData.profession?.includes(key)) || '';
      const additionalImages = formData.appearance_images?.split('|||').filter(Boolean) || [];

      const url = await generateCharacterAvatar(
        formData.appearance,
        undefined,              // don't pass AI-generated avatar as reference
        race,
        formData.profession,
        formData.age,
        formData.weight,
        formData.height,
        additionalImages,       // user-uploaded reference photos
        formData.personality,   // personality traits → influence pose/expression
        `${formData.name} ${formData.surname}`.trim(),
        formData.gender,
      );
      if (url) setFormData(prev => ({ ...prev, avatar_url: url }));
    } catch (e: any) {
      console.error("Error generating avatar:", e);
      if (e.message && (e.message.includes("quota") || e.message.includes("429") || e.message.includes("RESOURCE_EXHAUSTED"))) {
        alert("Wyczerpano próbki/darmowy limit zapytań do sztucznej inteligencji. Spróbuj ponownie później lub zmień klucz API w pliku konfiguracyjnym.");
      } else {
        alert(`Wystąpił błąd podczas generowania awatara: ${e.message || "Sprawdź konsolę po więcej szczegółów"}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const getInteligencja = () => {
    const match = formData.stats?.match(/Inteligencja:\s*(\d+)/i);
    return match ? parseInt(match[1]) : 0;
  };

  const getKidoLimits = () => {
    const intel = attributes['Inteligencja'] || 5;
    const skills = formData.skills?.toLowerCase() || '';
    const hasPojetnosc = skills.includes('pojętność');
    const hasMagik = skills.includes('znakomity magik');
    const hasRurkarz = skills.includes('rurkarz');

    const isStudent = formData.profession === 'Uczeń akademii Shinigami';
    const isQuincy = formData.profession?.toLowerCase().includes('quincy');

    if (isQuincy) {
      let countLimit = Math.floor(intel / 3);
      if (hasPojetnosc) countLimit += 1;
      if (hasRurkarz) countLimit += 1;

      const currentCount = formData.techniques === 'Brak' ? 0 : formData.techniques?.split(', ').filter(Boolean).length || 0;
      return { countLimit, currentCount, intel, isQuincy: true };
    }

    let maxLevel = intel * 2;
    let startingMax = isStudent ? 10 : 30;

    if (hasPojetnosc && hasMagik) startingMax += 10;
    else if (hasPojetnosc || hasMagik) startingMax += 5;

    const countLimit = Math.floor(intel / 3);
    const currentCount = formData.techniques === 'Brak' ? 0 : formData.techniques?.split(', ').filter(Boolean).length || 0;

    return { maxLevel, startingMax, countLimit, currentCount, intel, isQuincy: false };
  };

  const calculatePoints = (mods: ReturnType<typeof getRaceModifiers>) => {
    const age = parseInt(formData.age || '0') || 0;
    const ageBonus = Math.min(10, Math.floor(age / 5));
    const totalPoints = 20 + ageBonus + mods.freePoints;
    const spentPoints = Object.values(attributes).reduce((sum, val) => sum + (val - 5), 0);
    return { totalPoints, spentPoints, remainingPoints: totalPoints - spentPoints };
  };

  const getSkillLimits = () => {
    const intel = attributes['Inteligencja'] || 5;
    const currentSkills = formData.skills === 'Brak' ? [] : formData.skills?.split(', ').filter(Boolean) || [];
    const currentDisadvantages = formData.disadvantages === 'Brak' ? [] : formData.disadvantages?.split(', ').filter(Boolean) || [];

    const disadvantagePoints = currentDisadvantages.reduce((acc, name) => {
      const dis = Object.values(DISADVANTAGES).flat().find(d => d.name === name);
      return acc + (dis?.points || 0);
    }, 0);

    const race = Object.keys(STARTING_RANKS).find(key => formData.profession?.includes(key)) || '';
    const allAvailableSkills = [...GENERAL_SKILLS, ...(CLASS_SKILLS[race] || [])];

    const maxSkills = Math.floor(intel / 5) + 2 + disadvantagePoints;
    const innateCount = currentSkills.filter(s => {
      const skill = allAvailableSkills.find(gs => gs.name === s);
      return skill?.isInnate;
    }).length;

    return { maxSkills, currentCount: currentSkills.length, innateCount, maxInnate: 3, race, allAvailableSkills };
  };

  const skillLimits = getSkillLimits();

  const disadvantageLimits = React.useMemo(() => {
    const currentDisadvantages = formData.disadvantages === 'Brak' ? [] : formData.disadvantages?.split(', ').filter(Boolean) || [];
    return {
      currentCount: currentDisadvantages.length,
      maxDisadvantages: 3
    };
  }, [formData.disadvantages]);

  const toggleDisadvantage = (disName: string) => {
    const current = formData.disadvantages === 'Brak' ? [] : formData.disadvantages?.split(', ').filter(Boolean) || [];
    if (current.includes(disName)) {
      const updated = current.filter(d => d !== disName);
      setFormData(prev => ({ ...prev, disadvantages: updated.length > 0 ? updated.join(', ') : 'Brak' }));
    } else {
      if (disadvantageLimits.currentCount < disadvantageLimits.maxDisadvantages) {
        const updated = [...current, disName];
        setFormData(prev => ({ ...prev, disadvantages: updated.join(', ') }));
      }
    }
  };

  const checkSkillRequirements = (skill: any) => {
    const reqs = skill.requirements;
    if (!reqs || reqs === 'Brak' || reqs === '-' || reqs.toLowerCase() === 'brak') return { met: true, reasons: [] };

    const reasons: string[] = [];
    const currentSkills = formData.skills === 'Brak' ? [] : formData.skills?.split(', ').filter(Boolean) || [];

    const parts = reqs.split(',').map((p: string) => p.trim());

    parts.forEach((part: string) => {
      // 1. Stat requirements
      const statMatch = part.match(/(Siła|Szybkość|Zręczność|Wytrzymałość|Inteligencja|Psychika|Reiatsu|Kontrola Reiatsu)[\s:]*(\d+)/i);
      if (statMatch) {
        const statName = statMatch[1];
        const requiredValue = parseInt(statMatch[2]);
        const currentValue = attributes[statName as keyof typeof attributes] || 5;
        if (currentValue < requiredValue) {
          reasons.push(`${statName}: ${requiredValue} (masz ${currentValue})`);
        }
        return;
      }

      // 2. Comparisons
      if (part.includes('Reiatsu > Kontrola Reiatsu')) {
        if (!(attributes['Reiatsu'] > attributes['Kontrola Reiatsu'])) {
          reasons.push('Reiatsu > Kontrola Reiatsu');
        }
        return;
      }

      // 3. Race/Profession
      const lowerPart = part.toLowerCase();
      if (lowerPart.includes('rasa materialna')) {
        const materialRaces = ['człowiek', 'quincy', 'bounto', 'fullbringer'];
        if (!materialRaces.some(r => formData.profession?.toLowerCase().includes(r))) {
          reasons.push('Wymagana rasa materialna');
        }
        return;
      }
      if (lowerPart.includes('istota duchowa') || lowerPart.includes('istoty duchowe')) {
        const spiritualRaces = ['shinigami', 'hollow', 'dusza', 'kami'];
        if (!spiritualRaces.some(r => formData.profession?.toLowerCase().includes(r))) {
          reasons.push('Wymagana istota duchowa');
        }
        return;
      }
      if (part.includes('/')) {
        const allowedProfessions = part.split('/').map(p => p.trim().toLowerCase());
        if (!allowedProfessions.some(p => formData.profession?.toLowerCase().includes(p))) {
          reasons.push(`Wymagana profesja: ${part}`);
        }
        return;
      }

      // 4. Skill dependencies
      const specialKeywords = ['wrodzone', 'trening', 'opis w kp', 'próba chaosu', 'statystyki 70+', 'punkty z wiary', 'reiatsu z wiary', 'odpowiedni charakter', 'opis modyfikacji'];
      if (!specialKeywords.some(k => lowerPart.includes(k))) {
        const isSkill = skillLimits.allAvailableSkills.some(s => s.name.toLowerCase() === lowerPart);
        if (isSkill) {
          if (!currentSkills.some(s => s.toLowerCase() === lowerPart)) {
            reasons.push(`Wymagana um.: ${part}`);
          }
        }
      }
    });

    return { met: reasons.length === 0, reasons };
  };

  useEffect(() => {
    const mods = getRaceModifiers(formData.profession);
    const getEffectiveStat = (name: string) => Math.max(1, attributes[name as keyof typeof attributes] + mods.stats[name as keyof typeof mods.stats]);

    const statsString = ATTRIBUTE_NAMES.map(name => `${name}: ${getEffectiveStat(name)}`).join(', ');

    const sila = getEffectiveStat('Siła');
    const szybkosc = getEffectiveStat('Szybkość');
    const wytrzymalosc = getEffectiveStat('Wytrzymałość');
    const reiatsu = getEffectiveStat('Reiatsu');
    const kontrola = getEffectiveStat('Kontrola Reiatsu');

    const selectedSkills = formData.skills?.toLowerCase() || '';
    const hasSprinter = selectedSkills.includes('sprinter');
    const hasTwardziel = selectedSkills.includes('twardziel');
    const hasWulkan = selectedSkills.includes('wulkan reiatsu');

    const udzwig = Math.pow(sila, 2);

    let predkoscSr = szybkosc;
    let predkoscMax = szybkosc * 2 + 10;
    if (hasSprinter) {
      predkoscSr = szybkosc * 1.5;
      predkoscMax = szybkosc * 3 + 10;
    }

    let pz = wytrzymalosc * 10;
    if (hasTwardziel) {
      pz = wytrzymalosc * 12;
    }

    let prBase = Math.pow(0.75 * reiatsu + 0.25 * kontrola, 2);
    if (hasWulkan) {
      prBase = 1.3 * prBase;
    }
    const pr = Math.round(prBase);

    const generalStatsString = `Udźwig: ${udzwig}kg, Prędkość (śr.): ${predkoscSr}km/h, Prędkość (max.): ${predkoscMax}km/h, PŻ: ${pz}, PR: ${pr}`;

    setFormData(prev => ({
      ...prev,
      stats: statsString,
      general_stats: generalStatsString
    }));
  }, [attributes, formData.skills, formData.profession]);

  const kidoLimits = getKidoLimits();
  const raceMods = getRaceModifiers(formData.profession);
  const points = calculatePoints(raceMods);
  const isShinigamiRace = Object.keys(STARTING_RANKS).find(key => formData.profession?.includes(key)) === 'Shinigami' || formData.profession?.includes('Shinigami') || formData.profession?.includes('Uczeń akademii');

  return (
    <div className="space-y-8 glass-panel p-8 rounded-3xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Avatar, Cytat & Dane Podstawowe */}
        <div className="space-y-6">
          <div className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-zinc-800 bg-zinc-900/30 flex items-center justify-center">
            {formData.avatar_url ? (
              <img
                src={formData.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setShowAvatarPreview(true)}
              />
            ) : (
              <div className="text-zinc-600 text-center">
                <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                <p className="text-[10px] uppercase tracking-widest">Brak obrazu</p>
              </div>
            )}
            {/* Fullscreen lightbox - outside relative container so overlay doesn't block it */}
            {showAvatarPreview && formData.avatar_url && (
              <div
                className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
                onClick={() => setShowAvatarPreview(false)}
              >
                <div className="relative max-w-3xl max-h-full" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setShowAvatarPreview(false)}
                    className="absolute -top-10 right-0 text-white/70 hover:text-white text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
                  >
                    <X size={14} /> Zamknij
                  </button>
                  <img
                    src={formData.avatar_url}
                    alt="Avatar pełny rozmiar"
                    className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                  />
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
              {formData.avatar_url && (
                <button
                  onClick={() => setShowAvatarPreview(true)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 rounded-lg text-white/70 hover:text-white transition-colors"
                  title="Podgląd pełny"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                </button>
              )}
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-200 transition-colors">
                <Upload size={14} />
                Wgraj własny
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
              <button
                onClick={handleGenerateAvatar}
                disabled={isGenerating || !formData.appearance}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Generuj AI
              </button>
            </div>
          </div>

          <div className="space-y-4 border-t border-zinc-800/50 pt-4">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold border-b border-zinc-800 pb-2">Dane Podstawowe</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Imię</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Nazwisko</label>
                <input type="text" value={formData.surname} onChange={e => setFormData({ ...formData, surname: e.target.value })} className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Rasa / Typ</label>
              <select
                value={Object.keys(STARTING_RANKS).find(key => formData.profession?.includes(key)) || ''}
                onChange={e => {
                  const race = e.target.value;
                  setFormData({ ...formData, profession: STARTING_RANKS[race]?.[0] || '' });
                }}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-white transition-colors appearance-none"
              >
                <option value="">Wybierz...</option>
                {Object.keys(STARTING_RANKS).map(race => (
                  <option key={race} value={race}>{race}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Profesja / Ranga</label>
              {Object.keys(STARTING_RANKS).find(key => formData.profession?.includes(key)) === 'Shinigami' ? (
                <select
                  value={formData.profession}
                  onChange={e => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-white transition-colors appearance-none"
                >
                  {STARTING_RANKS['Shinigami'].map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.profession}
                  onChange={e => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-white transition-colors"
                  placeholder="np. Uczeń akademii Shinigami"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Płeć</label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-white transition-colors appearance-none"
                >
                  <option value="">Wybierz...</option>
                  <option value="Mężczyzna">Mężczyzna</option>
                  <option value="Kobieta">Kobieta</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Wiek</label>
                <input
                  type="number"
                  min={Object.keys(STARTING_RANKS).find(key => formData.profession?.includes(key)) === 'Kami' ? 0 : 13}
                  disabled={Object.keys(STARTING_RANKS).find(key => formData.profession?.includes(key)) === 'Kami'}
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-white transition-colors disabled:opacity-50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Waga (KG)</label>
                <input type="number" min="0" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm" placeholder="np. 75" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Wzrost (CM)</label>
                <input type="number" min="0" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm" placeholder="np. 180" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Pieniądze</label>
              <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2">
                <Coins size={14} className="text-emerald-500" />
                <span className="text-sm text-emerald-500 font-bold">{formData.money}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Form Fields */}
        <div className="lg:col-span-3 space-y-8">
          {/* Row 1: Atrybuty + Statystyki full width */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Atrybuty</h4>
                <div className="text-[10px] font-bold uppercase tracking-widest">
                  Punkty: <span className={points.remainingPoints < 0 ? 'text-red-500' : 'text-emerald-500'}>{points.remainingPoints}</span> / {points.totalPoints}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {ATTRIBUTE_NAMES.map(name => (
                  <div key={name} className="flex items-center justify-between bg-zinc-900/30 p-2 rounded-lg border border-zinc-800/50">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400">{name}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setAttributes(prev => ({ ...prev, [name]: Math.max(5, prev[name] - 1) }))}
                        className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-white"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-mono w-4 text-center">
                        <span className={raceMods.stats[name as keyof typeof raceMods.stats] !== 0 ? 'text-emerald-400' : ''}>
                          {Math.max(1, attributes[name] + raceMods.stats[name as keyof typeof raceMods.stats])}
                        </span>
                      </span>
                      <button
                        onClick={() => setAttributes(prev => ({ ...prev, [name]: prev[name] + 1 }))}
                        disabled={points.remainingPoints <= 0}
                        className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-white disabled:opacity-20"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold border-b border-zinc-800 pb-2">Statystyki Ogólne</h4>
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-zinc-500">Udźwig</span>
                  <span className="text-zinc-300">{Math.pow(Math.max(1, attributes['Siła'] + raceMods.stats['Siła']), 2)} kg</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-zinc-500">Prędkość (śr.)</span>
                  <span className="text-zinc-300">{Math.max(1, attributes['Szybkość'] + raceMods.stats['Szybkość'])} km/h</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-zinc-500">Prędkość (max.)</span>
                  <span className="text-zinc-300">{Math.max(1, attributes['Szybkość'] + raceMods.stats['Szybkość']) * 2 + 10} km/h</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-zinc-500 text-emerald-500/70">Punkty Życia (PŻ)</span>
                  <span className="text-emerald-400 font-bold">{Math.max(1, attributes['Wytrzymałość'] + raceMods.stats['Wytrzymałość']) * 10}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-zinc-500 text-blue-500/70">Punkty Reiatsu (PR)</span>
                  <span className="text-blue-400 font-bold">{Math.round(Math.pow(0.75 * Math.max(1, attributes['Reiatsu'] + raceMods.stats['Reiatsu']) + 0.25 * Math.max(1, attributes['Kontrola Reiatsu'] + raceMods.stats['Kontrola Reiatsu']), 2))}</span>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold border-b border-zinc-800 pb-2 mb-3">Charakter</h4>
                <textarea value={formData.personality} onChange={e => setFormData({ ...formData, personality: e.target.value })} className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-xs h-32" placeholder="Cechy charakteru, zachowanie..." />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold border-b border-zinc-800 pb-2">Wygląd & Historia</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Wygląd (Szczegółowy)</label>
                <textarea value={formData.appearance} onChange={e => setFormData({ ...formData, appearance: e.target.value })} className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-xs h-32 mb-2" />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[8px] uppercase tracking-widest text-zinc-600">Dodatkowe zdjęcia (Max 3)</label>
                    <span className="text-[8px] text-zinc-700">{(formData.appearance_images?.split('|||').filter(Boolean).length || 0)}/3</span>
                  </div>
                  <div className="flex gap-2">
                    {(formData.appearance_images?.split('|||').filter(Boolean) || []).map((url, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded border border-zinc-800 overflow-hidden group">
                        <img src={url} className="w-full h-full object-cover" />
                        <button
                          onClick={() => {
                            const images = formData.appearance_images?.split('|||').filter(Boolean) || [];
                            images.splice(idx, 1);
                            setFormData({ ...formData, appearance_images: images.join('|||') });
                          }}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {(formData.appearance_images?.split('|||').filter(Boolean).length || 0) < 3 && (
                      <label className="w-12 h-12 rounded border-2 border-dashed border-zinc-800 flex items-center justify-center cursor-pointer hover:border-zinc-600 transition-colors">
                        <Plus size={16} className="text-zinc-600" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const current = formData.appearance_images?.split('|||').filter(Boolean) || [];
                                setFormData({ ...formData, appearance_images: [...current, reader.result as string].join('|||') });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Historia</label>
                  <textarea value={formData.history} onChange={e => setFormData({ ...formData, history: e.target.value })} className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-xs h-[240px]" placeholder="Historia postaci..." />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="border border-zinc-800 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('wady')}
          className="w-full flex justify-between items-center px-4 py-3 bg-zinc-900/80 hover:bg-zinc-800/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Wady</span>
            {disadvantageLimits.currentCount > 0 && (
              <span className="px-2 py-0.5 bg-red-900/30 border border-red-800/40 text-red-300 rounded text-[9px]">
                {disadvantageLimits.currentCount}/{disadvantageLimits.maxDisadvantages} wybrane
              </span>
            )}
            {disadvantageLimits.currentCount === 0 && (
              <span className="text-[9px] text-zinc-600">Kliknij aby wybrać wady postaci</span>
            )}
          </div>
          <span className={`text-zinc-500 transition-transform duration-200 ${openSections.wady ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {openSections.wady && (
          <div className="p-4 bg-zinc-900/30 space-y-4 border-t border-zinc-800">
            <div className="flex flex-wrap gap-2">
              {formData.disadvantages?.split(', ').filter(Boolean).map(disName => {
                const dis = Object.values(DISADVANTAGES).flat().find(d => d.name === disName);
                return (
                  <div key={disName} className="group relative">
                    <span className="px-2 py-1 bg-red-900/20 border border-red-800/50 text-red-200 rounded text-[10px] flex items-center gap-2">
                      {disName}
                      <button
                        onClick={() => {
                          const current = formData.disadvantages?.split(', ').filter(d => d !== disName) || [];
                          setFormData({ ...formData, disadvantages: current.join(', ') || 'Brak' });
                        }}
                        className="hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                    {dis && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-900 border border-zinc-700 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        <p className="text-[10px] font-bold text-zinc-200 mb-1">{dis.name}</p>
                        <p className="text-[8px] text-zinc-400 leading-tight">{dis.description}</p>
                        <p className="text-[8px] text-zinc-500 mt-1 italic">Punkty: {dis.points}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              {['Ogólne', skillLimits.race].filter(Boolean).map(cat => {
                const disadvantagesInCat = DISADVANTAGES[cat as string] || [];
                if (disadvantagesInCat.length === 0) return null;

                return (
                  <div key={cat} className="space-y-2">
                    <p className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold border-l-2 border-zinc-800 pl-2">{cat}</p>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                      {disadvantagesInCat.map(dis => {
                        const currentDis = formData.disadvantages === 'Brak' ? [] : formData.disadvantages?.split(', ').filter(Boolean) || [];
                        const isSelected = currentDis.includes(dis.name);
                        const canAdd = disadvantageLimits.currentCount < disadvantageLimits.maxDisadvantages;

                        return (
                          <div key={dis.name} className="group relative">
                            <button
                              disabled={isSelected || !canAdd}
                              onClick={() => toggleDisadvantage(dis.name)}
                              className={cn(
                                "w-full text-left px-2 py-1.5 rounded text-[9px] transition-all border",
                                isSelected
                                  ? 'bg-zinc-800/50 border-zinc-700 text-zinc-500 cursor-default'
                                  : !canAdd
                                    ? 'bg-zinc-900/30 border-zinc-800/50 text-zinc-700 cursor-not-allowed'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                              )}
                            >
                              {dis.name}
                              <span className="ml-1 text-[7px] opacity-50">({dis.points} pkt)</span>
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 scale-95 group-hover:scale-100">
                              <div className="flex justify-between items-start mb-1.5">
                                <p className="text-[10px] font-bold text-white">{dis.name}</p>
                                <span className="text-[7px] bg-red-900/30 text-red-400 px-1 rounded border border-red-800/30">{dis.points} PKT</span>
                              </div>
                              <p className="text-[9px] text-zinc-400 leading-relaxed mb-2">{dis.description}</p>
                              {dis.requirements && (
                                <div className="pt-1.5 border-t border-zinc-800">
                                  <p className="text-[8px] text-zinc-500 uppercase tracking-tighter">Wymagania:</p>
                                  <p className="text-[8px] text-zinc-400">{dis.requirements}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <textarea
              value={formData.disadvantages}
              onChange={e => setFormData({ ...formData, disadvantages: e.target.value })}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-xs h-16"
              placeholder="Lub wpisz własne wady..."
            />
          </div>
        )}
      </div>

      <div className="border border-zinc-800 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('zdolnosci')}
          className="w-full flex justify-between items-center px-4 py-3 bg-zinc-900/80 hover:bg-zinc-800/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Zdolności &amp; Cechy</span>
            {skillLimits.currentCount > 0 && (
              <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-[9px]">
                {skillLimits.currentCount}/{skillLimits.maxSkills} umiejętności
              </span>
            )}
            {skillLimits.currentCount === 0 && (
              <span className="text-[9px] text-zinc-600">Kliknij aby wybrać zdolności</span>
            )}
          </div>
          <span className={`text-zinc-500 transition-transform duration-200 ${openSections.zdolnosci ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {openSections.zdolnosci && (
          <div className="p-4 bg-zinc-900/30 space-y-4 border-t border-zinc-800">
            {isShinigamiRace && (
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500">Techniki (Tylko Shinigami)</label>
                  <div className="text-[8px] uppercase tracking-widest text-zinc-600 space-x-4">
                    <span>Limit: {kidoLimits.currentCount}/{kidoLimits.countLimit}</span>
                    <span>Max Lvl: {kidoLimits.startingMax}</span>
                    <span>Int: {kidoLimits.intel}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.techniques?.split(', ').filter(Boolean).map(tech => (
                      <span key={tech} className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-[10px] flex items-center gap-2">
                        {tech}
                        <button
                          onClick={() => {
                            const current = formData.techniques?.split(', ').filter(t => t !== tech) || [];
                            setFormData({ ...formData, techniques: current.join(', ') || 'Brak' });
                          }}
                          className="text-zinc-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[8px] uppercase tracking-widest text-zinc-600 mb-1">Hadou</p>
                      <select
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] disabled:opacity-50"
                        disabled={kidoLimits.currentCount >= kidoLimits.countLimit}
                        onChange={e => {
                          if (!e.target.value) return;
                          const current = formData.techniques === 'Brak' ? [] : formData.techniques?.split(', ').filter(Boolean) || [];
                          if (!current.includes(e.target.value)) {
                            setFormData({ ...formData, techniques: [...current, e.target.value].join(', ') });
                          }
                          e.target.value = '';
                        }}
                      >
                        <option value="">Dodaj Hadou...</option>
                        {HADOU_LIST.map(h => (
                          <option
                            key={h.name}
                            value={h.name}
                            disabled={h.level > kidoLimits.startingMax || h.level > kidoLimits.maxLevel}
                          >
                            {h.name} (Lvl {h.level})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-widest text-zinc-600 mb-1">Bakudou</p>
                      <select
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] disabled:opacity-50"
                        disabled={kidoLimits.currentCount >= kidoLimits.countLimit}
                        onChange={e => {
                          if (!e.target.value) return;
                          const current = formData.techniques === 'Brak' ? [] : formData.techniques?.split(', ').filter(Boolean) || [];
                          if (!current.includes(e.target.value)) {
                            setFormData({ ...formData, techniques: [...current, e.target.value].join(', ') });
                          }
                          e.target.value = '';
                        }}
                      >
                        <option value="">Dodaj Bakudou...</option>
                        {BAKUDOU_LIST.map(b => (
                          <option
                            key={b.name}
                            value={b.name}
                            disabled={b.level > kidoLimits.startingMax || b.level > kidoLimits.maxLevel}
                          >
                            {b.name} (Lvl {b.level})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <textarea
                    value={formData.techniques}
                    onChange={e => setFormData({ ...formData, techniques: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-xs h-16"
                    placeholder="Możesz też wpisać ręcznie..."
                  />
                </div>
              </div>
            )}
            {kidoLimits.isQuincy && (
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500">Magia Ginto (Tylko Quincy)</label>
                  <div className="text-[8px] uppercase tracking-widest text-zinc-600 space-x-4">
                    <span>Limit: {kidoLimits.currentCount}/{kidoLimits.countLimit}</span>
                    <span>Int: {kidoLimits.intel}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.techniques?.split(', ').filter(Boolean).map(tech => (
                      <span key={tech} className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-[10px] flex items-center gap-2">
                        {tech}
                        <button
                          onClick={() => {
                            const current = formData.techniques?.split(', ').filter(t => t !== tech) || [];
                            setFormData({ ...formData, techniques: current.join(', ') || 'Brak' });
                          }}
                          className="text-zinc-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3, 4, 5].map(circle => {
                      const spellsInCircle = QUINCY_SPELLS.filter(s => s.circle === circle);
                      const currentTechs = formData.techniques?.split(', ').filter(Boolean) || [];

                      // Check if previous circle has at least one spell
                      const hasPrevCircle = circle === 1 || QUINCY_SPELLS.filter(s => s.circle === circle - 1).some(s => currentTechs.includes(s.name));

                      return (
                        <div key={circle}>
                          <p className="text-[8px] uppercase tracking-widest text-zinc-600 mb-1">Krąg {circle}</p>
                          <select
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] disabled:opacity-50"
                            disabled={kidoLimits.currentCount >= kidoLimits.countLimit || !hasPrevCircle}
                            onChange={e => {
                              if (!e.target.value) return;
                              const current = formData.techniques === 'Brak' ? [] : formData.techniques?.split(', ').filter(Boolean) || [];
                              if (!current.includes(e.target.value)) {
                                setFormData({ ...formData, techniques: [...current, e.target.value].join(', ') });
                              }
                              e.target.value = '';
                            }}
                          >
                            <option value="">Dodaj zaklęcie...</option>
                            {spellsInCircle.map(s => {
                              const reqMatch = s.requirements.match(/Kontrola:\s*(\d+),\s*Inteligencja:\s*(\d+)/i);
                              const reqControl = reqMatch ? parseInt(reqMatch[1]) : 0;
                              const reqInt = reqMatch ? parseInt(reqMatch[2]) : 0;
                              const currentControl = attributes['Kontrola Reiatsu'] || 5;
                              const currentInt = attributes['Inteligencja'] || 5;
                              const disabled = currentControl < reqControl || currentInt < reqInt;

                              return (
                                <option
                                  key={s.name}
                                  value={s.name}
                                  disabled={disabled}
                                >
                                  {s.name} {disabled ? `(Wym: K:${reqControl}, I:${reqInt})` : `(Koszt: ${s.cost})`}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                  <textarea
                    value={formData.techniques}
                    onChange={e => setFormData({ ...formData, techniques: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-xs h-16"
                    placeholder="Możesz też wpisać ręcznie..."
                  />
                </div>
              </div>
            )}

            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500">Zalety / Umiejętności</label>
                <div className="text-[8px] uppercase tracking-widest text-zinc-600 space-x-4">
                  <span>Limit: {skillLimits.currentCount}/{skillLimits.maxSkills}</span>
                  <span>Wrodzone: {skillLimits.innateCount}/{skillLimits.maxInnate}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.skills?.split(', ').filter(Boolean).map(skillName => {
                  const skill = skillLimits.allAvailableSkills.find(s => s.name === skillName);
                  return (
                    <div key={skillName} className="group relative">
                      <span className={`px-2 py-1 border rounded text-[10px] flex items-center gap-2 ${skill?.isInnate ? 'bg-amber-900/20 border-amber-800/50 text-amber-200' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}>
                        {skillName}
                        <button
                          onClick={() => {
                            const current = formData.skills?.split(', ').filter(s => s !== skillName) || [];
                            setFormData({ ...formData, skills: current.join(', ') || 'Brak' });
                          }}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                      {/* Tooltip for selected skills */}
                      {skill && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-900 border border-zinc-700 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                          <p className="text-[10px] font-bold text-zinc-200 mb-1">{skill.name}</p>
                          <p className="text-[8px] text-zinc-400 leading-tight">{skill.description}</p>
                          <p className="text-[8px] text-zinc-500 mt-1 italic">Wymagania: {skill.requirements}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4">
                {['Klasowe', 'Duchowe', 'Ogólne', 'Społeczne', 'Bojowe'].map(cat => {
                  const skillsInCat = skillLimits.allAvailableSkills.filter(s => s.category === cat);
                  if (skillsInCat.length === 0) return null;

                  return (
                    <div key={cat} className="space-y-2">
                      <p className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold border-l-2 border-zinc-800 pl-2">{cat}</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {skillsInCat.map(skill => {
                          const currentSkills = formData.skills === 'Brak' ? [] : formData.skills?.split(', ').filter(Boolean) || [];
                          const isSelected = currentSkills.includes(skill.name);
                          const reqCheck = checkSkillRequirements(skill);
                          const canAdd = skillLimits.currentCount < skillLimits.maxSkills &&
                            (!skill.isInnate || skillLimits.innateCount < skillLimits.maxInnate) &&
                            reqCheck.met;

                          return (
                            <div key={skill.name} className="group relative">
                              <button
                                disabled={isSelected || !canAdd}
                                onClick={() => {
                                  const current = formData.skills === 'Brak' ? [] : formData.skills?.split(', ').filter(Boolean) || [];
                                  if (!current.includes(skill.name)) {
                                    setFormData({ ...formData, skills: [...current, skill.name].join(', ') });
                                  }
                                }}
                                className={`w-full text-left px-2 py-1.5 rounded text-[9px] transition-all border ${isSelected
                                  ? 'bg-zinc-800/50 border-zinc-700 text-zinc-500 cursor-default'
                                  : !canAdd
                                    ? 'bg-zinc-900/30 border-zinc-800/50 text-zinc-700 cursor-not-allowed'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                                  }`}
                              >
                                {skill.name}
                                {skill.isInnate && <span className="ml-1 text-[7px] text-amber-500/70">★</span>}
                              </button>
                              {/* Tooltip for selection grid */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 scale-95 group-hover:scale-100">
                                <div className="flex justify-between items-start mb-1.5">
                                  <p className="text-[10px] font-bold text-white">{skill.name}</p>
                                  {skill.isInnate && <span className="text-[7px] bg-amber-900/30 text-amber-400 px-1 rounded border border-amber-800/30">WRODZONA</span>}
                                </div>
                                <p className="text-[9px] text-zinc-400 leading-relaxed mb-2">{skill.description}</p>
                                <div className="pt-1.5 border-t border-zinc-800">
                                  <p className="text-[8px] text-zinc-500 uppercase tracking-tighter">Wymagania:</p>
                                  <p className={`text-[8px] ${reqCheck.met ? 'text-zinc-400' : 'text-red-400 font-medium'}`}>
                                    {skill.requirements}
                                  </p>
                                  {!reqCheck.met && (
                                    <div className="mt-1 space-y-0.5">
                                      {reqCheck.reasons.map((reason, idx) => (
                                        <p key={idx} className="text-[7px] text-red-500/80 flex items-center gap-1">
                                          <span className="w-1 h-1 bg-red-500 rounded-full" />
                                          {reason}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <textarea
                value={formData.skills}
                onChange={e => setFormData({ ...formData, skills: e.target.value })}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-xs h-20"
                placeholder="Wybierz z listy lub wpisz własne..."
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
        <button onClick={onCancel} className="px-6 py-2 text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Anuluj</button>
        <button onClick={() => {
          if (formData.profession?.toLowerCase().includes('seireitei')) {
            const skills = formData.skills === 'Brak' ? [] : formData.skills?.split(', ').filter(Boolean) || [];
            if (!skills.includes('Z rodziny')) {
              alert("Dusza z Seireitei musi posiadać umiejętność 'Z rodziny'!");
              return;
            }
          }
          onSave(formData);
        }} className="px-8 py-2 bg-white text-black font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2">
          <Save size={16} />
          Zapisz Postać
        </button>
      </div>
    </div>
  );
};
// ─── SESSION BUILDER ─────────────────────────────────────────────────────────

type SNodeType = 'location' | 'gm' | 'player' | 'other_player';

interface SNode {
  id: string;
  type: SNodeType;
  // location fields
  locationName?: string;
  locationDescription?: string;
  // player / other_player fields
  playerName?: string;
  // shared content
  content: string;
}

function makeId() { return Math.random().toString(36).slice(2, 8); }

function nodesToText(nodes: SNode[], pcName: string): string {
  return nodes.map(n => {
    if (n.type === 'location') {
      return `=== MIEJSCE: ${n.locationName || 'Nieznane'} ===\n${n.locationDescription || ''}`;
    }
    if (n.type === 'gm') return `[MG]: ${n.content}`;
    if (n.type === 'player') return `[${pcName}]: ${n.content}`;
    if (n.type === 'other_player') return `[${n.playerName || 'Inny gracz'}]: ${n.content}`;
    return '';
  }).join('\n\n');
}

const NODE_COLORS: Record<SNodeType, string> = {
  location: 'border-amber-700/60 bg-amber-950/20',
  gm: 'border-blue-700/60 bg-blue-950/20',
  player: 'border-emerald-700/60 bg-emerald-950/20',
  other_player: 'border-violet-700/60 bg-violet-950/20',
};

const NODE_LABELS: Record<SNodeType, string> = {
  location: '📍 Miejsce',
  gm: '🎭 Post MG',
  player: '⚔️ Moja odpowiedź',
  other_player: '👤 Inny gracz',
};

const NODE_DOT: Record<SNodeType, string> = {
  location: 'bg-amber-500',
  gm: 'bg-blue-500',
  player: 'bg-emerald-500',
  other_player: 'bg-violet-500',
};

function SessionBuilder({
  pcName,
  onSave,
  onCancel,
  isSaving,
}: {
  pcName: string;
  onSave: (text: string, title: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [title, setTitle] = useState('');
  const [nodes, setNodes] = useState<SNode[]>([
    { id: makeId(), type: 'location', locationName: '', locationDescription: '', content: '' },
    { id: makeId(), type: 'gm', content: '' },
  ]);

  // Tracked active players in the session (name list)
  const [activePlayers, setActivePlayers] = useState<string[]>([]);
  // Inline "add player" input state
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');

  const update = (id: string, patch: Partial<SNode>) =>
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...patch } : n));

  const removeNode = (id: string) =>
    setNodes(prev => prev.filter(n => n.id !== id));

  const insertAfter = (idx: number, newNode: SNode) => {
    setNodes(prev => {
      const next = [...prev];
      next.splice(idx + 1, 0, newNode);
      return next;
    });
  };

  const handleConfirmAddPlayer = (idx: number) => {
    const name = newPlayerName.trim();
    if (!name) return;
    if (!activePlayers.includes(name)) {
      setActivePlayers(prev => [...prev, name]);
    }
    // Insert first post node for that player
    insertAfter(idx, { id: makeId(), type: 'other_player', playerName: name, content: '' });
    setNewPlayerName('');
    setAddingPlayer(false);
  };

  const removePlayer = (name: string) => {
    setActivePlayers(prev => prev.filter(p => p !== name));
  };

  // What actions are available after the last node
  const getActions = (idx: number) => {
    const node = nodes[idx];
    const isLast = idx === nodes.length - 1;
    if (!isLast) return null;

    const actions: { label: string; icon: string; onClick: () => void; variant?: string }[] = [];

    // Player's own response — always available
    actions.push({
      label: 'Moja odpowiedź',
      icon: '⚔️',
      onClick: () => insertAfter(idx, { id: makeId(), type: 'player', content: '' }),
    });
    // GM response — available when last node isn't already a gm post
    if (node.type !== 'gm') {
      actions.push({
        label: 'Odpowiedź MG',
        icon: '🎭',
        onClick: () => insertAfter(idx, { id: makeId(), type: 'gm', content: '' }),
      });
    }
    // Per-active-player buttons
    activePlayers.forEach(name => {
      actions.push({
        label: `Odpowiedź ${name}`,
        icon: '👤',
        onClick: () => insertAfter(idx, { id: makeId(), type: 'other_player', playerName: name, content: '' }),
        variant: 'violet',
      });
    });

    return actions;
  };

  const canSave = nodes.some(n => n.content.trim() || (n.type === 'location' && n.locationName?.trim()));

  const handleSave = () => {
    const text = nodesToText(nodes, pcName || 'Gracz');
    onSave(text, title);
  };

  const ta = (extra = '') =>
    `w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-zinc-600 transition-colors resize-none ${extra}`;

  return (
    <div className="space-y-3">
      {/* Title */}
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-600"
        placeholder="Tytuł sesji (opcjonalnie)"
      />

      {/* Tree */}
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-2 top-3 bottom-3 w-0.5 bg-zinc-800 rounded" />

        <div className="space-y-3">
          {nodes.map((node, idx) => {
            const actions = getActions(idx);
            return (
              <div key={node.id} className="relative">
                {/* Dot */}
                <div className={`absolute -left-5 top-3.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${NODE_DOT[node.type]}`} />

                {/* Card */}
                <div className={`border rounded-xl p-3 space-y-2 ${NODE_COLORS[node.type]}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
                      {NODE_LABELS[node.type]}
                    </span>
                    {/* Don't allow deleting if only 1 node left or first gm node */}
                    {nodes.length > 1 && !(idx === 0 && node.type === 'location') && (
                      <button
                        onClick={() => removeNode(node.id)}
                        className="text-zinc-700 hover:text-red-500 transition-colors"
                        title="Usuń"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </div>

                  {/* Location fields */}
                  {node.type === 'location' && (
                    <>
                      <input
                        value={node.locationName || ''}
                        onChange={e => update(node.id, { locationName: e.target.value })}
                        className={ta()}
                        placeholder="Nazwa miejsca (np. Akademia Shinigami)"
                      />
                      <textarea
                        value={node.locationDescription || ''}
                        onChange={e => update(node.id, { locationDescription: e.target.value })}
                        className={ta('h-12')}
                        placeholder="Opis miejsca (opcjonalnie)"
                      />
                    </>
                  )}

                  {/* Other player name — show from activePlayers, still editable */}
                  {node.type === 'other_player' && (
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-violet-400/70">👤</span>
                      <span className="text-xs text-violet-300 font-medium">{node.playerName || 'Nieznany gracz'}</span>
                    </div>
                  )}

                  {/* Content textarea (all except pure location) */}
                  {node.type !== 'location' && (
                    <textarea
                      value={node.content}
                      onChange={e => update(node.id, { content: e.target.value })}
                      className={ta('h-24')}
                      placeholder={
                        node.type === 'gm' ? 'Treść posta Mistrza Gry...' :
                          node.type === 'player' ? `Twoja odpowiedź jako ${pcName || 'Gracz'}...` :
                            `Odpowiedź gracza ${node.playerName || ''}...`
                      }
                    />
                  )}

                  {/* Action buttons after last node */}
                  {actions && (
                    <div className="space-y-2 pt-1 border-t border-zinc-800/50">
                      {/* Regular action buttons */}
                      <div className="flex flex-wrap gap-1.5">
                        {actions.map(a => (
                          <button
                            key={a.label}
                            onClick={a.onClick}
                            className={cn(
                              'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-widest transition-all',
                              a.variant === 'violet'
                                ? 'bg-violet-900/40 hover:bg-violet-800/50 border border-violet-700/60 hover:border-violet-600 text-violet-300 hover:text-violet-100'
                                : 'bg-zinc-800/70 hover:bg-zinc-700/70 border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200'
                            )}
                          >
                            <span>{a.icon}</span>
                            {a.label}
                          </button>
                        ))}
                        {/* Add new player button — opens inline input */}
                        {!addingPlayer && (
                          <button
                            onClick={() => setAddingPlayer(true)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800/70 hover:bg-zinc-700/70 border border-dashed border-zinc-600 hover:border-zinc-500 rounded-lg text-[9px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-all"
                          >
                            <Plus size={9} /> Nowy gracz
                          </button>
                        )}
                        {/* Zmień miejsce — always */}
                        <button
                          onClick={() => {
                            const lastIdx = nodes.length - 1;
                            insertAfter(lastIdx, { id: makeId(), type: 'location', locationName: '', locationDescription: '', content: '' });
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800/70 hover:bg-zinc-700/70 border border-zinc-700 hover:border-zinc-600 rounded-lg text-[9px] uppercase tracking-widest text-zinc-400 hover:text-zinc-200 transition-all"
                        >
                          <span>📍</span> Zmień miejsce
                        </button>
                      </div>

                      {/* Inline add player form */}
                      {addingPlayer && (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            autoFocus
                            value={newPlayerName}
                            onChange={e => setNewPlayerName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleConfirmAddPlayer(nodes.length - 1);
                              if (e.key === 'Escape') { setAddingPlayer(false); setNewPlayerName(''); }
                            }}
                            className="flex-1 bg-zinc-900 border border-violet-700/60 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-violet-500"
                            placeholder="Imię nowego gracza..."
                          />
                          <button
                            onClick={() => handleConfirmAddPlayer(nodes.length - 1)}
                            className="px-3 py-1.5 bg-violet-900/50 border border-violet-700 text-violet-300 hover:bg-violet-800/50 rounded-lg text-[9px] uppercase tracking-widest transition-all"
                          >
                            Dodaj
                          </button>
                          <button
                            onClick={() => { setAddingPlayer(false); setNewPlayerName(''); }}
                            className="text-zinc-600 hover:text-zinc-400 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}

                      {/* Active players chips */}
                      {activePlayers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          <span className="text-[8px] uppercase tracking-widest text-zinc-700 self-center">W sesji:</span>
                          {activePlayers.map(name => (
                            <span key={name} className="flex items-center gap-1 px-2 py-0.5 bg-violet-950/40 border border-violet-800/50 rounded-full text-[9px] text-violet-400">
                              {name}
                              <button
                                onClick={() => removePlayer(name)}
                                className="text-violet-600 hover:text-red-400 transition-colors ml-0.5"
                                title={`Usuń ${name} z sesji`}
                              >
                                <X size={8} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving || !canSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-zinc-200 disabled:opacity-40 transition-all"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {isSaving ? 'Zapisuję i podsumowuję...' : 'Zapisz sesję'}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 rounded-xl text-xs uppercase tracking-widest transition-all"
        >
          <X size={14} /> Anuluj
        </button>
      </div>
    </div>
  );
}

// ─── SESSION ITEM ─────────────────────────────────────────────────────────────

function SessionItem({ s, onDelete }: { s: Session; onDelete: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
      <div
        className="flex items-start gap-3 p-3 cursor-pointer"
        onClick={() => setExpanded(prev => !prev)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-bold text-zinc-300 truncate">{s.title || 'Sesja bez tytułu'}</p>
            <span className="text-[10px] text-zinc-600 shrink-0">{new Date(s.created_at).toLocaleDateString('pl-PL')}</span>
          </div>
          {s.summary ? (
            <p className={`text-[10px] text-zinc-500 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>{s.summary}</p>
          ) : (
            <p className="text-[10px] text-zinc-700 italic">Brak podsumowania</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ChevronDown size={13} className={`text-zinc-600 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          <button
            onClick={e => { e.stopPropagation(); onDelete(s.id); }}
            className="text-zinc-600 hover:text-red-500 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── GM ASSISTANT TAB ────────────────────────────────────────────────────────

function GMAssistantTab({ characters, onNPCSaved }: { characters: Character[]; onNPCSaved: () => void }) {
  const pc = characters.find(c => c.type === 'PC');
  const npcs = characters.filter(c => c.type === 'NPC');

  // --- Session History ---
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showAddSession, setShowAddSession] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [sessionsExpanded, setSessionsExpanded] = useState(false);

  // --- Main Assistant ---
  const [gmPost, setGmPost] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState('');

  // Generated response
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // NPC detection
  const [npcResult, setNpcResult] = useState<NPCDetectionResult | null>(null);
  // Track per-NPC acceptance: 'pending' | 'accepted' | 'rejected'
  const [newNpcStates, setNewNpcStates] = useState<Record<number, 'pending' | 'accepted' | 'rejected'>>({});
  const [updNpcStates, setUpdNpcStates] = useState<Record<number, 'pending' | 'accepted' | 'rejected'>>({});
  const [editingNewNpc, setEditingNewNpc] = useState<Record<number, Partial<DetectedNPC>>>({});

  const fetchSessions = useCallback(async () => {
    const res = await fetch('/api/sessions');
    if (res.ok) setSessions(await res.json());
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleAddSession = async (sessionText: string, sessionTitle: string) => {
    if (!sessionText.trim()) return;
    setIsSavingSession(true);
    setNpcResult(null);
    setNewNpcStates({});
    setUpdNpcStates({});
    setGeneratedResponse('');
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: sessionTitle.trim() || null, raw_text: sessionText }),
      });
      const { id } = await res.json();
      
      const [summary, detected] = await Promise.all([
        summarizeSession(sessionText),
        extractNPCsFromGMPost({
          gmPost: sessionText,
          knownNPCs: npcs.map(n => ({ id: n.id, name: n.name, appearance: n.appearance, personality: n.personality })),
          playerName: pc?.name || 'Gracz',
        })
      ]);

      await fetch(`/api/sessions/${id}/summary`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary }),
      });
      setShowAddSession(false);
      fetchSessions();

      setNpcResult(detected);
      
      const ns: Record<number, 'pending'> = {};
      detected.new_npcs.forEach((_, i) => { ns[i] = 'pending'; });
      setNewNpcStates(ns);
      
      const us: Record<number, 'pending'> = {};
      detected.updated_npcs.forEach((_, i) => { us[i] = 'pending'; });
      setUpdNpcStates(us);

    } finally {
      setIsSavingSession(false);
    }
  };

  const handleDeleteSession = async (id: number) => {
    if (!confirm('Usunąć tę sesję?')) return;
    await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
    fetchSessions();
  };

  const handleAnalyze = async () => {
    if (!gmPost.trim()) return;
    setIsAnalyzing(true);
    setNpcResult(null);
    setNewNpcStates({});
    setUpdNpcStates({});
    setGeneratedResponse('');
    try {
      // Fetch context (session summaries + recent full posts)
      setAnalyzeStatus('Pobieranie kontekstu sesji...');
      const ctxRes = await fetch('/api/sessions/context');
      const ctx = ctxRes.ok ? await ctxRes.json() : { summaries: [], recentFull: [] };

      setAnalyzeStatus('Generowanie odpowiedzi...');
      // Run response generation and NPC detection in parallel
      const [response, detected] = await Promise.all([
        pc ? generatePlayerResponse({
          gmPost,
          character: pc,
          sessionSummaries: ctx.summaries || [],
          recentPosts: ctx.recentFull || [],
          additionalInstructions: additionalInstructions.trim() || undefined,
        }) : Promise.resolve(''),
        extractNPCsFromGMPost({
          gmPost,
          knownNPCs: npcs.map(n => ({ id: n.id, name: n.name, appearance: n.appearance, personality: n.personality })),
          playerName: pc?.name || 'Gracz',
        }),
      ]);

      setGeneratedResponse(response);
      setNpcResult(detected);
      // init states
      const ns: Record<number, 'pending'> = {};
      detected.new_npcs.forEach((_, i) => { ns[i] = 'pending'; });
      setNewNpcStates(ns);
      const us: Record<number, 'pending'> = {};
      detected.updated_npcs.forEach((_, i) => { us[i] = 'pending'; });
      setUpdNpcStates(us);
    } finally {
      setIsAnalyzing(false);
      setAnalyzeStatus('');
    }
  };

  const handleRegenerate = async () => {
    if (!gmPost.trim() || !pc) return;
    setIsRegenerating(true);
    try {
      const ctxRes = await fetch('/api/sessions/context');
      const ctx = ctxRes.ok ? await ctxRes.json() : { summaries: [], recentFull: [] };
      const response = await generatePlayerResponse({
        gmPost,
        character: pc,
        sessionSummaries: ctx.summaries || [],
        recentPosts: ctx.recentFull || [],
        additionalInstructions: additionalInstructions.trim() || undefined,
      });
      setGeneratedResponse(response);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAcceptNewNPC = async (idx: number) => {
    const npc = editingNewNpc[idx] ? { ...npcResult!.new_npcs[idx], ...editingNewNpc[idx] } : npcResult!.new_npcs[idx];
    await fetch('/api/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: npc.name, surname: '', type: 'NPC',
        profession: npc.race_profession,
        appearance: npc.appearance,
        personality: npc.personality,
        avatar_url: '', quote: '', gender: '', age: '', weight: '', height: '',
        history: '', equipment: '', money: '', skills: '', disadvantages: '',
        stats: '', general_stats: '', techniques: '',
      }),
    });
    setNewNpcStates(s => ({ ...s, [idx]: 'accepted' }));
    onNPCSaved();
  };

  const handleAcceptUpdate = async (idx: number) => {
    const upd = npcResult!.updated_npcs[idx];
    const existing = npcs.find(n => n.id === upd.id);
    if (!existing) return;
    
    // Add date formatting
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`;
    
    // Append to existing history
    let newHistory = existing.history || "Brak historii.";
    const separator = newHistory.endsWith("\n") || !newHistory ? "" : "\n\n";
    newHistory += `${separator}--- Notatka z Sesji (${dateStr}) ---\n${upd.reason}`;

    await fetch(`/api/characters/${upd.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...existing, 
        ...upd.changes,
        history: newHistory,
      }),
    });
    setUpdNpcStates(s => ({ ...s, [idx]: 'accepted' }));
    onNPCSaved();
  };

  const inputCls = "w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-colors resize-none";
  const btnPrimary = "flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-zinc-200 disabled:opacity-40 transition-all";
  const btnGhost = "flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 rounded-xl text-xs uppercase tracking-widest transition-all";

  const hasNPCs = npcResult && (npcResult.new_npcs.length > 0 || npcResult.updated_npcs.length > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-5xl font-display italic uppercase tracking-tighter">Asystent MG</h2>
        <p className="text-zinc-500 uppercase tracking-[0.2em] text-xs mt-2">Automatyczna analiza postów i wykrywanie NPC</p>
      </div>

      {/* ── SESSION HISTORY ── */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-6 py-4 text-left"
          onClick={() => setSessionsExpanded(v => !v)}
        >
          <div className="flex items-center gap-3">
            <BookOpen size={16} className="text-zinc-400" />
            <span className="text-xs uppercase tracking-widest font-bold text-zinc-300">Historia Sesji</span>
            <span className="text-[10px] text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">{sessions.length}</span>
          </div>
          {sessionsExpanded ? <ChevronUp size={14} className="text-zinc-600" /> : <ChevronDown size={14} className="text-zinc-600" />}
        </button>

        {sessionsExpanded && (
          <div className="px-6 pb-6 space-y-4 border-t border-zinc-800/50">
            <div className="pt-4">
              {!showAddSession ? (
                <button onClick={() => setShowAddSession(true)} className={btnGhost}>
                  <Plus size={14} /> Dodaj sesję
                </button>
              ) : (
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <SessionBuilder
                    pcName={pc?.name || 'Gracz'}
                    onSave={handleAddSession}
                    onCancel={() => setShowAddSession(false)}
                    isSaving={isSavingSession}
                  />
                </div>
              )}
            </div>

            {sessions.length === 0 ? (
              <p className="text-xs text-zinc-700 italic">Brak zapisanych sesji. Dodaj pierwszą, aby bot mógł uczyć się Twojego stylu lpisania.</p>
            ) : (
              <div className="space-y-2">
                {sessions.map(s => (
                  <SessionItem key={s.id} s={s} onDelete={handleDeleteSession} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MAIN ASSISTANT PANEL ── */}
      <div className="space-y-4">
        {/* GM Post Input */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold flex items-center gap-2">
            <MessageSquare size={14} /> Wiadomość od MG
          </h3>
          <textarea
            value={gmPost}
            onChange={e => setGmPost(e.target.value)}
            className={cn(inputCls, 'h-44')}
            placeholder="Wklej tutaj post od Mistrza Gry (czysty tekst)..."
          />
          <div className="space-y-2">
            <textarea
              value={additionalInstructions}
              onChange={e => setAdditionalInstructions(e.target.value)}
              className={cn(inputCls, 'h-16 text-xs')}
              placeholder="Dodatkowe wskazówki (opcjonalnie) — np. 'Iowoi atakuje, jest spokojny', 'skup się na myślach'..."
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !gmPost.trim()}
            className={cn(btnPrimary, 'w-full justify-center py-3')}
          >
            {isAnalyzing
              ? <><Loader2 size={16} className="animate-spin" />{analyzeStatus || 'Analizuję...'}</>
              : <><Bot size={16} />Analizuj post MG</>}
          </button>
          {!pc && (
            <p className="text-[10px] text-amber-500/70 flex items-center gap-1">
              <AlertCircle size={11} /> Stwórz najpierw swój PC, żeby bot generował odpowiedzi w jego imieniu.
            </p>
          )}
        </div>

        {/* Results */}
        {(generatedResponse || hasNPCs) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── LEFT: NPC Detection ── */}
            {hasNPCs && (
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold flex items-center gap-2">
                  <Users size={14} /> Wykryci NPC
                </h3>

                {/* New NPCs */}
                {npcResult!.new_npcs.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-widest text-zinc-600 border-b border-zinc-800 pb-1">Nowi NPC</p>
                    {npcResult!.new_npcs.map((npc, idx) => {
                      const st = newNpcStates[idx] ?? 'pending';
                      const edited = editingNewNpc[idx] ?? {};
                      const current = { ...npc, ...edited };
                      return (
                        <div key={idx} className={cn(
                          'p-4 rounded-xl border space-y-3 transition-all',
                          st === 'accepted' ? 'border-emerald-800/50 bg-emerald-950/20'
                            : st === 'rejected' ? 'border-zinc-800/30 bg-zinc-900/20 opacity-40'
                              : 'border-zinc-700 bg-zinc-900/50'
                        )}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-bold text-zinc-200">{current.name}</p>
                              <p className="text-[10px] text-zinc-500">{current.race_profession}</p>
                            </div>
                            {st === 'accepted' && (
                              <span className="text-[9px] text-emerald-400 flex items-center gap-1">
                                <Check size={10} /> Dodano
                              </span>
                            )}
                          </div>

                          {st === 'pending' && (
                            <>
                              <div className="space-y-2">
                                <textarea
                                  value={current.appearance}
                                  onChange={e => setEditingNewNpc(prev => ({ ...prev, [idx]: { ...prev[idx], appearance: e.target.value } }))}
                                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-[10px] h-16 focus:outline-none focus:border-zinc-600 resize-none"
                                  placeholder="Wygląd..."
                                />
                                <textarea
                                  value={current.personality}
                                  onChange={e => setEditingNewNpc(prev => ({ ...prev, [idx]: { ...prev[idx], personality: e.target.value } }))}
                                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-[10px] h-20 focus:outline-none focus:border-zinc-600 resize-none"
                                  placeholder="Osobowość / relacja z graczem..."
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAcceptNewNPC(idx)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-900/50 border border-emerald-700 text-emerald-300 hover:bg-emerald-800/50 rounded-lg text-[9px] uppercase tracking-widest transition-all"
                                >
                                  <Check size={10} /> Dodaj NPC
                                </button>
                                <button
                                  onClick={() => setNewNpcStates(s => ({ ...s, [idx]: 'rejected' }))}
                                  className="flex items-center gap-1 px-3 py-1.5 border border-zinc-700 text-zinc-500 hover:text-red-400 hover:border-red-800 rounded-lg text-[9px] uppercase tracking-widest transition-all"
                                >
                                  <X size={10} /> Odrzuć
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Updated NPCs */}
                {npcResult!.updated_npcs.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-widest text-zinc-600 border-b border-zinc-800 pb-1">Aktualizacje NPC</p>
                    {npcResult!.updated_npcs.map((upd, idx) => {
                      const st = updNpcStates[idx] ?? 'pending';
                      return (
                        <div key={idx} className={cn(
                          'p-4 rounded-xl border space-y-2 transition-all',
                          st === 'accepted' ? 'border-emerald-800/50 bg-emerald-950/20'
                            : st === 'rejected' ? 'border-zinc-800/30 opacity-40'
                              : 'border-zinc-700 bg-zinc-900/50'
                        )}>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-zinc-200">{upd.name}</p>
                            {st === 'accepted' && (
                              <span className="text-[9px] text-emerald-400 flex items-center gap-1">
                                <Check size={10} /> Zaktualizowano
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-amber-400/80 italic leading-relaxed">{upd.reason}</p>
                          {Object.entries(upd.changes).map(([field, val]) => (
                            <div key={field} className="bg-zinc-800/30 rounded p-2">
                              <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">{field}</p>
                              <p className="text-[10px] text-zinc-400 leading-relaxed">{val as string}</p>
                            </div>
                          ))}
                          {st === 'pending' && (
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleAcceptUpdate(idx)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-900/50 border border-emerald-700 text-emerald-300 hover:bg-emerald-800/50 rounded-lg text-[9px] uppercase tracking-widest transition-all"
                              >
                                <Check size={10} /> Zatwierdź
                              </button>
                              <button
                                onClick={() => setUpdNpcStates(s => ({ ...s, [idx]: 'rejected' }))}
                                className="flex items-center gap-1 px-3 py-1.5 border border-zinc-700 text-zinc-500 hover:text-red-400 hover:border-red-800 rounded-lg text-[9px] uppercase tracking-widest transition-all"
                              >
                                <X size={10} /> Odrzuć
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── RIGHT: Generated Response ── */}
            {generatedResponse && (
              <div className={cn('glass-panel p-6 rounded-2xl space-y-4', !hasNPCs && 'lg:col-span-2')}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold flex items-center gap-2">
                    <FileText size={14} /> Wygenerowany odpis (BBCode)
                  </h3>
                  <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className={btnGhost}
                  >
                    {isRegenerating
                      ? <Loader2 size={12} className="animate-spin" />
                      : <RefreshCw size={12} />}
                    Regeneruj
                  </button>
                </div>

                <textarea
                  value={generatedResponse}
                  onChange={e => setGeneratedResponse(e.target.value)}
                  className={cn(inputCls, 'h-80 font-mono text-xs leading-relaxed')}
                />

                <div className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-800 space-y-1">
                  <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-2">Podgląd formatowania</p>
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    {generatedResponse.split('\n').map((line, i) => {
                      // Simple BBCode preview: bold, italic
                      const rendered = line
                        .replace(/\[b\](.*?)\[\/b\]/g, '<strong>$1</strong>')
                        .replace(/\[i\](.*?)\[\/i\]/g, '<em>$1</em>');
                      return <p key={i} dangerouslySetInnerHTML={{ __html: rendered || '&nbsp;' }} />;
                    })}
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(generatedResponse);
                    alert('Skopiowano do schowka!');
                  }}
                  className={cn(btnGhost, 'w-full justify-center')}
                >
                  <ScrollText size={13} /> Kopiuj do schowka
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!generatedResponse && !hasNPCs && !isAnalyzing && gmPost && (
          <div className="text-center py-12 text-zinc-700">
            <Bot size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-xs uppercase tracking-widest">Kliknij "Analizuj" aby uruchomić asystenta</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LOCATIONS TAB ─────────────────────────────────────────────────────────

function LocationForm({
  location,
  onSave,
  onCancel,
}: {
  location?: Partial<Location>;
  onSave: (l: Partial<Location>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Location>>(
    location || { name: '', description: '', notes: '', avatar_url: '' }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const taCls = "w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none placeholder:text-zinc-600";
  const inCls = "w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-600";

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
        <h2 className="text-2xl font-display italic tracking-tight text-white">
          {location ? 'Edytuj Miejsce' : 'Nowe Miejsce'}
        </h2>
        <button onClick={onCancel} className="text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 ml-1">Nazwa</label>
          <input name="name" value={formData.name || ''} onChange={handleChange} className={inCls} required />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 ml-1">URL Obrazka / Mapy</label>
          <input name="avatar_url" value={formData.avatar_url || ''} onChange={handleChange} className={inCls} placeholder="https://..." />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-amber-500/70 font-bold mb-2 ml-1 flex items-center gap-2"><MapPin size={12} /> Opis / Wygląd</label>
          <textarea name="description" value={formData.description || ''} onChange={handleChange} className={cn(taCls, "h-32 leading-relaxed")} />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-amber-500/70 font-bold mb-2 ml-1 flex items-center gap-2"><BookOpen size={12} /> Notatki MG / Gracza</label>
          <textarea name="notes" value={formData.notes || ''} onChange={handleChange} className={cn(taCls, "h-32 text-zinc-400")} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/50">
        <button onClick={onCancel} className="px-6 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-800/50 rounded-xl text-xs uppercase tracking-widest font-bold transition-all">Anuluj</button>
        <button onClick={() => onSave(formData)} disabled={!formData.name} className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-amber-500 disabled:opacity-50 transition-all">
          <Save size={16} /> Zapisz
        </button>
      </div>
    </div>
  );
}

function LocationsTab({ locations, onSave, onDelete }: { locations: Location[], onSave: (l: Partial<Location>) => void, onDelete: (id: number) => void }) {
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);

  if (editingId) {
    const loc = editingId === 'new' ? undefined : locations.find(l => l.id === editingId);
    return (
      <div className="flex justify-center py-8">
        <LocationForm
          location={loc}
          onSave={(data) => { onSave(data); setEditingId(null); }}
          onCancel={() => setEditingId(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-5xl font-display italic uppercase tracking-tighter text-white">Miejsca</h2>
          <p className="text-amber-500/70 uppercase tracking-[0.2em] text-xs mt-2 font-bold flex items-center gap-2">
            <MapPin size={14} /> Odwiedzone lokacje
          </p>
        </div>
        <button onClick={() => setEditingId('new')} className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-amber-500 transition-all shadow-[0_0_20px_rgba(217,119,6,0.2)]">
          <Plus size={16} /> Dodaj miejsce
        </button>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-24 glass-panel rounded-2xl border-dashed border-zinc-800">
          <MapPin size={48} className="mx-auto text-zinc-800 mb-4" />
          <p className="text-zinc-500 uppercase tracking-widest text-sm">Brak odwiedzonych miejsc</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map(loc => (
            <div key={loc.id} className="glass-panel rounded-2xl overflow-hidden group hover:border-amber-500/30 transition-colors flex flex-col h-full">
              {loc.avatar_url && (
                <div className="h-48 w-full overflow-hidden relative border-b border-zinc-800/50">
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10" />
                  <img src={loc.avatar_url} alt={loc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-xl font-display italic text-amber-500">{loc.name}</h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingId(loc.id)} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => { if (confirm('Usunąć?')) onDelete(loc.id); }} className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                {loc.description && (
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-3 flex-1">{loc.description}</p>
                )}
                {loc.notes && (
                  <div className="mt-auto pt-4 border-t border-zinc-800/50">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Notatki</p>
                    <p className="text-xs text-zinc-500 line-clamp-2">{loc.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ENCOUNTERED PLAYERS TAB ───────────────────────────────────────────────

function EncounteredPlayerForm({
  player,
  onSave,
  onCancel,
}: {
  player?: Partial<EncounteredPlayer>;
  onSave: (p: Partial<EncounteredPlayer>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<EncounteredPlayer>>(
    player || { name: '', character_name: '', description: '', relationship: '', notes: '', avatar_url: '' }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const taCls = "w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none placeholder:text-zinc-600";
  const inCls = "w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600";

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
        <h2 className="text-2xl font-display italic tracking-tight text-white">
          {player ? 'Edytuj Gracza' : 'Nowy Napotkany Gracz'}
        </h2>
        <button onClick={onCancel} className="text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 ml-1">Nazwa Gracza / Serwera</label>
          <input name="name" value={formData.name || ''} onChange={handleChange} className={inCls} required />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 ml-1">Imię Postaci</label>
          <input name="character_name" value={formData.character_name || ''} onChange={handleChange} className={inCls} />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 ml-1">Relacja / Nastawienie</label>
          <input name="relationship" value={formData.relationship || ''} onChange={handleChange} className={inCls} placeholder="np. Przyjaciel, Wróg, Neutralny..." />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 ml-1">URL Awatara</label>
          <input name="avatar_url" value={formData.avatar_url || ''} onChange={handleChange} className={inCls} />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] uppercase tracking-widest text-violet-400 font-bold mb-2 ml-1 flex items-center gap-2"><User size={12} /> Opis Postaci</label>
          <textarea name="description" value={formData.description || ''} onChange={handleChange} className={cn(taCls, "h-24 leading-relaxed")} />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] uppercase tracking-widest text-violet-400 font-bold mb-2 ml-1 flex items-center gap-2"><BookOpen size={12} /> Notatki z sesji</label>
          <textarea name="notes" value={formData.notes || ''} onChange={handleChange} className={cn(taCls, "h-32 text-zinc-400")} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/50">
        <button onClick={onCancel} className="px-6 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-800/50 rounded-xl text-xs uppercase tracking-widest font-bold transition-all">Anuluj</button>
        <button onClick={() => onSave(formData)} disabled={!formData.name} className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-violet-500 disabled:opacity-50 transition-all">
          <Save size={16} /> Zapisz
        </button>
      </div>
    </div>
  );
}

function EncounteredPlayersTab({ players, onSave, onDelete }: { players: EncounteredPlayer[], onSave: (p: Partial<EncounteredPlayer>) => void, onDelete: (id: number) => void }) {
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);

  if (editingId) {
    const pl = editingId === 'new' ? undefined : players.find(p => p.id === editingId);
    return (
      <div className="flex justify-center py-8">
        <EncounteredPlayerForm
          player={pl}
          onSave={(data) => { onSave(data); setEditingId(null); }}
          onCancel={() => setEditingId(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-5xl font-display italic uppercase tracking-tighter text-white">Napotkani Gracze</h2>
          <p className="text-violet-400 uppercase tracking-[0.2em] text-xs mt-2 font-bold flex items-center gap-2">
            <Users2 size={14} /> Inne postacie ze świata
          </p>
        </div>
        <button onClick={() => setEditingId('new')} className="flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-violet-500 transition-all shadow-[0_0_20px_rgba(124,58,237,0.2)]">
          <Plus size={16} /> Dodaj gracza
        </button>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-24 glass-panel rounded-2xl border-dashed border-zinc-800">
          <Users2 size={48} className="mx-auto text-zinc-800 mb-4" />
          <p className="text-zinc-500 uppercase tracking-widest text-sm">Brak zapisanych graczy</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map(pl => (
            <div key={pl.id} className="glass-panel rounded-2xl overflow-hidden group hover:border-violet-500/30 transition-colors flex flex-col h-full">
              {pl.avatar_url && (
                <div className="h-48 w-full overflow-hidden relative border-b border-zinc-800/50">
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
                  <img src={pl.avatar_url} alt={pl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 object-top" />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col relative z-20 -mt-2">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div>
                    <h3 className="text-xl font-display italic text-violet-400">{pl.character_name || 'Nieznana postać'}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">Gracz: {pl.name}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950/50 p-1 rounded-xl backdrop-blur-sm border border-zinc-800/50">
                    <button onClick={() => setEditingId(pl.id)} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"><Edit2 size={12} /></button>
                    <button onClick={() => { if (confirm('Usunąć?')) onDelete(pl.id); }} className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"><Trash2 size={12} /></button>
                  </div>
                </div>

                {pl.relationship && (
                  <div className="mt-3 inline-block px-2.5 py-1 bg-violet-950/50 border border-violet-900/50 rounded-lg text-[9px] uppercase tracking-widest text-violet-300 w-fit">
                    Relacja: {pl.relationship}
                  </div>
                )}

                {pl.description && (
                  <p className="text-xs text-zinc-400 leading-relaxed mt-4 line-clamp-2">{pl.description}</p>
                )}

                {pl.notes && (
                  <div className="mt-auto pt-4 border-t border-zinc-800/50">
                    <p className="text-[10px] uppercase tracking-widest text-violet-500/70 font-bold mb-1">Notatki z sesji</p>
                    <p className="text-xs text-zinc-500 line-clamp-3">{pl.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'PC' | 'NPC' | 'POSTS' | 'ASSISTANT' | 'LOCATIONS' | 'PLAYERS'>('PC');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [encounteredPlayers, setEncounteredPlayers] = useState<EncounteredPlayer[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stat History Modal
  const [isAddStatModalOpen, setIsAddStatModalOpen] = useState(false);
  const [selectedCharacterForStat, setSelectedCharacterForStat] = useState<Character | null>(null);
  const [statHistories, setStatHistories] = useState<Record<number, StatHistory[]>>({});

  // Post Helper State
  const [gmPost, setGmPost] = useState('');
  const [playerIntent, setPlayerIntent] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [mangaPanel, setMangaPanel] = useState('');
  const [isGeneratingManga, setIsGeneratingManga] = useState(false);
  const [generatingAvatarForId, setGeneratingAvatarForId] = useState<number | null>(null);

  const handleGenerateNPCAvatar = async (char: Character) => {
    setGeneratingAvatarForId(char.id);
    try {
      const race = Object.keys(STARTING_RANKS).find(key => char.profession?.includes(key)) || '';
      const additionalImages = char.appearance_images?.split('|||').filter(Boolean) || [];

      const url = await generateCharacterAvatar(
        char.appearance || "Tajemnicza postać z zaświatów",
        undefined,
        race,
        char.profession,
        char.age,
        char.weight,
        char.height,
        additionalImages,
        char.personality,
        char.name,
        char.gender,
      );

      if (url) {
        // Save the generated avatar to the character
        const updatedChar = { ...char, avatar_url: url };
        await fetch(`/api/characters/${char.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedChar)
        });

        // Update local state smoothly
        setCharacters(prev => prev.map(c => c.id === char.id ? updatedChar : c));
      }
    } catch (e: any) {
      console.error("Error generating NPC avatar:", e);
      if (e.message && (e.message.includes("quota") || e.message.includes("429") || e.message.includes("RESOURCE_EXHAUSTED"))) {
        alert("Wyczerpano próbki/darmowy limit zapytań do AI. Spróbuj powtórzyć generowanie obrazu później.");
      } else {
        alert(`Błąd generowania awatara: ${e.message || "Sprawdź konsolę po więcej szczegółów"}`);
      }
    } finally {
      setGeneratingAvatarForId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const charRes = await fetch('/api/characters');
      const postsRes = await fetch('/api/posts');
      const locRes = await fetch('/api/locations');
      const plRes = await fetch('/api/encountered-players');

      const chars = await charRes.json();
      setCharacters(chars);
      setPosts(await postsRes.json());
      setLocations(await locRes.json());
      setEncounteredPlayers(await plRes.json());

      // Load stat history for PCs immediately
      for (const c of chars) {
        if (c.type === 'PC') {
          fetchStatHistory(c.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSaveLocation = async (loc: Partial<Location>) => {
    try {
      if (loc.id) {
        await fetch(`/api/locations/${loc.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loc) });
      } else {
        await fetch('/api/locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loc) });
      }
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteLocation = async (id: number) => {
    try {
      await fetch(`/api/locations/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleSavePlayer = async (pl: Partial<EncounteredPlayer>) => {
    try {
      if (pl.id) {
        await fetch(`/api/encountered-players/${pl.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pl) });
      } else {
        await fetch('/api/encountered-players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pl) });
      }
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDeletePlayer = async (id: number) => {
    try {
      await fetch(`/api/encountered-players/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const fetchStatHistory = async (id: number) => {
    try {
      const response = await fetch(`/api/characters/${id}/stat_history`);
      if (response.ok) {
        const data = await response.json();
        setStatHistories(prev => ({ ...prev, [id]: data }));
      }
    } catch (e) {
      console.error("Błąd ładowania historii:", e);
    }
  };

  const undoStatHistory = async (charId: number, logId: number) => {
    if (!confirm('Czy na pewno chcesz cofnąć to dodanie statystyki? Statystyki postaci zostaną zmniejszone o dodaną wartość.')) {
      return;
    }

    try {
      const response = await fetch(`/api/characters/${charId}/stat_history/${logId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        // Refresh everything
        fetchData();
      } else {
        alert("Wystąpił błąd podczas proporcjonalnego cofania statystyki");
      }
    } catch (e) {
      console.error("Błąd cofania statystyki:", e);
    }
  };

  const handleSaveCharacter = async (formData: Partial<Character>) => {
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `/api/characters/${formData.id}` : '/api/characters';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    setIsEditing(false);
    setSelectedCharacter(null);
    fetchData();
  };

  const handleDeleteCharacter = async (id: number) => {
    if (!confirm('Czy na pewno chcesz usunąć tę postać?')) return;
    await fetch(`/api/characters/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleUpdateStats = async (char: Character, updates: Partial<Character>) => {
    setCharacters(prev => prev.map(c => c.id === char.id ? { ...c, ...updates } : c));
    await fetch(`/api/characters/${char.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...char, ...updates })
    });
  };

  const handleGeneratePost = async () => {
    const pc = characters.find(c => c.type === 'PC');
    if (!pc) {
      alert('Najpierw stwórz swoją postać (PC)!');
      return;
    }
    setIsGeneratingPost(true);
    try {
      const text = await getPostAssistance(gmPost, `${pc.name}: ${pc.personality}. Skills: ${pc.skills}`, playerIntent);
      setGeneratedPost(text || '');
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const handleGenerateManga = async () => {
    if (!generatedPost) return;
    setIsGeneratingManga(true);
    try {
      const pc = characters.find(c => c.type === 'PC');
      const npcs = characters.filter(c => c.type === 'NPC').map(n => n.appearance);
      const url = await generateMangaPanel(generatedPost, [pc?.appearance || '', ...npcs]);
      if (url) setMangaPanel(url);
    } finally {
      setIsGeneratingManga(false);
    }
  };

  const handleSavePost = async () => {
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gm_post: gmPost,
        player_post: generatedPost,
        manga_panel_url: mangaPanel
      })
    });
    setGmPost('');
    setPlayerIntent('');
    setGeneratedPost('');
    setMangaPanel('');
    fetchData();
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#050505]">

      {/* Overlay na mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Hamburger button na mobile */}
      <button
        className="fixed top-4 left-4 z-30 md:hidden bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white"
        onClick={() => setSidebarOpen(prev => !prev)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {sidebarOpen
            ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
          }
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`
      fixed md:sticky top-0 h-screen z-30
      w-64 border-r border-zinc-900 p-6 flex flex-col gap-8
      bg-[#050505] transition-transform duration-300
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0
    `}>
        <div className="flex flex-col gap-1">
          <h1 className="bleach-title text-white">Bleach Iowoi</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold">Chronicles</p>
        </div>

        <nav className="flex flex-col gap-2">
          <SidebarItem
            icon={User}
            label="Moja Postać"
            active={activeTab === 'PC'}
            onClick={() => { setActiveTab('PC'); setIsEditing(false); setSidebarOpen(false); }}
          />
          <SidebarItem
            icon={Users}
            label="Spotkani NPC"
            active={activeTab === 'NPC'}
            onClick={() => { setActiveTab('NPC'); setIsEditing(false); setSidebarOpen(false); }}
          />
          <SidebarItem
            icon={MapPin}
            label="Miejsca"
            active={activeTab === 'LOCATIONS'}
            onClick={() => { setActiveTab('LOCATIONS'); setIsEditing(false); setSidebarOpen(false); }}
          />
          <SidebarItem
            icon={Users2}
            label="Napotkani Gracze"
            active={activeTab === 'PLAYERS'}
            onClick={() => { setActiveTab('PLAYERS'); setIsEditing(false); setSidebarOpen(false); }}
          />
          <SidebarItem
            icon={MessageSquare}
            label="Przygoda"
            active={activeTab === 'POSTS'}
            onClick={() => { setActiveTab('POSTS'); setIsEditing(false); setSidebarOpen(false); }}
          />
          <SidebarItem
            icon={Bot}
            label="Asystent MG"
            active={activeTab === 'ASSISTANT'}
            onClick={() => { setActiveTab('ASSISTANT'); setIsEditing(false); setSidebarOpen(false); }}
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-900">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Sword size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Status</p>
              <p className="text-xs font-bold truncate">Gotowy do walki</p>
            </div>
          </div>
        </div>
      </aside>

      { /* Main Content */}
      <main className="flex-1 p-6 md:p-12 max-w-6xl mx-auto pt-16 md:pt-12">
        <AnimatePresence mode="wait">
          {activeTab === 'PC' && (
            <motion.div
              key="pc"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-5xl font-display italic uppercase tracking-tighter">Karta Postaci</h2>
                  <p className="text-zinc-500 uppercase tracking-[0.2em] text-xs mt-2">Zarządzaj swoim bohaterem</p>
                </div>
                {!isEditing && characters.filter(c => c.type === 'PC').length === 0 && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all"
                  >
                    <Plus size={18} />
                    Stwórz Postać
                  </button>
                )}
              </div>

              {isEditing ? (
                <CharacterForm
                  character={selectedCharacter || undefined}
                  onSave={handleSaveCharacter}
                  onCancel={() => { setIsEditing(false); setSelectedCharacter(null); }}
                />
              ) : (
                <div className="space-y-6">
                  {characters.filter(c => c.type === 'PC').map(char => (
                    <div key={char.id} className="glass-panel rounded-3xl overflow-hidden flex flex-col md:flex-row">
                      <div className="w-full md:w-80 shrink-0 relative">
                        <ImageCarousel
                          images={[char.avatar_url, ...(char.appearance_images?.split('|||').filter(Boolean) || [])].filter(Boolean) as string[]}
                          title={`${char.name} ${char.surname}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                        <div className="absolute bottom-6 left-6 right-6">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold mb-1">{char.profession || 'Shinigami'}</p>
                          <h3 className="text-3xl font-display italic uppercase leading-none">{char.name} {char.surname}</h3>
                          {char.quote && <p className="text-[10px] italic text-zinc-500 mt-2 line-clamp-2">"{char.quote}"</p>}
                        </div>
                      </div>
                      <div className="flex-1 p-8 space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-zinc-800/50">
                          <div>
                            <p className="text-[8px] uppercase tracking-widest text-zinc-600">Płeć</p>
                            <p className="text-xs font-bold">{char.gender || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[8px] uppercase tracking-widest text-zinc-600">Wiek</p>
                            <p className="text-xs font-bold">{char.age || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[8px] uppercase tracking-widest text-zinc-600">Wzrost</p>
                            <p className="text-xs font-bold">{char.height || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[8px] uppercase tracking-widest text-zinc-600">Waga</p>
                            <p className="text-xs font-bold">{char.weight || '-'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <div>
                              <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                                <Zap size={12} /> Atrybuty
                              </h4>
                              <p className="text-xs font-mono text-zinc-400 whitespace-pre-wrap">{char.stats}</p>
                            </div>
                            <div>
                              <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                                <Sparkles size={12} /> Statystyki Ogólne
                              </h4>
                              <div className="space-y-3">
                                <p className="text-[10px] font-mono text-zinc-500 whitespace-pre-wrap leading-relaxed mb-4">{char.general_stats}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                                <Shield size={12} /> Zalety
                              </h4>
                              <p className="text-xs text-zinc-300 leading-relaxed">{char.skills}</p>
                            </div>
                            <div>
                              <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                                <Skull size={12} /> Wady
                              </h4>
                              <p className="text-xs text-zinc-300 leading-relaxed">{char.disadvantages}</p>
                            </div>

                            {/* Derived Stats Bars (Moved here) */}
                            {(() => {
                              const pzMatch = char.general_stats?.match(/PŻ:\s*(\d+)/i);
                              const prMatch = char.general_stats?.match(/PR:\s*(\d+)/i);
                              if (!pzMatch && !prMatch) return null;

                              const maxHp = pzMatch ? parseInt(pzMatch[1]) : 1;
                              const maxPr = prMatch ? parseInt(prMatch[1]) : 1;
                              const currentHp = char.current_hp ?? maxHp;
                              const currentPr = char.current_pr ?? maxPr;

                              return (
                                <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                                  {pzMatch && (
                                    <StatBar
                                      label="Punkty Życia (PŻ)"
                                      current={currentHp} max={maxHp}
                                      color="bg-emerald-500"
                                      onChange={(val) => handleUpdateStats(char, { current_hp: val })}
                                    />
                                  )}
                                  {prMatch && (
                                    <StatBar
                                      label="Punkty Reiatsu (PR)"
                                      current={currentPr} max={maxPr}
                                      color="bg-blue-500"
                                      onChange={(val) => handleUpdateStats(char, { current_pr: val })}
                                    />
                                  )}
                                </div>
                              );
                            })()}

                          </div>
                          <div className="space-y-6">
                            <div>
                              <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                                <Sword size={12} /> Techniki
                              </h4>
                              <p className="text-xs text-zinc-300 leading-relaxed">{char.techniques}</p>
                            </div>
                            <div>
                              <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                                <Coins size={12} /> Majątek & Ekwipunek
                              </h4>
                              <p className="text-xs text-zinc-300 leading-relaxed">
                                <span className="text-zinc-500">Fundusze:</span> {char.money || 'Brak'}<br />
                                <span className="text-zinc-500">Sprzęt:</span> {char.equipment || 'Brak'}
                              </p>
                            </div>
                            <div>
                              <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                                <ScrollText size={12} /> Historia Postaci
                              </h4>
                              <div className="max-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                                <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{char.history}</p>
                              </div>
                            </div>

                            {/* Stat History Display */}
                            {statHistories[char.id] && statHistories[char.id].length > 0 && (
                              <div className="pt-6 border-t border-zinc-800/50 mt-auto">
                                <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                                  <Clock size={12} /> Historia Rozwoju
                                </h4>
                                <div className="space-y-2 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                                  {statHistories[char.id].map(log => (
                                    <div key={log.id} className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-[10px] shrink-0 relative group">
                                      <div className="flex justify-between items-start mb-1 pr-6">
                                        <span className="font-bold text-emerald-400">+{log.amount} {log.stat_name}</span>
                                        <span className="text-zinc-600">{new Date(log.created_at).toLocaleDateString()}</span>
                                      </div>
                                      {log.comment && <p className="text-zinc-400 italic pr-6 truncate" title={log.comment}>"{log.comment}"</p>}
                                      <button
                                        onClick={() => undoStatHistory(char.id, log.id)}
                                        className="absolute right-2 top-2 text-red-800 hover:text-red-400 opacity-40 hover:opacity-100 hover:text-red-400 transition-opacity"
                                        title="Cofnij tę zmianę (odejmie punkty i zaktualizuje HP/PR)"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-6 border-t border-zinc-800/50">
                          <div>
                            <button
                              onClick={() => { setSelectedCharacterForStat(char); setIsAddStatModalOpen(true); }}
                              className="text-xs uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors font-bold"
                            >
                              Rozwój Postaci
                            </button>
                          </div>
                          <div className="flex justify-end gap-4">
                            <button
                              onClick={() => { setSelectedCharacter(char); setIsEditing(true); }}
                              className="text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                            >
                              Edytuj
                            </button>
                            <button
                              onClick={() => handleDeleteCharacter(char.id)}
                              className="text-xs uppercase tracking-widest text-red-900 hover:text-red-500 transition-colors"
                            >
                              Usuń
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isAddStatModalOpen && selectedCharacterForStat && (
                    <AddStatModal
                      characterId={selectedCharacterForStat.id}
                      onClose={() => { setIsAddStatModalOpen(false); setSelectedCharacterForStat(null); }}
                      onSuccess={() => {
                        setIsAddStatModalOpen(false);
                        setSelectedCharacterForStat(null);
                        fetchData(); // Refresh character to get new stats
                        fetchStatHistory(selectedCharacterForStat.id);
                      }}
                    />
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'NPC' && (
            <motion.div
              key="npc"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-5xl font-display italic uppercase tracking-tighter">Spotkani NPC</h2>
                  <p className="text-zinc-500 uppercase tracking-[0.2em] text-xs mt-2">Postacie prowadzone przez MG</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all"
                  >
                    <Plus size={18} />
                    Dodaj NPC
                  </button>
                )}
              </div>

              {isEditing ? (
                <SimplifiedNPCForm
                  initialCharacter={selectedCharacter || undefined}
                  playerName={characters.find(c => c.type === 'PC')?.name || 'Gracz'}
                  onSave={handleSaveCharacter}
                  onCancel={() => { setIsEditing(false); setSelectedCharacter(null); }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {characters.filter(c => c.type === 'NPC').map(char => (
                    <div key={char.id} className="glass-panel rounded-2xl overflow-hidden group">
                      <div className="flex h-48">
                        <div className="w-48 shrink-0 relative">
                          <ImageCarousel
                            images={[char.avatar_url, ...(char.appearance_images?.split('|||').filter(Boolean) || [])].filter(Boolean) as string[]}
                            title={char.name}
                          />
                        </div>
                        <div className="flex-1 p-6 relative">
                          <h3 className="text-xl font-display italic uppercase mb-1">{char.name}</h3>
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">NPC / Sojusznik lub Wróg</p>
                          <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">{char.appearance}</p>
                          <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedCharacter(char); setIsEditing(true); }} className="text-zinc-500 hover:text-white"><Plus size={16} /></button>
                            <button onClick={() => handleDeleteCharacter(char.id)} className="text-red-900 hover:text-red-500"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'LOCATIONS' && (
            <motion.div
              key="locations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LocationsTab
                locations={locations}
                onSave={handleSaveLocation}
                onDelete={handleDeleteLocation}
              />
            </motion.div>
          )}

          {activeTab === 'PLAYERS' && (
            <motion.div
              key="players"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EncounteredPlayersTab
                players={encounteredPlayers}
                onSave={handleSavePlayer}
                onDelete={handleDeletePlayer}
              />
            </motion.div>
          )}

          {activeTab === 'POSTS' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-5xl font-display italic uppercase tracking-tighter">Dziennik Przygód</h2>
                  <p className="text-zinc-500 uppercase tracking-[0.2em] text-xs mt-2">Pomoc w odpisach i generowanie mangi</p>
                </div>
              </div>

              {/* Post Helper Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold">1. Wklej post MG</h3>
                    <textarea
                      value={gmPost}
                      onChange={e => setGmPost(e.target.value)}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 h-40 focus:outline-none focus:border-white transition-colors text-sm"
                      placeholder="Wklej tutaj treść posta od Mistrza Gry..."
                    />
                  </div>
                  <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold">2. Co chcesz zrobić?</h3>
                    <textarea
                      value={playerIntent}
                      onChange={e => setPlayerIntent(e.target.value)}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 h-24 focus:outline-none focus:border-white transition-colors text-sm"
                      placeholder="Opisz krótko swój zamiar (np. 'Atakuję Getsuga Tensho i krzyczę...')"
                    />
                    <button
                      onClick={handleGeneratePost}
                      disabled={isGeneratingPost || !gmPost || !playerIntent}
                      className="w-full py-3 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-zinc-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {isGeneratingPost ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      Generuj Odpis
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="glass-panel p-6 rounded-2xl space-y-4 min-h-[400px] flex flex-col">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold">3. Twój Odpis</h3>
                    {generatedPost ? (
                      <div className="flex-1 space-y-4">
                        <div className="prose prose-invert prose-sm max-w-none text-zinc-300 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
                          <ReactMarkdown>{generatedPost}</ReactMarkdown>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={handleGenerateManga}
                            disabled={isGeneratingManga}
                            className="flex-1 py-3 border border-zinc-700 text-zinc-400 hover:text-white hover:border-white rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                          >
                            {isGeneratingManga ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                            Generuj Panel Mangi
                          </button>
                          <button
                            onClick={handleSavePost}
                            className="px-6 py-3 bg-zinc-100 text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-white transition-all"
                          >
                            Zapisz w Dzienniku
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-zinc-700 border-2 border-dashed border-zinc-800 rounded-xl">
                        <p className="text-xs uppercase tracking-widest">Oczekiwanie na generację...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Manga Panel Preview */}
              {mangaPanel && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel p-8 rounded-3xl space-y-6"
                >
                  <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold text-center">Wygenerowany Panel Mangi</h3>
                  <div className="relative group">
                    <img src={mangaPanel} alt="Manga Panel" className="w-full rounded-2xl shadow-2xl manga-border" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-display italic text-2xl uppercase tracking-widest">Bankai!</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* History Section */}
              <div className="space-y-8 pt-12 border-t border-zinc-900">
                <h3 className="text-2xl font-display italic uppercase">Historia Przygody</h3>
                <div className="space-y-12">
                  {posts.map(post => (
                    <div key={post.id} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                      <div className="lg:col-span-2 space-y-4">
                        <div className="p-4 bg-zinc-900/30 rounded-xl border-l-2 border-zinc-700">
                          <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Post MG</p>
                          <p className="text-xs text-zinc-400 italic line-clamp-2">{post.gm_post}</p>
                        </div>
                        <div className="p-6 glass-panel rounded-2xl">
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Twój Odpis</p>
                          <div className="prose prose-invert prose-sm max-w-none text-zinc-300">
                            <ReactMarkdown>{post.player_post}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {post.manga_panel_url && (
                          <img src={post.manga_panel_url} alt="Panel" className="w-full rounded-xl manga-border shadow-xl" />
                        )}
                        <p className="text-[10px] uppercase tracking-widest text-zinc-700 text-right">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'ASSISTANT' && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <GMAssistantTab
                characters={characters}
                onNPCSaved={fetchData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
