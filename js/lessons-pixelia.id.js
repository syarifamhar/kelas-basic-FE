/* Indonesian (ID) translations for the new Pixelia lessons. Same shape as lessons.id.js. */
Object.assign(window.UX_LESSONS_ID = window.UX_LESSONS_ID || {}, {
'ux-process': {
title:'Proses UX', metaphor:'Periksa ke dokter',
parable:`Dokter yang bagus nggak langsung kasih obat begitu kamu duduk. Dia dengerin dan nanya-nanya dulu, baru nyebut masalahnya, nimbang beberapa pilihan pengobatan, coba satu, terus ngecek kamu udah membaik atau belum. Desain juga gitu: pahami orangnya dulu, rumuskan masalahnya, cari ide, bikin sesuatu yang kecil, lalu tes.`,
theory:[`Empati: kenali dulu orang-orang yang kamu desain buat. Amati, dengerin, dan tanya-tanya sebelum gambar apa pun.`,`Define: rangkum temuanmu jadi satu pernyataan masalah yang jelas: siapa yang kesulitan, kesulitan apa, dan kenapa.`,`Ide dan prototype: sketsa ide sebanyak-banyaknya, lalu bikin versi cepat dan murah dari ide terbaik.`,`Tes: tunjukin prototype-nya ke user beneran. Temuanmu bakal bawa kamu balik ke langkah sebelumnya, dan siklusnya muter lagi.`],
controls:[{label:'Tahap',options:['1 Empati','2 Define','3 Ide','4 Prototype','5 Tes']}],
bad:'Langsung loncat ke piksel: aplikasinya cantik, tapi nyelesaiin masalah yang salah.',
good:'Pahami dulu, bikin kecil, tes, lalu balik lagi dan perbaiki.',
figma:[`Bikin board FigJam dengan lima kolom, satu kolom per tahap, dan taruh semua catatan dan sketsa di situ.`,`Tempel pernyataan masalahmu sebagai sticky note gede di paling atas, biar tiap ide bisa dicek nyambung atau nggak.`,`Taruh link prototype Figma di kolom Tes dan tulis temuannya persis di sebelahnya.`],
quiz:[
 {q:`Apa yang sebaiknya kamu lakuin sebelum sketsa solusi?`,options:[`Pilih warna`,`Pahami user dan masalahnya`,`Nulis code`],why:`empati dan define dulu, kalau nggak kamu bisa nyelesaiin masalah yang salah.`},
 {q:`Pas dites, user nggak nemu nomor ambil pesanan. Terus gimana?`,options:[`Rilis aja`,`Balik lagi, perbaiki desainnya, terus tes ulang`,`Hapus aplikasinya`],why:`prosesnya itu siklus: hasil tes bawa kamu balik ke langkah sebelumnya.`}
]},
'ux-personas': {
title:'User, Research & Persona', metaphor:'Masak buat tamu',
parable:`Sebelum masak buat tamu, tuan rumah yang baik pasti nanya: ada yang vegetarian? Alergi kacang? Nggak kuat pedas? Kalau kamu cuma masak yang kamu suka, siap-siap aja piringnya masih penuh dan nggak disentuh. Di desain, research itu ya pertanyaan-pertanyaan tadi, dan persona itu daftar tamu yang kamu tempel di depanmu selama masak.`,
theory:[`Kamu bukan user-mu. Selera kamu sendiri cuma tebakan sampai dibuktiin sama orang beneran.`,`Metode research: wawancara jawab kenapa, survei jawab berapa banyak, analytics nunjukin apa yang beneran dilakuin orang.`,`Persona itu profil singkat user yang khas, dibikin dari hasil research: goal, pain point, dan konteksnya.`,`Pakai persona buat ambil keputusan: "Bu Ratna, 68 tahun dan pakai kacamata baca, bisa nemu button ini nggak?"`],
controls:[{label:'Persona',options:['Sari, mahasiswa','Andi, orang kantoran','Ratna, pensiunan']},{label:'Desain buat',options:['Persona-nya','Diri sendiri']}],
bad:'"Aku sukanya gini" itu cuma satu pendapat, bukan research.',
good:'Persona dari hasil wawancara, ditaruh di sebelah desain.',
figma:[`Bikin component kartu persona di Figma: foto, nama, kutipan, goal, pain point, konteks.`,`Taruh kartu persona di page yang sama dengan layarmu, biar selalu kelihatan pas kamu desain.`,`Bikin board FigJam isinya kutipan wawancara sebagai sticky note, terus kelompokin jadi tema (affinity mapping).`],
quiz:[
 {q:`Metode mana yang jawab KENAPA orang berperilaku kayak gitu?`,options:[`Analytics`,`Wawancara`,`A/B test`],why:`lewat wawancara, orang bisa jelasin alasannya. Analytics cuma nunjukin apa yang terjadi, bukan kenapa.`},
 {q:`Persona seharusnya berasal dari mana?`,options:[`Imajinasimu`,`Research beneran tentang user beneran`,`Foto stok`],why:`persona itu rangkuman insight dari research. Persona karangan cuma ngulang asumsimu sendiri.`}
]},
'ux-flows': {
title:'User Flow & Funnel', metaphor:'Jalan pintas di taman',
parable:`Taman biasanya punya jalan setapak rapi yang muter ngelilingin rumput, terus ada juga jalan pintas becek yang motong lurus lewat rumput. Orang jalan lewat yang paling gampang. Jejak becek itu, namanya "desire path", nunjukin rute yang sebenarnya orang mau. User flow memetakan tiap langkah orang buat sampai ke goal-nya, biar kamu bisa ngaspal jalan pintas itu, bukan malah ngelawannya.`,
theory:[`User flow itu urutan layar dan keputusan yang dilewatin seseorang buat nyelesaiin satu tugas.`,`Tiap langkah tambahan bikin sebagian orang kabur. Langkahnya makin sedikit dan jelas, makin banyak orang yang sampai tujuan.`,`Petakan happy path dulu, baru cabang-cabangnya: error, user belum login, keranjang kosong.`,`Arsitektur informasi itu soal gimana konten dikelompokin dan dikasih label, biar orang bisa nebak sesuatu ada di mana.`],
controls:[{label:'Alur checkout',options:['Wajib daftar','Checkout tamu']},{label:'Yang kabur per langkah (%)'}],
bad:'Tiap layar tambahan itu pintu buat orang kabur.',
good:'Aspal jalan pintasnya: biarin orang checkout sebagai tamu.',
figma:[`Gambar alurnya di FigJam pakai bentuk: kotak buat layar, belah ketupat buat keputusan, panah buat aksi.`,`Kasih nama tiap frame sesuai langkahnya ("02 Alamat") biar alur dan layarnya nyambung.`,`Pakai mode Prototype di Figma buat nyobain alurnya sendiri dan hitung udah berapa kali tap.`],
quiz:[
 {q:`Tiap langkah kehilangan 15% orang. Kalau dua langkah dihapus, efeknya apa?`,options:[`Nggak ada`,`Lebih banyak yang sampai tujuan`,`Lebih sedikit yang sampai tujuan`],why:`makin sedikit kesempatan buat kabur, makin banyak yang selesai.`},
 {q:`"Happy path" itu apa sih?`,options:[`Rute pas semuanya lancar`,`Jalur yang warnanya bagus`,`Layar-layar error`],why:`petakan rute idealnya dulu, baru desain cabang-cabang pas ada yang salah.`}
]},
'ux-heuristics': {
title:'Heuristic & Usability Testing', metaphor:'Inspektur bangunan',
parable:`Sebelum gedung baru ditempatin, inspektur keliling bawa checklist: pintu darurat udah ada tandanya belum, tangga ada pegangannya nggak, saklar lampu gampang ditemuin nggak? Dia nggak butuh cetak biru arsitek buat nemuin masalah. Usability heuristic itu checklist yang sama buat tampilan aplikasi, dan usability testing itu ngamatin penghuni beneran nyobain tinggal di sana.`,
theory:[`10 heuristic dari Jakob Nielsen itu aturan praktis, contohnya: tunjukin status sistem, pakai bahasa user, sediain undo, cegah error.`,`Review heuristic itu cepat dan murah: telusuri layar satu per satu dan catat tiap aturan yang dilanggar.`,`Usability testing artinya ngamatin sekitar 5 user beneran nyobain tugas beneran. Kamu diem aja dan catat.`,`Urutin masalahnya dari seberapa sering dan seberapa parah, terus beresin yang paling parah dulu.`],
controls:[{label:'Perbaikan dipasang'}],
bad:'Rilis tanpa dicek siapa-siapa: user yang nemu masalahnya, dan rasanya nggak enak.',
good:'Sekali jalan pakai checklist plus 5 user beneran udah nemuin sebagian besar masalah.',
figma:[`Duplikat layarmu ke page "Review" dan tempel sticky note merah buat tiap heuristic yang dilanggar.`,`Tes pakai link prototype Figma di HP. Minta user ngomongin isi pikirannya sambil kamu nyatet.`,`Kumpulin temuan di FigJam, kasih level keparahan (1 sampai 3), terus beresin yang nilainya 3 duluan.`],
quiz:[
 {q:`User nggak sengaja hapus file dan nggak bisa balikin lagi. Heuristic mana yang dilanggar?`,options:[`Kontrol & kebebasan user (undo)`,`Desain estetis`,`Dokumentasi bantuan`],why:`orang butuh pintu darurat: undo atau batal.`},
 {q:`Biasanya butuh berapa user buat usability testing cepat supaya sebagian besar masalah besar ketemu?`,options:[`1`,`Sekitar 5`,`500`],why:`sekitar 5 user udah cukup buat nunjukin sebagian besar masalah utama. Tes, perbaiki, terus tes lagi.`}
]},
'figma-basics': {
title:'Frame, Layer & Bentuk', metaphor:'Tumpukan lembar kaca',
parable:`Animator zaman dulu gambar di atas lembaran plastik bening: background di satu lembar, tokoh di lembar lain, balon kata paling atas. Tumpuk semuanya, jadilah satu gambar; angkat satu lembar, kamu cuma ngubah bagian itu aja. File Figma juga gitu. Tiap frame isinya tumpukan layer, dan urutan tumpukannya yang nentuin apa yang ada di depan.`,
theory:[`Frame itu wadah, kayak layar atau artboard. Mulai desain dengan gambar frame (tekan F) seukuran HP atau desktop.`,`Semua yang ada di dalamnya itu layer: bentuk, teks, gambar, sampai frame lain. Di panel Layers, makin atas di daftar artinya makin di depan.`,`Group layer (Ctrl/Cmd+G) biar bisa dipindah bareng, dan susun frame di dalam frame buat bikin bagian dengan layout-nya sendiri.`,`Kasih nama layer-mu. "Frame 482" nggak ngasih info apa-apa; "Card / Product" langsung jelas buat semua orang.`],
controls:[{label:'Pisahin layer'},{label:'Layer dipilih',options:['Frame','Kartu','Gambar','Judul','Button']}],
bad:'Bentuk-bentuk lepas di kanvas dengan nama bawaan. Mau nyari apa pun susah banget.',
good:'Semuanya ada di frame yang dikasih nama, disusun sesuai fungsinya.',
figma:[`Tekan F, terus pilih preset kayak iPhone 15 atau Desktop di panel kanan buat bikin frame.`,`Double-click nama layer di panel Layers buat ganti namanya. Pakai garis miring buat ngelompokin nama: "Card / Product".`,`Tekan Ctrl/Cmd + ] atau [ buat mindahin layer yang dipilih naik atau turun di tumpukan.`],
quiz:[
 {q:`Di panel Layers, layer yang posisinya lebih atas di daftar itu ada…`,options:[`di belakang layer lain`,`di depan layer lain`,`tersembunyi`],why:`daftarnya itu tumpukan: yang paling atas di daftar digambar paling depan.`},
 {q:`Wadah paling pas buat desain satu layar itu…`,options:[`Group`,`Frame`,`Rectangle`],why:`frame bisa diatur ukurannya sesuai device, motong content yang keluar, dan punya layout sendiri. Group nggak bisa.`}
]},
'figma-prototype': {
title:'Prototyping & Smart Animate', metaphor:'Buku flipbook',
parable:`Kalau kamu balik halaman flipbook cepat-cepat, gambarnya jadi kayak hidup, karena tiap halaman cuma beda dikit dari sebelumnya. Prototype di Figma juga gitu. Kamu nyambungin layar pakai panah, terus Smart Animate nyari layer yang namanya sama di kedua layar dan ngegeser layer itu dengan mulus dari satu halaman ke halaman berikutnya.`,
theory:[`Di tab Prototype, tarik sambungan dari satu layer ke frame lain. Nah, itu namanya interaction.`,`Tiap interaction punya pemicu (On click, While hovering, After delay) dan aksi (Navigate to, Open overlay, Back).`,`Animasi nentuin transition-nya kelihatan kayak gimana: Instant, Dissolve, Move in, atau Smart Animate.`,`Smart Animate nyocokin layer yang namanya sama antar frame, lalu nganimasiin beda posisi, ukuran, warna, dan opacity-nya.`],
controls:[{label:'Pemicu',options:['Pas di-click','Setelah jeda']},{label:'Animasi'},{label:'Durasi'}],
bad:'Nama layer di tiap frame beda-beda: Smart Animate cuma bisa bikin efek fade.',
good:'Namanya sama di kedua layar: Smart Animate gerakinnya mulus.',
figma:[`Pindah ke tab Prototype (Shift+E), pilih satu layer, terus tarik titik birunya ke frame lain.`,`Di panel interaction, atur pemicunya, set Animation ke Smart Animate, dan coba Ease out 300ms.`,`Tekan tombol Play (kanan atas) buat nyoba, atau buka prototype-nya di HP lewat aplikasi Figma.`],
quiz:[
 {q:`Smart Animate nentuin layer mana yang dianimasiin berdasarkan…`,options:[`warnanya`,`nama layer yang sama di kedua frame`,`pilihan acak`],why:`layer dengan nama (dan hierarki) yang sama di kedua frame bakal dianimasiin dari satu state ke state berikutnya.`},
 {q:`Pemicu mana yang jalan sendiri tanpa user ngapa-ngapain?`,options:[`On click`,`While hovering`,`After delay`],why:`After delay jalan sendiri, cocok buat splash screen dan state loading.`}
]},
'figma-handoff': {
title:'Dev Mode & Handoff', metaphor:'Cetak biru arsitek',
parable:`Tukang bangunan nggak nebak-nebak ukuran jendela dari lukisan rumah yang cantik. Mereka kerja pakai cetak biru yang nyantumin semua ukuran. Dev Mode ngubah desain Figma-mu jadi cetak biru kayak gitu: developer tinggal click layer mana aja buat baca ukuran, jarak, warna, dan font-nya, bahkan bisa langsung copy code-nya.`,
theory:[`Dev Mode (Shift+D) itu tampilan khusus developer. Click satu layer buat lihat ukuran, style, dan CSS-nya.`,`Tahan Alt/Option terus arahin kursor ke layer lain buat ngukur jarak di antara keduanya.`,`Pakai variable dan style dengan nama yang jelas, biar developer lihat "color/action", bukan kode hex random.`,`Tandain frame sebagai "Ready for dev" dan tambahin anotasi buat perilaku yang nggak kelihatan dari gambar, kayak loading atau error.`],
controls:[{label:'Inspect',options:['Jarak','Warna','Tipografi']},{label:'Anotasi',options:['Off','On']}],
bad:'Kirim screenshot doang. Developer jadi harus nebak tiap angka.',
good:'Link Dev Mode lengkap dengan variable bernama dan anotasi.',
figma:[`Nyalain Dev Mode pakai Shift+D, pilih satu layer, terus baca panel Inspect di sebelah kanan.`,`Klik kanan sebuah frame, pilih "Mark as ready for dev", biar developer tahu desainnya udah final.`,`Tambahin anotasi pakai tool Annotate di Dev Mode buat state kayak loading, kosong, dan error.`],
quiz:[
 {q:`Developer butuh jarak pasti antara dua layer. Di Dev Mode, harus ngapain?`,options:[`Nebak dari gambar`,`Pilih satu layer, terus tahan Alt/Option sambil arahin kursor ke layer lain`,`Ambil screenshot`],why:`Alt/Option nampilin jarak terukur antara layer yang dipilih dan layer yang ditunjuk.`},
 {q:`Kenapa warna dikasih nama sebagai variable kayak color/action?`,options:[`Biar kelihatan keren`,`Developer bisa pakai token yang sama di code, jadi perubahannya tetap sinkron`,`Diwajibin Figma`],why:`nama yang sama artinya desain dan code ngomongin hal yang sama.`}
]}
});
