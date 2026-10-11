/* Indonesian (ID) translations for the new Pixelia lessons. Same shape as lessons.id.js. */
Object.assign(window.UX_LESSONS_ID = window.UX_LESSONS_ID || {}, {
'ux-process': {
title:'Proses UX', metaphor:'Berobat ke dokter',
parable:`Dokter yang baik tidak langsung memberi obat begitu kamu masuk. Ia mendengarkan dan bertanya dulu, lalu menyebutkan masalahnya, menimbang beberapa pengobatan, mencoba satu, dan mengecek apakah kamu membaik. Desain bekerja dengan cara yang sama: pahami orangnya dulu, rumuskan masalahnya, jelajahi ide, buat sesuatu yang kecil, lalu uji.`,
theory:[`Empati: pelajari orang-orang yang kamu rancang untuknya. Amati, dengarkan, dan bertanya sebelum menggambar apa pun.`,`Definisi: ubah temuanmu menjadi satu pernyataan masalah yang jelas: siapa kesulitan apa, dan kenapa.`,`Ide dan prototipe: sketsa banyak ide, lalu buat versi cepat dan murah dari yang terbaik.`,`Uji: tunjukkan prototipe ke pengguna sungguhan. Temuanmu akan mengirimmu kembali ke langkah sebelumnya, dan siklusnya berulang.`],
controls:[{label:'Tahap',options:['1 Empati','2 Definisi','3 Ide','4 Prototipe','5 Uji']}],
bad:'Langsung lompat ke piksel: aplikasi cantik yang menyelesaikan masalah yang salah.',
good:'Pahami dulu, buat kecil, uji, lalu kembali dan perbaiki.',
figma:[`Buat papan FigJam dengan lima kolom, satu per tahap, dan simpan semua catatan dan sketsa di sana.`,`Tempel pernyataan masalahmu sebagai sticky note besar di atas, supaya setiap ide bisa dicek terhadapnya.`,`Tautkan prototipe Figma di kolom Uji dan tulis temuannya tepat di sebelahnya.`],
quiz:[
 {q:`Apa yang sebaiknya kamu lakukan sebelum membuat sketsa solusi?`,options:[`Memilih warna`,`Memahami pengguna dan masalahnya`,`Menulis kode`],why:`empati dan definisi dulu, kalau tidak kamu bisa menyelesaikan masalah yang salah.`},
 {q:`Pengujian menunjukkan pengguna tidak menemukan nomor ambil pesanan. Lalu apa?`,options:[`Rilis saja`,`Kembali, perbaiki desainnya, lalu uji lagi`,`Hapus aplikasinya`],why:`prosesnya berupa siklus: hasil uji mengirimmu kembali ke langkah sebelumnya.`}
]},
'ux-personas': {
title:'Pengguna, Riset & Persona', metaphor:'Memasak untuk tamu',
parable:`Sebelum memasak untuk tamu, tuan rumah yang baik bertanya: ada yang vegetarian? Alergi kacang? Tidak suka pedas? Memasak hanya yang kamu suka adalah cara tercepat berakhir dengan piring penuh yang tidak disentuh. Dalam desain, riset adalah pertanyaan-pertanyaan itu, dan persona adalah daftar tamu yang kamu letakkan di depanmu saat memasak.`,
theory:[`Kamu bukan penggunamu. Seleramu sendiri hanyalah tebakan sampai dibuktikan oleh orang sungguhan.`,`Metode riset: wawancara menjawab kenapa, survei menjawab berapa banyak, analytics menunjukkan apa yang sebenarnya dilakukan orang.`,`Persona adalah profil singkat pengguna yang khas, dibuat dari hasil riset: tujuan, frustrasi, dan konteks.`,`Gunakan persona untuk mengambil keputusan: "Apakah Bu Ratna, 68 tahun dan berkacamata baca, bisa menemukan tombol ini?"`],
controls:[{label:'Persona',options:['Sari, mahasiswa','Andi, pekerja kantor','Ratna, pensiunan']},{label:'Rancang untuk',options:['Persona-nya','Dirimu sendiri']}],
bad:'"Aku sukanya begini" itu satu pendapat, bukan riset.',
good:'Persona yang dibuat dari wawancara, diletakkan di samping desain.',
figma:[`Buat komponen kartu persona di Figma: foto, nama, kutipan, tujuan, frustrasi, konteks.`,`Letakkan kartu persona di halaman yang sama dengan layarmu supaya selalu terlihat saat mendesain.`,`Buat papan FigJam berisi kutipan wawancara sebagai sticky note, lalu kelompokkan menjadi tema (affinity mapping).`],
quiz:[
 {q:`Metode mana yang menjawab KENAPA orang berperilaku tertentu?`,options:[`Analytics`,`Wawancara`,`A/B test`],why:`wawancara membuat orang bisa menjelaskan alasannya. Analytics menunjukkan apa yang terjadi, bukan kenapa.`},
 {q:`Dari mana persona seharusnya berasal?`,options:[`Imajinasimu`,`Riset sungguhan tentang pengguna sungguhan`,`Foto stok`],why:`persona merangkum temuan riset. Persona karangan hanya mengulang asumsimu sendiri.`}
]},
'ux-flows': {
title:'User Flow & Funnel', metaphor:'Jalan pintas di taman',
parable:`Taman sering punya jalan setapak rapi yang memutari rumput, dan jalan pintas becek yang memotong lurus di atas rumput. Orang berjalan di tempat yang paling mudah. Garis becek itu, disebut "desire path", menunjukkan rute yang sebenarnya diinginkan orang. User flow memetakan setiap langkah orang untuk mencapai tujuan, supaya kamu bisa mengaspal jalan pintasnya alih-alih melawannya.`,
theory:[`User flow adalah urutan layar dan keputusan yang dilalui seseorang untuk menyelesaikan satu tugas.`,`Setiap langkah tambahan membuat sebagian orang pergi. Langkah yang lebih sedikit dan jelas berarti lebih banyak orang sampai tujuan.`,`Petakan happy path dulu, lalu cabang-cabangnya: error, pengguna belum login, keranjang kosong.`,`Arsitektur informasi adalah cara konten dikelompokkan dan diberi label, supaya orang bisa menebak di mana sesuatu berada.`],
controls:[{label:'Alur checkout',options:['Wajib daftar akun','Checkout sebagai tamu']},{label:'Orang yang pergi per langkah (%)'}],
bad:'Setiap layar tambahan adalah pintu tempat orang pergi.',
good:'Aspal jalan pintasnya: izinkan orang checkout sebagai tamu.',
figma:[`Gambar alurnya di FigJam dengan bentuk: persegi untuk layar, belah ketupat untuk keputusan, panah untuk aksi.`,`Beri nama setiap frame sesuai langkahnya ("02 Alamat") supaya alur dan layarnya cocok.`,`Gunakan tampilan Prototype di Figma untuk mencoba alurnya sendiri dan hitung jumlah ketukannya.`],
quiz:[
 {q:`Setiap langkah kehilangan 15% orang. Apa efek menghapus dua langkah?`,options:[`Tidak ada`,`Lebih banyak orang sampai tujuan`,`Lebih sedikit orang sampai tujuan`],why:`semakin sedikit tempat untuk pergi, semakin banyak yang selesai.`},
 {q:`Apa itu "happy path"?`,options:[`Rute ketika semuanya berjalan lancar`,`Jalur dengan warna yang bagus`,`Layar-layar error`],why:`petakan rute idealnya dulu, lalu rancang cabang-cabang saat terjadi masalah.`}
]},
'ux-heuristics': {
title:'Heuristik Usability & Pengujian', metaphor:'Inspektur bangunan',
parable:`Sebelum orang menempati gedung baru, inspektur berkeliling dengan daftar periksa: apakah pintu darurat diberi tanda, apakah tangga punya pegangan, apakah saklar lampu mudah ditemukan? Ia tidak perlu cetak biru arsitek untuk menemukan masalah. Heuristik usability adalah daftar periksa itu untuk antarmuka, dan uji usability adalah mengamati penghuni sungguhan mencoba tinggal di sana.`,
theory:[`10 heuristik Jakob Nielsen adalah aturan praktis, misalnya: tampilkan status sistem, pakai bahasa pengguna, izinkan undo, cegah error.`,`Review heuristik itu cepat dan murah: telusuri layar-layarnya dan catat setiap aturan yang dilanggar.`,`Uji usability berarti mengamati sekitar 5 pengguna sungguhan mencoba tugas sungguhan. Diam dan catat.`,`Urutkan masalah berdasarkan seberapa sering dan seberapa parah, lalu perbaiki yang terburuk dulu.`],
controls:[{label:'Perbaikan diterapkan'}],
bad:'Rilis tanpa ada yang memeriksa: masalah ditemukan pengguna dengan cara yang menyakitkan.',
good:'Satu putaran daftar periksa ditambah 5 pengguna sungguhan menemukan sebagian besar masalah.',
figma:[`Duplikat layarmu ke halaman "Review" dan tambahkan sticky note merah untuk setiap heuristik yang dilanggar.`,`Lakukan uji dengan link prototipe Figma di ponsel. Minta pengguna berpikir keras sambil kamu mencatat.`,`Kumpulkan temuan di FigJam, beri tingkat keparahan (1 sampai 3), lalu perbaiki yang bernilai 3 dulu.`],
quiz:[
 {q:`Pengguna tidak sengaja menghapus file dan tidak bisa mengembalikannya. Heuristik mana yang dilanggar?`,options:[`Kontrol dan kebebasan pengguna (undo)`,`Desain estetis`,`Dokumentasi bantuan`],why:`orang butuh pintu darurat: undo atau batal.`},
 {q:`Berapa pengguna yang biasanya dibutuhkan uji usability cepat untuk menemukan sebagian besar masalah besar?`,options:[`1`,`Sekitar 5`,`500`],why:`sekitar 5 pengguna sudah memperlihatkan sebagian besar masalah utama. Uji, perbaiki, lalu uji lagi.`}
]},
'figma-basics': {
title:'Frame, Layer & Bentuk', metaphor:'Tumpukan lembar kaca',
parable:`Animator zaman dulu menggambar di atas lembaran plastik bening: latar di satu lembar, tokoh di lembar lain, balon kata di paling atas. Tumpuk semuanya dan kamu melihat satu gambar; angkat satu lembar dan kamu hanya mengubah bagian itu. File Figma bekerja dengan cara yang sama. Setiap frame berisi tumpukan layer, dan urutan tumpukannya menentukan apa yang ada di depan.`,
theory:[`Frame adalah wadah, seperti layar atau artboard. Mulai desain dengan menggambar frame (tekan F) berukuran ponsel atau desktop.`,`Semua yang ada di dalamnya adalah layer: bentuk, teks, gambar, dan frame lain. Di panel Layers, makin atas di daftar berarti makin di depan.`,`Kelompokkan layer (Ctrl/Cmd+G) untuk memindahkannya bersama, dan susun frame bersarang untuk membuat bagian dengan tata letaknya sendiri.`,`Beri nama layermu. "Frame 482" tidak memberi tahu apa pun; "Card / Product" memberi tahu semua orang.`],
controls:[{label:'Pisahkan layer'},{label:'Layer terpilih',options:['Frame','Kartu','Gambar','Judul','Tombol']}],
bad:'Bentuk-bentuk lepas di kanvas dengan nama bawaan. Mustahil mencari apa pun.',
good:'Semuanya berada di frame bernama, tersusun sesuai maknanya.',
figma:[`Tekan F lalu pilih preset seperti iPhone 15 atau Desktop di panel kanan untuk membuat frame.`,`Klik dua kali nama layer di panel Layers untuk menggantinya. Pakai garis miring untuk mengelompokkan nama: "Card / Product".`,`Tekan Ctrl/Cmd + ] atau [ untuk memindahkan layer terpilih naik atau turun di tumpukan.`],
quiz:[
 {q:`Di panel Layers, layer yang lebih atas di daftar berada…`,options:[`di belakang layer lain`,`di depan layer lain`,`tersembunyi`],why:`daftarnya adalah tumpukan: paling atas di daftar digambar paling depan.`},
 {q:`Wadah terbaik untuk desain sebuah layar adalah…`,options:[`Group`,`Frame`,`Rectangle`],why:`frame bisa diatur ukurannya sesuai perangkat, memotong konten, dan punya tata letaknya sendiri. Group tidak bisa.`}
]},
'figma-prototype': {
title:'Prototyping & Smart Animate', metaphor:'Buku flipbook',
parable:`Balik halaman flipbook dengan cepat dan gambarnya jadi hidup, karena setiap halaman hanya sedikit berbeda dari sebelumnya. Prototipe Figma bekerja dengan cara yang sama. Kamu menghubungkan layar dengan panah, dan Smart Animate mencari layer bernama sama di kedua layar lalu menggesernya dengan mulus dari satu halaman ke halaman berikutnya.`,
theory:[`Di tab Prototype, tarik koneksi dari sebuah layer ke frame lain. Itulah interaksi.`,`Setiap interaksi punya pemicu (On click, While hovering, After delay) dan aksi (Navigate to, Open overlay, Back).`,`Animasi menentukan tampilan perpindahannya: Instant, Dissolve, Move in, atau Smart Animate.`,`Smart Animate mencocokkan layer bernama sama di antara frame dan menganimasikan perbedaan posisi, ukuran, warna, dan opacity-nya.`],
controls:[{label:'Pemicu',options:['Saat diklik','Setelah jeda']},{label:'Animasi'},{label:'Durasi'}],
bad:'Frame dengan nama layer berbeda: Smart Animate hanya bisa memudarkannya.',
good:'Nama yang sama di kedua layar: Smart Animate menggerakkannya dengan mulus.',
figma:[`Pindah ke tab Prototype (Shift+E), pilih sebuah layer, lalu tarik pegangan birunya ke frame lain.`,`Di panel interaksi, atur pemicunya, atur Animation ke Smart Animate, dan coba Ease out 300ms.`,`Tekan tombol Play (kanan atas) untuk mencobanya, atau buka prototipenya di ponsel lewat aplikasi Figma.`],
quiz:[
 {q:`Smart Animate menentukan layer mana yang dianimasikan berdasarkan…`,options:[`warnanya`,`nama layer yang sama di kedua frame`,`pilihan acak`],why:`layer dengan nama (dan hierarki) yang sama di kedua frame dianimasikan dari satu keadaan ke keadaan lain.`},
 {q:`Pemicu mana yang berjalan tanpa pengguna melakukan apa pun?`,options:[`On click`,`While hovering`,`After delay`],why:`After delay berjalan sendiri, berguna untuk splash screen dan status loading.`}
]},
'figma-handoff': {
title:'Dev Mode & Handoff', metaphor:'Cetak biru arsitek',
parable:`Tukang bangunan tidak menebak ukuran jendela dari lukisan rumah yang cantik. Mereka bekerja dari cetak biru yang mencantumkan setiap ukuran. Dev Mode mengubah desain Figma-mu menjadi cetak biru itu: developer mengklik layer mana pun dan membaca ukuran, jarak, warna, dan font-nya, bahkan menyalin kode yang sudah jadi.`,
theory:[`Dev Mode (Shift+D) adalah tampilan untuk developer. Klik sebuah layer untuk melihat ukuran, gaya, dan CSS-nya.`,`Tahan Alt/Option lalu arahkan kursor ke layer lain untuk mengukur jarak di antara keduanya.`,`Gunakan variable dan style dengan nama yang baik, supaya developer melihat "color/action" alih-alih kode hex acak.`,`Tandai frame sebagai "Ready for dev" dan tambahkan anotasi untuk perilaku yang tidak bisa ditunjukkan gambar, seperti loading atau error.`],
controls:[{label:'Periksa',options:['Jarak','Warna','Tipografi']},{label:'Anotasi',options:['Mati','Nyala']}],
bad:'Mengirim screenshot. Developer harus menebak setiap angka.',
good:'Link Dev Mode dengan variable bernama dan anotasi.',
figma:[`Nyalakan Dev Mode dengan Shift+D, pilih sebuah layer, dan baca panel Inspect di sebelah kanan.`,`Klik kanan sebuah frame lalu pilih "Mark as ready for dev" supaya developer tahu desainnya sudah final.`,`Tambahkan anotasi dengan alat Annotate di Dev Mode untuk keadaan seperti loading, kosong, dan error.`],
quiz:[
 {q:`Developer butuh jarak pasti antara dua layer. Apa yang sebaiknya dilakukan di Dev Mode?`,options:[`Menebak dari gambar`,`Pilih satu layer lalu tahan Alt/Option sambil mengarahkan kursor ke layer lain`,`Ambil screenshot`],why:`Alt/Option menampilkan jarak terukur antara layer terpilih dan layer yang ditunjuk.`},
 {q:`Kenapa warna diberi nama sebagai variable seperti color/action?`,options:[`Supaya terlihat keren`,`Developer bisa memakai token yang sama di kode, dan perubahan tetap sinkron`,`Figma mewajibkannya`],why:`nama yang sama berarti desain dan kode membicarakan hal yang sama.`}
]}
});
