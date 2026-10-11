/* Indonesian (ID) translations for lesson prose.
   Keyed by lesson id. Anything left out falls back to the English text in lessons.js.
   Playground source code (html/css/js) stays as-is so it matches the editable source. */
window.UX_LESSONS_ID = {
/* ───────────── PEMULA ───────────── */
hierarchy: {
title:'Hierarki Visual', metaphor:'Rak supermarket',
parable:`Coba deh perhatiin rak supermarket. Merek yang bayar paling mahal dipajang sejajar mata. Tulisan DISKON merah gede jadi hal pertama yang kamu lihat. Kaleng berdebu? Nangkring di rak paling bawah. Nggak ada orang yang baca semua label satu-satu. Mata langsung loncat ke yang paling gede, paling terang, dan paling dekat. Layar juga kerjanya persis kayak gitu.`,
theory:[`Ukuran dan ketebalan itu tanda penting: yang lebih gede dan tebal bakal dibaca duluan.`,`Contrast dan warna narik perhatian mata. Jadi simpan warna paling mencolok buat satu hal yang paling penting aja.`,`Posisi juga ngaruh. Orang biasanya scan dari kiri atas dulu (pola F dan Z).`,`Usahain tiap tampilan punya satu titik fokus yang jelas. Kalau semuanya teriak, ujung-ujungnya nggak ada yang kedengeran.`],
controls:[{label:'Ukuran judul'},{label:'Warna harga',options:['Redup','Amber']},{label:'Button',options:['Ghost','Solid']}],
bad:'Semuanya "volumenya" sama, jadi mata bingung mau berhenti di mana.',
good:'Ada satu titik fokus (nama produk), terus harga, baru aksinya.',
figma:[`Bikin text style berdasarkan perannya (Display, Title, Body, Caption) di panel kanan lewat Text → Style (+).`,`Coba tes "melek-merem": kasih Layer blur sekitar 6–8 ke frame, terus lihat apa yang masih nonjol.`,`Kasih fill warna cuma ke aksi utama. Button sekunder cukup jadi variant outline atau ghost.`],
quiz:[
 {q:`Kamu blur layar sampai buram banget. Apa yang harusnya masih kelihatan nonjol?`,options:[`Semua elemen, rata aja`,`Satu hal yang harus diperhatiin atau dilakuin user`,`Link di footer`],why:`layar yang di-blur bakal nunjukin hierarchy yang sebenarnya. Titik fokus utama harus tetap kelihatan.`},
 {q:`Mana yang BUKAN alat buat bikin hierarchy?`,options:[`Ukuran`,`Contrast`,`Posisi`,`Jumlah font yang di-load`],why:`ukuran, contrast, dan posisi itu yang ngarahin perhatian. Nambah font yang di-load sih nggak ngaruh.`}
]},
gestalt: {
title:'Pengelompokan Gestalt', metaphor:'Laci sendok garpu',
parable:`Coba buka laci dapur yang berantakan: garpu, sendok, sama pengocok telur campur aduk jadi satu. Sekarang buka laci yang ada tempat sendoknya: garpu kumpul sama garpu, sendok sama sendok, masing-masing di sekatnya sendiri. Kamu nggak baca label apa pun, tapi sendoknya langsung ketemu. Otak kita emang otomatis ngelompokin barang yang deketan, mirip, atau ada di satu wadah yang sama.`,
theory:[`Proximity (kedekatan): barang yang deketan dibaca sebagai satu kelompok.`,`Similarity (kemiripan): warna atau bentuk yang sama dianggap satu jenis.`,`Common region (wilayah bersama): background atau border yang sama bikin elemen kerasa satu kelompok.`,`Jarak antar kelompok harus jelas lebih gede daripada jarak di dalam kelompok.`],
controls:[{label:'Jarak dalam grup'},{label:'Jarak antar grup'},{label:'Similarity (warna)',options:['Off','On']},{label:'Common region',options:['Off','On']}],
bad:'Label-nya ngambang di tengah-tengah dua field. Jadi input yang mana nih yang "Email"?',
good:'Label nempel sama field-nya, dan jarak yang lebih lega misahin tiap pasangan.',
figma:[`Bungkus layer yang saling nyambung ke dalam frame pakai Auto layout. Gap di dalamnya kecil aja (8), jarak antar frame lebih lega (24+).`,`Kasih fill ke frame induknya biar jadi card "common region".`,`Pilih beberapa item, terus geser handle Tidy up biar jaraknya rata.`],
quiz:[
 {q:`Ada label yang posisinya pas di tengah dua input. Prinsip mana yang rusak?`,options:[`Proximity: user nggak tahu label itu punya input yang mana`,`Similarity`,`Closure`],why:`label-nya sama dekatnya ke dua input, jadi proximity nggak bisa ngelompokin dia ke salah satunya.`},
 {q:`Gimana cara paling cepat nunjukin kalau 3 button itu satu toolbar?`,options:[`Kasih warna random`,`Taruh deketan di atas background yang sama`,`Bikin ukurannya beda-beda`],why:`proximity ditambah common region langsung bikin mereka kebaca satu kelompok.`}
]},
color: {
title:'Color & Contrast', metaphor:'Rambu jalan',
parable:`Rambu jalan itu dirancang biar tetap kebaca walau kamu ngebut 100 km/jam pas hujan: putih di atas hijau tua, hitam di atas kuning. Nggak ada yang ngecat rambu STOP pakai pink pucat di atas putih. Teks di layar juga rambu. Kalau contrast-nya rendah, orang bisa kelewatan pintu keluarnya.`,
theory:[`Rasio contrast itu mulai dari 1:1 (nggak kelihatan) sampai 21:1 (hitam di atas putih).`,`WCAG AA minta minimal 4.5:1 buat teks biasa, dan 3:1 buat teks besar serta komponen UI.`,`Jangan cuma ngandelin warna. Tambahin ikon, label, atau pola.`,`Palet warnanya jangan kebanyakan: warna netral, satu aksen, plus beberapa warna semantik.`],
controls:[{label:'Terang teks'},{label:'Terang rambu'},{label:'Hue'}],
bad:'Teksnya low contrast, dan error cuma ditandain pakai border merah.',
good:'Teksnya gampang dibaca, dan error ada kata-kata plus ikonnya, bukan cuma warna.',
figma:[`Pakai plugin contrast (Stark, Contrast), terus pilih teks bareng background-nya buat lihat rasionya.`,`Bikin color style atau variable berupa tangga warna (ink/100 sampai ink/900), biar kamu tinggal pilih pasangan yang udah teruji, bukan nebak-nebak.`,`Jalanin plugin simulasi buta warna dulu sebelum handoff.`],
quiz:[
 {q:`Berapa contrast minimum WCAG AA buat teks biasa?`,options:[`3:1`,`4.5:1`,`7:1`,`21:1`],why:`AA minta 4.5:1 buat teks biasa, 3:1 buat teks besar, dan 7:1 buat AAA.`},
 {q:`Error di form cuma ditandain border yang berubah merah. Masalahnya apa?`,options:[`Nggak ada`,`User buta warna bisa kelewatan, jadi tambahin teks atau ikon`,`Merahnya kelewat terang`],why:`warna nggak boleh jadi satu-satunya penanda.`}
]},
type: {
title:'Typography & Type Scale', metaphor:'Menu restoran',
parable:`Menu restoran yang enak dibaca itu punya ritme yang jelas: nama bagian yang gede (Pembuka, Hidangan Utama), nama makanan ukuran sedang, deskripsinya kecil, dan harganya rapi sejajar. Kalau semua baris ukurannya sama, kamu harus baca seluruh menu cuma buat nyari dessert. Nah, skala huruf itu ya ritme menu tadi.`,
theory:[`Pilih ukuran dasar (16px di web) dan satu rasio, misalnya 1.25. Kaliin terus ke atas buat tiap level heading.`,`Line height 1.4–1.6 enak buat teks isi. Heading boleh lebih rapat.`,`Panjang baris idealnya 45–75 karakter (istilahnya "measure").`,`Cukup pakai 1–2 keluarga font. Variasinya ambil dari ketebalan dan ukuran aja.`],
controls:[{label:'Ukuran dasar'},{label:'Rasio skala'},{label:'Line height'},{label:'Panjang baris'}],
bad:'Tiga font, satu ukuran, dan barisnya panjang nggak ada ujungnya.',
good:'Satu keluarga font, skalanya jelas, panjang barisnya nyaman.',
figma:[`Kasih nama text style berdasarkan peran (Display, H1, H2, Body, Caption), bukan berdasarkan ukuran.`,`Set line height teks isi pakai % (misal 150%) biar ikut nyesuaiin ukuran font.`,`Bikin skala modular pakai plugin kayak Typescale, terus bulatin ke piksel utuh.`],
quiz:[
 {q:`Panjang baris yang nyaman buat teks isi itu berapa?`,options:[`15–25 karakter`,`45–75 karakter`,`120+ karakter`],why:`45–75 karakter bikin mata gampang balik lagi ke awal baris.`},
 {q:`Kalau dasarnya 16px dan rasionya 1.25, satu level di atasnya jadi…`,options:[`18px`,`20px`,`24px`],why:`16 × 1.25 = 20.`}
]},
'box-model': {
title:'CSS Box Model', metaphor:'Kirim paket',
legend:['Content: mugnya','Padding: bubble wrap','Border: kardusnya','Margin: jarak di mobil kurir'],
parable:`Bayangin kamu lagi kirim mug lewat ekspedisi. Ada mugnya sendiri (content), bubble wrap yang ngebungkus (padding), kardusnya (border), dan jarak yang disisain kurir antar paket di mobil (margin). Setiap elemen HTML "dikirim" persis kayak gini.`,
theory:[`Urutannya dari dalam ke luar: content → padding → border → margin.`,`Padding ikut nampilin background elemen. Margin selalu transparan.`,`box-sizing: content-box bikin padding dan border ditambahin di luar width. border-box bikin width tetap, content-nya yang ngalah menyempit.`,`Margin vertikal antar blok bisa nyatu (collapse): yang paling gede yang menang.`],
bad:'width:100% + padding pakai content-box bakal luber keluar dari induknya.',
good:'Pakai border-box, 100% ya tetap 100%. Padding udah dihitung di dalamnya.',
figma:[`Frame di Figma itu kelakuannya kayak border-box: ukuran yang kamu set udah termasuk padding. Set stroke ke "Inside" biar sama.`,`Di Auto layout, kolom padding ya padding CSS, dan gap kerjanya mirip margin antar anak elemen.`,`Di Dev Mode, panel inspect nampilin diagram box model buat layer apa aja.`],
quiz:[
 {q:`Lapisan mana yang ikut nampilin warna background elemen?`,options:[`Margin`,`Padding`,`Dua-duanya nggak`],why:`background digambar di bawah content dan padding, border ada di atasnya. Margin selalu transparan.`},
 {q:`width:200px; padding:20px; border:5px; box-sizing:content-box. Lebar yang kelihatan jadi berapa?`,options:[`200px`,`240px`,`250px`],why:`200 + 20×2 + 5×2 = 250px.`}
]},
/* ───────────── MENENGAH ───────────── */
spacing: {
title:'Spacing & Grid 8pt', metaphor:'Balok mainan',
parable:`Balok mainan bisa saling nyambung karena jarak tonjolannya persis sama semua. Kamu nggak butuh penggaris: semuanya otomatis lurus karena dibangun dari satu satuan. Sistem spacing 8 poin ngasih "klik" yang sama ke UI kamu. Setiap jarak itu 4, 8, 16, 24, 32…`,
theory:[`Pilih satu satuan dasar (8px, atau 4px buat area yang sempit).`,`Semua padding, gap, dan ukuran harus kelipatan satuan itu.`,`Pilihan makin sedikit, keputusan makin cepat, ritmenya juga konsisten.`,`Jarak gede buat misahin bagian. Jarak kecil buat ngiket item yang saling nyambung.`],
controls:[{label:'Nilai spacing',options:['Random','Ikut grid']},{label:'Satuan dasar'},{label:'Overlay grid',options:['Off','On']}],
bad:'Jarak 5, 7, 13, sama 19 bikin semuanya kerasa agak "aneh".',
good:'Semuanya kelipatan 8, jadi kerasa kalem dan rapi.',
figma:[`Di Preferences → Nudge amount, set big nudge ke 8 biar Shift+Panah geser 8px.`,`Tambahin Layout grid 8px ke frame, nyalain/matiin pakai Ctrl/Cmd+Shift+4.`,`Bikin variable spacing (space/8, space/16…) terus sambungin ke gap dan padding auto layout.`],
quiz:[
 {q:`Di sistem 8pt, nilai mana yang nggak cocok?`,options:[`16`,`24`,`13`,`32`],why:`13 bukan kelipatan 4, apalagi 8.`},
 {q:`Kenapa setengah langkah 4px masih boleh?`,options:[`Buat area sempit, kayak jarak antara ikon dan label-nya`,`Biar spacing-nya random`,`Browser maksa begitu`],why:`4px bisa nanganin hubungan kecil yang rapat tanpa keluar dari sistem.`}
]},
'fitts-hick': {
title:`Hukum Fitts & Hick`, metaphor:'Saklar & menu',
parable:`Pas mati lampu, saklar gede di dekat pintu bisa kamu temuin dalam sedetik. Tombol kecil di pojok ruangan? Bisa-bisa jempol kaki kepentok duluan. Di warung makan yang menunya 300 item, kamu bengong lama banget baca daftarnya. Di food truck yang cuma ada 5 pilihan, pesan beres dalam hitungan detik. Gede dan dekat itu cepat. Pilihan sedikit itu lebih cepat lagi.`,
theory:[`Hukum Fitts: waktu buat ngenain target makin lama kalau jaraknya jauh, dan makin cepat kalau targetnya gede.`,`Bikin aksi utama gede dan dekat sama posisi pointer atau jempol. Tepi dan sudut layar itu target yang gampang dikenai.`,`Hukum Hick: makin banyak pilihan, makin lama orang mikir. Jadi kelompokin, pecah, atau munculin pilihannya bertahap.`,`Target tap: usahain 44×44px. WCAG 2.2 AA netapin minimal 24×24px.`],
controls:[{label:'Ukuran saklar'},{label:'Jarak'},{label:'Jumlah menu'}],
bad:'Link checkout kecil yang jauh dari jempol, plus 9 pilihan yang bobotnya sama.',
good:'Dua pilihan yang jelas, dan button utama gede pas di bawah jempol.',
figma:[`Taruh frame "area tap" 44×44 (tanpa fill) di belakang ikon kecil, terus jadiin bagian dari component ikonnya.`,`Bikin prototype progressive disclosure pakai variant: tampilin 5 pilihan dulu, terus state "Lainnya…".`,`Tes langsung di HP pakai aplikasi Figma mobile biar kerasa jangkauan jempolnya.`],
quiz:[
 {q:`Menurut hukum Fitts, mana yang paling cepat di-click?`,options:[`Button kecil yang jauh`,`Button gede di dekat kursor`,`Link ukuran sedang di tengah paragraf`],why:`gede dan dekat artinya gerakannya pendek ke target yang gampang dikenai.`},
 {q:`Halaman pengaturan kamu punya 40 toggle dalam satu daftar. Hukum Hick nyaranin apa?`,options:[`Tambahin 10 lagi`,`Kelompokin ke beberapa kategori`,`Bikin merah semua`],why:`dipecah ke kelompok bikin pilihan yang harus ditimbang sekaligus jadi lebih sedikit.`}
]},
affordance: {
title:'Affordance & Feedback', metaphor:'Pintu & tombol lift',
parable:`Pintu yang ada pelat logam datarnya seolah bilang "dorong". Pintu yang ada gagangnya bilang "tarik". Tapi ada aja pintu bergagang yang ternyata harus didorong, dan semua orang nabrak. Ini namanya pintu Norman. Terus, tombol lift yang nyala pas dipencet itu kayak bilang: "Iya, udah kedengeran, nggak usah dipencet terus." UI butuh dua-duanya: kelihatan bisa di-click, dan ngasih respons.`,
theory:[`Affordance itu apa yang bisa kamu lakuin sama suatu objek. Signifier itu petunjuk visual yang ngasih tahu kamu: bayangan, garis bawah, kursor.`,`Feedback: setiap aksi harus dapat respons yang langsung kelihatan. Di bawah 100ms udah kerasa instan.`,`Tunjukin status sistem (loading, sukses, error) biar user nggak perlu nebak-nebak.`,`Jangan bikin elemen yang nggak interaktif kelihatan kayak bisa di-click.`],
controls:[{label:'Signifier',options:['Teks biasa','Outline','Solid timbul']},{label:'Feedback',options:['Nggak ada','Cuma tekan','Tekan + status']}],
bad:'Teks bergaris bawah tapi bukan link, dan "button" yang kelihatan kayak label doang.',
good:'Link kelihatan kayak link, button kelihatan bisa dipencet.',
figma:[`Bikin button sebagai component dengan variant: State = Default / Hover / Pressed / Loading / Disabled.`,`Di mode Prototype, pakai "While pressing" → Change to ke variant Pressed buat feedback yang kerasa.`,`Sambungin interaksi "After delay" buat simulasi state loading → sukses.`],
quiz:[
 {q:`"Pintu Norman" itu apa sih?`,options:[`Pintu yang desainnya ngasih sinyal aksi yang salah`,`Pintu putar`,`Pintu otomatis`],why:`signifier-nya (gagang) ngajak narik, padahal aslinya harus didorong.`},
 {q:`User click Simpan dan selama 3 detik kayak nggak terjadi apa-apa. Perbaikan terbaiknya gimana?`,options:[`Nggak perlu ngapa-ngapain`,`Tampilin state ditekan dan spinner, terus konfirmasi`,`Cukup bunyiin suara`],why:`feedback visual yang langsung plus status bikin user nggak click dua kali.`}
]},
responsive: {
title:'Flexbox & Grid Responsive', metaphor:'Pindahan rumah',
parable:`Waktu pindah dari rumah gede ke kos-kosan studio, kamu nggak bakal motong sofa jadi dua kan? Kamu atur ulang: rak dipindah ke dinding lain, meja dilipat, barang-barang ditumpuk. Flexbox dan Grid itu tukang angkutnya. Mereka nata ulang content biar muat di ruangan mana aja, yang di web artinya layar apa aja.`,
theory:[`Flexbox kerja di satu arah (baris atau kolom). Item bisa membesar, mengecil, dan turun baris (wrap).`,`Grid kerja di dua dimensi. repeat(auto-fit, minmax(…)) otomatis nambah dan ngurangin kolom.`,`Desain mobile-first dulu, terus tambahin ruang pas layarnya makin lebar.`,`Hindari lebar yang fixed. Pakai max-width, min(), dan clamp().`],
controls:[{label:'Lebar ruangan'},{label:'Layout',options:['Baris kaku','Flex wrap','Grid auto-fit']},{label:'gap'}],
bad:'Baris fixed 520px di layar kecil bakal kepotong.',
good:'Grid auto-fit nata ulang sesuai ruang yang ada.',
figma:[`Auto layout itu intinya Flexbox: direction, gap, padding, dan alignment-nya sama persis kayak di CSS.`,`Set anak elemen ke "Fill container" (flex:1) atau "Hug contents" (auto), dan nyalain Wrap buat flex-wrap.`,`Set min dan max width di frame, terus resize buat ngetes layout-nya.`],
quiz:[
 {q:`Card harus menuhin baris dan kolomnya berkurang pas layar mengecil, tanpa media query. Pakai apa?`,options:[`float:left`,`grid-template-columns: repeat(auto-fit, minmax(200px,1fr))`,`position:absolute`],why:`auto-fit + minmax bikin kolom sebanyak yang muat.`},
 {q:`Bedanya Flexbox sama Grid apa?`,options:[`Flex ngurus satu sumbu; Grid ngurus baris dan kolom sekaligus`,`Dua-duanya sama aja`,`Grid cuma jalan di mobile`],why:`Flexbox nata satu dimensi, Grid nata dua.`}
]},
'z-index': {
title:'z-index & Stacking Context', metaphor:'Piring di nampan kantin',
legend:['Piring A (di nampan)','Piring B (di nampan)','Piring C (di luar)','Nampan = stacking context'],
parable:`Di kantin, kamu numpuk piring di atas nampan. Kalau nampan 2 ada di atas nampan 1, piring paling atas di nampan 1 nggak bakal bisa ada di atas apa pun yang ada di nampan 2. Nampan yang nentuin duluan. z-index juga gitu: elemen numpuk di dalam "nampan"-nya (stacking context), terus nampan-nampan itu numpuk satu sama lain.`,
theory:[`z-index cuma ngaruh ke elemen yang di-position (relative, absolute, fixed, sticky) dan anak dari flex atau grid.`,`Kalau z-index-nya sama, elemen yang muncul belakangan di HTML yang digambar di atas.`,`Induk dengan z-index selain auto, opacity di bawah 1, transform, atau isolation:isolate bakal bikin nampan baru (stacking context).`,`Anak elemen nggak akan pernah bisa kabur dari nampannya: z-index:9999 di dalam nampan yang rendah tetap kalah sama nampan yang lebih tinggi.`],
controls:[{label:'z-index A'},{label:'z-index B'},{label:'z-index C'},{label:'Nampan A & B',options:['Tanpa nampan (auto)','Nampan z-index: 1']}],
bad:'Perang z-index: angkanya naik terus sampai nggak ada yang tahu kenapa.',
good:'Skala kecil yang dikasih nama, plus isolation:isolate di tiap komponen.',
figma:[`Panel Layers itu urutan-z kamu: makin atas di daftar, makin di depan.`,`Frame itu kayak nampan. Anak elemen nggak bisa tampil di atas frame saudara yang posisinya lebih atas di daftar.`,`Pakai Cmd/Ctrl + ] dan [ buat mindahin layer ke depan atau ke belakang.`],
quiz:[
 {q:`Card A punya z-index:999 di dalam induk yang z-index:1. Saudaranya, C (di luar), punya z-index:2. Mana yang di atas?`,options:[`A`,`C`],why:`A kejebak di nampan induknya, dan nampan itu (1) ada di bawah C (2).`},
 {q:`Mana yang NGGAK bikin stacking context?`,options:[`opacity: 0.9`,`transform: translateX(0)`,`isolation: isolate`,`margin: 10px`],why:`margin nggak ada hubungannya sama urusan tumpuk-menumpuk.`}
]},
/* ───────────── MAHIR ───────────── */
a11y: {
title:'Accessibility (WCAG)', metaphor:'Ramp di trotoar',
parable:`Ramp di ujung trotoar awalnya dibikin buat pengguna kursi roda. Sekarang ibu-ibu dorong stroller, orang bawa koper, sampai anak-anak naik sepeda juga pakai tiap hari. Desain yang accessible itu kayak ramp trotoar: dibikin buat sebagian orang, tapi jadi lebih enak buat semua orang.`,
theory:[`Perceivable (bisa ditangkap): sediain alternatif teks dan contrast yang cukup, dan jangan cuma ngandelin warna.`,`Operable (bisa dioperasiin): semuanya bisa dipakai pakai keyboard, dengan focus ring yang kelihatan.`,`Understandable (gampang dipahami): pakai label beneran (bukan cuma placeholder) dan pesan error yang jelas.`,`Robust (tahan banting): HTML semantik (button, label, nav) bantu teknologi asistif ngerti halamanmu. Mau ngetes? Singkirin mouse, terus pencet Tab.`],
controls:[{label:'Label',options:['Placeholder aja','Label beneran']},{label:'Focus ring',options:['Dihapus','Kelihatan']},{label:'Simulasi mata',options:['Normal','Buram','Hitam putih']}],
bad:'Div isinya cuma ikon. Screen reader nggak ngomong apa-apa, dan nggak bisa dijangkau pakai keyboard.',
good:'Button beneran dengan label yang kelihatan, bisa di-focus dan dibacain.',
figma:[`Pakai plugin kayak Stark, atau kit anotasi urutan focus, buat nandain urutan tab dan ngecek contrast.`,`Tambahin variant "Focus" ke tiap component interaktif biar developer ikut bikin ring-nya.`,`Jangan lupa tulis alt text dan nama aksesibel di anotasi Dev Mode.`],
quiz:[
 {q:`Kenapa label yang cuma placeholder itu bermasalah?`,options:[`Hilang pas ngetik dan sering low contrast`,`Lemot`,`Ngerusak CSS`],why:`begitu kamu mulai ngetik, petunjuknya ilang, dan teks placeholder biasanya gagal tes contrast.`},
 {q:`Tes accessibility paling cepat itu apa?`,options:[`Pakai keyboard doang (Tab, Enter, Spasi)`,`Gedein logonya`,`Tambahin animasi`],why:`pakai keyboard doang bakal ketahuan focus state yang hilang, focus yang kejebak, dan button palsu.`}
]},
'figma-components': {
title:'Auto Layout & Component Figma', metaphor:'Cetakan kue',
parable:`Tukang kue cukup pakai satu cetakan buat bikin seratus kue. Ubah bentuk cetakannya, adonan besok ikut berubah semua. Itulah component di Figma: satu main, banyak instance. Auto layout itu loyangnya, yang ngatur jarak antar kue biar rata dan ikut melebar kalau kamu nambah satu kue lagi.`,
theory:[`Main component (◆) nentuin desainnya. Instance (◇) ngewarisin desain itu dan bisa override teks atau warna secara lokal.`,`Variant ngumpulin state dan ukuran ke dalam satu component set (Size=S/M/L, State=Hover).`,`Auto layout punya direction, gap, padding, alignment, plus ukuran Hug atau Fill. Intinya ini CSS Flexbox.`,`Component property (boolean, text, instance swap) bikin instance tetap fleksibel tanpa harus di-detach.`],
controls:[{label:'Arah',options:['Horizontal →','Vertikal ↓']},{label:'Gap'},{label:'Padding'},{label:'Anak elemen',options:['Hug contents','Fill container']},{label:'Warna main',options:['Mint','Lilac','Amber']}],
bad:'Salinan yang di-detach: warna, radius, dan padding-nya pada melenceng dikit-dikit.',
good:'Instance dari satu main component, konsisten di mana aja.',
figma:[`Pilih beberapa layer, terus pencet Shift+A buat nambahin Auto layout.`,`Pencet Cmd/Ctrl+Alt+K buat bikin component, terus "Combine as variants" buat bikin set-nya.`,`Tambahin component property (Text, Boolean, Instance swap) daripada bikin variant yang hampir kembar.`],
quiz:[
 {q:`Kamu harus ganti warna button di 120 layar. Gimana caranya?`,options:[`Edit satu-satu`,`Edit main component sekali aja`,`Screenshot terus warnain ulang`],why:`semua instance ngewarisin dari main component.`},
 {q:`"Fill container" di Auto layout paling mirip CSS yang mana?`,options:[`flex: 1`,`position: absolute`,`float: right`],why:`Fill melebar ngisi sisa ruang, persis kayak flex: 1.`}
]},
state: {
title:'Event & State di JS', metaphor:'Mesin jualan otomatis',
parable:`Vending machine cuma ngelakuin apa yang dibolehin sama state-nya saat itu. Belum masukin koin? Tombolnya nggak ngapa-ngapain. Koin udah cukup? Silakan pilih camilan. Lagi ngeluarin barang? Sabar, tunggu dulu. Tiap kali tombol dipencet, itu sebuah event, dan mesinnya ngecek state dulu sebelum mutusin apa yang terjadi. UI kamu ya vending machine itu.`,
theory:[`Event (click, input, keydown) itu cara user ngobrol sama kamu. Listener yang ngerespons.`,`State itu data yang ngegambarin kondisi saat ini: saldo, pilihan, status.`,`Render dari state. Update state-nya, terus gambar ulang UI dari situ, jangan kebalik.`,`Modelin state secara eksplisit (idle → paying → dispensing) biar kombinasi yang mustahil nggak bisa kejadian.`],
controls:[{label:'Harga camilan (¢)'},{label:'Log event',options:['On','Off']}],
bad:'DOM dijadiin sumber kebenaran, jadi logikanya baca teks balik dari layar.',
good:'Satu object state, event yang ngupdate, dan render() yang gambar ulang.',
figma:[`Modelin layar sebagai variant (Idle / Paying / Dispensing) dan sambungin pakai interaksi prototype.`,`Pakai Variables (number, boolean) buat nyimpen state beneran kayak saldo di dalam prototype.`,`Gabungin "Set variable" pas click dengan kondisi ("if credit ≥ price") buat bikin prototype logika tanpa code.`],
quiz:[
 {q:`"Jumlah barang di keranjang" sebaiknya disimpan di mana?`,options:[`Di variabel state yang jadi dasar render UI`,`Cuma di teks DOM`,`Di class CSS`],why:`state itu satu-satunya sumber kebenaran, dan UI digambar dari situ.`},
 {q:`Button Beli masih bisa dipencet pas mesin lagi ngeluarin barang, jadi kena tagih dua kali. Benerinnya gimana?`,options:[`Cek state dan matiin aksi yang nggak valid di state itu`,`Click-nya pelan-pelan`,`Tambahin listener lagi`],why:`state yang eksplisit bikin aksi yang mustahil nggak bisa kejadian.`}
]},
motion: {
title:'Motion & Easing', metaphor:'Lift & ngerem',
parable:`Lift yang enak itu nggak pindah tiba-tiba, dan nggak berhenti mendadak juga. Dia melambat pelan-pelan sampai di lantai kamu. Driver ojek yang jago juga ngeremnya halus, bukan kecepatannya flat terus tiba-tiba stop. Gerakan yang mulai cepat terus melambat kerasa natural, soalnya benda di dunia nyata punya massa dan gesekan.`,
theory:[`Durasi: 150–250ms buat UI kecil, 250–400ms buat panel. Lewat dari sekitar 500ms udah mulai kerasa lelet.`,`Pakai ease-out buat elemen yang masuk, ease-in buat yang keluar, dan ease-in-out buat yang pindah posisi di layar.`,`Gerakan linear kerasa kayak robot. Simpan aja buat spinner dan progress bar.`,`Animasiin transform dan opacity (ringan buat GPU), dan hormati prefers-reduced-motion.`],
controls:[{label:'Durasi'},{label:'Easing'}],
bad:'Linear dan lambat, kayak robot di ban berjalan.',
good:'Ease-out: mulai cepat, terus berhenti dengan halus.',
figma:[`Pakai Smart Animate antar variant, dengan "Ease out" 200–300ms buat elemen yang masuk.`,`Coba preset Spring (Gentle, Quick, Bouncy) buat UI yang playful.`,`Dokumentasiin token motion (motion/fast = 150ms, motion/base = 250ms) buat developer.`],
quiz:[
 {q:`Ada dropdown yang lagi kebuka. Easing mana yang paling pas?`,options:[`ease-out (mulai cepat, berhenti halus)`,`ease-in (mulai lambat, berhenti mendadak)`,`linear`],why:`elemen yang masuk sebaiknya datang cepat, terus pelan-pelan diam di tempat.`},
 {q:`Properti mana yang paling ringan buat dianimasiin?`,options:[`width`,`top`,`transform`],why:`transform nggak lewat proses layout dan langsung dikomposisi sama GPU.`}
]},
tokens: {
title:'Design Token & Tema', metaphor:'Rak bumbu',
parable:`Di dapur yang rapi, tiap toples bumbu ada labelnya dan selalu ditaruh di tempat yang sama. Resepnya nulis "sejumput garam", bukan "butiran dari toples ketiga sebelah kiri". Design token itu ya toples berlabel tadi: color-accent, space-16, radius-md. Ganti isi toplesnya, semua resep yang pakai ikut berubah.`,
theory:[`Token itu keputusan desain yang dikasih nama: warna, typography, spacing, radius, bayangan, motion.`,`Susun bertingkat ya: primitive (mint-300) → semantic (color-action) → component (button-bg).`,`Tema (gelap, terang, brand) cuma nuker nilainya, namanya tetap sama.`,`Di code, token itu CSS custom property. Di Figma, token itu Variables dengan Modes. Pastiin cuma ada satu sumber kebenaran.`],
controls:[{label:'Tema (mode)',options:['Terminal','Kertas','Permen']},{label:'token radius'},{label:'token spacing'}],
bad:'Nilai hardcode bertebaran di semua file.',
good:'Token semantik: satu toples, dipakai di mana-mana.',
figma:[`Di panel Local variables, bikin collection (Primitives, Semantic) terus tambahin Modes (Dark, Light) buat tema.`,`Sambungin fill, gap, radius, dan padding ke variable lewat ikon variable di tiap kolom.`,`Sync variable ke code lewat plugin atau Variables REST API biar CSS custom property kamu ikut sama.`],
quiz:[
 {q:`Nama token yang paling oke buat background button utama?`,options:[`#7EF2C3`,`mint-green-light`,`color-action-primary`],why:`nama semantik ngejelasin tujuannya, jadi nilainya bisa diganti tanpa harus ganti nama.`},
 {q:`Buat nambahin dark mode pakai token, kamu…`,options:[`Nulis ulang semua component`,`Nuker nilai token di bawah satu tema atau mode`,`Duplikat situsnya`],why:`tema cuma nuker nilainya, namanya tetap.`}
]}
};
