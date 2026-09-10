import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Color, FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState, type ReactNode } from 'react';
import { metniHtmlYap } from './zenginMetinYardimci';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const YAZI_TIPLERI = [
  { etiket: 'Varsayılan', deger: '' },
  { etiket: 'Arial', deger: 'Arial, sans-serif' },
  { etiket: 'Georgia', deger: 'Georgia, serif' },
  { etiket: 'Times New Roman', deger: '"Times New Roman", serif' },
  { etiket: 'Verdana', deger: 'Verdana, sans-serif' },
  { etiket: 'Courier New', deger: '"Courier New", monospace' },
];

const YAZI_BOYUTLARI = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

const VURGU_RENKLERI = ['#FFF3A3', '#B9F3C4', '#BEE3FF', '#FFD1DC', '#E3D1FF'];
const YAZI_RENKLERI = [
  '#1A1A1A', '#B3261E', '#C9962B', '#1F5C56', '#1E5AA8', '#5E35B1',
];

// --- Ikon seti (feather-tarzi, dis bagimlilik olmadan cizilmis) ---
const Ikon = {
  geriAl: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a5 5 0 0 1 0 10h-2M3 10l4-4M3 10l4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  ileriAl: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10H11a5 5 0 0 0 0 10h2M21 10l-4-4M21 10l-4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  kalin: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h7a4.5 4.5 0 0 1 3.3 7.6A5 5 0 0 1 14 21H6zm3.2 3.1v4.1H13a2 2 0 0 0 0-4.1zm0 6.8v4.9h4.2a2.4 2.4 0 0 0 0-4.9z"/></svg>),
  italik: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="10" y1="4" x2="18" y2="4" strokeLinecap="round"/><line x1="6" y1="20" x2="14" y2="20" strokeLinecap="round"/><line x1="14" y1="4" x2="10" y2="20" strokeLinecap="round"/></svg>),
  altiCizili: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4v6a6 6 0 0 0 12 0V4" strokeLinecap="round"/><line x1="4" y1="20" x2="20" y2="20" strokeLinecap="round"/></svg>),
  ustuCizili: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 12h12M8 6.5c0-1.4 1.8-2.5 4-2.5s4 1.1 4 2.5M8 17.5c0 1.4 1.8 2.5 4 2.5s4-1.1 4-2.5" strokeLinecap="round"/></svg>),
  solaHiza: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round"/><line x1="4" y1="12" x2="14" y2="12" strokeLinecap="round"/><line x1="4" y1="18" x2="17" y2="18" strokeLinecap="round"/></svg>),
  ortaHiza: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round"/><line x1="7" y1="12" x2="17" y2="12" strokeLinecap="round"/><line x1="5.5" y1="18" x2="18.5" y2="18" strokeLinecap="round"/></svg>),
  sagaHiza: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round"/><line x1="10" y1="12" x2="20" y2="12" strokeLinecap="round"/><line x1="7" y1="18" x2="20" y2="18" strokeLinecap="round"/></svg>),
  iki_yanaYasla: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round"/><line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round"/><line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round"/></svg>),
  maddeListe: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="5" cy="18" r="1.4" fill="currentColor" stroke="none"/><line x1="10" y1="6" x2="20" y2="6" strokeLinecap="round"/><line x1="10" y1="12" x2="20" y2="12" strokeLinecap="round"/><line x1="10" y1="18" x2="20" y2="18" strokeLinecap="round"/></svg>),
  numarali: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><text x="1.5" y="8" fontSize="7" fill="currentColor" stroke="none">1</text><text x="1.5" y="14.5" fontSize="7" fill="currentColor" stroke="none">2</text><text x="1.5" y="21" fontSize="7" fill="currentColor" stroke="none">3</text><line x1="10" y1="6" x2="20" y2="6" strokeLinecap="round"/><line x1="10" y1="12" x2="20" y2="12" strokeLinecap="round"/><line x1="10" y1="18" x2="20" y2="18" strokeLinecap="round"/></svg>),
  alinti: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M7 6c-2.5 1.4-4 3.6-4 6.3 0 2.4 1.5 4 3.4 4 1.7 0 3-1.3 3-3s-1.2-2.8-2.7-2.8c-.2 0-.4 0-.6.1.3-1.7 1.5-3.2 3-4zm10 0c-2.5 1.4-4 3.6-4 6.3 0 2.4 1.5 4 3.4 4 1.7 0 3-1.3 3-3s-1.2-2.8-2.7-2.8c-.2 0-.4 0-.6.1.3-1.7 1.5-3.2 3-4z"/></svg>),
  baglanti: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 15l6-6M10 6l1-1a3.5 3.5 0 0 1 5 5l-1 1M14 18l-1 1a3.5 3.5 0 0 1-5-5l1-1" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  baglantiKaldir: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 15l6-6M10 6l1-1a3.5 3.5 0 0 1 5 5l-1 1M14 18l-1 1a3.5 3.5 0 0 1-5-5l1-1" strokeLinecap="round" strokeLinejoin="round"/><line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="2"/></svg>),
  temizle: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 4H8L3 9l7 7" strokeLinecap="round" strokeLinejoin="round"/><line x1="10" y1="20" x2="21" y2="20" strokeLinecap="round"/><line x1="14" y1="9" x2="21" y2="16" strokeLinecap="round"/></svg>),
};

