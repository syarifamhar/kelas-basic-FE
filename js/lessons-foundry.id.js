/* Indonesian (ID) translations for the new Foundry lessons. Same shape as lessons.id.js. */
Object.assign(window.UX_LESSONS_ID = window.UX_LESSONS_ID || {}, {
'html-structure': {
title:'HTML: Struktur & Semantik', metaphor:'Ruangan di sebuah rumah',
parable:`Rumah bukan satu ruangan besar. Ada teras, lorong dengan papan petunjuk, ruang tamu, kamar samping, dan gudang, dan semua orang tahu fungsi masing-masing. Tag HTML bekerja dengan cara yang sama. <header>, <nav>, <main>, <aside>, dan <footer> memberi tahu browser, mesin pencari, dan screen reader apa fungsi setiap bagian halaman, bukan hanya tampilannya.`,
theory:[`HTML menggambarkan struktur. Sebuah elemen adalah sepasang tag yang membungkus konten: <p>Halo</p>. Elemen bisa bersarang di dalam elemen lain seperti ruangan.`,`Tag semantik menyebutkan apa sesuatu itu: <header>, <nav>, <main>, <article>, <aside>, <footer>, <button>.`,`Halaman yang hanya dibangun dari <div> bisa terlihat sama, tapi tidak bermakna: screen reader tidak bisa melompat ke konten utama.`,`Gunakan satu <h1> per halaman dan jaga urutan heading (h1 → h2 → h3), seperti bab dalam buku.`],
controls:[{label:'Markup',options:['Tag semantik','div soup']},{label:'Tampilkan nama tag',options:['Nyala','Mati']}],
bad:'div soup: terlihat baik-baik saja, tapi tidak bermakna bagi teknologi asistif dan mesin pencari.',
good:'Tag semantik menjelaskan setiap ruangan, dan button sungguhan bisa dipakai dengan keyboard.',
figma:[`Buat index.html di VS Code, ketik ! lalu tekan Tab untuk mendapatkan kerangka HTML lengkap.`,`Sketsa halamanmu sebagai kotak-kotak di kertas dulu, lalu beri nama setiap kotak dengan tag semantik.`,`Buka DevTools browser, panel Accessibility, untuk melihat landmark yang ditemukan screen reader.`],
quiz:[
 {q:`Tag mana yang sebaiknya membungkus konten utama halaman?`,options:[`<div id="main">`,`<main>`,`<section class="content">`],why:`<main> adalah landmark yang bisa langsung dituju oleh screen reader.`},
 {q:`Kenapa <div onclick> lebih buruk daripada <button>?`,options:[`Lebih lambat`,`Tidak bisa dijangkau dengan Tab atau ditekan dengan Enter, dan tidak diumumkan sebagai tombol`,`Warnanya salah`],why:`<button> sungguhan otomatis mendapat fokus keyboard, aktivasi lewat keyboard, dan peran yang tepat.`}
]},
'css-selectors': {
title:'Selector CSS & Cascade', metaphor:'Aturan seragam sekolah',
parable:`Sekolah mengumumkan: semua murid memakai baju putih. Lalu wali kelas 5B berkata: kelasku memakai biru. Lalu pelatih berkata pada Budi: kamu pakai rompi kapten merah. Budi akhirnya memakai merah, karena perintah yang paling spesifik yang menang. CSS bekerja dengan cara yang sama. Banyak aturan bisa menargetkan satu elemen, dan selector yang paling spesifik yang menang.`,
theory:[`Selector memilih elemen: p (semua paragraf), .note (class), #hero (satu id), atau gabungan seperti .card .note.`,`Saat aturan bertabrakan, spesifisitas yang menentukan: id mengalahkan class, class mengalahkan elemen. Hitung sebagai (id, class, elemen).`,`Kalau dua aturan sama spesifiknya, yang ditulis belakangan di CSS yang menang.`,`Utamakan class. Id dan !important membuat aturan sulit ditimpa di kemudian hari.`],
controls:[{label:'Aturan yang dinyalakan'}],
bad:'Melawan spesifisitas dengan id dan !important. Perubahan berikutnya jadi makin sulit.',
good:'Selector datar satu class yang mudah ditimpa.',
figma:[`Di DevTools, pilih sebuah elemen: panel Styles menampilkan semua aturan yang cocok, dan yang kalah dicoret.`,`Arahkan kursor ke selector di VS Code untuk melihat spesifisitasnya, misalnya (0, 2, 0).`,`Beri nama class sesuai apa bendanya (.card, .card__title), bukan tampilannya (.blue-text).`],
quiz:[
 {q:`Selector mana yang menang: .note atau p?`,options:[`p`,`.note`,`Yang ditulis duluan`],why:`class (0,1,0) mengalahkan elemen (0,0,1).`},
 {q:`Dua aturan punya spesifisitas yang sama. Mana yang berlaku?`,options:[`Yang pertama`,`Yang terakhir di CSS`,`Tidak keduanya`],why:`dengan spesifisitas yang sama, urutan di kode yang menentukan: yang belakangan menang.`}
]},
'js-dom': {
title:'JavaScript & DOM', metaphor:'Pertunjukan wayang',
parable:`Dalam pertunjukan wayang, wayangnya tidak bergerak sendiri. Dalang di atas panggung menarik talinya: angkat tangan, tolehkan kepala, membungkuk. Halaman web (DOM) adalah panggung penuh wayang, dan JavaScript adalah dalangnya. Ia mencari sebuah elemen, lalu mengubah teks, gaya, atau class-nya, dan mendengarkan tepuk tangan penonton.`,
theory:[`Browser mengubah HTML-mu menjadi pohon objek yang disebut DOM. JavaScript bisa membaca dan mengubahnya.`,`Cari elemen dengan document.querySelector('.msg') atau document.getElementById('title').`,`Ubah elemennya: el.textContent = 'Hai', el.classList.add('on'), el.style.color = 'pink'.`,`Dengarkan event: btn.addEventListener('click', () => { … }) menjalankan kodemu setiap kali tombol diklik.`],
controls:[{label:'Tali yang ditarik'}],
bad:'Atribut onclick inline dan innerHTML di mana-mana: sulit dibaca dan mudah rusak.',
good:'Cari sekali, ubah dengan tepat, dengarkan dengan addEventListener.',
figma:[`Tambahkan <script src="main.js" defer></script> di HTML-mu supaya DOM sudah siap saat kodemu berjalan.`,`Buka Console browser lalu coba document.querySelector('h1').textContent = 'Hai' di situs mana pun.`,`Gunakan textContent untuk teks biasa. Pakai innerHTML hanya saat kamu yang mengendalikan HTML-nya, jangan pernah dengan input pengguna.`],
quiz:[
 {q:`Baris mana yang mencari elemen pertama dengan class "msg"?`,options:[`document.querySelector('.msg')`,`document.msg`,`getClass('msg')`],why:`querySelector menerima selector CSS apa pun dan mengembalikan elemen pertama yang cocok.`},
 {q:`Bagaimana cara menjalankan kode setiap kali tombol diklik?`,options:[`btn.addEventListener('click', fn)`,`btn.click = fn()`,`while (clicked) { … }`],why:`addEventListener mendaftarkan fungsi yang dipanggil browser pada setiap klik.`}
]}
});
