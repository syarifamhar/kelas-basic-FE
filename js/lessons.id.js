/* Indonesian (ID) translations for lesson prose.
   Keyed by lesson id. Anything left out falls back to the English text in lessons.js.
   Playground source code (html/css/js) stays as-is so it matches the editable source. */
window.UX_LESSONS_ID = {
/* ───────────── PEMULA ───────────── */
hierarchy: {
title:'Hierarki Visual', metaphor:'Rak supermarket',
parable:`Di supermarket, merek yang membayar paling mahal dipajang sejajar mata, tulisan DISKON merah besar adalah hal pertama yang kamu lihat, dan kaleng berdebu tinggal di rak paling bawah. Tidak ada yang membaca setiap label. Mata melompat ke hal yang paling besar, paling terang, dan paling dekat lebih dulu. Layar bekerja dengan cara yang sama.`,
theory:[`Ukuran dan ketebalan menandakan kepentingan: yang lebih besar dan tebal dibaca lebih dulu.`,`Kontras dan warna menarik mata, jadi simpan warna paling mencolok untuk satu hal yang paling penting.`,`Posisi juga berpengaruh. Orang memindai dari kiri atas lebih dulu (pola F dan Z).`,`Usahakan ada satu titik fokus yang jelas di setiap tampilan. Kalau semuanya berteriak, tidak ada yang terdengar.`],
controls:[{label:'Ukuran judul'},{label:'Warna harga',options:['Redup','Amber']},{label:'Tombol',options:['Ghost','Solid']}],
bad:'Semuanya punya "volume" yang sama, jadi mata tidak tahu harus berhenti di mana.',
good:'Satu titik fokus (nama produk), lalu harga, lalu aksi.',
figma:[`Buat text style berdasarkan peran (Display, Title, Body, Caption) di panel kanan lewat Text → Style (+).`,`Tes menyipitkan mata: tambahkan Layer blur sekitar 6–8 ke frame dan lihat apa yang masih menonjol.`,`Beri warna isi (fill) hanya pada aksi utama. Jadikan tombol sekunder varian outline atau ghost.`],
quiz:[
 {q:`Kamu mengaburkan layar sampai buram. Apa yang seharusnya masih menonjol?`,options:[`Semua elemen, sama rata`,`Satu hal yang harus diperhatikan atau dilakukan pengguna`,`Link di footer`],why:`layar yang diburamkan memperlihatkan hierarki yang sebenarnya. Titik fokus utama harus tetap terlihat.`},
 {q:`Mana yang BUKAN alat hierarki?`,options:[`Ukuran`,`Kontras`,`Posisi`,`Jumlah font yang dimuat`],why:`ukuran, kontras, dan posisi mengarahkan perhatian. Memuat lebih banyak font tidak.`}
]},
gestalt: {
title:'Pengelompokan Gestalt', metaphor:'Laci sendok garpu',
parable:`Buka laci dapur yang berantakan, dan kamu akan menemukan garpu, sendok, dan pengocok telur campur aduk. Sekarang buka laci yang punya tempat sendok: garpu bersama garpu, sendok bersama sendok, masing-masing di sekatnya sendiri. Kamu tidak membaca satu label pun, tapi sendoknya langsung ketemu. Otakmu mengelompokkan benda yang berdekatan, terlihat mirip, atau berada dalam satu wadah.`,
theory:[`Kedekatan (proximity): benda yang berdekatan dibaca sebagai satu kelompok.`,`Kemiripan (similarity): warna atau bentuk yang sama dibaca sebagai jenis yang sama.`,`Wilayah bersama (common region): latar atau border bersama membentuk kelompok.`,`Jarak antar kelompok harus jelas lebih besar daripada jarak di dalam kelompok.`],
controls:[{label:'Jarak di dalam kelompok'},{label:'Jarak antar kelompok'},{label:'Kemiripan (warna)',options:['Mati','Nyala']},{label:'Wilayah bersama (nampan)',options:['Mati','Nyala']}],
bad:'Label melayang di tengah-tengah antar field. Input mana yang "Email"?',
good:'Label menempel pada field-nya, dan jarak yang lebih besar memisahkan tiap pasangan.',
figma:[`Bungkus layer yang saling berhubungan dalam frame dengan Auto layout. Buat gap di dalamnya kecil (8) dan jarak antar frame lebih besar (24+).`,`Tambahkan fill ke frame induk untuk membuat kartu "wilayah bersama".`,`Pilih beberapa item lalu seret handle Tidy up untuk meratakan jaraknya.`],
quiz:[
 {q:`Sebuah label berada tepat di tengah antara dua input. Prinsip mana yang rusak?`,options:[`Kedekatan: pengguna tidak tahu label itu milik input yang mana`,`Kemiripan`,`Closure`],why:`label sama dekatnya dengan kedua input, jadi kedekatan tidak bisa mengelompokkannya dengan salah satu.`},
 {q:`Apa cara tercepat untuk menunjukkan bahwa 3 tombol adalah satu toolbar?`,options:[`Beri warna acak`,`Letakkan berdekatan di atas latar yang sama`,`Buat ukurannya berbeda-beda`],why:`kedekatan ditambah wilayah bersama langsung mengelompokkannya.`}
]},
color: {
title:'Warna & Kontras', metaphor:'Rambu jalan',
parable:`Rambu jalan dirancang supaya bisa dibaca pada kecepatan 100 km/jam di tengah hujan: putih di atas hijau tua, hitam di atas kuning. Tidak ada yang mengecat rambu STOP dengan merah muda pucat di atas putih. Teks di layar juga sebuah rambu. Kalau kontrasnya rendah, orang akan terlewat pintu keluarnya.`,
theory:[`Rasio kontras berkisar dari 1:1 (tak terlihat) sampai 21:1 (hitam di atas putih).`,`WCAG AA meminta 4.5:1 untuk teks isi dan 3:1 untuk teks besar dan komponen UI.`,`Jangan hanya mengandalkan warna. Tambahkan ikon, label, atau pola.`,`Jaga palet tetap kecil: warna netral, satu aksen, dan beberapa warna semantik.`],
controls:[{label:'Kecerahan teks'},{label:'Kecerahan rambu'},{label:'Hue (rona)'}],
bad:'Teks berkontras rendah, dan error hanya ditandai dengan border merah.',
good:'Teks mudah dibaca, dan error punya kata-kata serta ikon, bukan hanya warna.',
figma:[`Gunakan plugin kontras (Stark, Contrast), lalu pilih teks beserta latarnya untuk membaca rasionya.`,`Buat color style atau variable sebagai tangga warna (ink/100 sampai ink/900) supaya kamu memilih pasangan yang sudah teruji, bukan menebak.`,`Jalankan plugin simulasi buta warna sebelum handoff.`],
quiz:[
 {q:`Berapa kontras minimum WCAG AA untuk teks isi biasa?`,options:[`3:1`,`4.5:1`,`7:1`,`21:1`],why:`AA meminta 4.5:1 untuk teks isi, 3:1 untuk teks besar, dan 7:1 untuk AAA.`},
 {q:`Error pada form hanya ditandai dengan border yang berubah merah. Apa masalahnya?`,options:[`Tidak ada`,`Pengguna buta warna bisa melewatkannya, jadi tambahkan teks atau ikon`,`Merahnya terlalu terang`],why:`warna tidak boleh menjadi satu-satunya penanda.`}
]},
type: {
title:'Tipografi & Skala Huruf', metaphor:'Menu restoran',
parable:`Menu restoran yang baik punya ritme yang jelas: nama bagian yang besar (Pembuka, Hidangan Utama), nama hidangan berukuran sedang, deskripsi kecil, dan harga yang sejajar. Kalau setiap baris berukuran sama, kamu harus membaca seluruh menu hanya untuk menemukan pencuci mulut. Skala huruf adalah ritme menu tersebut.`,
theory:[`Pilih ukuran dasar (16px di web) dan sebuah rasio seperti 1.25. Kalikan naik untuk setiap tingkat heading.`,`Line height teks isi 1.4–1.6 terasa nyaman. Heading boleh lebih rapat.`,`Jaga panjang baris 45–75 karakter (disebut "measure").`,`Gunakan 1–2 keluarga font. Dapatkan variasi dari ketebalan dan ukuran saja.`],
controls:[{label:'Ukuran dasar'},{label:'Rasio skala'},{label:'Line height'},{label:'Panjang baris'}],
bad:'Tiga font, satu ukuran, dan baris yang tidak ada habisnya.',
good:'Satu keluarga font, skala yang jelas, dan panjang baris yang nyaman.',
figma:[`Beri nama text style berdasarkan peran (Display, H1, H2, Body, Caption), bukan berdasarkan ukuran.`,`Atur line height teks isi dalam % (mis. 150%) supaya ikut menyesuaikan ukuran font.`,`Buat skala modular dengan plugin seperti Typescale, lalu bulatkan ke piksel utuh.`],
quiz:[
 {q:`Berapa panjang baris yang nyaman untuk teks isi?`,options:[`15–25 karakter`,`45–75 karakter`,`120+ karakter`],why:`45–75 karakter membuat gerakan mata kembali ke awal baris tetap mudah.`},
 {q:`Dengan dasar 16px dan rasio 1.25, satu tingkat di atasnya adalah…`,options:[`18px`,`20px`,`24px`],why:`16 × 1.25 = 20.`}
]},
'box-model': {
title:'CSS Box Model', metaphor:'Mengirim paket',
legend:['Content: mugnya','Padding: bubble wrap','Border: kardusnya','Margin: ruang di mobil kurir'],
parable:`Saat kamu mengirim sebuah mug, ada mug itu sendiri (content), bubble wrap yang membungkusnya (padding), kardusnya (border), dan ruang yang disisakan kurir antar paket di dalam mobil (margin). Setiap elemen HTML "dikirim" persis seperti ini.`,
theory:[`Dari dalam ke luar: content → padding → border → margin.`,`Padding menampilkan background elemen. Margin selalu transparan.`,`box-sizing: content-box menambahkan padding dan border di atas width. border-box menjaga width tetap dan menyempitkan content-nya.`,`Margin vertikal antar blok bisa menyatu (collapse): yang lebih besar yang menang.`],
bad:'width:100% + padding dengan content-box akan meluap keluar dari induknya.',
good:'border-box membuat 100% tetap berarti 100%, padding sudah termasuk.',
figma:[`Frame di Figma berperilaku seperti border-box: ukuran yang kamu atur sudah termasuk padding. Atur stroke ke "Inside" agar sama.`,`Di Auto layout, kolom padding adalah padding CSS dan gap berperan seperti margin antar anak elemen.`,`Di Dev Mode, panel inspect menampilkan diagram box model untuk layer apa pun.`],
quiz:[
 {q:`Lapisan mana yang menampilkan warna background elemen?`,options:[`Margin`,`Padding`,`Tidak keduanya`],why:`background dilukis di bawah content dan padding, dan border berada di atasnya. Margin selalu transparan.`},
 {q:`width:200px; padding:20px; border:5px; box-sizing:content-box. Berapa lebar yang tampil?`,options:[`200px`,`240px`,`250px`],why:`200 + 20×2 + 5×2 = 250px.`}
]},
/* ───────────── MENENGAH ───────────── */
spacing: {
title:'Spasi & Grid 8pt', metaphor:'Balok mainan',
parable:`Balok mainan bisa saling mengunci karena setiap tonjolannya berjarak persis sama. Kamu tidak butuh penggaris: semuanya sejajar karena dibangun dari satu satuan. Sistem spasi 8 poin memberi UI-mu "klik" yang sama. Setiap jarak adalah 4, 8, 16, 24, 32…`,
theory:[`Pilih satu satuan dasar (8px, atau 4px untuk area yang sempit).`,`Setiap padding, gap, dan ukuran adalah kelipatan satuan itu.`,`Lebih sedikit pilihan berarti keputusan lebih cepat dan ritme yang konsisten.`,`Jarak besar memisahkan bagian. Jarak kecil mengikat item yang saling berhubungan.`],
controls:[{label:'Nilai spasi',options:['Acak','Sesuai grid']},{label:'Satuan dasar'},{label:'Overlay grid',options:['Mati','Nyala']}],
bad:'Jarak 5, 7, 13, dan 19 membuat semuanya terasa sedikit "janggal".',
good:'Semuanya kelipatan 8, jadi terasa tenang dan rapi.',
figma:[`Di Preferences → Nudge amount, atur big nudge ke 8 supaya Shift+Panah menggeser 8px.`,`Tambahkan Layout grid 8px ke frame, dan nyalakan/matikan dengan Ctrl/Cmd+Shift+4.`,`Buat variable spasi (space/8, space/16…) lalu hubungkan ke gap dan padding auto layout.`],
quiz:[
 {q:`Pada sistem 8pt, nilai mana yang tidak cocok?`,options:[`16`,`24`,`13`,`32`],why:`13 bukan kelipatan 4 maupun 8.`},
 {q:`Kenapa setengah langkah 4px diperbolehkan?`,options:[`Untuk area sempit seperti jarak antara ikon dan labelnya`,`Supaya spasinya acak`,`Browser mengharuskannya`],why:`4px menangani hubungan kecil yang rapat tanpa keluar dari sistem.`}
]},
'fitts-hick': {
title:`Hukum Fitts & Hick`, metaphor:'Saklar lampu & menu',
parable:`Dalam gelap, kamu menemukan saklar lampu besar di dekat pintu dalam sedetik. Tombol kecil di ujung ruangan? Jari kakimu bisa terantuk. Di warung makan dengan 300 menu kamu menatap daftar menu selamanya, sementara di food truck dengan 5 pilihan kamu memesan dalam hitungan detik. Besar dan dekat itu cepat. Lebih sedikit pilihan itu lebih cepat.`,
theory:[`Hukum Fitts: waktu untuk mengenai target bertambah seiring jarak dan berkurang seiring ukuran target.`,`Buat aksi utama besar dan dekat dengan posisi pointer atau jempol. Tepi dan sudut layar adalah target yang mudah.`,`Hukum Hick: waktu mengambil keputusan bertambah seiring jumlah pilihan. Kelompokkan, pecah, atau tampilkan pilihan secara bertahap.`,`Target sentuh: usahakan 44×44px. WCAG 2.2 AA menetapkan minimum 24×24px.`],
controls:[{label:'Ukuran saklar'},{label:'Jarak'},{label:'Jumlah pilihan menu'}],
bad:'Link checkout kecil yang jauh dari jempol, ditambah 9 pilihan yang setara.',
good:'Dua pilihan jelas, dan tombol utama besar tepat di bawah jempol.',
figma:[`Taruh frame "area sentuh" 44×44 (tanpa fill) di belakang ikon kecil dan jadikan bagian dari komponen ikon.`,`Buat prototipe progressive disclosure dengan variant: tampilkan 5 pilihan, lalu state "Lainnya…".`,`Tes di ponselmu dengan aplikasi Figma mobile untuk merasakan jangkauan jempol.`],
quiz:[
 {q:`Menurut hukum Fitts, mana yang paling cepat diklik?`,options:[`Tombol kecil yang jauh`,`Tombol besar di dekat kursor`,`Link berukuran sedang di dalam paragraf`],why:`besar dan dekat berarti gerakan pendek ke target yang mudah dikenai.`},
 {q:`Halaman pengaturanmu punya 40 toggle dalam satu daftar. Apa saran hukum Hick?`,options:[`Tambah 10 lagi`,`Kelompokkan ke dalam beberapa kategori`,`Buat semuanya merah`],why:`memecah ke kelompok mengurangi jumlah pilihan yang ditimbang sekaligus.`}
]},
affordance: {
title:'Affordance & Feedback', metaphor:'Pintu & tombol lift',
parable:`Pintu dengan pelat logam datar berkata "dorong". Pintu dengan gagang berkata "tarik", tapi ada pintu bergagang yang justru harus didorong, dan semua orang menabraknya. Ini disebut pintu Norman. Sementara itu, tombol lift yang menyala saat ditekan sedang berkata: "Aku dengar, berhenti menekan." Antarmuka butuh keduanya: terlihat bisa diklik, dan memberi jawaban.`,
theory:[`Affordance adalah apa yang bisa kamu lakukan dengan sebuah objek. Signifier adalah petunjuk visual yang memberitahumu: bayangan, garis bawah, kursor.`,`Feedback: setiap aksi mendapat respons yang langsung dan terlihat. Di bawah 100ms terasa instan.`,`Tampilkan status sistem (loading, sukses, error) supaya pengguna tidak pernah menebak-nebak.`,`Jangan membuat elemen yang tidak interaktif terlihat bisa diklik.`],
controls:[{label:'Signifier',options:['Teks biasa','Outline','Solid & timbul']},{label:'Feedback',options:['Tidak ada','Hanya tekan','Tekan + status']}],
bad:'Teks bergaris bawah yang bukan link, dan "tombol" yang terlihat seperti label.',
good:'Link terlihat seperti link, dan tombol terlihat bisa ditekan.',
figma:[`Buat tombol sebagai komponen dengan variant: State = Default / Hover / Pressed / Loading / Disabled.`,`Di mode Prototype, gunakan "While pressing" → Change to ke variant Pressed untuk feedback taktil.`,`Rangkai interaksi "After delay" untuk mensimulasikan state loading → sukses.`],
quiz:[
 {q:`Apa itu "pintu Norman"?`,options:[`Pintu yang desainnya memberi sinyal aksi yang salah`,`Pintu putar`,`Pintu otomatis`],why:`signifier-nya (gagang) mengisyaratkan tarik padahal sebenarnya harus didorong.`},
 {q:`Pengguna mengklik Simpan dan tidak ada yang terlihat terjadi selama 3 detik. Apa perbaikan terbaiknya?`,options:[`Tidak perlu apa-apa`,`Tampilkan state ditekan dan spinner, lalu konfirmasi`,`Hanya putar suara`],why:`feedback visual langsung ditambah status mencegah pengguna mengklik dua kali.`}
]},
responsive: {
title:'Flexbox & Grid Responsif', metaphor:'Pindahan furnitur',
parable:`Saat pindah dari rumah besar ke kamar studio, kamu tidak menggergaji sofa jadi dua. Kamu menata ulang: rak dipindah ke dinding lain, meja dilipat, barang-barang ditumpuk. Flexbox dan Grid adalah tukang angkutmu. Mereka menata ulang konten supaya muat di ruangan mana pun, yang di web berarti layar apa pun.`,
theory:[`Flexbox bekerja dalam satu arah (baris atau kolom). Item bisa membesar, mengecil, dan turun baris (wrap).`,`Grid bekerja dalam dua dimensi. repeat(auto-fit, minmax(…)) menambah dan mengurangi kolom secara otomatis.`,`Desain mobile-first, lalu tambahkan ruang seiring layar makin besar.`,`Hindari lebar tetap. Gunakan max-width, min(), dan clamp().`],
controls:[{label:'Lebar ruangan'},{label:'Tata letak',options:['Baris kaku','Flex wrap','Grid auto-fit']},{label:'gap'}],
bad:'Baris tetap 520px di layar kecil akan terpotong.',
good:'Grid auto-fit menata ulang sesuai ruang yang tersedia.',
figma:[`Auto layout pada dasarnya adalah Flexbox: direction, gap, padding, dan alignment sama persis dengan CSS.`,`Atur anak elemen ke "Fill container" (flex:1) atau "Hug contents" (auto), dan nyalakan Wrap untuk flex-wrap.`,`Atur min dan max width pada frame, lalu ubah ukurannya untuk menguji tata letak.`],
quiz:[
 {q:`Kartu harus memenuhi baris dan berkurang kolomnya saat layar mengecil, tanpa media query. Gunakan…`,options:[`float:left`,`grid-template-columns: repeat(auto-fit, minmax(200px,1fr))`,`position:absolute`],why:`auto-fit + minmax membuat kolom sebanyak yang muat.`},
 {q:`Apa perbedaan Flexbox dan Grid?`,options:[`Flex menangani satu sumbu; Grid menangani baris dan kolom sekaligus`,`Keduanya identik`,`Grid hanya bekerja di mobile`],why:`Flexbox menata satu dimensi, Grid menata dua.`}
]},
'z-index': {
title:'z-index & Stacking Context', metaphor:'Piring di atas nampan kantin',
legend:['Piring A (di nampan)','Piring B (di nampan)','Piring C (di luar)','Nampan = stacking context'],
parable:`Di kantin, kamu menumpuk piring di atas nampan. Kalau nampan 2 berada di atas nampan 1, piring paling atas di nampan 1 tidak akan pernah bisa berada di atas apa pun di nampan 2. Nampan yang menentukan duluan. z-index bekerja dengan cara yang sama: elemen bertumpuk di dalam "nampan"-nya (stacking context), dan nampan-nampan itu bertumpuk satu sama lain.`,
theory:[`z-index hanya berlaku untuk elemen yang diposisikan (relative, absolute, fixed, sticky) dan anak dari flex atau grid.`,`Jika z-index sama, elemen yang muncul belakangan di HTML dilukis di atas.`,`Induk dengan z-index selain auto, opacity di bawah 1, transform, atau isolation:isolate membuat nampan baru (stacking context).`,`Anak elemen tidak pernah bisa keluar dari nampannya: z-index:9999 di dalam nampan yang rendah tetap kalah dari nampan yang lebih tinggi.`],
controls:[{label:'z-index A'},{label:'z-index B'},{label:'z-index C'},{label:'Nampan untuk A & B',options:['Tanpa nampan (auto)','Nampan z-index: 1']}],
bad:'Perang z-index: angkanya terus naik sampai tidak ada yang tahu kenapa.',
good:'Skala kecil yang diberi nama, dengan isolation:isolate pada komponen.',
figma:[`Panel Layers adalah urutan-z kamu: makin atas di daftar berarti makin di depan.`,`Frame berperan seperti nampan. Anak elemen tidak bisa tampil di atas frame saudara yang posisinya lebih tinggi di daftar.`,`Gunakan Cmd/Ctrl + ] dan [ untuk memindahkan layer ke depan atau ke belakang.`],
quiz:[
 {q:`Kartu A punya z-index:999 di dalam induk dengan z-index:1. Saudaranya, C (di luar), punya z-index:2. Mana yang di atas?`,options:[`A`,`C`],why:`A terjebak di nampan induknya, dan nampan itu (1) berada di bawah C (2).`},
 {q:`Mana yang TIDAK membuat stacking context?`,options:[`opacity: 0.9`,`transform: translateX(0)`,`isolation: isolate`,`margin: 10px`],why:`margin tidak berpengaruh pada penumpukan.`}
]},
/* ───────────── MAHIR ───────────── */
a11y: {
title:'Aksesibilitas (WCAG)', metaphor:'Ramp di trotoar',
parable:`Ramp di ujung trotoar dibuat untuk pengguna kursi roda. Sekarang orang tua dengan kereta bayi, pelancong dengan koper, dan anak-anak bersepeda memakainya setiap hari. Desain yang aksesibel itu seperti ramp trotoar: dibuat untuk sebagian orang, lebih baik untuk semua orang.`,
theory:[`Perceivable (dapat dipersepsi): sediakan alternatif teks dan kontras yang cukup, dan jangan hanya mengandalkan warna.`,`Operable (dapat dioperasikan): semuanya bisa dipakai dengan keyboard, dengan focus ring yang terlihat.`,`Understandable (dapat dipahami): gunakan label sungguhan (bukan hanya placeholder) dan pesan error yang jelas.`,`Robust (tangguh): HTML semantik (button, label, nav) membantu teknologi asistif memahami halaman. Untuk mengujinya, singkirkan mouse dan tekan Tab.`],
controls:[{label:'Label',options:['Hanya placeholder','Label sungguhan']},{label:'Focus ring',options:['Dihapus','Terlihat']},{label:'Simulasi penglihatan',options:['Tidak ada','Buram','Hitam putih']}],
bad:'Div berisi ikon saja. Screen reader tidak mengucapkan apa-apa, dan tidak bisa dijangkau dengan keyboard.',
good:'Button sungguhan dengan label yang terlihat, bisa difokus dan diumumkan.',
figma:[`Gunakan plugin seperti Stark, atau kit anotasi urutan fokus, untuk menandai urutan tab dan mengecek kontras.`,`Tambahkan variant "Focus" ke setiap komponen interaktif supaya developer membuat ring-nya.`,`Tulis alt text dan nama aksesibel di anotasi Dev Mode.`],
quiz:[
 {q:`Kenapa label yang hanya berupa placeholder bermasalah?`,options:[`Hilang saat mengetik dan sering berkontras rendah`,`Lambat`,`Merusak CSS`],why:`begitu kamu mengetik, petunjuknya hilang, dan teks placeholder biasanya gagal uji kontras.`},
 {q:`Apa tes aksesibilitas tercepat?`,options:[`Pakai keyboard saja (Tab, Enter, Spasi)`,`Perbesar logonya`,`Tambah animasi`],why:`memakai keyboard saja akan memperlihatkan focus state yang hilang, jebakan fokus, dan tombol palsu.`}
]},
'figma-components': {
title:'Auto Layout & Komponen Figma', metaphor:'Cetakan kue',
parable:`Tukang roti memakai satu cetakan untuk membuat seratus kue. Ubah bentuk cetakannya, dan seluruh adonan besok ikut berubah. Itulah komponen Figma: satu main, banyak instance. Auto layout adalah loyang yang menata jarak kue dengan rata dan ikut membesar saat kamu menambah satu kue lagi.`,
theory:[`Main component (◆) mendefinisikan desainnya. Instance (◇) mewarisinya dan bisa menimpa teks atau warna secara lokal.`,`Variant mengelompokkan state dan ukuran ke dalam satu component set (Size=S/M/L, State=Hover).`,`Auto layout punya direction, gap, padding, alignment, serta ukuran Hug atau Fill. Pada dasarnya ini CSS Flexbox.`,`Component property (boolean, text, instance swap) menjaga instance tetap fleksibel tanpa perlu di-detach.`],
controls:[{label:'Arah',options:['Horizontal →','Vertikal ↓']},{label:'Gap'},{label:'Padding'},{label:'Anak elemen',options:['Hug contents','Fill container']},{label:'Warna main component',options:['Mint','Lilac','Amber']}],
bad:'Salinan yang di-detach: masing-masing sedikit melenceng warna, radius, dan padding-nya.',
good:'Instance dari satu main component, konsisten di mana-mana.',
figma:[`Pilih beberapa layer lalu tekan Shift+A untuk menambahkan Auto layout.`,`Tekan Cmd/Ctrl+Alt+K untuk membuat komponen, lalu "Combine as variants" untuk membuat set.`,`Tambahkan component property (Text, Boolean, Instance swap) daripada membuat variant yang hampir sama.`],
quiz:[
 {q:`Kamu perlu mengubah warna tombol di 120 layar. Apa yang kamu lakukan?`,options:[`Edit satu per satu`,`Edit main component sekali saja`,`Screenshot lalu warnai ulang`],why:`setiap instance mewarisi dari main component.`},
 {q:`"Fill container" di Auto layout paling mirip dengan CSS yang mana?`,options:[`flex: 1`,`position: absolute`,`float: right`],why:`Fill membesar mengisi sisa ruang, persis seperti flex: 1.`}
]},
state: {
title:'Event & State di JS', metaphor:'Mesin penjual otomatis',
parable:`Mesin penjual otomatis hanya melakukan apa yang diizinkan oleh state-nya saat ini. Belum ada koin? Tombolnya tidak berfungsi. Koin sudah cukup? Pilih camilan. Sedang mengeluarkan barang? Mohon tunggu. Setiap tekanan tombol adalah sebuah event, dan mesin mengecek state-nya sebelum memutuskan apa yang terjadi. UI-mu adalah mesin penjual otomatis.`,
theory:[`Event (click, input, keydown) adalah cara pengguna berbicara denganmu. Listener meresponsnya.`,`State adalah data yang menggambarkan apa yang benar saat ini: saldo, pilihan, status.`,`Render dari state. Perbarui state, lalu gambar ulang UI darinya, jangan sebaliknya.`,`Modelkan state secara eksplisit (idle → paying → dispensing) supaya kombinasi yang mustahil tidak bisa terjadi.`],
controls:[{label:'Harga camilan (¢)'},{label:'Log event',options:['Nyala','Mati']}],
bad:'DOM dijadikan sumber kebenaran, jadi logikanya membaca teks kembali dari layar.',
good:'Satu objek state, event memperbaruinya, dan render() menggambar ulang.',
figma:[`Modelkan layar sebagai variant (Idle / Paying / Dispensing) dan hubungkan dengan interaksi prototipe.`,`Gunakan Variables (number, boolean) untuk menyimpan state sungguhan seperti saldo di dalam prototipe.`,`Gabungkan "Set variable" saat klik dengan kondisi ("if credit ≥ price") untuk membuat prototipe logika tanpa kode.`],
quiz:[
 {q:`Di mana "jumlah barang di keranjang" sebaiknya disimpan?`,options:[`Di variabel state yang menjadi dasar render UI`,`Hanya di teks DOM`,`Di class CSS`],why:`state adalah satu-satunya sumber kebenaran, dan UI digambar darinya.`},
 {q:`Tombol Beli masih berfungsi saat mesin sedang mengeluarkan barang, sehingga tertagih dua kali. Apa perbaikannya?`,options:[`Cek state dan nonaktifkan aksi yang tidak valid pada state itu`,`Klik lebih pelan`,`Tambah listener lagi`],why:`state yang eksplisit mencegah aksi yang mustahil.`}
]},
motion: {
title:'Gerak & Easing', metaphor:'Lift & pengereman',
parable:`Lift yang baik tidak berpindah seketika, dan juga tidak berhenti mendadak. Ia melambat dengan halus sampai di lantaimu. Pengemudi yang baik mengerem dengan mulus, bukan dengan kecepatan konstan. Gerakan yang mulai cepat lalu melambat terasa alami, karena benda di dunia nyata punya massa dan gesekan.`,
theory:[`Durasi: 150–250ms untuk UI kecil, 250–400ms untuk panel. Di atas sekitar 500ms mulai terasa lamban.`,`Gunakan ease-out untuk elemen yang masuk, ease-in untuk elemen yang keluar, dan ease-in-out untuk elemen yang berpindah di layar.`,`Gerak linear terasa seperti robot. Simpan untuk spinner dan progress bar.`,`Animasikan transform dan opacity (ringan untuk GPU), dan hormati prefers-reduced-motion.`],
controls:[{label:'Durasi'},{label:'Easing'}],
bad:'Linear dan lambat, seperti robot di ban berjalan.',
good:'Ease-out: mulai cepat lalu berhenti dengan lembut.',
figma:[`Gunakan Smart Animate antar variant, dengan "Ease out" 200–300ms untuk elemen yang masuk.`,`Coba preset Spring (Gentle, Quick, Bouncy) untuk UI yang playful.`,`Dokumentasikan token gerak (motion/fast = 150ms, motion/base = 250ms) untuk developer.`],
quiz:[
 {q:`Sebuah menu dropdown sedang terbuka. Easing mana yang paling cocok?`,options:[`ease-out (mulai cepat, berhenti lembut)`,`ease-in (mulai lambat, berhenti mendadak)`,`linear`],why:`elemen yang masuk sebaiknya datang dengan cepat lalu mengendap.`},
 {q:`Properti mana yang paling ringan untuk dianimasikan?`,options:[`width`,`top`,`transform`],why:`transform melewati proses layout dan dikomposisi oleh GPU.`}
]},
tokens: {
title:'Design Token & Tema', metaphor:'Rak bumbu',
parable:`Di dapur yang tertata, setiap toples bumbu diberi label dan selalu berada di tempat yang sama. Resep menulis "sejumput garam", bukan "butiran dari toples ketiga di sebelah kiri". Design token adalah toples berlabel itu: color-accent, space-16, radius-md. Ganti isi toplesnya, dan setiap resep yang memakainya ikut berubah.`,
theory:[`Token adalah keputusan desain yang diberi nama: warna, tipografi, spasi, radius, bayangan, gerak.`,`Susun berlapis: primitive (mint-300) → semantic (color-action) → component (button-bg).`,`Tema (gelap, terang, brand) menukar nilainya dan mempertahankan namanya.`,`Di kode, token adalah CSS custom property. Di Figma, token adalah Variables dengan Modes. Jaga satu sumber kebenaran.`],
controls:[{label:'Tema (mode)',options:['Terminal','Kertas','Permen']},{label:'token radius'},{label:'token spasi'}],
bad:'Nilai yang di-hardcode tersebar di setiap file.',
good:'Token semantik: satu toples, dipakai di mana-mana.',
figma:[`Di panel Local variables, buat collection (Primitives, Semantic) dan tambahkan Modes (Dark, Light) untuk tema.`,`Hubungkan fill, gap, radius, dan padding ke variable lewat ikon variable di setiap kolom.`,`Sinkronkan variable ke kode lewat plugin atau Variables REST API supaya CSS custom property-mu sama.`],
quiz:[
 {q:`Apa nama token terbaik untuk background tombol utama?`,options:[`#7EF2C3`,`mint-green-light`,`color-action-primary`],why:`nama semantik menjelaskan tujuan, jadi nilainya bisa berubah tanpa mengganti nama.`},
 {q:`Untuk menambahkan dark mode dengan token, kamu…`,options:[`Menulis ulang setiap komponen`,`Menukar nilai token di bawah sebuah tema atau mode`,`Menduplikasi situsnya`],why:`tema menukar nilai dan mempertahankan nama.`}
]}
};