function AracButonu({
  onClick,
  aktif,
  baslik,
  devreDisi,
  children,
}: {
  onClick: () => void;
  aktif?: boolean;
  baslik: string;
  devreDisi?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={aktif ? 'aktif' : ''}
      onClick={onClick}
      title={baslik}
      disabled={devreDisi}
      onMouseDown={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}

function RenkSecici({
  renkler,
  onSec,
  baslik,
  ikon,
}: {
  renkler: string[];
  onSec: (renk: string) => void;
  baslik: string;
  ikon: ReactNode;
}) {
  const [acik, setAcik] = useState(false);
  const [sarmalayici, setSarmalayici] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!acik || !sarmalayici) return;
    const kapat = (e: MouseEvent) => {
      if (!sarmalayici.contains(e.target as Node)) setAcik(false);
    };
    document.addEventListener('mousedown', kapat);
    return () => document.removeEventListener('mousedown', kapat);
  }, [acik, sarmalayici]);

  return (
    <div className="zengin-metin-renk-secici" ref={setSarmalayici}>
      <button
        type="button"
        title={baslik}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setAcik((v) => !v)}
      >
        {ikon}
      </button>
      {acik && (
        <div className="zengin-metin-renk-panel">
          {renkler.map((renk) => (
            <button
              key={renk}
              type="button"
              className="zengin-metin-renk-ornek"
              style={{ background: renk }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSec(renk);
                setAcik(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ZenginMetinEditor({ value, onChange, placeholder, disabled }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder ?? 'Metni buraya yazın...' }),
    ],
    content: metniHtmlYap(value),
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    const mevcutHtml = editor.getHTML();
    const yeniHtml = metniHtmlYap(value);
    if (yeniHtml !== mevcutHtml && (yeniHtml || mevcutHtml !== '<p></p>')) {
      editor.commands.setContent(yeniHtml, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  // Toolbar buton durumlarini (aktif/pasif) her secim/imlec degisiminde
  // guncellemek icin - TipTap'in kendi transaction'lari React render'i
  // otomatik tetiklemiyor.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const yenile = () => setTick((t) => t + 1);
    editor.on('selectionUpdate', yenile);
    editor.on('transaction', yenile);
    return () => {
      editor.off('selectionUpdate', yenile);
      editor.off('transaction', yenile);
    };
  }, [editor]);

  if (!editor) return null;

  const blokTuru = editor.isActive('heading', { level: 1 })
    ? 'h1'
    : editor.isActive('heading', { level: 2 })
      ? 'h2'
      : editor.isActive('heading', { level: 3 })
        ? 'h3'
        : 'p';

  const setBlokTuru = (tur: string) => {
    if (tur === 'p') editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level: Number(tur.slice(1)) as 1 | 2 | 3 }).run();
  };

  const baglantiEkle = () => {
    const mevcutUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Bağlantı adresi (URL):', mevcutUrl ?? 'https://');
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  return (
    <div className={`zengin-metin${disabled ? ' devre-disi' : ''}`}>
      {!disabled && (
        <div className="zengin-metin-arac-cubugu">
          <AracButonu
            baslik="Geri Al"
            onClick={() => editor.chain().focus().undo().run()}
            devreDisi={!editor.can().undo()}
          >
            <Ikon.geriAl />
          </AracButonu>
          <AracButonu
            baslik="Yinele"
            onClick={() => editor.chain().focus().redo().run()}
            devreDisi={!editor.can().redo()}
          >
            <Ikon.ileriAl />
          </AracButonu>

          <span className="zengin-metin-ayirac" />

          <select
            title="Paragraf Stili"
            className="zengin-metin-blok-secim"
            value={blokTuru}
            onChange={(e) => setBlokTuru(e.target.value)}
          >
            <option value="p">Normal Metin</option>
            <option value="h1">Başlık 1</option>
            <option value="h2">Başlık 2</option>
            <option value="h3">Başlık 3</option>
          </select>

          <select
            title="Yazı Tipi"
            defaultValue=""
            onChange={(e) => {
              const deger = e.target.value;
              if (deger) editor.chain().focus().setFontFamily(deger).run();
              else editor.chain().focus().unsetFontFamily().run();
              e.target.value = '';
            }}
          >
            <option value="" disabled>Yazı Tipi</option>
            {YAZI_TIPLERI.map((yt) => (
              <option key={yt.etiket} value={yt.deger}>{yt.etiket}</option>
            ))}
          </select>

          <select
            title="Yazı Boyutu"
            defaultValue=""
            onChange={(e) => {
              const deger = e.target.value;
              if (deger) editor.chain().focus().setFontSize(deger).run();
              else editor.chain().focus().unsetFontSize().run();
              e.target.value = '';
            }}
          >
            <option value="" disabled>Boyut</option>
            {YAZI_BOYUTLARI.map((boyut) => (
              <option key={boyut} value={boyut}>{boyut.replace('px', '')}</option>
            ))}
          </select>

          <span className="zengin-metin-ayirac" />

          <AracButonu baslik="Kalın (Ctrl+B)" aktif={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Ikon.kalin />
          </AracButonu>
          <AracButonu baslik="İtalik (Ctrl+I)" aktif={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Ikon.italik />
          </AracButonu>
          <AracButonu baslik="Altı Çizili (Ctrl+U)" aktif={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <Ikon.altiCizili />
          </AracButonu>
          <AracButonu baslik="Üstü Çizili" aktif={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Ikon.ustuCizili />
          </AracButonu>

          <RenkSecici
            baslik="Yazı Rengi"
            renkler={YAZI_RENKLERI}
            ikon={<span className="zengin-metin-renk-ikon" style={{ color: editor.getAttributes('textStyle').color || 'currentColor' }}>A</span>}
            onSec={(renk) => editor.chain().focus().setColor(renk).run()}
          />
          <RenkSecici
            baslik="Vurgu Rengi"
            renkler={VURGU_RENKLERI}
            ikon={
              <span
                className="zengin-metin-renk-ikon zengin-metin-renk-ikon--vurgu"
                style={{ background: editor.getAttributes('highlight').color || 'transparent' }}
              />
            }
            onSec={(renk) => editor.chain().focus().setHighlight({ color: renk }).run()}
          />

          <span className="zengin-metin-ayirac" />

          <AracButonu baslik="Sola Hizala" aktif={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
            <Ikon.solaHiza />
          </AracButonu>
          <AracButonu baslik="Ortala" aktif={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
            <Ikon.ortaHiza />
          </AracButonu>
          <AracButonu baslik="Sağa Hizala" aktif={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
            <Ikon.sagaHiza />
          </AracButonu>
          <AracButonu baslik="İki Yana Yasla" aktif={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
            <Ikon.iki_yanaYasla />
          </AracButonu>

          <span className="zengin-metin-ayirac" />

          <AracButonu baslik="Madde İşaretli Liste" aktif={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <Ikon.maddeListe />
          </AracButonu>
          <AracButonu baslik="Numaralı Liste" aktif={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <Ikon.numarali />
          </AracButonu>
          <AracButonu baslik="Alıntı" aktif={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Ikon.alinti />
          </AracButonu>

          <span className="zengin-metin-ayirac" />

          <AracButonu baslik="Bağlantı Ekle" aktif={editor.isActive('link')} onClick={baglantiEkle}>
            <Ikon.baglanti />
          </AracButonu>
          {editor.isActive('link') && (
            <AracButonu baslik="Bağlantıyı Kaldır" onClick={() => editor.chain().focus().unsetLink().run()}>
              <Ikon.baglantiKaldir />
            </AracButonu>
          )}

          <span className="zengin-metin-ayirac" />

          <AracButonu
            baslik="Biçimlendirmeyi Temizle"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          >
            <Ikon.temizle />
          </AracButonu>
        </div>
      )}
      <EditorContent editor={editor} className="zengin-metin-icerik" />
    </div>
  );
}

export default ZenginMetinEditor;
