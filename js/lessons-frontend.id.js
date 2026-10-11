/* Indonesian (ID) translations for the Frontera (frontend) lessons. Same shape as lessons.id.js. */
Object.assign(window.UX_LESSONS_ID = window.UX_LESSONS_ID || {}, {
/* ───────────── KOTA REACT ───────────── */
'react-components': {
title:'Komponen & JSX', metaphor:'Kepingan LEGO',
legend:['Komponen','State','Props turun ke bawah','Event naik ke atas'],
parable:`Nggak ada yang bikin istana LEGO dari satu kepingan raksasa. Kamu nyambungin kepingan-kepingan kecil: ada kepingan jendela, pintu, menara. Bikin satu kepingan, terus pakai sampai seratus kali. Aplikasi React juga dibangun kayak gitu. Potongan-potongan kecil yang namanya komponen disambung jadi satu halaman utuh.`,
theory:[`Komponen itu function JavaScript yang balikin UI. Namanya wajib diawali huruf kapital: function ProductCard() { … }.`,`Pakai JSX, kamu bisa nulis tag mirip HTML langsung di dalam JavaScript. {Kurung kurawal} dipakai buat nyelipin nilai JavaScript ke markup.`,`Pakai komponen kayak tag biasa: <ProductCard />. Tulis sekali, pakai sebanyak yang kamu mau.`,`Komponen bisa ditaruh di dalam komponen lain sampai jadi pohon, dengan App di paling atas. Pohon itulah yang kamu lihat di tampilan 3D.`],
controls:[{label:'Jumlah kartu'},{label:'Warna keping',options:['Biru React','Mint','Amber']},{label:'Gaya kartu',options:['Garis tepi','Isi penuh']}],
bad:'Satu App raksasa yang isinya markup hasil copy-paste. Salah ketik sekali, kamu harus benerin di semua tempat.',
good:'Satu komponen kecil, dipakai ulang pakai data yang beda-beda.',
figma:[`Mulai proyek: npm create vite@latest my-app -- --template react, terus jalanin npm install dan npm run dev.`,`Pindahin ProductCard ke file sendiri, src/ProductCard.jsx, export, terus import di App.jsx.`,`Pasang React Developer Tools di browser. Tab Components-nya nampilin pohon yang sama persis kayak tampilan 3D.`],
quiz:[
 {q:`Nama mana yang bener buat komponen React?`,options:[`productCard`,`ProductCard`,`product-card`],why:`komponen wajib diawali huruf kapital. Tag huruf kecil bakal dianggap elemen HTML biasa.`},
 {q:`{Kurung kurawal} di JSX itu buat apa sih?`,options:[`Nyelipin nilai JavaScript ke markup`,`Bikin class CSS`,`Ngubah kode jadi komentar`],why:`kurung kurawal bikin kamu "balik" ke JavaScript, jadi {name} bakal nampilin nilai name.`}
]},
'react-props': {
title:'Props', metaphor:'Pesan kopi',
legend:['Komponen','State','Props turun ke bawah','Event naik ke atas'],
parable:`Di kedai kopi, semua barista pakai resep latte yang sama. Yang beda cuma kertas pesananmu: ukuran besar, gula dikit, susu oat. Resepnya itu komponen, kertas pesanannya itu props. Resepnya sama, gelasnya beda-beda. Dan barista nggak pernah nyoret-nyoret tulisan di kertas pesananmu.`,
theory:[`Props itu input buat komponen. Kirimnya kayak atribut HTML: <Coffee size="L" sugar={1} />.`,`Komponen nerima semua props sebagai satu object: function Coffee({ size, sugar }) { … }.`,`Props ngalir satu arah aja, dari parent ke child. Child cuma boleh baca, nggak boleh ngubah.`,`Apa aja bisa jadi props: teks, angka, array, function, bahkan elemen lain (children).`],
controls:[{label:'Ukuran'},{label:'Gula'},{label:'Susu',options:['Biasa','Oat','Tanpa susu']}],
bad:'Child ngubah props-nya sendiri. React cuek aja, dan parent-nya nggak pernah tahu.',
good:'Parent yang pegang nilainya, terus kirim props baru tiap kali nilainya berubah.',
figma:[`Di VS Code, arahin kursor ke komponen buat lihat props apa aja yang dibutuhin.`,`Kasih nilai default langsung di parameter: function Coffee({ size = 'M' }).`,`Pakai props children buat ngebungkus konten: <Card><h2>Hai</h2></Card>, terus tampilin {children} di dalam Card.`],
quiz:[
 {q:`Child pengin nilai props yang dia terima jadi beda. Harusnya gimana?`,options:[`Ubah langsung aja: props.size = 'L'`,`Minta parent (yang pegang nilainya) buat kirim props baru`,`Reload halamannya`],why:`props itu read-only. Parent yang pegang data, terus dia yang kirim nilai baru ke bawah.`},
 {q:`Gimana cara ngirim angka 2 sebagai props?`,options:[`sugar="2"`,`sugar={2}`,`sugar=2`],why:`kurung kurawal ngirim angka beneran. Kalau pakai tanda kutip, yang kekirim teks "2".`}
]},
'react-state': {
title:'State pakai useState', metaphor:'Papan skor stadion',
legend:['Komponen','State','Props turun ke bawah','Event naik ke atas'],
parable:`Pas ada gol, nggak ada yang manjat buat ngecat ulang papan skor stadion. Operatornya cukup ganti satu angka, dan papannya langsung update sendiri. State di React ya angka itu. Kamu ganti lewat setter, dan React gambar ulang semua bagian layar yang pakai nilai itu.`,
theory:[`useState ngasih kamu sebuah nilai plus setter-nya: const [score, setScore] = useState(0).`,`Begitu setter dipanggil, komponen langsung re-render pakai nilai baru. Kalau cuma ngubah variabel biasa, layarnya nggak bakal update.`,`State itu milik komponen yang bikin dia. Kalau child butuh, kirim aja ke bawah sebagai props.`,`Jangan ubah state langsung di tempat. Kasih setter nilai baru: setScore(score + 1), atau setScore(s => s + 1).`],
controls:[{label:'Poin per gol'},{label:'Simpan skor di',options:['useState','variabel biasa']}],
bad:'Pakai variabel biasa atau array yang diubah langsung. Datanya berubah, tapi layarnya diem aja.',
good:'Pakai useState dan kasih nilai baru tiap kali. React re-render bagian yang pakai nilai itu.',
figma:[`Di React Developer Tools, klik salah satu komponen buat lihat state-nya secara live, bahkan bisa kamu ubah juga.`,`Taruh state serendah mungkin di pohon: cukup di komponen yang beneran butuh.`,`Kalau dua komponen yang sejajar butuh state yang sama, pindahin ke parent-nya terus kirim ke bawah sebagai props ("lifting state up").`],
quiz:[
 {q:`Kamu nulis score = score + 1 di variabel biasa. Di layar kejadian apa?`,options:[`Ikut berubah`,`Nggak ada: React cuma re-render kalau state diubah lewat setter`,`Halamannya reload`],why:`React nggak ngawasin variabel biasa. Setter-lah yang bikin re-render jalan.`},
 {q:`Cara paling aman buat nambah 1 dari skor sebelumnya yang mana?`,options:[`setScore(s => s + 1)`,`score++`,`setScore(score++)`],why:`function updater selalu dapet nilai paling baru, bahkan kalau ada beberapa update beruntun.`}
]},
'react-effects': {
title:'Side effect pakai useEffect', metaphor:'Lampu sensor gerak',
legend:['Komponen','Effect','Effect jalan','Cleanup'],
parable:`Lampu sensor gerak kerja sendiri. Ada orang masuk, lampunya nyala. Orangnya pergi, lampunya mati. Nggak ada yang pencet saklar. useEffect itu sensornya: kamu kasih tahu React apa yang diawasi, apa yang dikerjain pas ada perubahan, dan gimana beres-beresnya setelah itu.`,
theory:[`Render harusnya cuma ngegambarin UI. Kerjaan yang nyentuh dunia luar (timer, fetch data, judul halaman) masuknya ke useEffect.`,`Dependency array nentuin kapan effect jalan: [] cuma sekali setelah render pertama, [room] tiap kali room berubah, tanpa array berarti setelah setiap render.`,`Balikin function cleanup buat ngebatalin effect: stop timer, tutup koneksi.`,`Kalau effect pakai sebuah nilai, masukin ke dependency array. Kalau nggak, effect bakal terus baca nilai lama.`],
controls:[{label:'Dependency',options:['[room]','[]','tanpa array']},{label:'Ruangan',options:['Dapur','Taman','Garasi']}],
bad:'Interval tanpa cleanup. Tiap re-render, timer baru nyala dan nggak pernah berhenti.',
good:'Jalan sekali aja, terus beres-beres pas komponennya unmount.',
figma:[`Fetch data di dalam effect: useEffect(() => { fetch(url).then(r => r.json()).then(setData) }, [url]).`,`Nyalain aturan eslint-plugin-react-hooks. Dia bakal ngingetin kalau ada dependency yang kelupaan.`,`Pas development, React sengaja jalanin effect dua kali (Strict Mode). Kalau itu bikin sesuatu rusak, berarti cleanup-mu belum ada.`],
quiz:[
 {q:`useEffect(fn, []) jalannya…`,options:[`setelah setiap render`,`sekali, setelah render pertama`,`nggak pernah`],why:`dependency array kosong artinya nggak ada yang bisa berubah, jadi effect cuma jalan sekali setelah komponen di-mount.`},
 {q:`Effect-mu nyalain timer. Matiinnya di mana?`,options:[`Di function cleanup yang di-return sama effect`,`Di dalam JSX`,`Nggak bisa`],why:`React manggil cleanup sebelum effect jalan lagi dan pas komponen di-unmount.`}
]},
'react-lists': {
title:'List & key', metaphor:'Papan nama di kelas',
legend:['Komponen (satu per key)','State','Pindah bareng key-nya','Re-render di tempat'],
parable:`Guru ngenalin murid dari papan namanya, bukan dari kursi yang mereka dudukin. Kalau murid tukeran kursi dan guru cuma inget "anak di kursi 2", PR-nya bisa balik ke orang yang salah. Key di React itu papan namanya. Dengan key yang stabil, React tahu item mana yang pindah, dan tiap item tetap nyimpen state-nya sendiri.`,
theory:[`Tampilin list pakai map: students.map(s => <Row key={s.id} … />).`,`Key harus unik di antara item sejajarnya dan nggak boleh berubah-ubah. Id dari data kamu paling pas.`,`Pakai index array sebagai key bakal kacau pas item diacak, disisipin, atau dihapus: state nempel ke posisi, bukan ke item-nya.`,`Key itu khusus buat React. Key nggak ikut dikirim ke komponenmu sebagai props.`],
controls:[{label:'Key'}],
bad:'Index sebagai key: habis diacak, state-nya tetap di kursi, bukan ikut muridnya.',
good:'Id stabil dari data: papan nama ikut ke mana pun muridnya pindah.',
figma:[`Buka console browser: React bakal ngasih warning "Each child in a list should have a unique key prop" kalau key-nya nggak ada.`,`Kalau data kamu nggak punya id, tambahin pas item dibuat (crypto.randomUUID()), jangan pas render.`,`Coba deh: acak pakai key={index}, terus ganti ke key={student.id} dan acak lagi.`],
quiz:[
 {q:`Key mana yang paling oke buat list produk dari API?`,options:[`Index array`,`product.id`,`Math.random()`],why:`id itu unik dan tetap sama di tiap render. Key acak berubah tiap render, jadi React harus bangun ulang semua baris.`},
 {q:`Kamu ngacak list yang pakai key index, terus teks yang udah diketik nyasar ke baris yang salah. Kenapa?`,options:[`React nyocokin baris dari posisinya, jadi state diem di posisi`,`Bug CSS`,`Input-nya rusak`],why:`pakai key index, "baris 0" tetap baris 0 habis diacak, jadi state-nya diem di tempat sementara namanya pindah.`}
]},
/* ───────────── KOTA VUE ───────────── */
'vue-template': {
title:'Template & interpolasi', metaphor:'Undangan isian',
legend:['Komponen / template','Data reaktif','Data turun ke bawah','Event naik ke atas'],
parable:`Undangan nikahan dicetak sekali dengan bagian kosong: "Kepada ____, kamu diundang pada ____." Tinggal isi nama tamunya, kartunya siap dikirim. Template Vue ya kartu cetakan itu. {{ Bagian kosong }} diisi dari data kamu, dan pas datanya berubah, kartunya ikut update sendiri.`,
theory:[`Aplikasi Vue di-mount ke sebuah elemen: createApp({ … }).mount('#app').`,`{{ Kurung kurawal ganda }} nampilin nilai dari data kamu ke dalam HTML.`,`Directive itu atribut yang diawali v-. Ada singkatannya juga: :href="…" buat binding atribut, @click="…" buat dengerin event.`,`Template tetap HTML yang gampang dibaca. Pas data berubah, Vue cuma update bagian halaman yang berubah aja.`],
controls:[{label:'Tamu'},{label:'Tanggal'},{label:'Warna kartu',options:['Hijau Vue','Lilac','Pink']}],
bad:'Bikin HTML dengan nyambung-nyambung string. Susah dibaca, gampang rusak, dan rawan nggak aman.',
good:'Template dengan bagian kosong. Vue yang ngisi dan jagain biar selalu update.',
figma:[`Mulai proyek: npm create vue@latest, terus jalanin npm install dan npm run dev.`,`Buka src/App.vue. Blok <template> itu HTML yang kamu tulis, dan <script setup> tempat nyimpen data.`,`Pasang Vue Devtools di browser buat lihat dan ngubah data pas aplikasi lagi jalan.`],
quiz:[
 {q:`{{ guest }} di template Vue itu buat apa?`,options:[`Nampilin nilai guest dan jagain biar selalu update`,`Bikin variabel`,`Nambahin komentar`],why:`interpolasi nampilin nilai saat ini, dan Vue re-render tiap kali guest berubah.`},
 {q:`:href="mapLink" artinya apa?`,options:[`Teks "mapLink" jadi link-nya`,`Atribut href diisi nilai mapLink dari data kamu`,`Ngematiin link`],why:`titik dua itu singkatan v-bind: nilai atributnya dibaca sebagai ekspresi JavaScript.`}
]},
'vue-reactivity': {
title:'Reactivity: ref & computed', metaphor:'Sel spreadsheet',
legend:['ref (sel yang kamu isi)','computed (rumus)','Template','Perubahan nyebar'],
parable:`Di spreadsheet, kamu ketik harga baru di satu sel dan total di bawahnya langsung ikut berubah. Nggak ada yang ngitung ulang manual. Sel total isinya rumus yang inget sel mana aja yang dia baca. Reactivity di Vue kerjanya sama persis: ref() itu selnya, computed() itu rumusnya.`,
theory:[`ref(0) bikin nilai yang reaktif. Di JavaScript, kamu baca dan ubah lewat .value. Di template, Vue udah otomatis buka bungkusnya buat kamu.`,`computed(() => …) itu rumus. Dia inget ref mana aja yang dibaca, dan cuma ngitung ulang kalau salah satunya berubah.`,`Jangan simpen sesuatu yang bisa dihitung. Simpen price dan qty aja, terus hitung total-nya.`,`watch() jalanin kode tiap kali sebuah nilai berubah, cocok buat side effect kayak nyimpen data atau nulis log.`],
controls:[{label:'B1 · harga'},{label:'B3 · pajak %'}],
bad:'Nyimpen total secara terpisah. Sekali aja lupa update, hasilnya salah.',
good:'Pakai rumus computed. Dijamin nggak bakal ketinggalan.',
figma:[`Di file .vue, tulis kode yang sama di dalam <script setup>. Semua yang kamu deklarasiin langsung bisa dipakai di template.`,`Pakai reactive({ … }) kalau kamu pengin satu object utuh jadi reaktif, misalnya buat form.`,`Di Vue Devtools, nilai computed ditampilin terpisah, jadi kamu bisa cek hasil tiap rumus.`],
quiz:[
 {q:`Di JavaScript, gimana cara ngubah ref yang namanya count?`,options:[`count = 5`,`count.value = 5`,`setCount(5)`],why:`ref itu kayak kotak. Kamu baca dan ubah isinya lewat .value.`},
 {q:`Kapan nilai computed dihitung ulang?`,options:[`Tiap detik`,`Cuma pas salah satu nilai reaktif yang dia baca berubah`,`Nggak pernah`],why:`computed ngelacak dependency-nya dan nyimpen hasilnya sampai salah satunya berubah.`}
]},
'vue-directives': {
title:'v-if, v-show & v-for', metaphor:'Lampu panggung',
legend:['Ada di DOM','Diumpetin v-show (masih ada)','Data','Dibuat'],
parable:`Ada dua cara buat ngumpetin aktor di teater. Matiin lampu sorotnya, dan dia tetap berdiri di panggung dalam gelap, siap muncul kapan aja. Atau suruh dia ke belakang panggung, dan dia harus jalan jauh buat balik lagi. v-show itu matiin lampu (display:none). v-if itu ngirim elemen ke belakang panggung, alias ngehapus dari halaman.`,
theory:[`v-if nambahin atau ngehapus elemen dari DOM. Pakai buat hal yang jarang berubah.`,`v-show tetap nyimpen elemennya dan cuma ganti display:none. Pakai buat hal yang sering dinyala-matiin.`,`v-for ngulang elemen buat tiap item: <li v-for="item in items" :key="item.id">.`,`Selalu kasih item v-for sebuah :key yang stabil, sama kayak di React.`],
controls:[{label:'Aktor (v-for)'},{label:'Umpetin pakai'}],
bad:'v-if dan v-for di elemen yang sama. Bikin bingung mana yang jalan duluan.',
good:'Saring dulu pakai list computed, baru di-loop pakai key.',
figma:[`Pakai v-else dan v-else-if tepat setelah v-if buat nampilin salah satu dari beberapa pilihan.`,`Bungkus beberapa elemen pakai <template v-if="…"> biar bisa ditampilin atau diumpetin barengan tanpa div tambahan.`,`Buka panel Elements di DevTools terus nyala-matiin lampunya: elemen v-show tetap ada, elemen v-if hilang.`],
quiz:[
 {q:`Ada dropdown yang dibuka-tutup berkali-kali dalam semenit. Paling cocok pakai apa?`,options:[`v-show`,`v-if`,`Dua-duanya nggak`],why:`v-show cuma ganti display, jauh lebih ringan daripada bikin dan ngehapus elemen terus-terusan.`},
 {q:`v-for butuh apa di tiap item?`,options:[`Sebuah class`,`:key yang unik`,`Atribut id`],why:`key bikin Vue bisa ngelacak tiap item pas list berubah, sama kayak key di React.`}
]},
'vue-model': {
title:'v-model & form', metaphor:'Walkie-talkie',
legend:['Data (ref)','Elemen input','Data → input','Input → data'],
parable:`Walkie-talkie itu kerjanya dua arah. Kamu ngomong, temanmu denger. Dia ngomong, kamu denger. v-model nyambungin input sama data kamu dengan cara yang sama: ketik di kotak, datanya berubah; ubah datanya, kotaknya ikut berubah.`,
theory:[`v-model di input bikin input dan sebuah ref selalu sama, dua arah.`,`Ini sebenernya singkatan dari :value plus @input: nilai masuk ke input, event keluar balik lagi.`,`Bisa dipakai di input teks, checkbox, radio, dan select. Modifier kayak v-model.trim dan v-model.number bantu ngerapiin nilainya.`,`Pakai @submit.prevent di form biar halamannya nggak reload pas dikirim.`],
controls:[{label:'Isi dari kode',options:['Kosong','Contoh']}],
bad:'Baca dan tulis input secara manual. Gampang banget lupa salah satu arahnya.',
good:'v-model jagain kedua sisi biar tetap sama.',
figma:[`Kumpulin field form dalam satu reactive({ name: '', role: '' }) terus sambungin masing-masing pakai v-model="form.name".`,`Pakai v-model.number di input angka biar yang kamu dapet angka, bukan teks.`,`Buat validasi, bikin error pakai computed (const nameError = computed(() => …)) terus tampilin di bawah tiap field.`],
quiz:[
 {q:`v-model itu fungsinya apa?`,options:[`Bikin input dan ref selalu sama, dua arah`,`Cuma baca input sekali`,`Ngasih style ke input`],why:`dia masukin nilai ke input dan sekaligus dengerin perubahan yang keluar dari situ.`},
 {q:`Kenapa @submit di form perlu ditambahin .prevent?`,options:[`Biar browser nggak reload halaman`,`Biar form-nya lebih cepet`,`Buat ngumpetin tombol`],why:`.prevent manggil event.preventDefault(), jadi kamu bisa ngurus pengirimannya sendiri di JavaScript.`}
]},
'vue-components': {
title:'Komponen, props & emit', metaphor:'Pelayan dan dapur',
legend:['Komponen','Data','Props turun ke bawah','Emit naik ke atas'],
parable:`Di restoran, pelayan bawa pesananmu ke dapur lewat secarik kertas. Pas masakannya siap, dapur bunyiin bel. Dapur nggak pernah keluar ke mejamu buat ngubah pesananmu. Komponen Vue ngobrolnya juga kayak gitu: props turun kayak kertas pesanan, event naik kayak bunyi bel.`,
theory:[`Komponen itu object yang isinya template dan setup(). Daftarin di components: { … } terus pakai sebagai tag.`,`Props bawa data turun dari parent ke child. Deklarasiin kayak gini: props: { tableNo: Number }.`,`emit('served') ngirim event ke atas. Parent dengerin pakai @served="…".`,`Props turun, event naik: tiap bagian tetap simpel, dan kamu selalu tahu siapa ngubah apa.`],
controls:[{label:'Meja'},{label:'Speed dapur (props)',options:['Cepat','Lambat']}],
bad:'Child nyelonong ke atas dan ngubah data parent langsung. Nggak ada yang tahu siapa pelakunya.',
good:'Props turun, event naik. Parent yang mutusin apa yang diubah.',
figma:[`Di file .vue, pakai defineProps({ tableNo: Number }) dan const emit = defineEmits(['served']) di dalam <script setup>.`,`Kasih nama event pakai kata kerja yang udah kejadian (served, saved, closed) biar kode parent kebaca kayak cerita.`,`Vue Devtools punya tab Timeline yang nyatet tiap event yang di-emit pas kejadian.`],
quiz:[
 {q:`Child perlu ngasih tahu parent kalau masakannya udah siap. Sebaiknya pakai apa?`,options:[`emit('served')`,`Ubah data parent langsung`,`Variabel global`],why:`event itu naik ke atas. Parent dengerin pakai @served dan mutusin mau ngapain.`},
 {q:`Gimana cara ngirim data dari parent ke child?`,options:[`Lewat props`,`Lewat emit`,`Lewat CSS`],why:`props bawa data ke bawah. Emit bawa pesan ke atas.`}
]}
});
