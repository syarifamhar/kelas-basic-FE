/* Indonesian (ID) translations for the Frontera (frontend) lessons. Same shape as lessons.id.js. */
Object.assign(window.UX_LESSONS_ID = window.UX_LESSONS_ID || {}, {
/* ───────────── KOTA REACT ───────────── */
'react-components': {
title:'Komponen & JSX', metaphor:'Kepingan LEGO',
legend:['Komponen','State','Props mengalir ke bawah','Event naik ke atas'],
parable:`Tidak ada yang membangun istana LEGO dari satu kepingan raksasa. Kamu menyambungkan kepingan-kepingan kecil: kepingan jendela, kepingan pintu, kepingan menara. Buat satu kepingan, lalu pakai seratus kali. Aplikasi React dibangun dengan cara yang sama. Potongan kecil bernama komponen disambung menjadi satu halaman utuh.`,
theory:[`Komponen adalah fungsi JavaScript yang mengembalikan UI. Namanya diawali huruf kapital: function ProductCard() { … }.`,`JSX memungkinkan kamu menulis tag mirip HTML di dalam JavaScript. {Kurung kurawal} memasukkan nilai JavaScript ke dalam markup.`,`Pakai komponen seperti tag: <ProductCard />. Tulis sekali, pakai sebanyak yang kamu mau.`,`Komponen bisa bersarang di dalam komponen lain dan membentuk pohon, dengan App di puncaknya. Pohon itulah yang ditampilkan tampilan 3D.`],
controls:[{label:'Jumlah kartu'},{label:'Warna kepingan',options:['Biru React','Mint','Amber']},{label:'Gaya kartu',options:['Garis tepi','Berisi']}],
bad:'Satu App raksasa dengan markup hasil copy-paste. Salah ketik satu, harus diperbaiki di semua tempat.',
good:'Satu komponen kecil, dipakai ulang dengan data berbeda.',
figma:[`Mulai proyek: npm create vite@latest my-app -- --template react, lalu npm install dan npm run dev.`,`Pindahkan ProductCard ke file sendiri, src/ProductCard.jsx, export, lalu import di App.jsx.`,`Pasang React Developer Tools di browser. Tab Components-nya menampilkan pohon yang sama dengan tampilan 3D.`],
quiz:[
 {q:`Nama mana yang benar untuk komponen React?`,options:[`productCard`,`ProductCard`,`product-card`],why:`komponen harus diawali huruf kapital. Tag berhuruf kecil dianggap elemen HTML biasa.`},
 {q:`Apa fungsi {kurung kurawal} di dalam JSX?`,options:[`Memasukkan nilai JavaScript ke dalam markup`,`Membuat class CSS`,`Menjadikan kode komentar`],why:`kurung kurawal membuatmu kembali ke JavaScript, jadi {name} menampilkan nilai name.`}
]},
'react-props': {
title:'Props', metaphor:'Memesan kopi',
legend:['Komponen','State','Props mengalir ke bawah','Event naik ke atas'],
parable:`Di kedai kopi, semua barista memakai resep latte yang sama. Yang berbeda adalah kertas pesananmu: ukuran besar, gula sedikit, susu oat. Resepnya adalah komponen, kertas pesanannya adalah props. Resep sama, gelasnya berbeda-beda. Dan barista tidak pernah mengubah tulisan di kertas pesananmu.`,
theory:[`Props adalah input sebuah komponen. Kamu mengirimnya seperti atribut HTML: <Coffee size="L" sugar={1} />.`,`Komponen menerimanya sebagai satu objek: function Coffee({ size, sugar }) { … }.`,`Props mengalir satu arah, dari induk ke anak. Anak membacanya, tapi tidak pernah mengubahnya.`,`Apa saja bisa jadi props: teks, angka, array, fungsi, bahkan elemen lain (children).`],
controls:[{label:'Ukuran'},{label:'Gula'},{label:'Susu',options:['Biasa','Oat','Tanpa susu']}],
bad:'Anak mengubah props-nya sendiri. React mengabaikannya, dan induknya tidak pernah tahu.',
good:'Induk memegang nilainya dan mengirim props baru saat nilainya berubah.',
figma:[`Di VS Code, arahkan kursor ke komponen untuk melihat props apa saja yang dibutuhkan.`,`Beri nilai default langsung di parameter: function Coffee({ size = 'M' }).`,`Gunakan props children untuk membungkus konten: <Card><h2>Hai</h2></Card>, lalu tampilkan {children} di dalam Card.`],
quiz:[
 {q:`Komponen anak ingin nilai yang berbeda untuk props yang ia terima. Apa yang seharusnya terjadi?`,options:[`Ubah langsung: props.size = 'L'`,`Minta induk, yang memegang nilainya, untuk mengirim props baru`,`Muat ulang halaman`],why:`props itu hanya-baca. Induk yang memegang datanya dan mengirim nilai baru ke bawah.`},
 {q:`Bagaimana cara mengirim angka 2 sebagai props?`,options:[`sugar="2"`,`sugar={2}`,`sugar=2`],why:`kurung kurawal mengirim angka sungguhan. Tanda kutip mengirim teks "2".`}
]},
'react-state': {
title:'State dengan useState', metaphor:'Papan skor stadion',
legend:['Komponen','State','Props mengalir ke bawah','Event naik ke atas'],
parable:`Saat terjadi gol, tidak ada yang memanjat untuk mengecat ulang papan skor stadion. Operator cukup mengubah satu angka, dan papannya menggambar ulang sendiri. State di React adalah angka itu. Kamu mengubahnya lewat setter, dan React menggambar ulang setiap bagian layar yang memakainya.`,
theory:[`useState memberimu sebuah nilai dan setter-nya: const [score, setScore] = useState(0).`,`Memanggil setter membuat komponen di-render ulang dengan nilai baru. Mengubah variabel biasa tidak memperbarui layar.`,`State milik komponen yang mendeklarasikannya. Kirim ke bawah sebagai props kalau anak-anaknya butuh.`,`Jangan ubah state di tempat. Beri setter nilai baru: setScore(score + 1), atau setScore(s => s + 1).`],
controls:[{label:'Poin per gol'},{label:'Simpan skor di',options:['useState','variabel biasa']}],
bad:'Variabel biasa atau array yang diubah langsung. Datanya berubah, layarnya tidak.',
good:'useState dan nilai baru setiap kali. React me-render ulang bagian yang memakainya.',
figma:[`Di React Developer Tools, pilih sebuah komponen untuk melihat state-nya secara langsung, bahkan mengubahnya.`,`Simpan state serendah mungkin di pohon: hanya di komponen yang membutuhkannya.`,`Kalau dua komponen bersaudara butuh state yang sama, pindahkan ke induknya lalu kirim ke bawah sebagai props ("lifting state up").`],
quiz:[
 {q:`Kamu menulis score = score + 1 pada variabel biasa. Apa yang terjadi di layar?`,options:[`Ikut berubah`,`Tidak ada: React hanya me-render ulang saat state berubah lewat setter`,`Halaman dimuat ulang`],why:`React tidak mengawasi variabel biasa. Setter-lah yang memicu render ulang.`},
 {q:`Apa cara paling aman menambah 1 berdasarkan skor sebelumnya?`,options:[`setScore(s => s + 1)`,`score++`,`setScore(score++)`],why:`fungsi updater selalu mendapat nilai terbaru, bahkan saat ada beberapa update berturut-turut.`}
]},
'react-effects': {
title:'Efek samping dengan useEffect', metaphor:'Lampu sensor gerak',
legend:['Komponen','Efek','Efek berjalan','Cleanup'],
parable:`Lampu sensor gerak bekerja sendiri. Ada orang masuk, lampu menyala. Orangnya pergi, lampu mati. Tidak ada yang menekan saklar. useEffect adalah sensor itu: kamu memberi tahu React apa yang diawasi, apa yang dilakukan saat berubah, dan bagaimana membereskannya setelah itu.`,
theory:[`Render seharusnya hanya menggambarkan UI. Pekerjaan yang menyentuh dunia luar (timer, mengambil data, judul halaman) masuk ke useEffect.`,`Array dependensi menentukan kapan efek berjalan: [] sekali setelah render pertama, [room] setiap kali room berubah, tanpa array setelah setiap render.`,`Kembalikan fungsi cleanup untuk membatalkan efek: hentikan timer, tutup koneksi.`,`Kalau efek memakai sebuah nilai, masukkan ke dependensi. Kalau tidak, efek terus membaca nilai lama.`],
controls:[{label:'Dependensi',options:['[room]','[]','tanpa array']},{label:'Ruangan',options:['Dapur','Taman','Garasi']}],
bad:'Interval tanpa cleanup. Setiap render ulang memulai timer baru yang tidak pernah berhenti.',
good:'Jalankan sekali, dan bereskan saat komponennya pergi.',
figma:[`Ambil data di dalam efek: useEffect(() => { fetch(url).then(r => r.json()).then(setData) }, [url]).`,`Nyalakan aturan eslint-plugin-react-hooks. Ia memberi peringatan saat ada dependensi yang terlupa.`,`Saat development, React sengaja menjalankan efek dua kali (Strict Mode). Kalau itu merusak sesuatu, berarti cleanup-mu belum ada.`],
quiz:[
 {q:`useEffect(fn, []) berjalan…`,options:[`setelah setiap render`,`sekali, setelah render pertama`,`tidak pernah`],why:`array dependensi kosong berarti tidak ada yang bisa mengubahnya, jadi efek hanya berjalan setelah komponen dipasang.`},
 {q:`Efekmu memulai sebuah timer. Di mana kamu menghentikannya?`,options:[`Di fungsi cleanup yang dikembalikan oleh efek`,`Di dalam JSX`,`Tidak bisa`],why:`React memanggil cleanup sebelum efek berjalan lagi dan saat komponen dilepas.`}
]},
'react-lists': {
title:'List & key', metaphor:'Papan nama di kelas',
legend:['Komponen (satu per key)','State','Pindah bersama key-nya','Di-render ulang di tempat'],
parable:`Guru mengenali murid dari papan namanya, bukan dari kursi yang mereka duduki. Kalau murid bertukar kursi dan guru hanya ingat "anak di kursi 2", PR akan dikembalikan ke orang yang salah. Key di React adalah papan nama. Dengan key yang stabil, React tahu item mana yang berpindah, dan setiap item tetap menyimpan state-nya sendiri.`,
theory:[`Tampilkan list dengan map: students.map(s => <Row key={s.id} … />).`,`Key harus unik di antara saudaranya dan tidak boleh berubah dari waktu ke waktu. Id dari datamu paling cocok.`,`Memakai index array sebagai key akan rusak saat item diacak, disisipkan, atau dihapus: state menempel pada posisi, bukan pada item.`,`Key hanya untuk React. Key tidak dikirim ke komponenmu sebagai props.`],
controls:[{label:'Key'}],
bad:'Index sebagai key: setelah diacak, state tetap di kursinya, bukan ikut muridnya.',
good:'Id stabil dari data: papan nama ikut ke mana pun muridnya pindah.',
figma:[`Buka console browser: React memberi peringatan "Each child in a list should have a unique key prop" kalau key-nya tidak ada.`,`Kalau datamu tidak punya id, tambahkan saat item dibuat (crypto.randomUUID()), bukan saat render.`,`Coba: acak dengan key={index}, lalu ganti ke key={student.id} dan acak lagi.`],
quiz:[
 {q:`Key mana yang paling baik untuk list produk dari API?`,options:[`Index array`,`product.id`,`Math.random()`],why:`id itu unik dan tetap sama di setiap render. Key acak berubah setiap render, sehingga React membangun ulang semua baris.`},
 {q:`Kamu mengacak list yang memakai key index, dan teks yang diketik tertinggal di baris yang salah. Kenapa?`,options:[`React mencocokkan baris berdasarkan posisi, jadi state tetap di posisinya`,`Bug CSS`,`Input-nya rusak`],why:`dengan key index, "baris 0" tetap baris 0 setelah diacak, jadi state-nya diam di tempat sementara namanya berpindah.`}
]},
/* ───────────── KOTA VUE ───────────── */
'vue-template': {
title:'Template & interpolasi', metaphor:'Undangan isian',
legend:['Komponen / template','Data reaktif','Data mengalir ke bawah','Event naik ke atas'],
parable:`Undangan pernikahan dicetak sekali dengan bagian kosong: "Kepada ____, kamu diundang pada ____." Isi nama tamunya, dan kartu siap dikirim. Template Vue adalah kartu cetakan itu. {{ Bagian kosong }} diisi dari datamu, dan saat datanya berubah, kartunya ikut diperbarui sendiri.`,
theory:[`Aplikasi Vue dipasang pada sebuah elemen: createApp({ … }).mount('#app').`,`{{ Kurung kurawal ganda }} menampilkan nilai dari datamu ke dalam HTML.`,`Directive adalah atribut yang diawali v-. Singkatannya: :href="…" mengikat atribut, @click="…" mendengarkan event.`,`Template tetap berupa HTML yang mudah dibaca. Saat data berubah, Vue hanya memperbarui bagian halaman yang berubah.`],
controls:[{label:'Tamu'},{label:'Tanggal'},{label:'Warna kartu',options:['Hijau Vue','Lilac','Pink']}],
bad:'Membangun HTML dengan menyambung string. Sulit dibaca, dan mudah rusak atau tidak aman.',
good:'Template dengan bagian kosong. Vue mengisinya dan menjaganya tetap terbaru.',
figma:[`Mulai proyek: npm create vue@latest, lalu npm install dan npm run dev.`,`Buka src/App.vue. Blok <template> adalah HTML yang kamu tulis di sini, dan <script setup> menyimpan datanya.`,`Pasang Vue Devtools di browser untuk melihat dan mengubah data saat aplikasi berjalan.`],
quiz:[
 {q:`Apa fungsi {{ guest }} di template Vue?`,options:[`Menampilkan nilai guest dan menjaganya tetap terbaru`,`Membuat variabel`,`Menambahkan komentar`],why:`interpolasi menampilkan nilai saat ini, dan Vue me-render ulang setiap kali guest berubah.`},
 {q:`Apa arti :href="mapLink"?`,options:[`Teks "mapLink" menjadi link-nya`,`Atribut href diisi nilai mapLink dari datamu`,`Menonaktifkan link`],why:`titik dua adalah singkatan v-bind: nilai atributnya berupa ekspresi JavaScript.`}
]},
'vue-reactivity': {
title:'Reaktivitas: ref & computed', metaphor:'Sel spreadsheet',
legend:['ref (sel yang kamu isi)','computed (rumus)','Template','Perubahan menyebar'],
parable:`Di spreadsheet, kamu mengetik harga baru di satu sel dan total di bawahnya langsung berubah. Tidak ada yang menghitung ulang dengan tangan. Sel total berisi rumus yang ingat sel mana saja yang dibacanya. Reaktivitas Vue bekerja dengan cara yang sama: ref() adalah sel, computed() adalah rumus.`,
theory:[`ref(0) membuat nilai reaktif. Di JavaScript kamu membaca dan mengubahnya lewat .value. Di template, Vue membukanya untukmu.`,`computed(() => …) adalah rumus. Ia ingat ref mana yang dibacanya dan hanya menghitung ulang saat salah satunya berubah.`,`Jangan simpan sesuatu yang bisa dihitung. Simpan price dan qty, lalu hitung total-nya.`,`watch() menjalankan kode saat sebuah nilai berubah, untuk efek samping seperti menyimpan atau mencatat log.`],
controls:[{label:'B1 · harga'},{label:'B3 · pajak %'}],
bad:'Menyimpan total secara terpisah. Lupa memperbaruinya sekali saja, hasilnya salah.',
good:'Rumus computed. Tidak mungkin ketinggalan.',
figma:[`Di file .vue, tulis kode yang sama di dalam <script setup>. Semua yang kamu deklarasikan bisa dipakai di template.`,`Gunakan reactive({ … }) kalau kamu ingin seluruh objek reaktif, misalnya sebuah form.`,`Di Vue Devtools, nilai computed ditampilkan terpisah, jadi kamu bisa melihat hasil setiap rumus.`],
quiz:[
 {q:`Di JavaScript, bagaimana cara mengubah ref bernama count?`,options:[`count = 5`,`count.value = 5`,`setCount(5)`],why:`ref itu seperti kotak. Kamu membaca dan mengubah isinya lewat .value.`},
 {q:`Kapan nilai computed dihitung ulang?`,options:[`Setiap detik`,`Hanya saat salah satu nilai reaktif yang dibacanya berubah`,`Tidak pernah`],why:`computed melacak dependensinya dan menyimpan hasilnya sampai salah satunya berubah.`}
]},
'vue-directives': {
title:'v-if, v-show & v-for', metaphor:'Lampu panggung',
legend:['Ada di DOM','Disembunyikan v-show (masih ada)','Data','Dibuat'],
parable:`Ada dua cara menyembunyikan aktor di teater. Matikan lampu sorotnya, dan ia tetap berdiri di panggung dalam gelap, siap muncul seketika. Atau suruh ia ke belakang panggung, dan ia harus berjalan jauh untuk kembali. v-show mematikan lampu (display:none). v-if mengirim elemen ke belakang panggung, menghapusnya dari halaman.`,
theory:[`v-if menambahkan atau menghapus elemen dari DOM. Pakai untuk hal yang jarang berubah.`,`v-show mempertahankan elemen dan hanya mengganti display:none. Pakai untuk hal yang sering dinyalakan-dimatikan.`,`v-for mengulang elemen untuk setiap item: <li v-for="item in items" :key="item.id">.`,`Selalu beri item v-for sebuah :key yang stabil, sama seperti di React.`],
controls:[{label:'Aktor (v-for)'},{label:'Sembunyikan dengan'}],
bad:'v-if dan v-for di elemen yang sama. Membingungkan mana yang berjalan duluan.',
good:'Saring di list computed, lalu ulangi dengan key.',
figma:[`Gunakan v-else dan v-else-if tepat setelah v-if untuk menampilkan salah satu dari beberapa pilihan.`,`Bungkus beberapa elemen dengan <template v-if="…"> untuk menampilkan atau menyembunyikannya bersama tanpa div tambahan.`,`Buka panel Elements di DevTools lalu nyalakan-matikan lampu: elemen v-show tetap ada, elemen v-if menghilang.`],
quiz:[
 {q:`Sebuah dropdown dibuka dan ditutup berkali-kali dalam semenit. Mana yang paling cocok?`,options:[`v-show`,`v-if`,`Tidak keduanya`],why:`v-show hanya mengganti display, lebih ringan daripada membuat dan menghapus elemen berulang-ulang.`},
 {q:`Apa yang dibutuhkan v-for di setiap item?`,options:[`Sebuah class`,`:key yang unik`,`Atribut id`],why:`key membuat Vue bisa melacak setiap item saat list berubah, sama seperti key di React.`}
]},
'vue-model': {
title:'v-model & form', metaphor:'Walkie-talkie',
legend:['Data (ref)','Elemen input','Data → input','Input → data'],
parable:`Walkie-talkie bekerja dua arah. Kamu bicara, seberang mendengar. Mereka bicara, kamu mendengar. v-model menghubungkan input dan datamu dengan cara yang sama: ketik di kotak, datanya berubah; ubah datanya, kotaknya ikut berubah.`,
theory:[`v-model pada input menjaga input dan sebuah ref tetap sama, dua arah.`,`Ini singkatan dari :value ditambah @input: nilai masuk ke input, event keluar kembali.`,`Bisa dipakai di input teks, checkbox, radio, dan select. Modifier seperti v-model.trim dan v-model.number merapikan nilainya.`,`Gunakan @submit.prevent pada form supaya halaman tidak dimuat ulang saat dikirim.`],
controls:[{label:'Isi data dari kode',options:['Kosong','Contoh']}],
bad:'Membaca dan menulis input secara manual. Gampang lupa salah satu arahnya.',
good:'v-model menjaga kedua sisi tetap sama.',
figma:[`Kelompokkan field form dalam satu reactive({ name: '', role: '' }) lalu hubungkan masing-masing dengan v-model="form.name".`,`Gunakan v-model.number pada input angka supaya kamu mendapat angka, bukan teks.`,`Untuk validasi, buat error dengan computed (const nameError = computed(() => …)) dan tampilkan di bawah setiap field.`],
quiz:[
 {q:`Apa fungsi v-model?`,options:[`Menjaga input dan ref tetap sama, dua arah`,`Hanya membaca input sekali`,`Memberi gaya pada input`],why:`ia memasukkan nilai ke input dan mendengarkan perubahan yang keluar darinya.`},
 {q:`Kenapa menambahkan .prevent pada @submit di sebuah form?`,options:[`Supaya browser tidak memuat ulang halaman`,`Supaya form lebih cepat`,`Untuk menyembunyikan tombol`],why:`.prevent memanggil event.preventDefault(), jadi kamu bisa menangani pengiriman di JavaScript.`}
]},
'vue-components': {
title:'Komponen, props & emit', metaphor:'Pelayan dan dapur',
legend:['Komponen','Data','Props turun ke bawah','Emit naik ke atas'],
parable:`Di restoran, pelayan membawa pesananmu ke dapur di atas secarik kertas. Saat masakan siap, dapur membunyikan bel. Dapur tidak pernah keluar ke mejamu untuk mengubah pesananmu. Komponen Vue berkomunikasi dengan cara yang sama: props turun seperti kertas pesanan, event naik seperti bunyi bel.`,
theory:[`Komponen adalah objek berisi template dan setup(). Daftarkan di components: { … } lalu pakai sebagai tag.`,`Props membawa data turun dari induk ke anak. Deklarasikan: props: { tableNo: Number }.`,`emit('served') mengirim event ke atas. Induk mendengarkan dengan @served="…".`,`Props turun, event naik: setiap bagian tetap sederhana, dan kamu selalu tahu siapa mengubah apa.`],
controls:[{label:'Meja'},{label:'Kecepatan dapur (props)',options:['Cepat','Lambat']}],
bad:'Anak meraih ke atas dan mengubah data induk secara langsung. Tidak ada yang tahu siapa yang mengubahnya.',
good:'Props turun, event naik. Induk yang memutuskan apa yang diubah.',
figma:[`Di file .vue, gunakan defineProps({ tableNo: Number }) dan const emit = defineEmits(['served']) di dalam <script setup>.`,`Beri nama event sebagai aksi yang sudah terjadi (served, saved, closed) supaya kode induk terbaca seperti cerita.`,`Vue Devtools punya tab Timeline yang mencatat setiap event yang di-emit saat terjadi.`],
quiz:[
 {q:`Komponen anak perlu memberi tahu induknya bahwa masakan sudah siap. Apa yang sebaiknya dipakai?`,options:[`emit('served')`,`Ubah data induk secara langsung`,`Variabel global`],why:`event naik ke atas. Induk mendengarkan dengan @served dan memutuskan apa yang dilakukan.`},
 {q:`Bagaimana data dikirim dari induk ke komponen anak?`,options:[`Lewat props`,`Lewat emit`,`Lewat CSS`],why:`props membawa data ke bawah. Emit membawa pesan ke atas.`}
]}
});
