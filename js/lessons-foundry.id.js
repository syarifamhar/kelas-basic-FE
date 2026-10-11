/* Indonesian (ID) translations for the new Foundry lessons. Same shape as lessons.id.js. */
Object.assign(window.UX_LESSONS_ID = window.UX_LESSONS_ID || {}, {
'html-structure': {
title:'HTML: Struktur & Semantic', metaphor:'Ruangan di dalam rumah',
parable:`Rumah itu bukan satu ruangan gede doang. Ada teras, lorong yang ada papan petunjuknya, ruang tamu, kamar samping, sama gudang, dan semua orang tahu fungsinya masing-masing. Tag HTML juga gitu. <header>, <nav>, <main>, <aside>, dan <footer> ngasih tahu browser, mesin pencari, dan screen reader apa fungsi tiap bagian halaman, bukan cuma tampilannya.`,
theory:[`HTML itu buat ngegambarin struktur. Element itu sepasang tag yang ngebungkus content: <p>Halo</p>. Element bisa ada di dalam element lain, kayak ruangan di dalam rumah.`,`Tag semantic nyebutin sesuatu itu apa: <header>, <nav>, <main>, <article>, <aside>, <footer>, <button>.`,`Halaman yang isinya <div> semua bisa aja kelihatan sama, tapi nggak ada maknanya: screen reader nggak bisa loncat ke content utama.`,`Pakai satu <h1> per halaman dan jaga urutan heading-nya (h1 → h2 → h3), kayak bab di buku.`],
controls:[{label:'Markup',options:['Tag semantic','div soup']},{label:'Nama tag',options:['On','Off']}],
bad:'div soup: kelihatannya oke-oke aja, tapi nggak ada artinya buat teknologi asistif dan mesin pencari.',
good:'Tag semantic ngejelasin tiap ruangan, dan button beneran bisa dipakai pakai keyboard.',
figma:[`Bikin index.html di VS Code, ketik ! terus tekan Tab, langsung jadi kerangka HTML lengkap.`,`Sketsa halamanmu dulu sebagai kotak-kotak di kertas, baru kasih nama tiap kotak pakai tag semantic.`,`Buka DevTools browser, panel Accessibility, buat lihat landmark apa aja yang ditemuin screen reader.`],
quiz:[
 {q:`Tag mana yang paling pas buat ngebungkus content utama halaman?`,options:[`<div id="main">`,`<main>`,`<section class="content">`],why:`<main> itu landmark yang bisa langsung dituju screen reader.`},
 {q:`Kenapa <div onclick> lebih jelek daripada <button>?`,options:[`Lebih lambat`,`Nggak bisa dijangkau pakai Tab atau ditekan pakai Enter, dan nggak dibacain sebagai button`,`Warnanya salah`],why:`<button> beneran otomatis dapet fokus keyboard, bisa diaktifin lewat keyboard, dan punya peran yang tepat.`}
]},
'css-selectors': {
title:'CSS Selector & Cascade', metaphor:'Aturan seragam sekolah',
parable:`Sekolah ngumumin: semua murid pakai baju putih. Terus wali kelas 5B bilang: kelasku pakai biru. Terus pelatih bilang ke Budi: kamu pakai rompi kapten merah ya. Akhirnya Budi pakai merah, karena perintah yang paling spesifik yang menang. CSS juga gitu. Banyak aturan bisa ngincer satu element yang sama, dan selector yang paling spesifik yang menang.`,
theory:[`Selector itu buat milih element: p (semua paragraph), .note (class), #hero (satu id), atau gabungan kayak .card .note.`,`Kalau aturannya bentrok, specificity yang nentuin: id ngalahin class, class ngalahin element. Hitungnya (id, class, element).`,`Kalau specificity dua aturan sama, yang ditulis belakangan di CSS yang menang.`,`Utamain class. Id dan !important bikin aturan susah ditimpa nanti-nanti.`],
controls:[{label:'Aturan aktif'}],
bad:'Ngelawan specificity pakai id dan !important. Perubahan berikutnya jadi makin ribet.',
good:'Selector datar satu class yang gampang ditimpa.',
figma:[`Di DevTools, pilih satu element: panel Styles nampilin semua aturan yang cocok, dan yang kalah dicoret.`,`Arahin kursor ke selector di VS Code buat lihat specificity-nya, misalnya (0, 2, 0).`,`Kasih nama class sesuai bendanya apa (.card, .card__title), bukan tampilannya (.blue-text).`],
quiz:[
 {q:`Selector mana yang menang: .note atau p?`,options:[`p`,`.note`,`Yang ditulis duluan`],why:`class (0,1,0) ngalahin element (0,0,1).`},
 {q:`Dua aturan punya specificity yang sama. Yang kepakai yang mana?`,options:[`Yang pertama`,`Yang terakhir di CSS`,`Nggak dua-duanya`],why:`kalau specificity-nya sama, urutan di code yang nentuin: yang belakangan menang.`}
]},
'js-dom': {
title:'JavaScript & DOM', metaphor:'Pertunjukan wayang',
parable:`Di pertunjukan wayang, wayangnya nggak gerak sendiri. Dalang di atas panggung yang narik talinya: angkat tangan, nolehin kepala, membungkuk. Halaman web (DOM) itu panggung penuh wayang, dan JavaScript itu dalangnya. Dia nyari element, terus ngubah teks, style, atau class-nya, sambil dengerin tepuk tangan penonton.`,
theory:[`Browser ngubah HTML-mu jadi pohon objek yang namanya DOM. JavaScript bisa baca dan ngubah pohon itu.`,`Cari element pakai document.querySelector('.msg') atau document.getElementById('title').`,`Ubah element-nya: el.textContent = 'Hai', el.classList.add('on'), el.style.color = 'pink'.`,`Dengerin event: btn.addEventListener('click', () => { … }) bakal jalanin code-mu tiap kali button di-click.`],
controls:[{label:'Tali yang ditarik'}],
bad:'Attribute onclick inline dan innerHTML di mana-mana: susah dibaca dan gampang rusak.',
good:'Cari sekali, ubah seperlunya, dengerin pakai addEventListener.',
figma:[`Tambahin <script src="main.js" defer></script> di HTML-mu biar DOM udah siap pas code-mu jalan.`,`Buka Console browser, terus coba document.querySelector('h1').textContent = 'Hai' di website mana aja.`,`Pakai textContent buat teks biasa. Pakai innerHTML cuma kalau HTML-nya kamu yang kontrol, jangan pernah buat input dari user.`],
quiz:[
 {q:`Baris mana yang nyari element pertama dengan class "msg"?`,options:[`document.querySelector('.msg')`,`document.msg`,`getClass('msg')`],why:`querySelector nerima selector CSS apa aja dan ngembaliin element pertama yang cocok.`},
 {q:`Gimana caranya jalanin code tiap kali button di-click?`,options:[`btn.addEventListener('click', fn)`,`btn.click = fn()`,`while (clicked) { … }`],why:`addEventListener ngedaftarin function yang bakal dipanggil browser tiap ada click.`}
]}
});
